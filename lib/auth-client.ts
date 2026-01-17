import { createAuthClient } from "better-auth/react"
import { siweClient } from "better-auth/client/plugins"
import { stripeClient } from "@better-auth/stripe/client"

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  plugins: [
    siweClient(),
    stripeClient(),
  ],
})

// Named exports for compatibility
export const useSession = authClient.useSession
export const signIn = authClient.signIn
export const signOut = authClient.signOut
