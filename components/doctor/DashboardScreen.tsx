import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, FlatList } from 'react-native';
import { fetchDoctorAppointments } from '../../services/doctorApi';

function isToday(dateStr: string) {
  const today = new Date();
  const d = new Date(dateStr);
  return d.getFullYear() === today.getFullYear() && d.getMonth() === today.getMonth() && d.getDate() === today.getDate();
}

export default function DashboardScreen() {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await fetchDoctorAppointments();
      setAppointments(data);
    } catch (e: any) {
      setError(e.message || 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  // Stats
  const upcoming = appointments.filter(a => a.status === 'booked' && new Date(a.date) >= new Date());
  const today = appointments.filter(a => a.status === 'booked' && isToday(a.date));
  const pending = appointments.filter(a => a.status === 'booked'); // Adjust if you have a real 'pending' status
  const next = upcoming.sort((a, b) => new Date(a.date + 'T' + a.time).getTime() - new Date(b.date + 'T' + b.time).getTime())[0];

  return (
    <View style={{ flex: 1, backgroundColor: '#f6f8fa', padding: 20 }}>
      <Text style={styles.title}>Dashboard</Text>
      {loading ? (
        <ActivityIndicator style={{ marginTop: 40 }} size="large" />
      ) : error ? (
        <Text style={{ color: 'red', textAlign: 'center', marginTop: 40 }}>{error}</Text>
      ) : (
        <>
          <View style={styles.statsRow}>
            <View style={[styles.statCard, { backgroundColor: '#007bff' }]}> 
              <Text style={styles.statValue}>{upcoming.length}</Text>
              <Text style={styles.statLabel}>Upcoming</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: '#2ecc71' }]}> 
              <Text style={styles.statValue}>{today.length}</Text>
              <Text style={styles.statLabel}>Today</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: '#ffb300' }]}> 
              <Text style={styles.statValue}>{pending.length}</Text>
              <Text style={styles.statLabel}>Pending</Text>
            </View>
          </View>
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Next Appointment</Text>
            {next ? (
              <View style={{ marginTop: 8 }}>
                <Text style={styles.nextLine}><Text style={styles.nextLabel}>Date:</Text> {next.date} {next.time}</Text>
                <Text style={styles.nextLine}><Text style={styles.nextLabel}>Patient:</Text> {next.patient}</Text>
                <Text style={styles.nextLine}><Text style={styles.nextLabel}>Status:</Text> {next.status}</Text>
                <Text style={styles.nextLine}><Text style={styles.nextLabel}>Severity:</Text> {next.severity}</Text>
                <Text style={styles.nextLine}><Text style={styles.nextLabel}>Symptoms:</Text> {next.symptoms}</Text>
              </View>
            ) : (
              <Text style={{ color: '#888', marginTop: 8 }}>No upcoming appointments.</Text>
            )}
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 18,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    marginHorizontal: 6,
    borderRadius: 16,
    paddingVertical: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  statValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 15,
    color: '#fff',
    fontWeight: '600',
  },
  sectionCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007bff',
    marginBottom: 8,
  },
  nextLine: {
    fontSize: 15,
    color: '#333',
    marginBottom: 2,
  },
  nextLabel: {
    fontWeight: '600',
    color: '#222',
  },
}); 