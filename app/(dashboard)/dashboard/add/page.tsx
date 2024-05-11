import AddFriendButton from "@/components/AddFriendButton";


export default function AddPage() {

  // Simulamos una carga de 4 segundos
  /* await new Promise((resolve) => setTimeout(resolve, 4000)) */

  return (
    <main className='pt-8'>
        <h1 className='font-bold text-5xl mb-8'>Add a friend</h1>
        <AddFriendButton />
    </main>
  )
}
