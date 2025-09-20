import { defineEventHandler, readBody } from "h3";
import { createError } from "h3";
import { stripe } from "../utils/stripe";

const prices = {
  monthly: "price_1S9UDbPW6ilRA0XQFQLn4slG", // unlimited 9.99
};

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    const period = body.period as "monthly";

    const customerId = body.customerId;

    if (!customerId) {
      throw createError({
        statusCode: 400,
        statusMessage: "No Stripe customer found",
      });
    }

    const ephemeralKey = await stripe.ephemeralKeys.create(
      { customer: customerId },
      { apiVersion: "2025-08-27.basil" }
      );
      
      const subscription = await stripe.subscriptions.create({
        customer: customerId,
        items: [{ price: prices[period] }],
        payment_behavior: "default_incomplete",
        payment_settings: { save_default_payment_method: "on_subscription" },
        expand: ["latest_invoice.confirmation_secret"],
      });

      return {
        success: true,
        clientSecret:
          subscription.latest_invoice?.confirmation_secret?.client_secret as string,
        ephemeralKey: ephemeralKey.secret,
        customer: customerId,
        publishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
        hasTrial: false,
        subscriptionId: subscription.id,
      };
  } catch (error) {
    console.error("Stripe subscription creation error:", error);
    throw createError({
      statusCode: 500,
      statusMessage:
        error instanceof Error
          ? error.message
          : "Failed to create subscription",
    });
  }
});
