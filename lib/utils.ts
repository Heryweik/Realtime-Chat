
import { ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...input: ClassValue[]) {
    return twMerge(clsx(input));
}

// Esta funcion recibe dos id de usuario y los ordena alfabéticamente
export function chatHrefConstructor(userId: string, friendId: string) {
    // Ordenamos los ids alfabéticamente
    const sortedIds = [userId, friendId].sort();

    // Devolvemos un string con los ids separados por "--"
    return `${sortedIds.join("--")}`;
}