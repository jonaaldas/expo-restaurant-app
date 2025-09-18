import { useClerk } from '@clerk/clerk-expo'
import { useRouter } from 'expo-router'
import { Text, TouchableOpacity, StyleSheet } from 'react-native'

export const SignOutButton = () => {
  const { signOut } = useClerk()
  const router = useRouter()
  
  const handleSignOut = async () => {
    try {
      await signOut()
      router.replace('/(app)')
    } catch (err) {
      console.error(JSON.stringify(err, null, 2))
    }
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