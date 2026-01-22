"use client";

import { CopyChatButton } from "@/components/copy-chat-button";
import { useGetMessages } from "@/hooks/use-get-messages";
import { useRealtime } from "@/hooks/use-realtime";
import { useSendMessage } from "@/hooks/use-send-message";
import { useUsername } from "@/hooks/use-username";
import { client } from "@/lib/client";
import { useMutation, useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

function formatTimeRemaining(timeRemaining: number) {
  const minutes = Math.floor(timeRemaining / 60);
  const seconds = timeRemaining % 60;

  return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
}

export default function ChatPage() {
  const params = useParams();
  const chatId = params.chatId as string;

  const { username } = useUsername();
  const { mutateAsync: sendMessage, isPending } = useSendMessage();
  const { data: messages, refetch } = useGetMessages({ chatId });

  const [message, setMessage] = useState<string>("");
  const inputRef = useRef<HTMLInputElement>(null);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);

  const router = useRouter();

  useRealtime({
    channels: [`history:${chatId}`],
    events: ["chat.message", "chat.destroy"],
    onData: ({ event }) => {
      if (event === "chat.message") {
        refetch();
      }

      if (event === "chat.destroy") {
        router.push("/?destroyed=true");
      }
    },
  });

  const { mutateAsync: destroyChat, isPending: isDestroying } = useMutation({
    mutationFn: async () => {
      await client.chat.delete(null, {
        query: {
          chatId,
        },
      });
    },
  });

  const { data: ttl } = useQuery({
    queryKey: ["ttl", chatId],
    queryFn: async () => {
      const res = await client.chat.ttl.get({
        query: {
          chatId,
        },
      });

      return res.data?.ttl;
    },
  });

  useEffect(() => {
    if (ttl !== undefined) {
      setTimeRemaining(ttl);
    }
  }, [ttl]);

  useEffect(() => {
    if (timeRemaining === null || timeRemaining < 0) {
      return;
    }

    if (timeRemaining === 0) {
      router.push("/?destroyed=true");
      return;
    }

    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev === null || prev <= 1) {
          clearInterval(interval);
          return 0;
        }

        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [timeRemaining, router]);

  return (
    <main className="flex flex-col h-screen max-h-screen overflow-hidden">
      <header className="border-b border-zinc-800 p-4 flex sm:flex-row flex-col gap-4 w-full  justify-between bg-zinc-900/30">
        <div className="flex items-center gap-4">
          <div className="flex flex-col">
            <span className="text-xs text-zinc-500 uppercase">Chat ID</span>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm text-amber-400">
                {chatId}
              </span>

              <CopyChatButton />
            </div>
          </div>

          <div className="h-8 w-px bg-zinc-800" />

          <div className="flex flex-col">
            <span className="text-xs text-zinc-500 uppercase">
              Auto-Destruição
            </span>
            <span className="text-sm font-bold flex items-center gap-2">
              {timeRemaining === null
                ? "--:--"
                : formatTimeRemaining(timeRemaining)}
            </span>
          </div>
        </div>

        <button
          onClick={() => destroyChat()}
          disabled={isDestroying}
          className="text-sm sm:text-xs bg-zinc-800 hover:bg-red-800 text-zinc-300 hover:text-white font-bold transition-all group flex items-center justify-center gap-2 px-3 py-3 sm:py-1.5 rounded disabled:opacity-50 hover:cursor-pointer"
        >
          <span className="group-hover:animate-pulse">👋</span> ABAFAR
        </button>
      </header>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin">
        {messages?.length === 0 && (
          <div className="flex items-center justify-center h-full">
            <span className="text-sm text-zinc-400">Nenhuma mensagem</span>
          </div>
        )}

        {messages?.map((message) => (
          <div key={message.id}>
            <div className="flex items-center gap-2">
              <span
                className={`font-semibold text-sm uppercase ${message.sender === username ? "text-amber-400" : "text-emerald-400"}`}
              >
                {message.sender === username ? "Você" : message.sender}
              </span>
              <span className="text-sm text-zinc-400">
                {format(message.timestamp, "HH:mm")}
              </span>
            </div>

            <p className="mt-2 text-sm leading-relaxed text-zinc-300 break-all">
              {message.text}
            </p>
          </div>
        ))}
      </div>

      <div className="p-4 border-t border-zinc-800 flex items-center gap-2">
        <div className="flex gap-4 w-full">
          <div className="flex-1 flex items-center gap-2 relative group">
            <input
              autoFocus
              type="text"
              placeholder="Enviar mensagem"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && message.trim()) {
                  inputRef.current?.focus();
                  sendMessage({
                    sender: username,
                    text: message,
                    chatId: chatId as string,
                  });
                  setMessage("");
                }
              }}
              className="w-full bg-black border text-sm border-zinc-800 focus:ring-zinc-700 focus:ring-2 focus:outline-none px-3 py-1.5 rounded"
            />

            <button
              onClick={() => {
                sendMessage({
                  sender: username,
                  text: message,
                  chatId: chatId as string,
                });
                inputRef.current?.focus();
                setMessage("");
              }}
              className="text-xs bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white font-bold transition-all group flex items-center gap-2 px-3 py-1.5 rounded disabled:opacity-50 hover:cursor-pointer"
              disabled={!message.trim() || isPending}
            >
              <span className="group-hover:animate-pulse">Enviar</span>
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
