import { fetchRedis } from "@/helpers/redis";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { z } from "zod";


export async function POST(req: Request) {
    try {
        const body = await req.json();
    
        // Le pasamos el id del usuario que envió la solicitud de amistad
        const { id: idToDeny } = z.object({ id: z.string() }).parse(body);
    
        // Obtenemos la sesión del usuario
        const session = await getServerSession(authOptions)
    
        if (!session) {
        return new Response('Unauthorized', { status: 401 });
        }
    
        // Eliminamos la solicitud de amistad de la lista
        // El método srem elimina un valor de un conjunto
        await db.srem(`user:${idToDeny}:outbound_friend_requests`, session.user.id);
        await db.srem(`user:${session.user.id}:incoming_friend_requests`, idToDeny);
    
        return new Response('OK');
    
    } catch (error) {
        console.log(error)
        if (error instanceof z.ZodError) {
        return new Response('Invalid request payload', { status: 422 });
        }
    
        return new Response('Invalid request', { status: 400 });
    }
}