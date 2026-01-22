'use client'

import { client } from "@/lib/client"
import { useQuery } from "@tanstack/react-query"

export function useGetMessages({ chatId }: { chatId: string }) {
    return useQuery({
        queryKey: ["messages", chatId],
        queryFn: async () => {
            const res = await client.messages.get({
                query: {
                    chatId
                }
            })

            return res.data?.messages
        }
    })
}