import Checkout from "@/components/checkout"
import { PRODUCTS } from "@/lib/products"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function CheckoutPage() {
  const product = PRODUCTS[0]

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <Link href="/landing">
            <Button variant="ghost">← Voltar</Button>
          </Link>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Finalizar Compra</h1>
          <p className="text-muted-foreground">Complete o pagamento para começar a usar a plataforma</p>
        </div>

        <Checkout productId={product.id} />
      </div>
    </div>
  )
}
