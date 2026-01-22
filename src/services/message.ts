import { client } from "@/lib/client"

export async function sendMessage() {
    return await client.chat.create.post()
}
