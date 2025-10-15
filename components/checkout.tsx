"use client"

import { useEffect, useState } from "react"
import { EmbeddedCheckout, EmbeddedCheckoutProvider } from "@stripe/react-stripe-js"
import { loadStripe } from "@stripe/stripe-js"

import { startCheckoutSession } from "@/app/actions/stripe"

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

export default function Checkout({ productId }: { productId: string }) {
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const initCheckout = async () => {
      try {
        const secret = await startCheckoutSession(productId)
        setClientSecret(secret)
      } catch (err) {
        console.error("[v0] Error initializing checkout:", err)
        setError("Erro ao inicializar pagamento. Tente novamente.")
      }
    }

    initCheckout()
  }, [productId])

  if (error) {
    return (
      <div className="text-center p-8">
        <p className="text-destructive">{error}</p>
      </div>
    )
  }

  if (!clientSecret) {
    return (
      <div className="text-center p-8">
        <p className="text-muted-foreground">Carregando checkout...</p>
      </div>
    )
  }

  return (
    <div id="checkout" className="w-full max-w-2xl mx-auto">
      <EmbeddedCheckoutProvider stripe={stripePromise} options={{ clientSecret }}>
        <EmbeddedCheckout />
      </EmbeddedCheckoutProvider>
    </div>
  )
}
