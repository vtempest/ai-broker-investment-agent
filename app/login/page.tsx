"use client"

import { GoogleSignIn } from "@/components/auth/google-signin"
import { Card } from "@/components/ui/card"
import { Activity } from "lucide-react"
import Link from "next/link"

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
      <Card className="w-full max-w-md p-8">
        <div className="flex flex-col items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary">
              <Activity className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="text-2xl font-bold">TimeTravel.AI</span>
          </div>

          <div className="text-center">
            <h1 className="text-2xl font-bold mb-2">Welcome Back</h1>
            <p className="text-muted-foreground">
              Sign in to access your AI-powered trading dashboard
            </p>
          </div>

          <div className="w-full">
            <GoogleSignIn />
          </div>

          <div className="text-center text-sm text-muted-foreground">
            <Link href="/demo" className="underline hover:text-foreground">
              Try the demo
            </Link>
            {" · "}
            <Link href="/" className="underline hover:text-foreground">
              Learn more
            </Link>
          </div>
        </div>
      </Card>
    </div>
  )
}
