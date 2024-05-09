import { fetchRedis } from "./redis"

export const getFriendsByUserId = async (userId: string) => {
    // Obtenemos los id de los amigos del usuario
    const friendsIds = await fetchRedis('smembers', `user:${userId}:friends`) as String[]
  
    // Obtenemos los amigos del usuario
    // Promise.all nos permite hacer múltiples peticiones a la vez
    const friends = await Promise.all(
      friendsIds.map(async (friendId) => {
        const friend = await fetchRedis('get', `user:${friendId}`) as string
        // Parseamos los amigos y los convertimos en json
        const parsedFriend = JSON.parse(friend) as User
        return parsedFriend
      })
    )

  
    return friends
}