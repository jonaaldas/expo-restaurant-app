import { createContext, useContext, ReactNode } from "react";
import { useQuery as useConvexQuery } from 'convex/react';
import { useQuery as useTanstackQuery } from "@tanstack/react-query";
import { api } from '@/convex/_generated/api';
import { ofetch } from "ofetch";

interface UserContextType {
  user: any | undefined;
  isLoadingUser: boolean;
  subscription: any | undefined;
  isLoadingSubscription: boolean;
  subscriptionError: any;
  refreshSubscription: () => void;
}

export const UserContext = createContext<UserContextType | undefined>(undefined);

interface UserProviderProps {
  children: ReactNode;
}

export const UserProvider = ({ children }: UserProviderProps) => {
  // Fetch user data from Convex
  const user = useConvexQuery(api.user.getUser);
  const isLoadingUser = user === undefined;

  // Fetch subscription status when user is available
  const subscriptionQuery = useTanstackQuery({
    queryKey: ['subscription', user?._id],
    queryFn: async () => {
      if (!user?._id) {
        throw new Error("User ID not available");
      }
      console.log("Fetching subscription for user:", user._id);
      
      try {
        const response = await ofetch(`${process.env.EXPO_PUBLIC_JS_SERVER_URL}/check-subscription`, {
          method: "POST",
          headers: {
            'Content-Type': 'application/json',
          },
          body: {
            userID: user._id,
          }
        });
        console.log("Subscription response:", response);
        return response;
      } catch (error) {
        console.error("Subscription fetch error:", error);
        // For new users who don't have a customer yet, return default "none" status
        return {
          hasActiveSubscription: false,
          customer: null,
          subscriptions: [{ status: 'none' }]
        };
      }
    },
    enabled: !!user?._id,
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
    retry: false, // Don't retry since we handle errors gracefully
  });

  const value: UserContextType = {
    user,
    isLoadingUser,
    subscription: subscriptionQuery.data,
    isLoadingSubscription: subscriptionQuery.isLoading,
    subscriptionError: subscriptionQuery.error,
    refreshSubscription: () => subscriptionQuery.refetch(),
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};