

import { getFriendsByUserId } from "@/helpers/get-friends-by-user-id";
import { fetchRedis } from "@/helpers/redis";
import { authOptions } from "@/lib/auth";
import { chatHrefConstructor } from "@/lib/utils";
import { ChevronRight } from "lucide-react";
import { getServerSession } from "next-auth";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

interface DashboardPageProps {}

export default async function DashboardPage({}: DashboardPageProps) {
  // get the session of google
  const session = await getServerSession(authOptions);

  if (!session) notFound();

  // get the friends of the user
  const friends = await getFriendsByUserId(session.user.id);

  // get the last message of each friend
  const friendsWithLastMessage = await Promise.all(
    // Recorre cada amigo y obtiene el último mensaje
    friends.map(async (friend) => {
      const [lastMessageRaw] = (await fetchRedis(
        // zrange obtiene los elementos de un conjunto en un rango
        "zrange",
        `chat:${chatHrefConstructor(session.user.id, friend.id)}:messages`,
        -1,
        -1
      )) as string[];
      
      // Si no hay mensajes, se retorna un objeto vacío
      if (!lastMessageRaw) {
        return {
          ...friend,
          lastMessage: {
            text: "",
            senderId: "",
          },
        };
      }

      const lastMessage = JSON.parse(lastMessageRaw) as Message;

      // Se retorna cada propiedad del amigo y se agrega el último mensaje
      return {
        ...friend,
        lastMessage,
      };
    })
  );

  return (
    <div className='container py-12'>
      <h1 className='font-bold text-4xl md:text-5xl mb-7 mx-auto text-center'>Recent chats</h1>
      {friendsWithLastMessage.length === 0 ? (
        <p className='text-sm text-zinc-500'>Nothing to show here...</p>
      ) : (
        friendsWithLastMessage.map((friend) => (
          <div
            key={friend.id}
            className='relative bg-zinc-50 border border-zinc-200 p-3 rounded-md'>
              {/* inset-y-0 centra el icono en el eje y */}
            <div className='absolute z-10 right-4 inset-y-0 flex items-center'>
              <ChevronRight className='h-7 w-7 text-zinc-400' />
            </div>

            <Link
              href={`/dashboard/chat/${chatHrefConstructor(
                session.user.id,
                friend.id
              )}`}
              className='relative flex'>
              <div className=' flex-shrink-0 mb-0 mr-4'>
                <div className='relative h-6 w-6'>
                  <Image
                    referrerPolicy='no-referrer'
                    className='rounded-full'
                    alt={`${friend.name} profile picture`}
                    src={friend.image}
                    fill
                  />
                </div>
              </div>

              <div>
                <h4 className='text-lg font-semibold whitespace-nowrap truncate'>{friend.name}</h4>
                <p className='mt-1 max-w-md whitespace-nowrap truncate pr-10'>
                  <span className='text-zinc-400'>
                    {friend.lastMessage.senderId === session.user.id
                      ? 'You: '
                      : ''}
                  </span>
                  {friend.lastMessage.text}
                </p>
              </div>
            </Link>
          </div>
        ))
      )}
    </div>
  )
}
