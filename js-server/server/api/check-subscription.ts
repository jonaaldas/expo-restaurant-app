import { createError, defineEventHandler, readBody } from 'h3'
import stripeStore from '../utils/stripe-store'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { userID } = body;
    console.log('Received subscription check request for userID:', userID);

    if (!userID) {
      throw createError({
        statusCode: 400,
        statusMessage: 'userID is required'
      })
    }

    // Get customer and subscription from stripe-store using userID
    const customer = await stripeStore.getCustomer(userID)
    console.log('Found customer:', customer ? 'yes' : 'no')
    
    if (!customer) {
      console.log('No customer found, returning free tier')
      // save in stripe-store
      const response = {
        hasActiveSubscription: false,
        customer: null,
        subscriptions: [{status: 'free'}]
      }
      console.log('Sending response:', response)
      return response
    }

    const subscription = await stripeStore.getSubscription(customer.id)
    console.log('Found subscription:', subscription ? 'yes' : 'no')

    if (!subscription) {
      const response = {
        hasActiveSubscription: false,
        customer: {
          id: customer.id,
          email: customer.email,
          name: customer.name,
          metadata: customer.metadata
        },
        subscriptions: [{status: 'free'}]
      }
      console.log('No subscription found, sending response:', response)
      return response
    }

    // Check if subscription is active
    const isActive = subscription.status === 'active' || subscription.status === 'trialing'
    console.log('Subscription status:', subscription.status, 'isActive:', isActive)

    const response = {
      hasActiveSubscription: isActive,
      customer: {
        id: customer.id,
        email: customer.email,
        name: customer.name,
        metadata: customer.metadata
      },
      subscriptions: isActive ? [{
        id: subscription.subscriptionId,
        status: subscription.status,
        current_period_start: subscription.currentPeriodStart,
        current_period_end: subscription.currentPeriodEnd,
        cancel_at_period_end: subscription.cancelAtPeriodEnd,
        items: subscription.priceId || []
      }] : [{status: 'free'}]
    }
    console.log('Sending final response:', response)
    return response
  } catch (error) {
    console.error('Error checking subscription:', error)
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to check subscription status'
    })
  }
})
