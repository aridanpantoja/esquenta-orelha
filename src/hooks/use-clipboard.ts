'use client'

import { useState } from "react"

export function useClipboard() {
    const [isCopied, setIsCopied] = useState(false)

    function copyText(text: string) {
        navigator.clipboard.writeText(text)
        setIsCopied(true)

        setTimeout(() => setIsCopied(false), 2000)
    }

    return {
        isCopied,
        setIsCopied,
        copyText
    }
}