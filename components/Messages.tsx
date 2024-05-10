"use client";

import { useRef, useState } from "react";
import { Message } from "@/lib/validations/message";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import Image from "next/image";
import { log } from "console";

interface MessageProps {
  initialMessages: Message[];
  sessionId: string;
  sessionImg: string | undefined | null;
  chatPartner: User;
}

export default function Messages({
  initialMessages,
  sessionId,
  sessionImg,
  chatPartner,
}: MessageProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);

  /* // Obteniendo la palabra mas larga de todos los mensajes
    const longestWordAll = messages.map((message) => message.text.split(" ").reduce((a, b) => (a.length > b.length ? a : b))).reduce((a, b) => (a.length > b.length ? a : b));

    const longestWordLengthAll = longestWordAll.length;

    console.log(longestWordLengthAll); */

  const scrollDownRef = useRef<HTMLDivElement | null>(null);

  const formatTimestamp = (timestamp: number) => {
    return format(timestamp, "HH:mm");
  };

  // Filtrar mensajes por fecha que se enviaron, que se vean los mensajes de hoy, ayer y el resto de los días que se veran por la fecha en la que se enviaron, esto es para mostrar los mensajes en diferentes secciones

  /* const filterMessagesByDate = (messages: Message[]) => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const todayMessages = messages.filter(
      (message) => new Date(message.timestamp).toDateString() === today.toDateString()
    );

    const yesterdayMessages = messages.filter(
      (message) => new Date(message.timestamp).toDateString() === yesterday.toDateString()
    );

    const otherDaysMessages = messages.filter(
      (message) =>
        new Date(message.timestamp).toDateString() !== today.toDateString() &&
        new Date(message.timestamp).toDateString() !== yesterday.toDateString()
    );

    return { todayMessages, yesterdayMessages, otherDaysMessages };
  }

  filterMessagesByDate(messages);
  console.log(filterMessagesByDate(messages)); */

  return (
    <div
      id="messages"
      className="flex h-full flex-1 flex-col-reverse gap-2 p-3 overflow-y-auto scrollbar-thumb-blue scrollbar-thumb-rounded scrollbar-track-blue-lighter scrollbar-w-2 scrolling-touch"
    >
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
        const hasNextMessageFromSameUser =
          messages[index - 1]?.senderId === messages[index].senderId;

        // Obteniendo la palabra mas larga del mensaje
        const longestWord = message.text.split(" ").reduce((a, b) => (a.length > b.length ? a : b));

        // Ahora obtenemos el largo de la palabra
        const longestWordLength = longestWord.length;

        return (
          <div
            key={`${message.id}-${message.timestamp}`}
            className="chat-message"
          >
            <div
              className={cn("flex items-end gap-x-1", {
                "justify-end": isCurrentUser,
              })}
            >
              <div
                className={cn(
                  "flex flex-col space-y-2 text-base relative max-w-[60%]",
                  { "order-1 items-end": isCurrentUser },
                  { "order-2 items-start": !isCurrentUser }
                )}
              >
                
                <span
                className={cn(
                    //inline-block break-words max-w-60 sm:max-w-xs md:max-w-md
                    // Se usa hyphens-auto para que las palabras largas no se salgan del contenedor, se podria usar break-word pero no va bien ya que el div no se auto ajusta a la pantalla
                    "px-4 py-2 rounded-lg  hyphens-auto",
                    // Si el mensaje es mayor a 62 caracteres, se rompe la palabra, si no, se hace un guion, esto ya que algunos mensajes largos no se ven bien y rompen la UI
                    // El 62 es un numero que se saco a prueba y error ya que por alguna razón hasta ese punto se rompe
                    longestWordLength > 62  ? 'break-all' : '',
                    { "bg-indigo-600 text-white": isCurrentUser },
                    { "bg-gray-200 text-gray-900": !isCurrentUser },
                    {
                      "rounded-br-none":
                        isCurrentUser && !hasNextMessageFromSameUser,
                    },
                    {
                      "rounded-bl-none":
                        !isCurrentUser && !hasNextMessageFromSameUser,
                    }
                  )}

                >
                  {message.text}
                  <span className=" text-xs text-gray-400 whitespace-nowrap  inline-block ml-2 w-8">
                    {/* Este span es solo para dejar un espacio en blanco del tamanio del tiempo */}
                  </span>
                  <span className=" text-xs text-gray-400 whitespace-nowrap   absolute right-2 bottom-2">
                    {formatTimestamp(message.timestamp)}
                  </span>
                </span>
              </div>

              <div
                className={cn(
                  "relative min-w-6 min-h-6",
                  { "order-2": isCurrentUser },
                  { "order-1": !isCurrentUser },
                  { invisible: hasNextMessageFromSameUser }
                )}
              >
                <Image
                  fill
                  referrerPolicy="no-referrer"
                  src={
                    isCurrentUser ? (sessionImg as string) : chatPartner.image
                  }
                  alt={`Profile picture`}
                  className="rounded-full "
                />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
