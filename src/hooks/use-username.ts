'use client'

import { nanoid } from 'nanoid'
import { useEffect, useState } from 'react'

const GOSSIP_SYNONYMS = [
    'fifi',
    'fuxiqueiro',
    'fofoqueiro',
    'maricota',
    'linguarudo',
    'boca-de-sacola',
    'ze-povinho',
    'tricoteiro',
    'mexeriqueiro',
    'maria-vai-com-as-outras',
] as const;

const ANIMALS = [
    'ornitorrinco',
    'preguica',
    'lhama',
    'peixe-gota',
    'dodo',
    'chupacabra',
    'pe-grande',
    'lemure',
    'capivara',
    'tamandua',
    'tatu',
    'mosquito'
] as const;

const STORAGE_KEY = 'chat_username' as const

function generateUsername() {
    const animal = ANIMALS[Math.floor(Math.random() * ANIMALS.length)]
    const subject = GOSSIP_SYNONYMS[Math.floor(Math.random() * GOSSIP_SYNONYMS.length)]
    return `${subject}-${animal}-${nanoid(5)}`
}

export function useUsername() {
    const [username, setUsername] = useState("");

    useEffect(() => {
        const main = () => {
            const storedUsername = localStorage.getItem(STORAGE_KEY)

            if (storedUsername) {
                setUsername(storedUsername)
                return
            }

            const generated = generateUsername()
            localStorage.setItem(STORAGE_KEY, generated)
            setUsername(generated)
        }

        main()
    }, [])

    return { username }
}