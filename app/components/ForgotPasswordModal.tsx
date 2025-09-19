import React from 'react'
import { 
  Modal, 
  View, 
  Text, 
  TextInput, 
  Pressable, 
  StyleSheet, 
  KeyboardAvoidingView, 
  Platform 
} from 'react-native'
import { useRouter } from 'expo-router'
import Colors from '@/constants/Colors'

interface ForgotPasswordModalProps {
  visible: boolean
  onClose: () => void
}

export default function ForgotPasswordModal({ visible, onClose }: ForgotPasswordModalProps) {
  const router = useRouter()
  
  const [email, setEmail] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [code, setCode] = React.useState('')
  const [successfulCreation, setSuccessfulCreation] = React.useState(false)
  const [error, setError] = React.useState('')
  const [isLoading, setIsLoading] = React.useState(false)

  const resetState = () => {
    setEmail('')
    setPassword('')
    setCode('')
    setSuccessfulCreation(false)
    setError('')
    setIsLoading(false)
  }

  const handleClose = () => {
    resetState()
    onClose()
  }

  const sendResetCode = async () => {
    if (!email) return

    setIsLoading(true)
    setError('')
    
    // Simplified password reset - just show success
    setTimeout(() => {
      setSuccessfulCreation(true)
      setIsLoading(false)
    }, 1000)
  }

  const resetPassword = async () => {
    if (!code || !password) return

    setIsLoading(true)
    setError('')
    
    // Simplified password reset - just navigate to home
    setTimeout(() => {
      handleClose()
      router.replace('/')
      setIsLoading(false)
    }
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={handleClose}
    >
      <View style={styles.modalOverlay}>
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <View style={styles.modalContent}>
            <View style={styles.header}>
              <Text style={styles.title}>
                {!successfulCreation ? 'Forgot Password?' : 'Reset Your Password'}
              </Text>
              <Pressable onPress={handleClose} style={styles.closeButton}>
                <Text style={styles.closeText}>✕</Text>
              </Pressable>
            </View>
            
            {!successfulCreation ? (
              <>
                <Text style={styles.description}>
                  Enter your email address and we'll send you a code to reset your password.
                </Text>
                
                <TextInput
                  style={styles.input}
                  value={email}
                  placeholder="Email address"
                  placeholderTextColor={Colors.colors.gray}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  editable={!isLoading}
                />
                
                <Pressable 
                  style={({ pressed }) => [
                    styles.primaryButton,
                    { opacity: pressed ? 0.9 : 1 },
                    (!email || isLoading) && styles.disabledButton
                  ]}
                  onPress={sendResetCode}
                  disabled={!email || isLoading}
                >
                  <Text style={styles.primaryButtonText}>
                    {isLoading ? 'Sending...' : 'Send Reset Code'}
                  </Text>
                </Pressable>
              </>
            ) : (
              <>
                <Text style={styles.description}>
                  Check your email for a verification code. Enter the code and your new password below.
                </Text>
                
                <TextInput
                  style={styles.input}
                  value={code}
                  placeholder="Verification code"
                  placeholderTextColor={Colors.colors.gray}
                  onChangeText={setCode}
                  keyboardType="number-pad"
                  editable={!isLoading}
                />
                
                <TextInput
                  style={styles.input}
                  value={password}
                  placeholder="New password"
                  placeholderTextColor={Colors.colors.gray}
                  onChangeText={setPassword}
                  secureTextEntry
                  editable={!isLoading}
                />
                
                <Pressable 
                  style={({ pressed }) => [
                    styles.primaryButton,
                    { opacity: pressed ? 0.9 : 1 },
                    (!code || !password || isLoading) && styles.disabledButton
                  ]}
                  onPress={resetPassword}
                  disabled={!code || !password || isLoading}
                >
                  <Text style={styles.primaryButtonText}>
                    {isLoading ? 'Resetting...' : 'Reset Password'}
                  </Text>
                </Pressable>
                
                <Pressable 
                  style={styles.backButton}
                  onPress={() => setSuccessfulCreation(false)}
                  disabled={isLoading}
                >
                  <Text style={styles.backButtonText}>← Back to email</Text>
                </Pressable>
              </>
            )}
            
            {error ? <Text style={styles.errorText}>{error}</Text> : null}
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  keyboardView: {
    width: '100%',
  },
  modalContent: {
    backgroundColor: Colors.colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 40,
    minHeight: 320,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.colors.navy,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.colors.lightGray,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeText: {
    fontSize: 18,
    color: Colors.colors.navy,
    fontWeight: 'bold',
  },
  description: {
    fontSize: 14,
    color: Colors.colors.gray,
    marginBottom: 24,
    lineHeight: 20,
  },
  input: {
    width: '100%',
    height: 52,
    backgroundColor: Colors.colors.lightGray,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    marginBottom: 16,
    color: Colors.colors.navy,
    borderWidth: 1,
    borderColor: Colors.colors.lightGray,
  },
  primaryButton: {
    width: '100%',
    height: 52,
    backgroundColor: Colors.colors.orange,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
    shadowColor: Colors.colors.orangeShadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  primaryButtonText: {
    color: Colors.colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  disabledButton: {
    backgroundColor: Colors.colors.gray,
    shadowOpacity: 0,
    elevation: 0,
  },
  errorText: {
    color: '#ef4444',
    fontSize: 14,
    marginTop: 12,
    textAlign: 'center',
  },
  backButton: {
    marginTop: 16,
    paddingVertical: 8,
  },
  backButtonText: {
    color: Colors.colors.orange,
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
})