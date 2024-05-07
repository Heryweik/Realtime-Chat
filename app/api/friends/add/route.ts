import { fetchRedis } from "@/helpers/redis";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { addFriendValidator } from "@/lib/validations/add-friend";
import { getServerSession } from "next-auth";
import { z } from "zod";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Se usa el validador para parsear el email y obtenerlo
    const { email: emailToAdd } = addFriendValidator.parse(body.email);

    // Se hace la petición a la API (upstash)
    // Se usa el email como llave para obtener el usuario, asi sale en upstash: user:email:yhonny296@gmail.com
    /* const RESTResponse = await fetch(
      `${process.env.UPSTASH_REDIS_REST_URL}/get/user:email:${emailToAdd}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.UPSTASH_REDIS_REST_TOKEN}`,
        },
        cache: "no-store",
      }
    );

    const data = await RESTResponse.json() as {result: string | null}; */

    const idToAdd = await fetchRedis("get", `user:email:${emailToAdd}`) as string;

    // Obtenemos el id del usuario a agregar
    /* const idToAdd = data.result; */

    // Si el usuario no existe, se responde con un error
    if (!idToAdd) {
      return new Response("This person not exist", { status: 400 });
    }

    // Obtenemos la sesión del usuario autenticado (En otras palabras, el usuario que está intentando agregar a otro usuario)
    const session = await getServerSession(authOptions)

    // Si no hay sesión, se responde con Unauthorized
    if (!session) {
        return new Response('Unauthorized', { status: 401 });
    }

    // Si el usuario intenta agregarse a si mismo, se responde con un error
    if (idToAdd === session.user.id) {
        return new Response('You cannot add yourself', { status: 400 });
    }

    // Chequeamos si el usuario a sido agregado
    // el sismember es un parametro de la API de upstash
    // el user:${idToAdd}:incoming_friend_requests es la llave en la que se almacenan las solicitudes de amistad
    const isAlreadyAdded = await fetchRedis("sismember", `user:${idToAdd}:incoming_friend_requests`, session.user.id) as 0 | 1;

    // Si el usuario ya a sido agregado, se responde con un error
    if (isAlreadyAdded) {
        return new Response('Already added this user', { status: 400 });
    }

    // Chequeamos si el usuario ya es amigo
    const isAlreadyFriends = await fetchRedis("sismember", `user:${session.user.id}:friends`, idToAdd) as 0 | 1;

    // Si el usuario ya es amigo, se responde con un error 
    if (isAlreadyFriends) {
        return new Response('This user is already your friend', { status: 400 });
    }

    // Se agrega la solicitud de amistad
    // el sadd es un parametro de la API de upstash
    db.sadd(`user:${idToAdd}:incoming_friend_requests`, session.user.id);

    return new Response('OK');

  } catch (error) {
    if (error instanceof z.ZodError) {
      return new Response('Invalid request payload', { status: 422 });
    }

    return new Response('Invalid request', { status: 400 });
  }
}
