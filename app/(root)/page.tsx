"use client"

import React from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { signOut } from "firebase/auth"
import { auth } from "@/firebase/client"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import Image from "next/image"

export default function Page() {
  const router = useRouter()

  const handleSignOut = async () => {
  try {
    await signOut(auth)
    toast.success("Signed out successfully")
    router.replace("/sign-up") // 👈 Correct
  } catch (error) {
    console.error("Sign out error:", error)
    toast.error("Failed to sign out")
  }
}


  return (
    <>
      <section className="card-cta">
        <div className="flex flex-col gap-6 max-w-lg">
          <h2>Get Interview-Ready with AI-Powered Practice & Feedback</h2>
          <p className="text-lg">
            Practice on real interview questions & get instant feedback
          </p>

          <Button asChild className="btn-primary max-sm:w-full">
            <Link href="/interview">Start an Interview</Link>
          </Button>
        </div>
        <Image
          src="/robot.png"
          alt="robo-dude"
          width={400}
          height={400}
          priority
          className="max-sm:hidden"
        />
      </section>

      <section className="mt-6 flex justify-end">
        <Button onClick={handleSignOut} className="btn-primary ml-auto">
      Sign Out
    </Button>
      </section>
    </>
  )
}
