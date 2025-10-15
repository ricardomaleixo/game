import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Check } from "lucide-react"
import Link from "next/link"
import { PRODUCTS } from "@/lib/products"

export default function LandingPage() {
  const product = PRODUCTS[0]

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center space-y-6 mb-16">
          <h1 className="text-5xl font-bold tracking-tight">Transforme suas Vendas em um Jogo</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Aumente a motivação da sua equipe e impulsione resultados com nossa plataforma de gamificação de vendas
          </p>
        </div>

        <div className="max-w-md mx-auto">
          <Card className="border-2 border-primary shadow-lg">
            <CardHeader className="text-center">
              <CardTitle className="text-3xl">{product.name}</CardTitle>
              <CardDescription className="text-lg">{product.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center py-6">
                <div className="text-5xl font-bold text-primary">R$ 29,90</div>
                <div className="text-muted-foreground mt-2">por mês</div>
              </div>

              <div className="space-y-3">
                {product.features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="flex-shrink-0 w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center">
                      <Check className="w-3 h-3 text-primary" />
                    </div>
                    <span className="text-sm">{feature}</span>
                  </div>
                ))}
              </div>

              <Link href="/checkout" className="block">
                <Button size="lg" className="w-full text-lg py-6">
                  Começar Agora
                </Button>
              </Link>

              <p className="text-xs text-center text-muted-foreground">
                Pagamento seguro via Stripe • Cancele quando quiser
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="mt-24 grid md:grid-cols-3 gap-8">
          <div className="text-center space-y-3">
            <div className="text-4xl">🎯</div>
            <h3 className="text-xl font-semibold">Aumente a Motivação</h3>
            <p className="text-muted-foreground">Transforme metas em desafios empolgantes que engajam sua equipe</p>
          </div>
          <div className="text-center space-y-3">
            <div className="text-4xl">📈</div>
            <h3 className="text-xl font-semibold">Melhore Resultados</h3>
            <p className="text-muted-foreground">Acompanhe o desempenho em tempo real e identifique oportunidades</p>
          </div>
          <div className="text-center space-y-3">
            <div className="text-4xl">🏆</div>
            <h3 className="text-xl font-semibold">Reconheça Talentos</h3>
            <p className="text-muted-foreground">Sistema de conquistas e rankings que valorizam os melhores</p>
          </div>
        </div>
      </div>
    </div>
  )
}
