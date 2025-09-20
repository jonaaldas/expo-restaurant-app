import { createError, defineEventHandler, readBody } from 'h3'
import stripeStore, { STRIPE_SUB_CACHE } from '../utils/stripe-store'
import { stripe } from '../utils/stripe'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { userID, email, name } = body

    if (!userID) {
      throw createError({
        statusCode: 400,
        statusMessage: 'userID is required'
      })
    }

    console.log('Setting user to free plan:', userID)

    // Get or create customer
    let customer = await stripeStore.getCustomer(userID)
    
    if (!customer) {
      console.log('Creating new Stripe customer for free tier user:', userID)
      
      // Create Stripe customer for free tier user
      const stripeCustomer = await stripe.customers.create({
        email: email,
        name: name,
        metadata: {
          userID: userID.toString()
        }
      })

      // Store customer in stripe-store
      await stripeStore.setCustomer(userID, stripeCustomer)
      customer = stripeCustomer
    }
    
    // Set subscription status to "free" (not "none")
    const freeStatus = { status: "free" } as const
    
    // Update their subscription status to free
    await stripeStore.setSubscription(customer.id, freeStatus as STRIPE_SUB_CACHE)
    console.log('User subscription set to free:', userID)

    return {
      success: true,
      message: 'User set to free plan',
      subscription: freeStatus,
      customer: {
        id: customer.id,
        email: customer.email,
        name: customer.name
      }
    }
  } catch (error) {
    console.error('Error setting user to free plan:', error)
    
    if (error && typeof error === 'object' && 'statusCode' in error) {
      throw error
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to set user to free plan'
    })
  }
})
