export interface Product {
  id: string
  name: string
  description: string
  priceInCents: number
  features: string[]
}

export const PRODUCTS: Product[] = [
  {
    id: "gamified-sales-platform",
    name: "Plataforma de Vendas Gamificada",
    description: "Sistema completo de gamificação para equipes de vendas",
    priceInCents: 2990, // R$ 29,90
    features: [
      "Dashboard completo de vendas",
      "Sistema de ranking e competições",
      "Conquistas e medalhas",
      "Gestão de equipes",
      "Relatórios detalhados",
      "Suporte prioritário",
    ],
  },
]
