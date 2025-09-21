import Stripe from "stripe"

export const stripe = new Stripe(process.env.STRIPE_KEY!, {
  httpClient: Stripe.createFetchHttpClient(),
  apiVersion: '2025-08-27.basil',
  appInfo: {
    name: 'TastePlan',
  },
})