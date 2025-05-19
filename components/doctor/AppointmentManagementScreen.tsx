import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { fetchDoctorAppointments } from '../../services/doctorApi';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function AppointmentManagementScreen() {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadAppointments();
  }, []);

  const loadAppointments = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await fetchDoctorAppointments();
      setAppointments(data);
    } catch (e) {
      setError('Failed to fetch appointments');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (appointment: any, status: string) => {
    try {
      setLoading(true);
      setMessage('');
      const token = await AsyncStorage.getItem('access');
      const res = await fetch(`http://10.0.2.2:8000/api/appointments/${appointment.id}/`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error('Failed to update status');
      setMessage('Status updated');
      loadAppointments();
    } catch (e) {
      setMessage('Failed to update status');
    } finally {
      setLoading(false);
    }
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'pending': return { color: '#ff9800' };
      case 'confirmed': return { color: '#1976d2' };
      case 'completed': return { color: 'green' };
      case 'canceled': return { color: 'red' };
      default: return { color: '#888' };
    }
  };

  if (loading) return <ActivityIndicator style={{ flex: 1 }} size="large" />;
  if (error) return <View style={styles.center}><Text style={{ color: 'red' }}>{error}</Text></View>;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Appointments</Text>
      {message ? <Text style={styles.message}>{message}</Text> : null}
      <FlatList
        data={appointments}
        keyExtractor={item => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.label}>Patient:</Text>
            <Text style={styles.value}>{item.patient}</Text>
            <Text style={styles.label}>Date:</Text>
            <Text style={styles.value}>{item.date}</Text>
            <Text style={styles.label}>Time:</Text>
            <Text style={styles.value}>{item.time}</Text>
            <Text style={styles.label}>Severity:</Text>
            <Text style={styles.value}>{item.severity}</Text>
            <Text style={styles.label}>Symptoms:</Text>
            <Text style={styles.value}>{item.symptoms}</Text>
            <Text style={styles.label}>Status:</Text>
            <Text style={[styles.value, getStatusStyle(item.status)]}>{item.status}</Text>
            <View style={{ flexDirection: 'row', marginTop: 10 }}>
              {item.status === 'pending' && (
                <>
                  <TouchableOpacity style={styles.confirmButton} onPress={() => updateStatus(item, 'confirmed')}>
                    <Text style={styles.confirmButtonText}>Confirm</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.cancelButton} onPress={() => updateStatus(item, 'canceled')}>
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </TouchableOpacity>
                </>
              )}
              {item.status === 'confirmed' && (
                <>
                  <TouchableOpacity style={styles.completeButton} onPress={() => updateStatus(item, 'completed')}>
                    <Text style={styles.completeButtonText}>Complete</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.cancelButton} onPress={() => updateStatus(item, 'canceled')}>
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          </View>
        )}
        ListEmptyComponent={<Text style={{ textAlign: 'center', marginTop: 40 }}>No appointments found.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f6fa',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  label: {
    fontWeight: 'bold',
    marginTop: 5,
  },
  value: {
    marginBottom: 5,
    fontSize: 16,
  },
  confirmButton: {
    backgroundColor: '#1976d2',
    padding: 10,
    borderRadius: 6,
    marginRight: 10,
  },
  confirmButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  completeButton: {
    backgroundColor: '#388e3c',
    padding: 10,
    borderRadius: 6,
    marginRight: 10,
  },
  completeButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  cancelButton: {
    backgroundColor: '#e53935',
    padding: 10,
    borderRadius: 6,
  },
  cancelButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  message: {
    marginTop: 15,
    color: 'green',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
}); 