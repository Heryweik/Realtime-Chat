'use client'

import { useRef, useState } from "react";
import { Message } from "@/lib/validations/message";
import { cn } from "@/lib/utils";

interface MessageProps {
    initialMessages: Message[];
    sessionId: string;
}

export default function Messages({ initialMessages, sessionId }: MessageProps) {

    const [messages, setMessages] = useState<Message[]>(initialMessages)

    const scrollDownRef = useRef<HTMLDivElement | null>(null);

  return (
    <div id="messages" className="flex h-full flex-1 flex-col-reverse gap-4 p-3 overflow-y-auto scrollbar-thumb-blue scrollbar-thumb-rounded scrollbar-track-blue-lighter scrollbar-w-2 scrolling-touch">
        {/* flex-col-reverse es para que los mensajes se muestren en orden inverso */}
        {/* scrollbar-thumb-blue es el color del scroll */}
        {/* scrollbar-thumb-rounded es para que el scroll sea redondeado */}
        {/* scrollbar-track-blue-lighter es el color del track del scroll */}
        {/* scrollbar-w-2 es el ancho del scroll */}

        {/* Este div es para que haga scroll hacia abajo cuando se carguen nuevos mensajes */}
        <div ref={scrollDownRef} />

        {messages.map((message, index) => {
            // Si el id del mensaje es igual al id de la sesión, quiere decir que el mensaje fue enviado por el usuario actual
            const isCurrentUser = message.senderId === sessionId;

            // Si el mensaje anterior fue enviado por el mismo usuario, esto es para no mostrar el avatar
            const hasNextMessageFromSameUser = messages[index - 1]?.senderId === messages[index].senderId;

            return (
                <div key={`${message.id}-${message.timestamp}`}
                className="chat-message"
                >
                    <div className={cn(
                        'flex items-end',
                        {'justify-end': isCurrentUser},
                    )}>
                        <div className={cn(
                            'flex flex-col space-y-2 text-base max-w-xs mx-2',
                            {'order-1 items-end': isCurrentUser},
                            {'order-2 items-start': !isCurrentUser},
                        )}>
                            <span className={cn(
                                'px-4 py-2 rounded-lg inline-block',
                                {'bg-indigo-600 text-white': isCurrentUser},
                                {'bg-gray-200 text-gray-900': !isCurrentUser},
                                {'rounded-br-none': isCurrentUser && !hasNextMessageFromSameUser},
                                {'rounded-bl-none': !isCurrentUser && !hasNextMessageFromSameUser},
                            )}>
                                {message.text}{' '}
                                <span className="ml-2 text-xs text-gray-400">
                                    {new Date(message.timestamp).toLocaleString()}
                                </span>
                            </span>
                        </div>
                    </div>
                </div>
            )
        })}
    </div>
  )
}
