import AddFriend from "@/components/AddFriend";
import FriendRequestsSidebarOption from "@/components/FriendRequestsSidebarOption";
import { Icon, Icons } from "@/components/Icons";
import MobileChatLayout from "@/components/MobileChatLayout";
import SidebarChatList from "@/components/SidebarChatList";
import SignOutButton from "@/components/SignOutButton";
import { getFriendsByUserId } from "@/helpers/get-friends-by-user-id";
import { fetchRedis } from "@/helpers/redis";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";


// Este es un server component
export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Obtenemos la sesión del usuario
  const session = await getServerSession(authOptions);

  // Si no hay sesión, redirigimos a la página de NotFound
  if (!session) {
    notFound();
  }

  // Obtenemos los amigos del usuario
  const friends = await getFriendsByUserId(session.user.id);

  // Obtenemos la cantidad de solicitudes de amistad
  // Exactamente aqui hacemos un fetch a Redis para obtener las solicitudes de amistad
  const unseenRequestCount = (
    (await fetchRedis(
      "smembers",
      `user:${session.user.id}:incoming_friend_requests`
    )) as User[]
  ).length;

  return (
    <div className="w-full flex h-screen">
      {/* Burguer para moviles */}
      <div className="md:hidden z-50">
        <MobileChatLayout friends={friends} session={session} unseenRequestCount={unseenRequestCount} />
      </div>

      <div className="hidden md:flex h-full w-full max-w-xs grow flex-col gap-y-5 overflow-y-auto border-r border-gray-200 bg-white px-6">
        <Link href="/dashboard" className="flex h-16 shrink-0 items-center">
          <Icons.Logo className="h-8 w-auto text-indigo-600" />
        </Link>

        {friends.length > 0 ? (
          <div className="text-xs font-semibold leading-6 text-gray-400">
            Your chats
          </div>
        ) : null}

        <nav className="flex flex-1 flex-col">
          <ul role="list" className="flex flex-1 flex-col gap-y-7">
            <li>
              <SidebarChatList friends={friends} sessionId={session.user.id} />
            </li>
            <li>
              <div className="text-xs font-semibold leading-6 text-gray-400">
                Overview
              </div>

              <ul role="list" className="-mx-2 mt-2 space-y-1">
                  <AddFriend />
                {/* Este li va separado ya que ocupa propiedades del clien component */}
                <li>
                  <FriendRequestsSidebarOption
                    sessionId={session.user.id}
                    initialUnseenRequestsCount={unseenRequestCount}
                  />
                </li>
              </ul>
            </li>

            <li className="-mx-6 mt-auto flex items-center">
              <div className="flex flex-1 items-center gap-x-4 px-6 py-3 text-sm font-semibold leading-6 text-gray-900">
                {/* El relative es porque la imagen de Next trae por defecto absolute */}
                <div className="relative h-8 w-8 bg-gray-50">
                  <Image
                    fill
                    referrerPolicy="no-referrer"
                    className="rounded-full"
                    src={session.user.image || ""}
                    alt={"Your profile picture"}
                  />
                </div>

                {/* sr-only es para que no se lea el texto */}
                <span className="sr-only">Your profile</span>
                <div className="flex flex-col items-start justify-center">
                  {/* aria-hidden es para que no se lea el texto */}
                  <span aria-hidden={"true"}>{session.user.name}</span>
                  <span className="text-xs text-zinc-400" aria-hidden={"true"}>
                    {session.user.email}
                  </span>
                </div>
              </div>

              <SignOutButton className="h-full aspect-square" />
            </li>
          </ul>
        </nav>
      </div>

      <section className="max-h-screen container py-16 md:py-12 w-full">
      {children}
      </section>
    </div>
  );
}
