import { Password } from "@convex-dev/auth/providers/Password";
import { convexAuth } from "@convex-dev/auth/server";

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [Password({ 
    profile(params) {
      return {
        email: params.email as string,
        name: params.name as string,
      };
    },
  })],
  signIn: {
    "maxFailedAttempsPerHour": 10,
  },
  // Removed callbacks - we'll create Stripe customers when needed instead of at registration
  // This avoids the localhost access issue from Convex actions
});
