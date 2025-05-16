import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Image } from 'react-native';
import { registerUser } from '../services/authApi';

const SignUpScreen = ({ onSignUp, onLogin }: { onSignUp: () => void, onLogin: () => void }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState(''); // Default to an empty string to indicate no selection
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');

  const validate = () => {
    if (!fullName.trim()) return 'Full Name is required.';
    if (!email.includes('@')) return 'Please enter a valid email.';
    if (!phoneNumber.match(/^\d{10}$/)) return 'Please enter a valid 10-digit phone number.';
    if (!password.trim()) return 'Password is required.';
    if (!role) return 'Please select who you are.';
    return '';
  };

  const handleSignUp = async () => {
    setError('');
    setSuccess('');
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }
    setLoading(true);
    try {
      await registerUser({ fullName, phoneNumber, email, password, role });
      setSuccess('Account created! Please check your email for a verification link.');
      setFullName('');
      setPhoneNumber('');
      setEmail('');
      setPassword('');
    } catch (e: any) {
      if (e.response?.status === 400 && e.response?.data?.email) {
        setError('Failed to process: Email already exists.');
      } else {
        setError(e.response?.data?.detail || e.message || 'Sign up failed.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f5f6fa', padding: 20 }}>
      <Image
        source={require('../assets/DoctorbookAdmin.png')}
        style={styles.logo}
      />
      <Text style={styles.title}>Create Your Account</Text>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      {success ? <Text style={styles.success}>{success}</Text> : null}
      <TextInput
        style={styles.input}
        placeholder="Full Name *"
        value={fullName}
        onChangeText={(text) => {
          setFullName(text);
          if (error) setError('');
        }}
        editable={!loading}
      />
      <TextInput
        style={styles.input}
        placeholder="Phone Number *"
        value={phoneNumber}
        onChangeText={(text) => {
          setPhoneNumber(text);
          if (error) setError('');
        }}
        keyboardType="phone-pad"
        editable={!loading}
      />
      <TextInput
        style={styles.input}
        placeholder="Email *"
        value={email}
        onChangeText={(text) => {
          setEmail(text);
          if (error) setError('');
        }}
        autoCapitalize="none"
        keyboardType="email-address"
        editable={!loading}
      />
      <TextInput
        style={styles.input}
        placeholder="Password *"
        value={password}
        onChangeText={(text) => {
          setPassword(text);
          if (error) setError('');
        }}
        secureTextEntry
        editable={!loading}
      />
      <Text style={styles.roleTitle}>Who are you?</Text>
      <View style={styles.roleContainer}>
        <TouchableOpacity
          style={[styles.roleButton, role === 'doctor' && styles.activeRoleButton]}
          onPress={() => {
            setRole('doctor');
            if (error) setError('');
          }}
          disabled={loading}
        >
          <Text style={[styles.roleText, role === 'doctor' && styles.activeRoleText]}>Doctor</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.roleButton, role === 'patient' && styles.activeRoleButton]}
          onPress={() => {
            setRole('patient');
            if (error) setError('');
          }}
          disabled={loading}
        >
          <Text style={[styles.roleText, role === 'patient' && styles.activeRoleText]}>Patient</Text>
        </TouchableOpacity>
      </View>
      <TouchableOpacity
        style={styles.signUpButton}
        onPress={handleSignUp}
        disabled={loading}
      >
        <Text style={styles.signUpButtonText}>{loading ? 'Signing Up...' : 'Sign Up'}</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.linkButton}
        onPress={() => onLogin()}
        disabled={loading}
      >
        <Text style={styles.linkButtonText}>
          Already have an account?{' '}
          <Text style={{ textDecorationLine: 'underline' }}>Login</Text>
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  logo: {
    width: 150,
    height: 150,
    marginBottom: 20,
    resizeMode: 'contain',
    borderRadius: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1976d2',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    width: '90%',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    padding: 10,
    marginBottom: 15,
    fontSize: 16,
  },
  roleTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1976d2',
    marginBottom: 10,
    textAlign: 'center',
  },
  roleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    marginLeft: 25,
    marginRight: 25,
  },
  error: {
    color: 'red',
    marginBottom: 10,
    textAlign: 'center',
  },
  success: {
    color: 'green',
    marginBottom: 10,
    textAlign: 'center',
  },
  roleButton: {
    flex: 1,
    padding: 8,
    marginHorizontal: 5,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    alignItems: 'center',
  },
  activeRoleButton: {
    backgroundColor: '#1976d2',
    borderColor: '#1976d2',
  },
  roleText: {
    color: '#000',
  },
  activeRoleText: {
    color: '#fff',
  },
  signUpButton: {
    width: '90%',
    backgroundColor: '#1976d2',
    padding: 15,
    borderRadius: 6,
    alignItems: 'center',
    marginBottom: 10,
  },
  signUpButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loginButton: {
    backgroundColor: '#42a5f5',
    padding: 15,
    borderRadius: 6,
    alignItems: 'center',
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  linkButton: {
    alignItems: 'center',
    marginTop: 10,
  },
  linkButtonText: {
    color: '#1976d2',
    fontSize: 14,
    fontWeight: 'bold',
    textDecorationLine: 'underline',
  },
});

export default SignUpScreen;
