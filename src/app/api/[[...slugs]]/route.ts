import { redis } from '@/lib/redis'
import { Elysia, t } from 'elysia'
import { nanoid } from 'nanoid'
import { authMiddleware } from './auth'
import z from 'zod'
import { Message, realtime } from '@/lib/realtime'

const CHAT_TTL_SECONDS = 60 * 10


export const chat = new Elysia({ prefix: '/chat' }).post("/create", async () => {
    const chatId = nanoid()
    const chatKey = `meta:${chatId}`

    await redis.hset(chatKey, {
        connected: [],
        createdAt: Date.now()
    })

    await redis.expire(chatKey, CHAT_TTL_SECONDS)

    return { chatId }
}).use(authMiddleware).get("/ttl", async ({ query }) => {
    const { chatId } = query

    const ttl = await redis.ttl(`meta:${chatId}`)

    return { ttl: ttl > 0 ? ttl : 0 }
}, {
    query: z.object({
        chatId: z.string()
    })
}).delete("/", async ({ auth }) => {
    const { chatId } = auth

    await Promise.all([
        redis.del(`meta:${chatId}`),
        redis.del(`messages:${chatId}`),
        redis.del(`history:${chatId}`)
    ])

    await realtime.channel(`history:${chatId}`).emit("chat.destroy", {
        isDestroyed: true
    })
}, {
    query: z.object({
        chatId: z.string()
    })
})

const messages = new Elysia({ prefix: '/messages' }).use(authMiddleware).post("/", async ({ body, auth }) => {
    const { sender, text } = body
    const { chatId, token } = auth

    const chatExists = await redis.exists(`meta:${chatId}`)

    if (!chatExists) {
        throw new Error("Chat not found")
    }

    const message: Message = {
        id: nanoid(),
        sender,
        text,
        timestamp: Date.now(),
        chatId,
        token: auth.token
    }

    const messageKey = `messages:${chatId}`

    await redis.rpush(messageKey, {
        ...message,
        token
    })

    await realtime.channel(`history:${chatId}`).emit("chat.message", message)

    const remaining = await redis.ttl(`meta:${chatId}`)

    await redis.expire(messageKey, remaining)
    await redis.expire(`history:${chatId}`, remaining)
    await redis.expire(`meta:${chatId}`, remaining)
}, {
    query: z.object({
        chatId: z.string()
    }),
    body: z.object({
        sender: z.string().max(100),
        text: z.string().max(1000)
    })
}).get("/", async ({ auth }) => {
    const { chatId, token } = auth

    const messageKey = `messages:${chatId}`
    const messages = await redis.lrange<Message>(messageKey, 0, -1)

    return { messages: messages.map((message) => ({ ...message, token: message.token === token ? message.token : undefined })) }
}, {
    query: z.object({
        chatId: z.string()
    })
})

export const app = new Elysia({ prefix: '/api' }).use(chat).use(messages)

export const GET = app.fetch
export const POST = app.fetch
export const DELETE = app.fetch