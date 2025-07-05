"use client"

import { useEffect, useState } from "react"
import { onAuthStateChanged } from "firebase/auth"
import { useRouter } from "next/navigation"
import { auth } from "@/firebase/client"

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // If user is logged in, redirect to home
        router.replace("/")
      } else {
        setChecking(false)
      }
    })

    return () => unsubscribe()
  }, [router])

  if (checking) return null // or a loading spinner

  return <div className="auth-layout">{children}</div>
}
