// Esto es para la comunicación en tiempo real

interface IncomingFriendRequest {
    senderId: string;
    senderEmail: string | null | undefined;
}