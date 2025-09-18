import { useSignIn, useOAuth } from '@clerk/clerk-expo'
import { Link, useRouter } from 'expo-router'
import { Text, TextInput, View, Pressable, StyleSheet, KeyboardAvoidingView, Platform, Image } from 'react-native'
import React from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import Colors from '@/constants/Colors'
import * as WebBrowser from 'expo-web-browser'
import * as Linking from 'expo-linking'
import ForgotPasswordModal from '@/components/ForgotPasswordModal'

// Warm up browser for better OAuth performance
WebBrowser.maybeCompleteAuthSession()

export default function Page() {
  const { signIn, setActive, isLoaded } = useSignIn()
  const router = useRouter()
  const { startOAuthFlow: startGoogleFlow } = useOAuth({ strategy: 'oauth_google' })
  const { startOAuthFlow: startAppleFlow } = useOAuth({ strategy: 'oauth_apple' })

  const [emailAddress, setEmailAddress] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [showForgotPasswordModal, setShowForgotPasswordModal] = React.useState(false)

  // Warm up browser for OAuth
  React.useEffect(() => {
    void WebBrowser.warmUpAsync()
    return () => {
      void WebBrowser.coolDownAsync()
    }
  }, [])

  // Handle the submission of the sign-in form
  const onSignInPress = React.useCallback(async () => {
    if (!isLoaded) return

    // Start the sign-in process using the email and password provided
    try {
      const signInAttempt = await signIn.create({
        identifier: emailAddress,
        password,
      })

      // If sign-in process is complete, set the created session as active
      // and redirect the user
      if (signInAttempt.status === 'complete') {
        await setActive({
          session: signInAttempt.createdSessionId,
          navigate: async ({ session }) => {
            if (session?.currentTask) {
              // Check for tasks and navigate to custom UI to help users resolve them
              // See https://clerk.com/docs/custom-flows/overview#session-tasks
              console.log(session?.currentTask)
              return
            }

            router.replace('/')
          },
        })
      } else {
        // If the status is not complete, check why. User may need to
        // complete further steps.
        console.error(JSON.stringify(signInAttempt, null, 2))
      }
    } catch (err) {
      // See https://clerk.com/docs/custom-flows/error-handling
      // for more info on error handling
      console.error(JSON.stringify(err, null, 2))
    }
  }, [isLoaded, emailAddress, password])

  const onGooglePress = React.useCallback(async () => {
    try {
      const { createdSessionId, signIn, signUp, setActive } = 
        await startGoogleFlow({
          redirectUrl: Linking.createURL('/(home)', { scheme: 'myapp' }),
        })
      
      if (createdSessionId) {
        await setActive({ session: createdSessionId })
        router.replace('/')
      } else {
        // Use signIn or signUp for next steps such as MFA
        console.log('Additional steps required')
      }
    } catch (err) {
      console.error('OAuth error', err)
    }
  }, [startGoogleFlow, router])

  const onApplePress = React.useCallback(async () => {
    try {
      const { createdSessionId, signIn, signUp, setActive } = 
        await startAppleFlow({
          redirectUrl: Linking.createURL('/(home)', { scheme: 'myapp' }),
        })
      
      if (createdSessionId) {
        await setActive({ session: createdSessionId })
        router.replace('/')
      } else {
        // Use signIn or signUp for next steps such as MFA
        console.log('Additional steps required')
      }
    } catch (err) {
      console.error('OAuth error', err)
    }
  }, [startAppleFlow, router])

  return (
    <View style={styles.container}>
      <Image
        resizeMode="cover"
        source={require("@/assets/images/res.jpg")}
        style={styles.backgroundImage}
      />
      <View style={styles.overlay} />
      
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.content}>
            <Text style={styles.title}>Welcome Back</Text>
            <Text style={styles.subtitle}>Sign in to continue to your account</Text>
            
            <View style={styles.inputContainer}>
              <TextInput
                autoCapitalize="none"
                value={emailAddress}
                placeholder="Email address"
                placeholderTextColor={Colors.colors.gray}
                onChangeText={(emailAddress) => setEmailAddress(emailAddress)}
                style={styles.input}
                keyboardType="email-address"
              />
              
              <TextInput
                value={password}
                placeholder="Password"
                placeholderTextColor={Colors.colors.gray}
                secureTextEntry={true}
                onChangeText={(password) => setPassword(password)}
                style={styles.input}
              />
              
              <Pressable 
                onPress={() => setShowForgotPasswordModal(true)}
                style={styles.forgotPasswordLink}
              >
                <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
              </Pressable>
            </View>
            
            <Pressable 
              style={({ pressed }) => [
                styles.primaryButton,
                { opacity: pressed ? 0.9 : 1 }
              ]}
              onPress={onSignInPress}
              disabled={!isLoaded}
            >
              <Text style={styles.primaryButtonText}>Sign In</Text>
            </Pressable>
            
            <View style={styles.dividerContainer}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>OR</Text>
              <View style={styles.dividerLine} />
            </View>
            
            <Pressable 
              style={({ pressed }) => [
                styles.oauthButton,
                { opacity: pressed ? 0.9 : 1 }
              ]}
              onPress={onGooglePress}
            >
              <Text style={styles.oauthButtonText}>🔍 Continue with Google</Text>
            </Pressable>
            
            <Pressable 
              style={({ pressed }) => [
                styles.oauthButton,
                styles.appleButton,
                { opacity: pressed ? 0.9 : 1 }
              ]}
              onPress={onApplePress}
            >
              <Text style={[styles.oauthButtonText, styles.appleButtonText]}>🍎 Continue with Apple</Text>
            </Pressable>
            
            <View style={styles.linkContainer}>
              <Text style={styles.linkText}>Don't have an account? </Text>
              <Link href="/(auth)/sign-up" asChild>
                <Pressable>
                  <Text style={styles.linkHighlight}>Sign up</Text>
                </Pressable>
              </Link>
            </View>
          </View>
        </SafeAreaView>
      </KeyboardAvoidingView>
      
      <ForgotPasswordModal 
        visible={showForgotPasswordModal}
        onClose={() => setShowForgotPasswordModal(false)}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: "relative",
  },
  backgroundImage: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: "100%",
    height: "100%",
  },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: Colors.colors.navyOverlay,
  },
  keyboardView: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    justifyContent: "center",
  },
  content: {
    paddingHorizontal: 24,
    paddingVertical: 32,
    alignItems: "center",
  },
  title: {
    fontSize: 36,
    fontWeight: "bold",
    color: Colors.colors.white,
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: Colors.colors.white,
    marginBottom: 32,
    textAlign: "center",
    opacity: 0.9,
  },
  inputContainer: {
    width: "100%",
    marginBottom: 16,
  },
  input: {
    width: "100%",
    height: 52,
    backgroundColor: Colors.colors.white,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    marginBottom: 16,
    color: Colors.colors.navy,
    borderWidth: 2,
    borderColor: Colors.colors.white,
  },
  primaryButton: {
    width: "100%",
    height: 52,
    backgroundColor: Colors.colors.orange,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
    shadowColor: Colors.colors.orangeShadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  primaryButtonText: {
    color: Colors.colors.white,
    fontSize: 18,
    fontWeight: "600",
  },
  linkContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 16,
  },
  linkText: {
    color: Colors.colors.white,
    fontSize: 14,
    opacity: 0.9,
  },
  linkHighlight: {
    color: Colors.colors.orange,
    fontSize: 14,
    fontWeight: "600",
  },
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 20,
    width: "100%",
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.colors.white,
    opacity: 0.3,
  },
  dividerText: {
    color: Colors.colors.white,
    paddingHorizontal: 16,
    fontSize: 14,
    opacity: 0.8,
  },
  oauthButton: {
    width: "100%",
    height: 52,
    backgroundColor: Colors.colors.white,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  oauthButtonText: {
    color: Colors.colors.navy,
    fontSize: 16,
    fontWeight: "600",
  },
  appleButton: {
    backgroundColor: "#000000",
  },
  appleButtonText: {
    color: Colors.colors.white,
  },
  forgotPasswordLink: {
    alignSelf: 'flex-end',
    marginTop: -8,
    marginBottom: 16,
    paddingVertical: 4,
  },
  forgotPasswordText: {
    color: Colors.colors.orange,
    fontSize: 14,
    fontWeight: '600',
  },
})