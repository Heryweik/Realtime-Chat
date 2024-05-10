import { fetchRedis } from "@/helpers/redis"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { Message, messageValidator } from "@/lib/validations/message"
import { timeStamp } from "console"
import { getServerSession } from "next-auth"
import { nanoid } from "nanoid"

export async function POST(req: Request) {
    try {

        const { text, chatId }: {text: string, chatId: string} = await req.json()
        const session = await getServerSession(authOptions)

        if (!session) {
            return new Response('Unauthorized', { status: 401 })
        }

        // Obtenemos los id de los usuarios que están en la conversación
        const [userId1, userId2] = chatId.split('--')

        // Si el usuario no está en la conversación, retornamos un Unauthorized
        if (session.user.id !== userId1 && session.user.id !== userId2) {
            return new Response('Unauthorized', { status: 401 })
        }

        // Id del amigo con el que estamos chateando
        const friendId = session.user.id === userId1 ? userId2 : userId1

        // Obtenemos todos los amigos del usuario
        const friendList = await fetchRedis('smembers', `user:${session.user.id}:friends`) as string[]
        // Obtenemos la informacion del amigo con el que estamos chateando
        const isFriend = friendList.includes(friendId)

        // Si el amigo no está en la lista de amigos, retornamos un Unauthorized
        if (!isFriend) {
            return new Response('Unauthorized', { status: 401 })
        }

        // Obtenemos la informacion del usuario que envía el mensaje
        const sender = await fetchRedis('get', `user:${session.user.id}`) as string
        // Pasamos la informacion del usuario a formato JSON
        const parsedSender = JSON.parse(sender) as User

        const timestamp = Date.now()

        // Creamos el mensaje
        const messageData: Message = {
            id: nanoid(),
            senderId: session.user.id,
            text,
            timestamp
        }

        // Validamos el mensaje
        const message = messageValidator.parse(messageData)

        // Todo esta validado, ahora enviamos el mensaje
        await db.zadd(`chat:${chatId}:messages`, {
            score: timestamp,
            member: JSON.stringify(message)
        })

        return new Response('OK')

    } catch (error) {
        if (error instanceof Error) {
            return new Response(error.message, { status: 500 })
        }

        return new Response('Internal Server Error', { status: 500 })
    }
}