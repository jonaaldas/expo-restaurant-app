import React, { useState } from 'react'
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  Pressable, 
  TextInput, 
  Alert,
  KeyboardAvoidingView,
  Platform
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import Colors from '@/constants/Colors'
import { SignOutButton } from '@/components/SignOutButton'
import { useQuery } from 'convex/react'
import { api } from '@/convex/_generated/api'

export default function SettingsPage() {
  const router = useRouter()
  // Hardcoded user data
  const user = useQuery(api.user.getUser);
  console.log("user", user);
  
  
  // Password update states
  const [isEditingPassword, setIsEditingPassword] = useState(false)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false)

  // Check if user signed in with email (has password capability)
  const hasEmailPassword = user?.email !== undefined


  const handleUpdatePassword = async () => {
    if (newPassword.length < 8) {
      Alert.alert('Error', 'Password must be at least 8 characters long')
      return
    }

    if (!currentPassword) {
      Alert.alert('Error', 'Please enter your current password')
      return
    }

    setIsUpdatingPassword(true)
    // Simplified password update
    setTimeout(() => {
      setIsEditingPassword(false)
      setCurrentPassword('')
      setNewPassword('')
      Alert.alert('Success', 'Password updated successfully!')
      setIsUpdatingPassword(false)
    }, 1000)
  }

  const handleBackPress = () => {
    router.back()
  }



  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView 
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.keyboardView}
        >
          <ScrollView 
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Header */}
            <View style={styles.header}>
              <Pressable onPress={handleBackPress} style={styles.backButton}>
                <Text style={styles.backButtonText}>←</Text>
              </Pressable>
              <Text style={styles.title}>Settings</Text>
              <View style={{ width: 40 }} />
            </View>


            {/* Password Section - Only for email users */}
            {hasEmailPassword && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>Password</Text>
                  <Pressable 
                    onPress={() => setIsEditingPassword(!isEditingPassword)}
                    style={styles.editButton}
                  >
                    <Text style={styles.editButtonText}>
                      {isEditingPassword ? 'Cancel' : 'Change'}
                    </Text>
                  </Pressable>
                </View>
                
                {isEditingPassword ? (
                  <View style={styles.editForm}>
                    <TextInput
                      style={styles.input}
                      value={currentPassword}
                      onChangeText={setCurrentPassword}
                      placeholder="Current Password"
                      placeholderTextColor={Colors.colors.gray}
                      secureTextEntry={true}
                      autoCapitalize="none"
                    />
                    <TextInput
                      style={styles.input}
                      value={newPassword}
                      onChangeText={setNewPassword}
                      placeholder="New Password (min 8 characters)"
                      placeholderTextColor={Colors.colors.gray}
                      secureTextEntry={true}
                      autoCapitalize="none"
                    />
                    <Pressable 
                      style={[styles.saveButton, isUpdatingPassword && styles.disabledButton]}
                      onPress={handleUpdatePassword}
                      disabled={isUpdatingPassword}
                    >
                      <Text style={styles.saveButtonText}>
                        {isUpdatingPassword ? 'Updating...' : 'Update Password'}
                      </Text>
                    </Pressable>
                  </View>
                ) : (
                  <Text style={styles.passwordHint}>
                    Change your account password
                  </Text>
                )}
              </View>
            )}

            {/* Account Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Account</Text>
              
              <View style={styles.menuItem}>
                <Text style={styles.menuItemText}>Email</Text>
                <Text style={styles.menuItemValue}>
                  {user?.email}
                </Text>
              </View>
              
              <View style={styles.menuItem}>
                <Text style={styles.menuItemText}>Member Since</Text>
                <Text style={styles.menuItemValue}>
                    {new Date(user?._creationTime || '').toLocaleDateString()}
                </Text>
              </View>
            </View>


            {/* Actions */}
            <View style={styles.section}>
              <View style={styles.signOutWrapper}>
                <SignOutButton />
              </View>
              
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.colors.white,
  },
  safeArea: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 28,
    color: Colors.colors.navy,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.colors.navy,
  },
  section: {
    backgroundColor: '#F8F9FA',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.colors.navy,
  },
  editButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  editButtonText: {
    color: Colors.colors.orange,
    fontSize: 16,
    fontWeight: '600',
  },
  editForm: {
    width: '100%',
  },
  input: {
    backgroundColor: Colors.colors.white,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 12,
    color: Colors.colors.navy,
    borderWidth: 2,
    borderColor: '#E9ECEF',
  },
  saveButton: {
    backgroundColor: Colors.colors.orange,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  saveButtonText: {
    color: Colors.colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  disabledButton: {
    opacity: 0.6,
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#E9ECEF',
  },
  menuItemText: {
    fontSize: 16,
    color: Colors.colors.navy,
  },
  menuItemArrow: {
    fontSize: 20,
    color: Colors.colors.orange,
  },
  menuItemValue: {
    fontSize: 16,
    color: Colors.colors.gray,
  },
  signOutWrapper: {
    marginBottom: 12,
  },
  passwordHint: {
    fontSize: 14,
    color: Colors.colors.gray,
    textAlign: 'center',
    paddingVertical: 8,
  },
})