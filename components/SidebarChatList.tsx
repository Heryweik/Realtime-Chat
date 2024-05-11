"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { chatHrefConstructor, cn, toPusherKey } from "@/lib/utils";
import Link from "next/link";
import Image from "next/image";
import { pusherClient } from "@/lib/pusher";
import toast from "react-hot-toast";
import UnseenChatToast from "./UnseenChatToast";

interface SidebarChatListProps {
  friends: User[];
  sessionId: string;
}

// Interfaz extendida de Message por lo tanto tiene todos sus atributos mas los nuevoa
interface ExtendedMessage extends Message {
  senderImg: string;
  senderName: string;
}

export default function SidebarChatList({
  friends,
  sessionId,
}: SidebarChatListProps) {
  const router = useRouter();
  // Obtenemos la ruta actual
  const pathname = usePathname();

  const [unseenMessages, setUnseenMessages] = useState<Message[]>([]);

  useEffect(() => {
    pusherClient.subscribe(toPusherKey(`user:${sessionId}:chats`));
    // Nos suscribimos a los amigos del usuario, esto es para saber si se agrega un nuevo amigo y lo veamos en tiempo real
    pusherClient.subscribe(toPusherKey(`user:${sessionId}:friends`));

    // Actualizamos la lista de mensajes no vistos en tiempo real
    const chatHandler = (message: ExtendedMessage) => {
      // Verificamos si el usuario actual está fuera de la conversación
      const shouldNotify =
        pathname !==
        `/dashboard/chat/${chatHrefConstructor(sessionId, message.senderId)}`;

      if (!shouldNotify) return;

      toast.custom((t) => (
        // Creamos una notificación personalizada
        <UnseenChatToast
          t={t}
          sessionId={sessionId}
          senderId={message.senderId}
          senderImage={message.senderImg}
          senderName={message.senderName}
          senderMessage={message.text}
        />
      ));

      // Agregamos el mensaje no visto a la lista
      setUnseenMessages((prev) => [...prev, message]);
    };

    const newFriendHandler = () => {
      // Actualizamos la lista de amigos cuando se agrega un nuevo amigo

      router.refresh();
    };

    pusherClient.bind("new_message", chatHandler);
    pusherClient.bind("new_friend", newFriendHandler);

    return () => {
      pusherClient.unsubscribe(toPusherKey(`user:${sessionId}:chats`));
      pusherClient.unsubscribe(toPusherKey(`user:${sessionId}:friends`));

      pusherClient.unbind("new_message", chatHandler);
      pusherClient.unbind("new_friend", newFriendHandler);
    };
  }, [pathname, sessionId, router]);

  // Este useEffect se ejecuta cada vez que la ruta cambia
  useEffect(() => {
    if (pathname.includes("chat")) {
      // Filtramos los mensajes no vistos
      setUnseenMessages((prev) => {
        // Filtramos los mensajes que no sean del usuario actual
        // obtenemos solo los mensejes recibidos
        return prev.filter((message) => !pathname.includes(message.senderId));
      });
    }
  }, [pathname]);

  return (
    <ul role="list" className="max-h-[25rem] overflow-y-auto -mx-2 space-y-1">
      {/* El sort ordena los amigos por orden alfabético */}
      {friends.sort().map((friend) => {
        // Obtenemos la cantidad de mensajes no vistos (recibidos)
        const unseenMessagesCount = unseenMessages.filter((unseenMsg) => {
          return unseenMsg.senderId === friend.id;
        }).length;

        return (
          <li key={friend.id}>
            {/* Hacemos que la ruta tenga los Ids del usuario y del amigo al que estamos ingresando para ver el chat */}
            {/* El ancor a diferencia del Link recarga la página */}
            <a
              href={`/dashboard/chat/${chatHrefConstructor(
                sessionId,
                friend.id
              )}`}
              className={cn(
                "text-gray-700 hover:text-indigo-600 hover:bg-gray-50 group flex items-center gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold whitespace-nowrap truncate",

                pathname ===
                  `/dashboard/chat/${chatHrefConstructor(sessionId, friend.id)}`
                  ? "bg-gray-50 text-indigo-600"
                  : ""
              )}
            >
              <div className="relative w-8 h-8">
                <Image
                  fill
                  referrerPolicy="no-referrer"
                  src={friend.image}
                  alt={`${friend.name} profile picture`}
                  className="rounded-full"
                />
              </div>
              {friend.name}
              {unseenMessagesCount > 0 && (
                <div className="bg-indigo-600 font-medium text-xs text-white w-4 h-4 rounded-full flex justify-center items-center">
                  {unseenMessagesCount}
                </div>
              )}
            </a>
          </li>
        );
      })}
    </ul>
  );
}
