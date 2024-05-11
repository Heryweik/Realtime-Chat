"use client";

import { pusherClient } from "@/lib/pusher";
import { toPusherKey } from "@/lib/utils";
import axios from "axios";
import { Check, UserPlus, X } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";

interface FriendRequestsProps {
  // Este es un array de solicitudes de amistad entrantes, esta en los types de la aplicación
  incomingFriendRequests: IncomingFriendRequest[];
  sessionId: string;
}

export default function FriendRequests({
  incomingFriendRequests,
  sessionId,
}: FriendRequestsProps) {
  // useRouter es para usar en el cliente
  const router = useRouter();

  const [friendRequests, setFriendRequests] = useState<IncomingFriendRequest[]>(
    incomingFriendRequests
  );

  // Se actualiza la lista de solicitudes de amistad en tiempo real
  useEffect(() => {
    pusherClient.subscribe(
      toPusherKey(`user:${sessionId}:incoming_friend_requests`)
    )

    const friendRequestHandler = ({
      senderId,
      senderEmail,
    }: IncomingFriendRequest) => {
      setFriendRequests((prev) => [...prev, { senderId, senderEmail }])
    }

    pusherClient.bind('incoming_friend_requests', friendRequestHandler)

    return () => {
      pusherClient.unsubscribe(
        toPusherKey(`user:${sessionId}:incoming_friend_requests`)
      )
      pusherClient.unbind('incoming_friend_requests', friendRequestHandler)
    }
  }, [sessionId])

  // Aceptar solicitud de amistad, le enviamos el id del usuario que envió la solicitud
  const acceptFriend = async (senderId: string) => {
    // Aceptamos la solicitud de amistad
    await axios.post("/api/friends/accept", {
      id: senderId,
    });

    // Eliminamos la solicitud de amistad de la lista
    setFriendRequests((prev) =>
      prev.filter((request) => request.senderId !== senderId)
    );

    /* window.location.reload(); */
    router.refresh()
  };

  const denyFriend = async (senderId: string) => {
    // Denegamos la solicitud de amistad
    await axios.post("/api/friends/deny", {
      id: senderId,
    });

    // Eliminamos la solicitud de amistad de la lista
    setFriendRequests((prev) =>
      prev.filter((request) => request.senderId !== senderId)
    );

    /* window.location.reload(); */
    router.refresh()
  };

  return (
    <>
      {friendRequests.length === 0 ? (
        <p className="text-sm text-zinc-500">Nothing to show here...</p>
      ) : (
        friendRequests.map((request) => (
          <div key={request.senderId} className="flex gap-4 items-center">
            <UserPlus className="text-black" />
            <p className="font-medium text-lg">{request.senderEmail}</p>

            <button
              aria-label="accept friend"
              className="w-8 h-8 bg-indigo-600 hover:bg-indigo-700 grid place-items-center rounded-full transition hover:shadow-md"
              onClick={() => acceptFriend(request.senderId)}
            >
              <Check className="font-medium text-white w-3/4 h-3/4" />
            </button>

            <button
              aria-label="deny friend"
              className="w-8 h-8 bg-red-600 hover:bg-red-700 grid place-items-center rounded-full transition hover:shadow-md"
              onClick={() => denyFriend(request.senderId)}
            >
              <X className="font-medium text-white w-3/4 h-3/4" />
            </button>
          </div>
        ))
      )}
    </>
  );
}
