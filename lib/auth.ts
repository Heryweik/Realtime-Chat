import { UpstashRedisAdapter } from "@next-auth/upstash-redis-adapter";
import { NextAuthOptions } from "next-auth";
import { db } from "./db";
import GoogleProvider from "next-auth/providers/google";
import { fetchRedis } from "@/helpers/redis";

// Obtiene las credenciales de Google de las variables de entorno
function getGoogleCredentials() {

    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

    if (!clientId || clientId.length === 0) {
        throw new Error("Missing GOOGLE_CLIENT_ID");
    }
    if (!clientSecret || clientSecret.length === 0) {
        throw new Error("Missing GOOGLE_CLIENT_SECRET");
    }

    return {
        clientId,
        clientSecret
    };
}

// Todos los elementos que tiene este auth es porque asi lo define el NextAuthOptions
export const authOptions: NextAuthOptions = {
    adapter: UpstashRedisAdapter(db),
    session: {
        // Use JSON Web Tokens for session instead of database sessions.
        // Sirve para que las sesiones se guarden en JWT en lugar de en la base de datos
        strategy: "jwt",
    },
    pages: {
        signIn: "/login",
    },
    providers: [
        GoogleProvider({
            clientId: getGoogleCredentials().clientId,
            clientSecret: getGoogleCredentials().clientSecret,
        })
    ],
    // Sirve para que se cree el JWT
    callbacks: {
        // User usa una interfaz que esta en types
        async jwt({token, user}) {

            // Se obtiene el usuario de la base de datos
            const dbUserResult = (await fetchRedis('get', `user:${token.id}`)) as
            | string
            | null
    
            // Si el usuario no existe en la base de datos, se usa el usuario de Google
          if (!dbUserResult) {
            if (user) {
              token.id = user!.id
            }
    
            return token
          }
    
          const dbUser = JSON.parse(dbUserResult) as User
    
          return {
            id: dbUser.id,
            name: dbUser.name,
            email: dbUser.email,
            picture: dbUser.image,
          }
        },
        // Sirve para que se cree la sesión
        async session({session, token}) {
            // Se agrega el id del usuario a la sesión
            if (token) {
                session.user.id = token.id
                session.user.name = token.name
                session.user.email = token.email
                session.user.image = token.picture
            }

            return session;
        },

        redirect() {
            return '/dashboard'
        }
    }
}