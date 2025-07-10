"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Form } from "@/components/ui/form"
import FormField from "./FormField"

import { auth, googleProvider } from "@/firebase/client"
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithRedirect,
  getRedirectResult,
  fetchSignInMethodsForEmail,
  EmailAuthProvider,
  linkWithCredential,
} from "firebase/auth"

import { signIn, signUp } from "@/lib/actions/auth.action"

const authFormSchema = (type: FormType) =>
  z.object({
    name: type === "sign-up" ? z.string().min(3) : z.string().optional(),
    email: z.string().email(),
    password: z.string().min(3),
  })

const AuthForm = ({ type }: { type: FormType }) => {
  const router = useRouter()
  const formSchema = authFormSchema(type)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  })

  // --- NEW: Handle Google redirect result ---
  useEffect(() => {
    getRedirectResult(auth)
      .then(async (result) => {
        if (result && result.user) {
          const user = result.user
          const idToken = await user.getIdToken()
          await signIn({
            email: user.email!,
            idToken,
          })
          toast.success("Signed in with Google")
          router.push("/")
        }
      })
      .catch((error) => {
        console.error("Google sign-in redirect error:", error)
        toast.error("Google sign-in failed. Please try again.")
      })
    // Only run on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // --- Rewritten Google sign-in handler ---
  const handleGoogleSignIn = async () => {
    try {
      await signInWithRedirect(auth, googleProvider)
      // No need to handle result here; it's handled in useEffect after redirect
    } catch (error: any) {
      if (error.code === "auth/popup-closed-by-user") {
        toast.warning("Google sign-in was cancelled. Please try again.")
        return
      }
      if (error.code === "auth/account-exists-with-different-credential") {
        const email = error.customData?.email
        if (email) {
          const methods = await fetchSignInMethodsForEmail(auth, email)
          if (methods.includes("password")) {
            toast.error(
              "This email is registered with a password. Sign in with email and link Google later in settings."
            )
          } else {
            toast.error("Account exists with a different provider. Try another sign-in method.")
          }
        } else {
          toast.error("Account already exists with a different credential.")
        }
      } else {
        console.error("Google sign-in error:", error)
        toast.error("Google sign-in failed. Please try again.")
      }
    }
  }

  const isSignIn = type === "sign-in"

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      if (type === "sign-up") {
        const { name, email

