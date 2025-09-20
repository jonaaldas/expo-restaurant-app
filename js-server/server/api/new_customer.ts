import { createError, defineEventHandler, readBody } from 'h3'
import { stripe } from '../utils/stripe'
import stripeStore from '../utils/stripe-store'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { userID, email, name } = body
    console.log("new_customer", body)
    
    if (!userID) {
      throw createError({
        statusCode: 400,
        statusMessage: 'userID is required'
      })
    }
    
    if (!email) {
      throw createError({
        statusCode: 400,
        statusMessage: 'email is required'
      })
    }

    // Check if customer already exists in our store first (faster lookup)
    const existingStoreCustomer = await stripeStore.getCustomer(userID)
    if (existingStoreCustomer) {
      console.log("Found existing customer in store:", existingStoreCustomer.id)
      return {
        success: true,
        customer: {
          id: existingStoreCustomer.id,
          email: existingStoreCustomer.email,
          name: existingStoreCustomer.name,
          metadata: existingStoreCustomer.metadata
        },
        isExisting: true
      }
    }

    // Check if customer exists in Stripe by email (fallback)
    const existingCustomers = await stripe.customers.list({
      limit: 3, // Get more to handle potential duplicates
      email: email
    })

    if (existingCustomers.data.length > 0) {
      // Use the first customer and store it in our cache
      const existingCustomer = existingCustomers.data[0]
      console.log("Found existing customer in Stripe, caching:", existingCustomer.id)
      
      // Cache the customer for future lookups
      await stripeStore.setCustomer(userID, existingCustomer)
      
      return {
        success: true,
        customer: {
          id: existingCustomer.id,
          email: existingCustomer.email,
          name: existingCustomer.name,
          metadata: existingCustomer.metadata
        },
        isExisting: true
      }
    }

    console.log("Creating new Stripe customer for:", email)
    const customer = await stripe.customers.create({
      email,
      name: name || "Unknown User",
      metadata: {
        userID: userID.toString()
      }
    })

    // Store customer and set initial subscription status atomically
    await Promise.all([
      stripeStore.setCustomer(userID, customer),
      stripeStore.setSubscription(customer.id, { status: "none" })
    ])

    console.log("Successfully created customer:", customer.id)
    return {
      success: true,
      customer: {
        id: customer.id,
        email: customer.email,
        name: customer.name,
        metadata: customer.metadata
      },
      isExisting: false
    }
  } catch (error) {
    console.error('Error creating Stripe customer:', error)
    
    // Provide more specific error messages
    let statusCode = 500
    let statusMessage = 'Failed to create customer'
    
    if (error && typeof error === 'object' && 'type' in error) {
      // Stripe-specific errors
      if (error.type === 'StripeCardError') {
        statusCode = 400
        statusMessage = 'Invalid payment information'
      } else if (error.type === 'StripeRateLimitError') {
        statusCode = 429
        statusMessage = 'Too many requests, please try again later'
      } else if (error.type === 'StripeConnectionError') {
        statusCode = 503
        statusMessage = 'Payment service temporarily unavailable'
      }
    }
    
    throw createError({
      statusCode,
      statusMessage
    })
  }
})
