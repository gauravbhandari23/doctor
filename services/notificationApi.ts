import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE = 'http://10.0.2.2:8000/api';

export async function fetchNotifications() {
  const token = await AsyncStorage.getItem('access');
  if (!token) throw new Error('Authentication token is missing. Please log in again.');
  const res = await fetch(`${API_BASE}/notifications/`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  if (!res.ok) throw new Error('Failed to fetch notifications');
  return await res.json();
}

export async function markNotificationAsRead(id: number) {
  const token = await AsyncStorage.getItem('access');
  if (!token) throw new Error('Authentication token is missing. Please log in again.');
  const res = await fetch(`${API_BASE}/notifications/${id}/`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ is_read: true }),
  });
  if (!res.ok) throw new Error('Failed to mark notification as read');
  return await res.json();
}
