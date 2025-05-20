import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE } from './apiConfig';

export async function fetchDoctorProfile() {
  const token = await AsyncStorage.getItem('access');
  const res = await fetch(`${API_BASE}/doctors/`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  const data = await res.json();
  console.log('API Response:', res.status, data); // Log the parsed JSON response
  if (!Array.isArray(data) || data.length === 0) {
    throw new Error('No doctor profile found for this user. Please create one in the admin panel.');
  }
  return data[0]; // Return the first profile if the array is valid
}

export async function updateDoctorProfile(profileId: number, updates: any) {
  const token = await AsyncStorage.getItem('access');
  if (!token) {
    throw new Error('Authentication token is missing. Please log in again.');
  }
  // If phone is present, send as user_phone
  const payload = { ...updates };
  if (updates.phone) {
    payload.user_phone = updates.phone;
    delete payload.phone;
  }
  const res = await fetch(`${API_BASE}/doctors/${profileId}/`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Failed to update doctor profile');
  return await res.json();
}

export async function uploadDoctorDocument(profileId: number, file: any) {
  const token = await AsyncStorage.getItem('access');
  const formData = new FormData();
  formData.append('certificate_document', {
    uri: file.uri,
    name: file.name,
    type: file.mimeType || 'application/octet-stream',
  } as any);
  const res = await fetch(`${API_BASE}/doctors/${profileId}/upload_certificate/`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      // 'Content-Type': 'multipart/form-data', // Let fetch set this automatically
    },
    body: formData,
  });
  if (!res.ok) throw new Error('Failed to upload document');
  return await res.json();
}

export async function fetchDoctorAvailability() {
  const token = await AsyncStorage.getItem('access');
  const res = await fetch(`${API_BASE}/doctor-availabilities/`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  if (!res.ok) throw new Error('Failed to fetch availability');
  return await res.json();
}

export async function addDoctorAvailability(slot: any) {
  const token = await AsyncStorage.getItem('access');
  const res = await fetch(`${API_BASE}/doctor-availabilities/`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(slot),
  });
  if (!res.ok) throw new Error('Failed to add availability');
  return await res.json();
}

export async function deleteDoctorAvailability(id: number) {
  const token = await AsyncStorage.getItem('access');
  const res = await fetch(`${API_BASE}/doctor-availabilities/${id}/`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  if (!res.ok) throw new Error('Failed to delete availability');
  return true;
}

export async function fetchDoctorAppointments() {
  const token = await AsyncStorage.getItem('access');
  const res = await fetch(`${API_BASE}/appointments/`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  if (!res.ok) throw new Error('Failed to fetch appointments');
  return await res.json();
}

export async function createAppointment(appointmentData: any) {
  const token = await AsyncStorage.getItem('access');
  if (!token) {
    throw new Error('Authentication token is missing. Please log in again.');
  }
  const res = await fetch(`${API_BASE}/appointments/`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(appointmentData),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.detail || 'Failed to create appointment');
  }
  return data;
}

export async function cancelAppointment(appointmentId: string) {
  const token = await AsyncStorage.getItem('access');
  if (!token) {
    throw new Error('Authentication token is missing. Please log in again.');
  }
  const res = await fetch(`${API_BASE}/appointments/${appointmentId}/`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ status: 'canceled' }),
  });
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.detail || 'Failed to cancel appointment');
  }
  return await res.json();
}