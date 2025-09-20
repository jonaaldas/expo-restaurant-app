import { createError, defineEventHandler, readBody } from 'h3'
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

    // Check if customer already exists
    const existingCustomers = await stripe.customers.list({
      limit: 1,
      email: email
    })

    if (existingCustomers.data.length > 0) {
      // Return existing customer
      const existingCustomer = existingCustomers.data[0]
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

    const customer = await stripe.customers.create({
      email,
      name,
      metadata: {
        userID: userID.toString()
      }
    })

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
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to create customer'
    })
  }
})
