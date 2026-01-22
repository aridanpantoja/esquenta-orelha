'use client'

import { createChat } from "@/services/chat";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

export function useCreateChat() {
    const router = useRouter()

    return useMutation({
        mutationFn: async () => {
            const res = await createChat()

            if (res.status === 200) {
                router.push(`/chat/${res.data?.chatId}`)
            }
        },
    })
}