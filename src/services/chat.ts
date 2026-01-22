import { client } from "@/lib/client"

export async function createChat() {
    return await client.chat.create.post()
}
