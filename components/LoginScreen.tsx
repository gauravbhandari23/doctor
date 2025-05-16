import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, ActivityIndicator, TouchableOpacity, Image } from 'react-native';
import { loginUser } from '../services/authApi';
import AsyncStorage from '@react-native-async-storage/async-storage';

const LoginScreen = ({ onLogin, onSignUp }: { onLogin: (role: string) => void, onSignUp: () => void }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const validate = () => {
    if (!email.includes('@')) return 'Please enter a valid email.';
    if (!password.trim()) return 'Password is required.';
    return '';
  };

  const handleLogin = async () => {
    setError('');
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }
    setLoading(true);
    try {
      const data = await loginUser({ email, password });
      await AsyncStorage.setItem('access', data.access);
      await AsyncStorage.setItem('refresh', data.refresh);
      const payload = JSON.parse(atob(data.access.split('.')[1]));
      const role = payload.user_type || 'doctor';
      if (!payload.is_verified) {
        setError('Please verify your email before logging in.');
        return;
      }
      if (role === 'doctor') {
        onLogin('doctor'); // Navigate to the doctor component
      } else if (role === 'patient') {
        onLogin('patient'); // Navigate to the patient component
      }
    } catch (e: any) {
      if (e.message === 'Invalid credentials') {
        setError('Invalid credentials. Please check your email and password.');
      } else {
        setError(e.message || 'Login failed.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Image
        source={require('../assets/DoctorbookAdmin.png')}
        style={styles.logo}
      />
      <Text style={styles.title}>Login</Text>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <TextInput
        style={styles.input}
        placeholder="Email"
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
        placeholder="Password"
        value={password}
        onChangeText={(text) => {
          setPassword(text);
          if (error) setError('');
        }}
        secureTextEntry
        editable={!loading}
      />
      <Text style={styles.forgotPassword}>Forgot Password?</Text>
      <TouchableOpacity
        style={[styles.button, { backgroundColor: '#1976d2' }]}
        onPress={handleLogin}
        disabled={loading}
      >
        <Text style={styles.buttonText}>Login</Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={onSignUp}
        disabled={loading}
      >
        <Text style={[styles.linkText, { textAlign: 'center', marginTop: 20 }]}>Don’t have an account?{' '}
          <Text style={{ textDecorationLine: 'underline', color: '#1976d2' }}>Create Account</Text>
        </Text>
      </TouchableOpacity>
      {loading && <ActivityIndicator style={{ marginTop: 10 }} />}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f5f6fa',
  },
  logo: {
    width: 150,
    height: 150,
    marginBottom: 80,
    resizeMode: 'contain',
    borderRadius: 30,
  },
  title: {
    fontSize: 28,
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
  error: {
    color: 'red',
    marginBottom: 10,
    textAlign: 'center',
  },
  forgotPassword: {
    color: '#1976d2',
    textAlign: 'right',
    width: '90%',
    marginBottom: 20,
    fontSize: 14,
  },
  button: {
    width: '90%',
    borderRadius: 25,
    paddingVertical: 10,
    alignItems: 'center',
    marginVertical: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  linkText: {
    fontSize: 16,
    color: '#1976d2',
  },
});

export default LoginScreen;
