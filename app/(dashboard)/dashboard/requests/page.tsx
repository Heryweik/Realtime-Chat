
import FriendRequests from '@/components/FriendRequests';
import { fetchRedis } from '@/helpers/redis';
import { authOptions } from '@/lib/auth';
import { getServerSession } from 'next-auth';
import { notFound } from 'next/navigation';
import React from 'react'

// Este es un server component
export default async function RequestsPage() {

    const session = await getServerSession(authOptions);

    if (!session) notFound();

    // Obtenemos los ids de los usuarios que han enviado solicitudes de amistad al usuario
    // Lo convertimos en arreglo para poder iterar sobre ellos
    const incomingSenderIds = await fetchRedis('smembers', `user:${session.user.id}:incoming_friend_requests`) as string[];

    // Solicitudes de amistad entrantes
    // Las promesas sirven para realizar múltiples operaciones asíncronas al mismo tiempo
    const incomingFriendRequests = await Promise.all(incomingSenderIds.map(async (senderId) => {
        // Obtenemos el usuario que envió la solicitud de amistad
        // Por defecto es un objeto, lo convertimos a string
        const sender = await fetchRedis('get', `user:${senderId}`) as string;

        // Convertimos el objeto a JSON
        const senderJson = JSON.parse(sender) as User;

        return {
            senderId,
            senderEmail: senderJson.email,
        }
    }));

  return (
    <main className='pt-8'>
        <h1 className='font-bold text-4xl md:text-5xl mb-7 text-center'>Add a friend</h1>
        <div className='flex flex-col gap-4 items-center'>
            {/* Este es un Client component */}
            <FriendRequests incomingFriendRequests={incomingFriendRequests} sessionId={session.user.id}/>
        </div>
    </main>
  )
}
