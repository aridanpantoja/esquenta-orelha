"use client";

import { CreateChatButton } from "@/components/create-chat-button";
import { useCreateChat } from "@/hooks/use-create-chat";
import { useUsername } from "@/hooks/use-username";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

export default function Home() {
  return (
    <Suspense>
      <HomeContent />
    </Suspense>
  );
}

function HomeContent() {
  const { username } = useUsername();
  const { mutateAsync: createChat } = useCreateChat();

  const searchParams = useSearchParams();
  const wasDestroyed = searchParams.get("destroyed") === "true";
  const error = searchParams.get("error");

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        {wasDestroyed && (
          <div className="bg-red-950/50 border border-red-900 text-red-400 p-4 rounded-lg text-center">
            <p className="text-sm">FOFOCA ABAFADA</p>
            <p className="text-xs mt-1">
              Ninguém mais pode espalhar essa fofoca
            </p>
          </div>
        )}

        {error === "chat-not-found" && (
          <div className="bg-red-950/50 border border-red-900 text-red-400 p-4 rounded-lg text-center">
            <p className="text-sm">FOFOCA NÃO ENCONTRADA</p>
            <p className="text-xs mt-1">
              Essa fofoca já foi abafada ou nunca existiu
            </p>
          </div>
        )}

        {error === "chat-full" && (
          <div className="bg-red-950/50 border border-red-900 text-red-400 p-4 rounded-lg text-center">
            <p className="text-sm">MUITA FOFOQUINHA</p>
            <p className="text-xs mt-1">Como diziam as más linguas...</p>
          </div>
        )}

        <div className="space-y-3 text-center">
          <p className="text-4xl">{"🔥👂"}</p>
          <h1 className="text-2xl tracking-tight font-bold text-gradient">
            esquenta orelha
          </h1>
          <p className="text-sm text-zinc-400">
            O canal perfeito para espalhar as suas fofocas
          </p>
        </div>

        <div className="border border-zinc-800 bg-zinc-900/60 p-6 backdrop-blur-md rounded-2xl">
          <div className="space-y-5">
            <div className="space-y-2">
              <label className="flex items-center text-zinc-500">
                Seu apelido
              </label>

              <div className="flex items-center gap-3">
                <div className="flex-1 bg-zinc-950 border border-zinc-800 p-3 text-sm text-zinc-400 font-mono rounded-lg">
                  {username}
                </div>
              </div>
            </div>

            <CreateChatButton onClick={() => createChat()} />
          </div>
        </div>
      </div>
    </main>
  );
}
