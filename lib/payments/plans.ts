export interface Plan {
  id: number,
  name: string,
  priceId: string,
  limits: any,
  features: string[],
  price: number,
  trialDays: number
}

export const plans: Plan[] = [
  {
    id: 1,
    name: "pro",
    priceId: "price_1Sf25tD6sln9a8JlVfI0B6WR",
    limits: {
      tokens: 1000
    },
    features: [
      "Unlimited research",
      "Advanced strategies",
      "Copy Trade order flow",
      "Priority support",
    ],
    price: 19.99,
    trialDays: 7,
  },
  {
    id: 2,
    name: "Team",
    priceId: "price_1SfItcD6sln9a8JlFRR4o83g",
    limits: {
      tokens: 10000,
      proMembers: 8
    },
    features: [
      "8 Pro member spots included",
      "Team sharing & collaboration",
      "Toggle Pro upgrades for members",
      "Custom integrations",
    ],
    price: 299,
    trialDays: 14,
  },

  // {
  //   id: 2,
  //   name: "pro",
  //   priceId: "price_1Rk2OzQ70YfWGPkSD4IBXRDo",
  //   limits: {
  //     tokens: 300
  //   },
  //   features: [
  //     "Gives you access to pro features!",
  //     "Upto 10 team members",
  //     "Upto 20 GB storage",
  //     "Upto 10 pages",
  //     "Phone & email support",
  //     "AI assistance"
  //   ],
  //   price: 29.99,
  //   trialDays: 0
  // },
  // {
  //   id: 3,
  //   name: "Premium",
  //   priceId: "price_1RCQTRDYd93YQoGLLd7bh8Kf",
  //   limits: {
  //     tokens: 900
  //   },
  //   features: [
  //     "Unlimited projects",
  //     "Advanced analytics",
  //     "Priority support",
  //     "100 GB storage"
  //   ],
  //   price: 59.99,
  //   trialDays: 7
  // }
]