'use client'

import React, { ButtonHTMLAttributes, useState } from 'react'
import Button from './ui/Button'
import toast from 'react-hot-toast'
import { signOut } from 'next-auth/react'
import { Loader2, LogOut } from 'lucide-react'

// Interface con las propiedades del componente, se extienden las propiedades de un botón HTML para poder utilizarlas y no tener que definirlas nuevamente
interface SignOutButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {}

export default function SignOutButton({...props}: SignOutButtonProps) {

    const [isSignedInOut, setIsSignedInOut] = useState<boolean>(false)

  return (
    <Button {...props} variant={'ghost'} size={'sm'} onClick={async () => {
        setIsSignedInOut(true)
        try {
            await signOut()
        } catch (error) {
            toast.error('There was a problem signing out')
        } finally {
            setIsSignedInOut(false)
        }
    }}>
        {isSignedInOut ? <Loader2 className='h-4 w-4 animate-spin' /> : <LogOut className='h-4 w-4' />}
    </Button>
  )
}
