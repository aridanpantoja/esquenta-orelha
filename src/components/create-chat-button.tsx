type CreateChatButtonProps = React.ComponentProps<"button">;

export function CreateChatButton({ ...props }: CreateChatButtonProps) {
  return (
    <button
      className="w-full bg-amber-400 text-black p-3 text-sm font-bold hover:bg-amber-300 hover:text-black transition-colors disabled:opacity-50 hover:cursor-pointer rounded-lg"
      {...props}
    >
      CRIAR REDE DE FOFOCA
    </button>
  );
}
