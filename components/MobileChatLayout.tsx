"use client";

import { Fragment, useEffect, useState } from "react";
import {
  Dialog,
  DialogPanel,
  DialogTitle,
  Transition,
  TransitionChild,
} from "@headlessui/react";
import { Menu, X } from "lucide-react";
import { Session } from "next-auth";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Icons } from "./Icons";
import Button, { buttonVariants } from "./ui/Button";
import SidebarChatList from "./SidebarChatList";
import SignOutButton from "./SignOutButton";
import Image from "next/image";
import FriendRequestsSidebarOption from "./FriendRequestsSidebarOption";
import AddFriend from "./AddFriend";

interface MobileChatLayoutProps {
  friends: User[];
  session: Session;
  unseenRequestCount: number;
}

export default function MobileChatLayout({
  friends,
  session,
  unseenRequestCount,
}: MobileChatLayoutProps) {
  const [open, setOpen] = useState<boolean>(false);

  const pathname = usePathname();

  // Cada vez que cambie la ruta, cerramos el menú
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <div className="fixed bg-zinc-50 border-b border-zinc-200 top-0 inset-x-0 py-2 px-4">
      <div className="w-full flex justify-between z-50 items-center">
        <a
          href="/dashboard"
          className={buttonVariants({ variant: "ghost" })}
        >
          <Icons.Logo className="h-6 w-auto text-indigo-600" />
        </a>
        <Button onClick={() => setOpen(true)} className="gap-4 ring-1 ring-gray-300" variant={'ghost'}>
          Menu <Menu className="h-6 w-6" />
        </Button>
      </div>
      <Transition show={open} as={Fragment}>
        <Dialog as="div" className="relative z-20" onClose={setOpen}>
          <div className="fixed inset-0" />

          <div className="fixed inset-0 overflow-hidden">
            <div className="absolute inset-0 overflow-hidden">
              <div className="pointer-events-none fixed inset-y-0 left-0 flex max-w-full pr-10">
                <TransitionChild
                  as={Fragment}
                  enter="transform transition ease-in-out duration-500 sm:duration-700"
                  enterFrom="-translate-x-full"
                  enterTo="translate-x-0"
                  leave="transform transition ease-in-out duration-500 sm:duration-700"
                  leaveFrom="translate-x-0"
                  leaveTo="-translate-x-full"
                >
                  <DialogPanel className="pointer-events-auto w-screen max-w-md">
                    <div className="flex h-full flex-col overflow-hidden bg-white py-6 shadow-xl">
                      <div className="px-4 sm:px-6">
                        <div className="flex items-start justify-between">
                          <DialogTitle className="text-base font-semibold leading-6 text-gray-900">
                            <a href={'/dashboard'}>
                            Dashboard
                            </a>
                          </DialogTitle>
                          <div className="ml-3 flex h-7 items-center">
                            <button
                              type="button"
                              className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                              onClick={() => setOpen(false)}
                            >
                              <span className="sr-only">Close panel</span>
                              <X className="h-6 w-6" aria-hidden="true" />
                            </button>
                          </div>
                        </div>
                      </div>
                      <div className="relative mt-6 flex-1 flex flex-col px-4 sm:px-6">
                        {/* Content */}

                        {friends.length > 0 ? (
                          <div className="text-xs font-semibold leading-6 text-gray-400">
                            Your chats
                          </div>
                        ) : null}

                        <nav className="flex flex-1 flex-col">
                          <ul
                            role="list"
                            className="flex flex-1 flex-col gap-y-7"
                          >
                            <li>
                              <SidebarChatList
                                friends={friends}
                                sessionId={session.user.id}
                              />
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
                                    initialUnseenRequestsCount={
                                      unseenRequestCount
                                    }
                                  />
                                </li>
                              </ul>
                            </li>

                            <li className="-mx-3 mt-auto flex items-center">
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
                                  <span aria-hidden={"true"}>
                                    {session.user.name}
                                  </span>
                                  <span
                                    className="text-xs text-zinc-400"
                                    aria-hidden={"true"}
                                  >
                                    {session.user.email}
                                  </span>
                                </div>
                              </div>

                              <SignOutButton className="h-full aspect-square" />
                            </li>
                          </ul>
                        </nav>

                        {/* content end */}
                      </div>
                    </div>
                  </DialogPanel>
                </TransitionChild>
              </div>
            </div>
          </div>
        </Dialog>
      </Transition>
    </div>
  );
}
