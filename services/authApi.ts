import axios from 'axios';
import { API_BASE } from './apiConfig';

export async function registerUser({ fullName, phoneNumber, email, password, role }: { fullName: string, phoneNumber: string, email: string, password: string, role: string }) {
  const res = await axios.post(`${API_BASE}/register/`, {
    email,
    full_name: fullName,
    phone: phoneNumber,
    user_type: role,
    password,
  });
  return res.data;
}

export async function verifyEmail({ uidb64, token }: { uidb64: string, token: string }) {
  const res = await axios.post(`${API_BASE}/verify-email/`, { uidb64, token });
  return res.data;
}

export async function loginUser({ email, password }: { email: string, password: string }) {
  try {
    const res = await axios.post(`${API_BASE}/token/`, { email, password });
    return res.data;
  } catch (error: any) {
    if (error.response) {
      if (error.response.status === 401) {
        throw new Error('Invalid credentials');
      } else if (error.response.status === 400) {
        throw new Error(error.response.data.detail || 'Invalid credentials');
      } else if (error.response.status === 500) {
        throw new Error('Server error. Please try again later.');
      } else {
        throw new Error(error.response.data.detail || error.message);
      }
    } else {
      throw new Error('Network error. Please check your connection.');
    }
  }
}
