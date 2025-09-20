import { createError, defineEventHandler, readBody } from 'h3'
import { stripe } from '../utils/stripe'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { userID, customerId } = body

    // Accept either userID or customerId for flexibility
    const searchParam = userID || customerId

    if (!searchParam) {
      throw createError({
        statusCode: 400,
        statusMessage: 'userID or customerId is required'
      })
    }

    let customer = null

    if (customerId) {
      // If customerId is provided, get customer directly
      try {
        customer = await stripe.customers.retrieve(customerId)
      } catch (error) {
        // Customer not found, continue to search by userID
      }
    }

    if (!customer && userID) {
      // Find customer by userID in metadata
      const customers = await stripe.customers.list({
        limit: 1,
        metadata: {
          userID: userID.toString()
        }
      })
      customer = customers.data.length > 0 ? customers.data[0] : null
    }

    if (!customer) {
      return {
        hasActiveSubscription: false,
        customer: null,
        subscriptions: []
      }
    }


    // Get all subscriptions for this customer
    const subscriptions = await stripe.subscriptions.list({
      customer: customer.id,
      status: 'active',
      limit: 10
    })

    const activeSubscriptions = subscriptions.data.filter(sub => 
      sub.status === 'active' || sub.status === 'trialing'
    )

    return {
      hasActiveSubscription: activeSubscriptions.length > 0,
      customer: {
        id: customer.id,
        email: customer.email,
        name: customer.name,
        metadata: customer.metadata
      },
      subscriptions: activeSubscriptions.map(sub => ({
        id: sub.id,
        status: sub.status,
        current_period_start: sub.current_period_start,
        current_period_end: sub.current_period_end,
        cancel_at_period_end: sub.cancel_at_period_end,
        items: sub.items.data.map(item => ({
          price_id: item.price.id,
          product_id: item.price.product,
          quantity: item.quantity
        }))
      }))
    }
  } catch (error) {
    console.error('Error checking subscription:', error)
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to check subscription status'
    })
  }
})
