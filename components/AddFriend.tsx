'use client'

import { UserPlus } from "lucide-react";
import { Icon, Icons } from "./Icons";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";

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

export default function AddFriend() {

    const pathname = usePathname();

  return (
    <>
    {sidebarOptions.map((option) => {
        const Icon = Icons[option.icon];

        return (
          <li key={option.id}>
            <Link
              href={'/dashboard/add'}
              className={cn('text-gray-700 hover:text-indigo-600 hover:bg-gray-50 group flex gap-3 rounded-md p-2 text-sm leading-6 font-semibold',
                pathname === '/dashboard/add' ? 'bg-gray-50 text-indigo-600' : ''
              )}
            >
              <span className={cn('text-gray-400 border-gray-200 group-hover:border-indigo-600 group-hover:text-indigo-600 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border text-[0.625rem] font-medium bg-white',
                pathname === '/dashboard/add' ? 'border-indigo-600 text-indigo-600' : ''
              )}>
                <Icon className="h-4 w-4" />
              </span>

              <span className="truncate">Add Friend</span>
            </Link>
          </li>
        );
      })}
      </>
  );
}
