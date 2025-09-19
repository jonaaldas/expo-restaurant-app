import { useRouter } from 'expo-router'
import { Text, TouchableOpacity, StyleSheet } from 'react-native'
import { useAuthActions } from "@convex-dev/auth/react";
export const SignOutButton = () => {
  const router = useRouter()
  const { signOut } = useAuthActions();
  const handleSignOut = async () => {
    // Simplified sign out - just navigate to auth
    await signOut()
    router.replace('/(auth)/sign-in')
  }
  
  return (
    <TouchableOpacity onPress={handleSignOut} style={styles.button}>
      <Text style={styles.text}>Sign Out</Text>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#FF3B30',
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
    width: '100%',
  },
  text: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
})