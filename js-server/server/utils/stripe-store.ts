import storage from "./storage";

const isDev = process.env.NODE_ENV === 'development' || 
             process.env.STRIPE_KEY?.includes('sk_test_');
const envPrefix = isDev ? 'dev' : 'prod';

const getCustomer = async (userId: string) => {
  const cachedCustomer = await storage.getItem(
    `stripe:${envPrefix}:customer:${userId}`
  );
  return cachedCustomer;
};

const getSubscription = async (customerId: string) => {
  const cachedSubscription = await storage.getItem(
    `stripe:${envPrefix}:subscription:${customerId}`
  );
  return cachedSubscription ? cachedSubscription : null;
};

const getSubscriptionStatus = async (userId: string) => {
  const customer = (await getCustomer(userId)) as { id: string };
  const id = customer?.id;
  if (!id) {
    return null;
  }
  const cachedSubscription = await storage.getItem(
    `stripe:${envPrefix}:subscription:${id}`
  );
  return (cachedSubscription as any)?.status;
};

const setCustomer = async (userId: string, customer: any) => {
  await storage.setItem(
    `stripe:${envPrefix}:customer:${userId}`,
    customer
  );
};

const setSubscription = async (customerId: string, subscription: any) => {
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
