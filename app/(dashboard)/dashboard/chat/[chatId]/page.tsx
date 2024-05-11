import ChatInput from "@/components/ChatInput";
import Messages from "@/components/Messages";
import { fetchRedis } from "@/helpers/redis";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { messageArrayValidator } from "@/lib/validations/message";
import { getServerSession } from "next-auth";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Message } from "postcss";

interface ChatPageProps {
  params: {
    chatId: string
  }
}

async function getChatMessages(chatId: string) {
  try {
    // Obtenemos los mensajes de la conversación, zrange obtiene los mensajes de un rango de 0 a -1
    const result: string[] = await fetchRedis('zrange', `chat:${chatId}:messages`, 0, -1)

    const dbMessages = result.map((message) => JSON.parse(message) as Message)

    //Necesitamos mostrar los mensajes en orden reverso
    const reversedMessages = dbMessages.reverse()

    // Validamos los mensajes, messageArrayValidator es un validador de mensajes que esta en lib/validations/message.ts
    const messages = messageArrayValidator.parse(reversedMessages)

    return messages

  } catch (error) {
    notFound()
  }
}

export default async function ChatPage({params}: ChatPageProps) {

  // Obtenemos el id de la conversación (Viene el id del usuario y el id del amigo separados por --)
  const { chatId } = params
  const session = await getServerSession(authOptions);

  if (!session) {
    notFound();
  }

  const {user} = session

  // Id de los usuarios que están en la conversación
  // split separa el string en un array, en este caso el string se separa por --
  const [userId1, userId2] = chatId.split('--')

  // Si el usuario no está en la conversación, redirigimos a la página de NotFound
  if (user.id !== userId1 && user.id !== userId2) {
    notFound();
  }

  // Id del amigo con el que estamos chateando
  const chatPartnerId = user.id === userId1 ? userId2 : userId1

  // Obtenemos la información del amigo con el que estamos chateando
  // El fetchRedis no funciona en el server component, por eso usamos db.get
  // No funciona porque fetchRedis hace una petición a la API de Upstash, y eso no se puede hacer en un server component
  /* const chatPartner = await db.get(`user:${chatPartnerId}`) as User */

  // Ahora si funciona el error estaba en que habia que convertir el resultado a string y luego a JSON
  const chatPartnerRow = await fetchRedis('get', `user:${chatPartnerId}`) as string
  const chatPartner = JSON.parse(chatPartnerRow) as User

  // Obtenemos los mensajes de la conversación
  const initialMessages = await getChatMessages(chatId)

  
    // Id del chat
    {/* <div>{chatId}</div> */}

  return (
    <div className="flex-1 justify-between flex flex-col h-full max-h-[calc(100vh-1rem)]">
      {/* {chatId} */}
      <div className="flex sm:items-center justify-between py-3 border-b-2 border-gray-200">
        <div className="relative flex items-center space-x-4">
          <div className="relative">
            <div className="relative w-8 sm:w-12 h-8 sm:h-12">
              {/* referrerPolicy="no-referrer" esto va porque asi trabajan las imagenes de google */}
              <Image 
                fill
                referrerPolicy="no-referrer"
                src={chatPartner.image}
                alt={`${chatPartner.name} profile picture`}
                className="rounded-full"
              />
            </div>
          </div>

          <div className="flex flex-col leading-tight">
            <div className="text-xl flex items-center">
              <span className="text-gray-700 mr-3 font-semibold">
                {chatPartner.name}
              </span>
            </div>

            <span className="text-sm text-gray-600">
              {chatPartner.email}
            </span>
          </div>
        </div>
      </div>

      <Messages initialMessages={initialMessages} sessionId={session.user.id} sessionImg={session.user.image} chatPartner={chatPartner} chatId={chatId}/>
      <ChatInput chatPartnerId={chatPartner} chatId={chatId} />
    </div>
  )
}
