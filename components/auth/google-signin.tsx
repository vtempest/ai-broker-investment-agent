"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { signIn, useSession } from "@/lib/auth-client"
import { useRouter } from "next/navigation"

declare global {
  interface Window {
    google?: any
  }
}

export function GoogleSignIn() {
  const { data: session } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (session?.user) {
      router.push("/app")
    }
  }, [session, router])

  const handleGoogleSignIn = async () => {
    await signIn.social({
      provider: "google",
      callbackURL: "/app",
    })
  }

  // Google One Tap
  useEffect(() => {
    if (typeof window !== "undefined" && !session?.user) {
      // Load Google One Tap script
      const script = document.createElement("script")
      script.src = "https://accounts.google.com/gsi/client"
      script.async = true
      script.defer = true
      document.head.appendChild(script)

      script.onload = () => {
        if (window.google) {
          window.google.accounts.id.initialize({
            client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
            callback: async (response: any) => {
              // Handle the credential response
              const credential = response.credential
              // You would send this to your backend to verify
              console.log("Google credential:", credential)
              await handleGoogleSignIn()
            },
            auto_select: false,
            cancel_on_tap_outside: true,
          })

          // Display the One Tap prompt
          window.google.accounts.id.prompt()
        }
      }

      return () => {
        script.remove()
      }
    }
  }, [session])

  if (session?.user) {
    return null
  }

  return (
    <div className="flex flex-col gap-4">
      <Button onClick={handleGoogleSignIn} size="lg" className="w-full">
        <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
          <path
            fill="currentColor"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="currentColor"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="currentColor"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
          />
          <path
            fill="currentColor"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
          />
        </svg>
        Sign in with Google
      </Button>
    </div>
  )
}
