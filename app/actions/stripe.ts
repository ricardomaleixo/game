"use server"

import { stripe } from "@/lib/stripe"
import { PRODUCTS } from "@/lib/products"

export async function startCheckoutSession(productId: string) {
  const product = PRODUCTS.find((p) => p.id === productId)
  if (!product) {
    throw new Error(`Product with id "${productId}" not found`)
  }

  const session = await stripe.checkout.sessions.create({
    ui_mode: "embedded",
    redirect_on_completion: "if_required",
    line_items: [
      {
        price_data: {
          currency: "brl",
          product_data: {
            name: product.name,
            description: product.description,
          },
          unit_amount: product.priceInCents,
        },
        quantity: 1,
      },
    ],
    mode: "payment",
    return_url: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/register?session_id={CHECKOUT_SESSION_ID}`,
  })

  return session.client_secret
}

export async function getCheckoutSession(sessionId: string) {
  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId)
    return {
      status: session.status,
      payment_status: session.payment_status,
      customer_email: session.customer_details?.email,
    }
  } catch (error) {
    console.error("[v0] Error retrieving checkout session:", error)
    return null
  }
}
