import * as React from 'react'
import { Text, TextInput, View, Pressable, StyleSheet, KeyboardAvoidingView, Platform, Image } from 'react-native'
import { Link, useRouter } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import Colors from '@/constants/Colors'
import { useAuthActions } from "@convex-dev/auth/react";  

export default function Page() {
  const router = useRouter()
  const { signIn } = useAuthActions();
  const [name, setName] = React.useState('')
  const [emailAddress, setEmailAddress] = React.useState('')
  const [password, setPassword] = React.useState('')

  // Random generators for testing
  const generateRandomData = () => {
    const firstNames = ['Alex', 'Jordan', 'Casey', 'Morgan', 'Taylor', 'Riley', 'Avery', 'Cameron', 'Quinn', 'Sage'];
    const lastNames = ['Smith', 'Johnson', 'Brown', 'Davis', 'Miller', 'Wilson', 'Moore', 'Taylor', 'Anderson', 'Thomas'];
    const randomFirst = firstNames[Math.floor(Math.random() * firstNames.length)];
    const randomLast = lastNames[Math.floor(Math.random() * lastNames.length)];
    const randomNumber = Math.floor(Math.random() * 9999);
    
    const randomName = `${randomFirst} ${randomLast}`;
    const randomEmail = `${randomFirst.toLowerCase()}.${randomLast.toLowerCase()}${randomNumber}@test.com`;
    
    setName(randomName);
    setEmailAddress(randomEmail);
    setPassword('Jona1995!');
  };

  // Handle submission of sign-up form
  const onSignUpPress = async () => {
    if (name && emailAddress && password) {
      try {
        await signIn("password", {
          name: name,
          email: emailAddress,
          password: password,
          flow: "signUp",
        });

        // Add a delay to ensure auth state is updated, then redirect to subscription page
        setTimeout(() => {
          router.replace('/subscribe');
        }, 200);
      } catch (error) {
        console.error('Sign up error:', error);
        alert(`Sign up failed: ${error.message || 'Please check your credentials and try again.'}`);
      }
    } else {
      alert('Please enter name, email and password')
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
          
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Join us to discover amazing restaurants</Text>

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              autoCapitalize="words"
              value={name}
              placeholder="Full Name..."
              placeholderTextColor={Colors.light.tabIconDefault}
              onChangeText={(name) => setName(name)}
            />
          </View>

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

          <Pressable style={styles.button} onPress={onSignUpPress}>
            <Text style={styles.buttonText}>Sign up</Text>
          </Pressable>

          <Pressable style={styles.randomButton} onPress={generateRandomData}>
            <Text style={styles.randomButtonText}>🎲 Generate Random Test Data</Text>
          </Pressable>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account?</Text>
            <Link href="/sign-in" asChild>
              <Pressable>
                <Text style={styles.linkText}>Sign in</Text>
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
    marginBottom: 16,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  randomButton: {
    backgroundColor: '#6B7280',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    marginBottom: 24,
  },
  randomButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
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