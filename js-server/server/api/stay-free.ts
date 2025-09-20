import { createError, defineEventHandler, readBody } from 'h3'
import stripeStore, { STRIPE_SUB_CACHE } from '../utils/stripe-store'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { userID } = body

    if (!userID) {
      throw createError({
        statusCode: 400,
        statusMessage: 'userID is required'
      })
    }

    // Get customer from stripe-store
    const customer = await stripeStore.getCustomer(userID)
    
    // Set subscription status to free
    const freeStatus = { status: "none" } as const
    
    if (customer) {
      // Customer exists, update their subscription status
      await stripeStore.setSubscription(customer.id, freeStatus as STRIPE_SUB_CACHE)
    } else {
      // Customer doesn't exist yet, they're just staying on free plan
      // No need to create a customer record for free users
    }

    return {
      success: true,
      message: 'User set to free plan',
      subscription: freeStatus
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
