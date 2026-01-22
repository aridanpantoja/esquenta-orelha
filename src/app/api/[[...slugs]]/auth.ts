import { redis } from "@/lib/redis"
import Elysia from "elysia"

class AuthError extends Error {
    constructor(message: string) {
        super(message)
        this.name = "AuthError"
    }
}

export const authMiddleware = new Elysia({
    name: "auth"
}).error({ AuthError }).onError(({ code, set }) => {
    if (code === "AuthError") {
        set.status = 401
        return { error: "Unauthorized" }
    }
}).derive({ as: "scoped" }, async ({ query, cookie }) => {
    const chatId = query.chatId
    const token = cookie["x-auth-token"].value as string | undefined

    if (!chatId || !token) {
        throw new AuthError("Missing chatId or token")
    }

    const connected = await redis.hget<string[]>(`meta:${chatId}`, "connected")

    if (!connected?.includes(token)) {
        throw new AuthError("Invalid token")
    }

    return { auth: { chatId, token, connected } }
})