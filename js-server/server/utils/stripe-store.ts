import storage from "./storage";
import type Stripe from "stripe";

export type STRIPE_SUB_CACHE =
  | {
      subscriptionId: string | null;
      status: Stripe.Subscription.Status;
      priceId: string | null;
      currentPeriodStart: number | null;
      currentPeriodEnd: number | null;
      cancelAtPeriodEnd: boolean;
      paymentMethod: {
        brand: string | null;
        last4: string | null;
      } | null;
    }
  | {
      status: "free"; 
    } | {
      status: "none";
    };

const isDev = process.env.NODE_ENV === 'development' || 
             process.env.STRIPE_KEY?.includes('sk_test_');
const envPrefix = isDev ? 'dev' : 'prod';

const getCustomer = async (userId: string): Promise<any | null> => {
  const cachedCustomer = await storage.getItem(
    `stripe:${envPrefix}:customer:${userId}`
  );
  return cachedCustomer;
};

const getSubscription = async (customerId: string): Promise<STRIPE_SUB_CACHE | null> => {
  const cachedSubscription = await storage.getItem(
    `stripe:${envPrefix}:subscription:${customerId}`
  );
  return cachedSubscription ? cachedSubscription as STRIPE_SUB_CACHE : null;
};

const getSubscriptionStatus = async (userId: string): Promise<Stripe.Subscription.Status | "none" | null> => {
  const customer = (await getCustomer(userId)) as { id: string };
  const id = customer?.id;
  if (!id) {
    return null;
  }
  const cachedSubscription = await storage.getItem(
    `stripe:${envPrefix}:subscription:${id}`
  );
  return (cachedSubscription as STRIPE_SUB_CACHE)?.status || null;
};

const setCustomer = async (userId: string, customer: any): Promise<void> => {
  await storage.setItem(
    `stripe:${envPrefix}:customer:${userId}`,
    customer
  );
};

const setSubscription = async (customerId: string, subscription: STRIPE_SUB_CACHE): Promise<void> => {
  await storage.setItem(
    `stripe:${envPrefix}:subscription:${customerId}`,
    subscription
  );
};

export default {
  getCustomer,
  getSubscription,
  getSubscriptionStatus,
  setCustomer,
  setSubscription,
  isDev,
  envPrefix,
};
