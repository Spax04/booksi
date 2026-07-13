import { useState } from 'react';
import { View, StyleSheet, TextInput } from 'react-native';
import { router } from 'expo-router';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';

export default function SignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  return (
    <SafeAreaView style={styles.container}>

      <View style={styles.header}>
        <Text variant="title" style={styles.title}>Sign In</Text>
      </View>

      <View style={styles.form}>
        <TextInput
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          style={styles.input}
          placeholderTextColor="#aaa"
        />
        <TextInput
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          style={styles.input}
          secureTextEntry
          placeholderTextColor="#aaa"
        />

        <Button 
          style={styles.primaryButton}
          textStyle={styles.primaryButtonText}
          onPress={() => router.replace('/')}
        >
          Login
        </Button>

        <Button 
          style={styles.secondaryButton}
          textStyle={styles.secondaryButtonText}
          onPress={() => {}}
        >
          Google Sign In
        </Button>
      </View>

      <View style={styles.footer}>
        <Text onPress={() => {}} style={styles.link}>Forgot password?</Text>
        <Text onPress={() => {}} style={styles.link}>Create account</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 32, justifyContent: 'center' },
  header: { marginBottom: 48 },
  title: { 
    fontSize: 28, 
    fontWeight: '700', 
    color: '#1c6a77' // Added color to title
  },
  form: { gap: 16 },
  input: {
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    paddingVertical: 12,
    fontSize: 16,
  },
  primaryButton: { 
    backgroundColor: '#1c6a77', // Primary action color
    borderRadius: 8 // Slight rounding for a modern look
  },
  primaryButtonText: { color: '#fff' },
  secondaryButton: { 
    backgroundColor: '#fff', 
    borderWidth: 1, 
    borderColor: '#1c6a77', // Accent outline
    borderRadius: 8 
  },
  secondaryButtonText: { color: '#1c6a77' }, // Text matches border
  footer: { marginTop: 32, alignItems: 'center', gap: 16 },
  link: { color: '#1c6a77', fontSize: 14, fontWeight: '600' } // Accent for links
});