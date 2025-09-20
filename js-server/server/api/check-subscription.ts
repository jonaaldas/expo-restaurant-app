import { createError, defineEventHandler, readBody } from 'h3'
import stripeStore from '../utils/stripe-store'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { userID } = body;

    if (!userID) {
      throw createError({
        statusCode: 400,
        statusMessage: 'userID is required'
      })
    }

    // Get customer and subscription from stripe-store using userID
    const customer = await stripeStore.getCustomer(userID)

    if (!customer) {
      // No customer found - user hasn't chosen a plan yet
      const response = {
        hasActiveSubscription: false,
        customer: null,
        subscriptions: [{status: 'none'}]
      }
      return response
    }

    const subscription = await stripeStore.getSubscription(customer.id)

    if (!subscription) {
      // Customer exists but no subscription record - treat as none (needs to choose plan)
      const response = {
        hasActiveSubscription: false,
        customer: {
          id: customer.id,
          email: customer.email,
          name: customer.name,
          metadata: customer.metadata
        },
        subscriptions: [{status: 'none'}]
      }
      return response
    }

    // Check subscription status
    const isActive = subscription.status === 'active' || subscription.status === 'trialing'
    const isFree = subscription.status === 'free'

    let subscriptionData;
    if (isActive) {
      // Active/paid subscription with full details
      subscriptionData = [{
        id: subscription.subscriptionId,
        status: subscription.status,
        current_period_start: subscription.currentPeriodStart,
        current_period_end: subscription.currentPeriodEnd,
        cancel_at_period_end: subscription.cancelAtPeriodEnd,
        items: subscription.priceId || []
      }];
    } else if (isFree) {
      // Free tier user
      subscriptionData = [{status: 'free'}];
    } else {
      // Unknown status, treat as none
      subscriptionData = [{status: 'none'}];
    }

    const response = {
      hasActiveSubscription: isActive,
      customer: {
        id: customer.id,
        email: customer.email,
        name: customer.name,
        metadata: customer.metadata
      },
      subscriptions: subscriptionData
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
