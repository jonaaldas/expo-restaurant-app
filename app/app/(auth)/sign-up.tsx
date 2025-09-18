import * as React from 'react'
import { Text, TextInput, View, Pressable, StyleSheet, KeyboardAvoidingView, Platform, Image } from 'react-native'
import { useSignUp, useOAuth } from '@clerk/clerk-expo'
import { Link, useRouter } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import Colors from '@/constants/Colors'
import * as WebBrowser from 'expo-web-browser'
import * as Linking from 'expo-linking'

// Warm up browser for better OAuth performance
WebBrowser.maybeCompleteAuthSession()

export default function Page() {
  const { isLoaded, signUp, setActive } = useSignUp()
  const router = useRouter()
  const { startOAuthFlow: startGoogleFlow } = useOAuth({ strategy: 'oauth_google' })
  const { startOAuthFlow: startAppleFlow } = useOAuth({ strategy: 'oauth_apple' })

  const [emailAddress, setEmailAddress] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [pendingVerification, setPendingVerification] = React.useState(false)
  const [code, setCode] = React.useState('')

  // Warm up browser for OAuth
  React.useEffect(() => {
    void WebBrowser.warmUpAsync()
    return () => {
      void WebBrowser.coolDownAsync()
    }
  }, [])

  // Handle submission of sign-up form
  const onSignUpPress = async () => {
    if (!isLoaded) return

    // Start sign-up process using email and password provided
    try {
      await signUp.create({
        emailAddress,
        password,
      })

      // Send user an email with verification code
      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' })

      // Set 'pendingVerification' to true to display second form
      // and capture OTP code
      setPendingVerification(true)
    } catch (err) {
      // See https://clerk.com/docs/custom-flows/error-handling
      // for more info on error handling
      console.error(JSON.stringify(err, null, 2))
    }
  }

  // Handle submission of verification form
  const onVerifyPress = async () => {
    if (!isLoaded) return

    try {
      // Use the code the user provided to attempt verification
      const signUpAttempt = await signUp.attemptEmailAddressVerification({
        code,
      })

      // If verification was completed, set the session to active
      // and redirect the user
      if (signUpAttempt.status === 'complete') {
        await setActive({
          session: signUpAttempt.createdSessionId,
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
        console.error(JSON.stringify(signUpAttempt, null, 2))
      }
    } catch (err) {
      // See https://clerk.com/docs/custom-flows/error-handling
      // for more info on error handling
      console.error(JSON.stringify(err, null, 2))
    }
  }

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

  if (pendingVerification) {
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
              <Text style={styles.title}>Verify Email</Text>
              <Text style={styles.subtitle}>We've sent a verification code to your email</Text>
              
              <View style={styles.inputContainer}>
                <TextInput
                  value={code}
                  placeholder="Enter verification code"
                  placeholderTextColor={Colors.colors.gray}
                  onChangeText={(code) => setCode(code)}
                  style={styles.input}
                  keyboardType="number-pad"
                />
              </View>
              
              <Pressable 
                style={({ pressed }) => [
                  styles.primaryButton,
                  { opacity: pressed ? 0.9 : 1 }
                ]}
                onPress={onVerifyPress}
              >
                <Text style={styles.primaryButtonText}>Verify</Text>
              </Pressable>
            </View>
          </SafeAreaView>
        </KeyboardAvoidingView>
      </View>
    )
  }

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
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>Sign up to get started</Text>
            
            <View style={styles.inputContainer}>
              <TextInput
                autoCapitalize="none"
                value={emailAddress}
                placeholder="Email address"
                placeholderTextColor={Colors.colors.gray}
                onChangeText={(email) => setEmailAddress(email)}
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
            </View>
            
            <Pressable 
              style={({ pressed }) => [
                styles.primaryButton,
                { opacity: pressed ? 0.9 : 1 }
              ]}
              onPress={onSignUpPress}
              disabled={!isLoaded}
            >
              <Text style={styles.primaryButtonText}>Sign Up</Text>
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
              <Text style={styles.linkText}>Already have an account? </Text>
              <Link href="/(auth)/sign-in" asChild>
                <Pressable>
                  <Text style={styles.linkHighlight}>Sign in</Text>
                </Pressable>
              </Link>
            </View>
          </View>
        </SafeAreaView>
      </KeyboardAvoidingView>
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
    marginBottom: 24,
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
})