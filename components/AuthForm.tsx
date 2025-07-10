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

  // Handle redirect result once user returns from Google sign-in
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

  // Use signInWithRedirect for Google sign-in
  const handleGoogleSignIn = async () => {
    try {
      await signInWithRedirect(auth, googleProvider)
      // The redirect will take user to Google and back, result handled in useEffect
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
        const { name, email, password } = values

        // Prevent Google duplicate
        const methods = await fetchSignInMethodsForEmail(auth, email)
        if (methods.includes("google.com")) {
          toast.error("This email is already registered with Google. Please use Google sign-in.")
          return
        }

        const userCredentials = await createUserWithEmailAndPassword(auth, email, password)

        const result = await signUp({
          uid: userCredentials.user.uid,
          name: name!,
          email,
          password,
        })

        if (!result?.success) {
          toast.error(result?.message)
          return
        }

        toast.success("Account created successfully. Please sign in.")
        router.push("/sign-in")
      } else {
        const { email, password } = values
        const userCredential = await signInWithEmailAndPassword(auth, email, password)
        const idToken = await userCredential.user.getIdToken()

        if (!idToken) {
          toast.error("Sign in failed")
          return
        }

        await signIn({ email, idToken })
        toast.success("Signed in successfully")
        router.push("/")
      }
    } catch (error: any) {
      console.log(error)
      toast.error(`There was an error: ${error?.message || error}`)
    }
  }

  return (
    <div className="card-border lg:min-w-[566px]">
      <div className="flex flex-col gap-6 card py-14 px-10">
        <div className="flex flex-row gap-2 justify-center">
          <Image src="/logo.svg" alt="logo" height={32} width={38} priority />
          <h2 className="text-primary-100">InterPrep</h2>
        </div>
        <h3 className="text-center">Practice job interviews with AI</h3>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="w-full space-y-6 mt-4 form">
            {!isSignIn && (
              <FormField
                control={form.control}
                name="name"
                label="Name"
                placeholder="Your Name"
              />
            )}
            <FormField
              control={form.control}
              name="email"
              label="Email"
              placeholder="Your email address"
              type="email"
            />

            <FormField
              control={form.control}
              name="password"
              label="Password"
              placeholder="Enter your password"
              type="password"
            />

            <Button className="btn w-full" type="submit">
              {isSignIn ? "Sign in" : "Create an Account"}
            </Button>
          </form>
        </Form>

        <div className="text-center">
          <p className="my-2 text-sm text-gray-500">or continue with</p>
          <Button
            type="button"
            onClick={handleGoogleSignIn}
            className="bg-dark-200 !text-primary-200 hover:!bg-dark-200/80 !rounded-full !font-bold px-5 cursor-pointer min-h-10"
          >
            <Image src="/google-icon.svg" alt="Google" width={20} height={20} className="mr-2" priority />
            Google
          </Button>
        </div>

        <p className="text-center">
          {isSignIn ? "No account yet?" : "Have an account already"}
          <Link
            href={!isSignIn ? "/sign-in" : "/sign-up"}
            className="font-bold text-user-primary ml-1"
          >
            {!isSignIn ? "Sign in" : "Sign up"}
          </Link>
        </p>
      </div>
    </div>
  )
}

export default AuthForm
