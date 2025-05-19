import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { fetchDoctorAppointments } from '../../services/doctorApi';

export default function HomeScreen() {
  const [loading, setLoading] = useState(true);
  const [nextAppointment, setNextAppointment] = useState<any>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await fetchDoctorAppointments();
        const now = new Date();
        // Find the next appointment (pending or confirmed, in the future)
        const upcoming = data.filter((a: any) =>
          (a.status === 'pending' || a.status === 'confirmed') &&
          new Date(a.date + 'T' + a.time) > now
        );
        upcoming.sort((a: any, b: any) => new Date(a.date + 'T' + a.time).getTime() - new Date(b.date + 'T' + b.time).getTime());
        setNextAppointment(upcoming[0] || null);
      } catch (e) {
        setError('Failed to load appointments');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.welcome}>Welcome to DoctorBook!</Text>
      <Text style={styles.subtitle}>Your health, our priority.</Text>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Upcoming Appointment</Text>
        {loading ? (
          <ActivityIndicator size="large" />
        ) : error ? (
          <Text style={styles.error}>{error}</Text>
        ) : nextAppointment ? (
          <View style={styles.card}>
            <Text style={styles.label}>Doctor:</Text>
            <Text style={styles.value}>{nextAppointment.doctor_name || nextAppointment.doctor}</Text>
            <Text style={styles.label}>Date:</Text>
            <Text style={styles.value}>{nextAppointment.date}</Text>
            <Text style={styles.label}>Time:</Text>
            <Text style={styles.value}>{nextAppointment.time}</Text>
            <Text style={styles.label}>Status:</Text>
            <Text style={styles.value}>{nextAppointment.status}</Text>
            <Text style={styles.label}>Severity:</Text>
            <Text style={styles.value}>{nextAppointment.severity}</Text>
            <Text style={styles.label}>Symptoms:</Text>
            <Text style={styles.value}>{nextAppointment.symptoms}</Text>
          </View>
        ) : (
          <Text style={styles.noUpcoming}>No upcoming appointments. Book your next visit!</Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f6fa',
    alignItems: 'center',
  },
  welcome: {
    fontSize: 26,
    fontWeight: 'bold',
    marginTop: 30,
    marginBottom: 10,
    color: '#1976d2',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#555',
    marginBottom: 30,
    textAlign: 'center',
  },
  section: {
    width: '100%',
    marginTop: 20,
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#1976d2',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    width: 320,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    marginBottom: 10,
  },
  label: {
    fontWeight: 'bold',
    marginTop: 5,
  },
  value: {
    marginBottom: 5,
    fontSize: 16,
  },
  noUpcoming: {
    color: '#888',
    fontSize: 16,
    marginTop: 20,
    textAlign: 'center',
  },
  error: {
    color: 'red',
    marginTop: 20,
    textAlign: 'center',
  },
});
