import { treaty } from '@elysiajs/eden'
import { app } from '../app/api/[[...slugs]]/route'

export const client =
    typeof window === "undefined"
        ? treaty(app).api
        : treaty<typeof app>(process.env.NEXT_PUBLIC_API_URL!).api