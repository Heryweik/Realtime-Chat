const upstashRedisRestURL = process.env.UPSTASH_REDIS_REST_URL;
const authToken = process.env.UPSTASH_REDIS_REST_TOKEN;

type Commands = "zrange" | "sismember" | "get" | "smembers";

// Se define la función fetchRedis para hacer peticiones a la API de Upstash
export async function fetchRedis(
  command: Commands,
  ...args: (string | number)[]
) {
  // Se construye la URL con el comando y los argumentos
  const commandURL = `${upstashRedisRestURL}/${command}/${args.join("/")}`;

  const response = await fetch(commandURL, {
    headers: {
        // Bearer token para autenticación, esto viene de parte de JWT
      Authorization: `Bearer ${authToken}`,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    // Si la respuesta no es exitosa, se lanza un error
    // response.statusText contiene el mensaje de error
    throw new Error(`Error executing Redis command: ${response.statusText}`);
  }

  const data = await response.json();

  return data.result;
}
