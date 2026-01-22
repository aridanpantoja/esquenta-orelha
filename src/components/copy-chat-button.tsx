"use client";

import { useClipboard } from "@/hooks/use-clipboard";

export function CopyChatButton() {
  const { isCopied, copyText } = useClipboard();

  return (
    <button
      onClick={() => copyText(window.location.href)}
      className="text-[10px] bg-zinc-800 gover:bg-zinc-700 px-2 py-0.5 rounded text-zinc-400 hover:cursor-pointer hover:text-zinc-200 transition-colors"
    >
      {isCopied ? "Copiado!" : "Copiar"}
    </button>
  );
}
