import { fetchRedis } from "@/helpers/redis";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { pusherServer } from "@/lib/pusher";
import { toPusherKey } from "@/lib/utils";
import { getServerSession } from "next-auth";
import { z } from "zod";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Le pasamos el id del usuario que envió la solicitud de amistad
    const { id: idToAdd } = z.object({ id: z.string() }).parse(body);

    // Obtenemos la sesión del usuario
    const session = await getServerSession(authOptions);

    if (!session) {
      return new Response("Unauthorized", { status: 401 });
    }

    //Verificamos que ambos usuarios no sean amigos
    // Buscamos si el usuario que envió la solicitud de amistad ya es amigo del usuario actual
    // El método sismember verifica si un valor existe en un conjunto
    const isAlreadyFriends = await fetchRedis(
      "sismember",
      `user:${session.user.id}:friends`,
      idToAdd
    );

    if (isAlreadyFriends) {
      return new Response("Already friends", { status: 400 });
    }

    // Verificamos que el usuario que envió la solicitud de amistad haya enviado una solicitud de amistad
    const hasFriendRequest = await fetchRedis(
      "sismember",
      `user:${session.user.id}:incoming_friend_requests`,
      idToAdd
    );

    if (!hasFriendRequest) {
      return new Response("No friend request", { status: 400 });
    }

    // Obtenemos la información de ambos usuarios, esto sirve para pusher
    const [userRow, friendRow] = (await Promise.all([
      fetchRedis("get", `user:${session.user.id}`),
      fetchRedis("get", `user:${idToAdd}`),
    ])) as [string, string];

    const user = JSON.parse(userRow) as User;
    const friend = JSON.parse(friendRow) as User;

    await Promise.all([
      pusherServer.trigger(
        toPusherKey(`user:${idToAdd}:friends`),
        "new_friend",
        user
      ),
      pusherServer.trigger(
        toPusherKey(`user:${session.user.id}:friends`),
        "new_friend",
        friend
      ),

      db.sadd(`user:${session.user.id}:friends`, idToAdd),
      db.sadd(`user:${idToAdd}:friends`, session.user.id),
      db.srem(
        `user:${idToAdd}:incoming_friend_requests`,
        session.user.id
      ),
      db.srem(
        `user:${session.user.id}:incoming_friend_requests`,
        idToAdd
      ),
    ]);

    // Ahora todo esto lo hacemos en la Promesa
    /* // Actualiza la lista de amigos de ambos usuarios en tiempo real
    pusherServer.trigger(
      toPusherKey(`user:${idToAdd}:friends`),
      "new_friend",
      {}
    );

    // Añadimos al usuario a la lista de amigos
    await db.sadd(`user:${session.user.id}:friends`, idToAdd);

    // Terminamos agregando al usuario actual a la lista de amigos del usuario que envió la solicitud de amistad, para que ambos sean amigos
    await db.sadd(`user:${idToAdd}:friends`, session.user.id);

    // Eliminamos la solicitud de amistad de la lista
    // El método srem elimina un valor de un conjunto
    //await db.srem(`user:${idToAdd}:outbound_friend_requests`, session.user.id); 
    await db.srem(
      `user:${idToAdd}:incoming_friend_requests`,
      session.user.id
    ); // esto es por si ambos se enviaron la solicitud, pero no es necesario ya que al intentar aceptar y ya son amigos marca error 
    await db.srem(`user:${session.user.id}:incoming_friend_requests`, idToAdd); */

    return new Response("OK");
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new Response("Invalid request payload", { status: 422 });
    }

    return new Response("Invalid request", { status: 400 });
  }
}
