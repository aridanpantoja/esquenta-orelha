'use client'

import { client } from "@/lib/client";
import { useMutation } from "@tanstack/react-query";

export function useSendMessage() {
    return useMutation({
        mutationFn: async ({ sender, text, chatId }: { sender: string, text: string, chatId: string }) => {
            const res = await client.messages.post({
                sender,
                text
            }, {
                query: {
                    chatId
                }
            })
        },
    })
}