import AddFriendButton from "@/components/AddFriendButton";


export default function AddPage() {

  // Simulamos una carga de 4 segundos
  /* await new Promise((resolve) => setTimeout(resolve, 4000)) */

  return (
    <main className='pt-8  flex flex-col items-center justify-center'>
        <h1 className='font-bold text-4xl md:text-5xl mb-7'>Add a friend</h1>
        <AddFriendButton />
    </main>
  )
}
