import { Text, TextInput, View, Pressable, StyleSheet, KeyboardAvoidingView, Platform, Image } from 'react-native'
import { Link, useRouter } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useState } from 'react'
import Colors from '@/constants/Colors'
import { useAuthActions } from "@convex-dev/auth/react";

export default function Page() {
   const { signIn } = useAuthActions();
  const router = useRouter()
  const [emailAddress, setEmailAddress] = useState('')
  const [password, setPassword] = useState('')

  const onSignInPress = async () => {
    // Simplified sign-in - just navigate to main app
    if (emailAddress && password) {
      try {
        await signIn("password", {
          email: emailAddress,
          password: password,
          flow: "signIn",
          redirectTo: '/(app)',
        });
        router.replace('/(app)');
      } catch (error) {
        alert('Sign in failed. Please check your credentials and try again.');
      }
    } else {
      alert('Please enter email and password');
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <View style={styles.content}>
          <Image
            source={require("../../assets/images/res.jpg")}
            style={styles.image}
            resizeMode="cover"
          />
          
          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.subtitle}>Sign in to continue exploring</Text>

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              autoCapitalize="none"
              value={emailAddress}
              placeholder="Email..."
              placeholderTextColor={Colors.light.tabIconDefault}
              onChangeText={(email) => setEmailAddress(email)}
            />
          </View>

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              value={password}
              placeholder="Password..."
              placeholderTextColor={Colors.light.tabIconDefault}
              secureTextEntry={true}
              onChangeText={(password) => setPassword(password)}
            />
          </View>

          <Pressable style={styles.button} onPress={onSignInPress}>
            <Text style={styles.buttonText}>Sign in</Text>
          </Pressable>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Don't have an account?</Text>
            <Link href="/sign-up" asChild>
              <Pressable>
                <Text style={styles.linkText}>Sign up</Text>
              </Pressable>
            </Link>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  image: {
    width: 120,
    height: 120,
    alignSelf: 'center',
    marginBottom: 30,
    borderRadius: 60,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
    color: Colors.light.text,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 40,
    color: Colors.light.tabIconDefault,
  },
  inputContainer: {
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.light.tabIconDefault,
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    backgroundColor: Colors.light.background,
    color: Colors.light.text,
  },
  button: {
    backgroundColor: Colors.light.tint,
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 24,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 16,
    color: Colors.light.tabIconDefault,
    marginRight: 8,
  },
  linkText: {
    fontSize: 16,
    color: Colors.light.tint,
    fontWeight: '600',
  },
})