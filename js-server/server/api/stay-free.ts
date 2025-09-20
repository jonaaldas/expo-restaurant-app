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
    
    if (!email) {
      throw createError({
        statusCode: 400,
        statusMessage: 'email is required for creating customer'
      })
    }

    console.log('Setting user to free plan:', userID)

    // Get or create customer
    let customer = await stripeStore.getCustomer(userID)
    
    if (!customer) {
      console.log('Creating new Stripe customer for free tier user:', userID)
      
      try {
        // Create Stripe customer for free tier user
        const stripeCustomer = await stripe.customers.create({
          email: email,
          name: name || "Free Tier User",
          metadata: {
            userID: userID.toString(),
            tier: "free",
            createdAt: new Date().toISOString()
          }
        })

        // Store customer in stripe-store
        await stripeStore.setCustomer(userID, stripeCustomer)
        customer = stripeCustomer
        console.log('Successfully created free tier customer:', stripeCustomer.id)
      } catch (stripeError) {
        console.error('Failed to create Stripe customer:', stripeError)
        throw createError({
          statusCode: 503,
          statusMessage: 'Failed to create customer account'
        })
      }
    }
    
    // Set subscription status to "free" (not "none")
    const freeStatus = { status: "free" } as const
    
    try {
      // Update their subscription status to free
      await stripeStore.setSubscription(customer.id, freeStatus as STRIPE_SUB_CACHE)
      console.log('User subscription set to free:', userID)
      
      // Verify the status was set correctly
      const verifyStatus = await stripeStore.getSubscription(customer.id)
      if (verifyStatus?.status !== "free") {
        console.error('Subscription status verification failed:', verifyStatus)
        throw new Error('Failed to set subscription status')
      }
    } catch (statusError) {
      console.error('Failed to set subscription status:', statusError)
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to set subscription status'
      })
    }

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
