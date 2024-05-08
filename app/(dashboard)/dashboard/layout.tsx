import FriendRequestsSidebarOption from "@/components/FriendRequestsSidebarOption";
import { Icon, Icons } from "@/components/Icons";
import SignOutButton from "@/components/SignOutButton";
import { fetchRedis } from "@/helpers/redis";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

interface SidebarOption {
  id: number;
  name: string;
  href: string;
  icon: Icon;
}

const sidebarOptions: SidebarOption[] = [
  {
    id: 1,
    name: "Add friends",
    href: "/dashboard/add",
    icon: "UserPlus",
  },
  /* {
        id: 2,
        name: "Chats",
        href: "/dashboard/chats",
        icon: "MessageSquare",
    },
    {
        id: 3,
        name: "Contacts",
        href: "/dashboard/contacts",
        icon: "Users",
    },
    {
        id: 4,
        name: "Settings",
        href: "/dashboard/settings",
        icon: "Settings",
    }, */
];

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

  // Obtenemos la cantidad de solicitudes de amistad
  // Exactamente aqui hacemos un fetch a Redis para obtener las solicitudes de amistad
  const unseenRequestCount = (
    await fetchRedis(
      "smembers",
      `user:${session.user.id}:incoming_friend_requests`
    ) as User[]
  ).length;

  return (
    <div className="w-full flex h-screen">
      <div className="flex h-full w-full max-w-xs grow flex-col gap-y-5 overflow-y-auto border-r border-gray-200 bg-white px-6">
        <Link href="/dashboard" className="flex h-16 shrink-0 items-center">
          <Icons.Logo className="h-8 w-auto text-indigo-600" />
        </Link>

        <div className="text-xs font-semibold leading-6 text-gray-400">
          Your chats
        </div>

        <nav className="flex flex-1 flex-col">
          <ul role="list" className="flex flex-1 flex-col gap-y-7">
            <li>chats that this user has</li>
            <li>
              <div className="text-xs font-semibold leading-6 text-gray-400">
                Overview
              </div>

              <ul role="list" className="-mx-2 mt-2 space-y-1">
                {sidebarOptions.map((option) => {
                  const Icon = Icons[option.icon];

                  return (
                    <li key={option.id}>
                      <Link
                        href={option.href}
                        className="text-gray-700 hover:text-indigo-600 hover:bg-gray-50 group flex gap-3 rounded-md p-2 text-sm leading-6 font-semibold"
                      >
                        <span className="text-gray-400 border-gray-200 group-hover:border-indigo-600 group-hover:text-indigo-600 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border text-[0.625rem] font-medium bg-white">
                          <Icon className="h-4 w-4" />
                        </span>

                        <span className="truncate">{option.name}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </li>

            <li>
              <FriendRequestsSidebarOption
                sessionId={session.user.id}
                initialUnseenRequestsCount={unseenRequestCount}
              />
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

      {children}
    </div>
  );
}
