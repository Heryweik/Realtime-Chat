'use client'


import { useRef, useState } from 'react';
import TextareaAutosize from 'react-textarea-autosize';
import Button from './ui/Button';
import axios from 'axios';
import { text } from 'stream/consumers';
import toast from 'react-hot-toast';

interface ChatInputProps {
  chatPartnerId: User
  chatId: string
}

export default function ChatInput({ chatPartnerId, chatId }: ChatInputProps) {

  // Referencia al textarea
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false)
  // Valor que tiene el textarea
  const [input, setInput] = useState<string>('')

  // Función para enviar el mensaje
  const sendMessage = async () => {
    setIsLoading(true)

    try {
      // Esperamos un segundo para simular el tiempo que se tarda en enviar un mensaje
      /* await new Promise((resolve) => setTimeout(resolve, 1000)) */

      await axios.post('/api/message/send', {
        text: input,
        chatId
      })
      // Limpiamos el input
      setInput('')
      // despues de enviar un mensaje, el textarea se enfoca de nuevo
      textareaRef.current?.focus()
    } catch (error) {
      toast.error('Something went wrong, please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="border-t border-gray-200 px-4 pt-4 mb-2 sm:mb-0">
        <div className="relative flex-1 overflow-hidden rounded-lg shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-indigo-600">
          <TextareaAutosize ref={textareaRef} onKeyDown={(e) => {
            // Si el usuario presiona Enter y no está presionando Shift, se envía el mensaje
            if (e.key === 'Enter' && !e.shiftKey) {
              // Evita que se haga un salto de línea
              e.preventDefault();
              sendMessage()
            }
          }}
          rows={1}
          // Le damos el valor que el usuario va escribiendo
          value={input}
          // Contiene el valor del input que el usuario escribe
          onChange={(e) => setInput(e.target.value)}
          placeholder={`Message ${chatPartnerId.name}`}
          className='block w-full resize-none border-0 bg-transparent text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:py-1.5 sm:text-sm sm:leading-6'
          />

          {/* Este div sirve para que el textarea tenga un padding arriba y abajo, hacemos referencia al textareaRef para que cuando se haga click en el div, el textarea se enfoque */}
          <div onClick={() => textareaRef.current?.focus()} className='py-2' aria-hidden='true'>
            {/* py-px sirve para darle un padding al div de 1px arriba y abajo */}
            <div className='py-px'>
              <div className='h-9' />
            </div>
          </div>

          <div className='absolute right-0 bottom-0 flex justify-between py-2 pl-3 pr-2'>
            <div className='flex-shrink-0'>
                <Button isLoading={isLoading} onClick={sendMessage} type='submit'>
                  Post
                </Button>
            </div>
          </div>
        </div>
    </div>
  )
}
