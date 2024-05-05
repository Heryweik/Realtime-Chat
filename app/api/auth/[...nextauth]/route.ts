import { authOptions } from "@/lib/auth";
import NextAuth from "next-auth/next";

// Toda la logica de autenticación se encuentra en el archivo auth.ts
const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }


// Esto estaba en la ruta de pages/api/auth/[...nextauth].ts
/* import { authOptions } from "@/lib/auth";
import NextAuth from "next-auth/next"; */

// Toda la logica de autenticación se encuentra en el archivo auth.ts


// Esta es la forma que se hacia en el tutorial, sin embargo al ser con una version vieja de next, ya no funcionaba
// Ahora todo esta en App/api/auth/[...nextauth]/route.ts
/* export default NextAuth(authOptions) */