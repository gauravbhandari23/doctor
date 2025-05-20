import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { fetchDoctorAppointments, cancelAppointment } from '../../services/doctorApi';
import { LinearGradient } from 'expo-linear-gradient';
import { FontAwesome5, MaterialIcons, Ionicons } from '@expo/vector-icons';

export default function HomeScreen({ navigation }: any) {
  const [loading, setLoading] = useState(true);
  const [nextAppointment, setNextAppointment] = useState<any>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await fetchDoctorAppointments();
        console.log('Appointments:', data);
        if (!Array.isArray(data)) {
          throw new Error('Invalid API response: Expected an array');
        }
        const now = new Date();
        const upcoming = data.filter((a: any) =>
          (a.status === 'pending' || a.status === 'confirmed') &&
          new Date(a.date + 'T' + a.time) > now
        );
        upcoming.sort((a: any, b: any) => new Date(a.date + 'T' + a.time).getTime() - new Date(b.date + 'T' + a.time).getTime());
        setNextAppointment(upcoming[0] || null);
      } catch (e) {
        setError('Failed to load appointments');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleCancelAppointment = async (appointmentId: string) => {
    Alert.alert(
      'Cancel Appointment',
      'Are you sure you want to cancel this appointment?',
      [
        {
          text: 'No',
          style: 'cancel',
        },
        {
          text: 'Yes',
          onPress: async () => {
            try {
              setLoading(true);
              await cancelAppointment(appointmentId);
              setNextAppointment((prev: any) =>
                prev ? { ...prev, status: 'cancelled' } : null
              );
            } catch (e) {
              setError('Failed to cancel appointment');
              Alert.alert('Error', 'Failed to cancel appointment. Please try again.');
            } finally {
              setLoading(false);
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'confirmed':
        return '#4CAF50';
      case 'pending':
        return '#FF9800';
      case 'cancelled':
        return '#F44336';
      default:
        return '#9E9E9E';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity?.toLowerCase()) {
      case 'high':
        return '#F44336';
      case 'medium':
        return '#FF9800';
      case 'low':
        return '#4CAF50';
      default:
        return '#9E9E9E';
    }
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return 'N/A';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  return (
    <ScrollView style={styles.scrollView}>
      <LinearGradient
        colors={['#1976d2', '#2196f3', '#64b5f6']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.headerGradient}
      >
        <View style={styles.headerContent}>
          <FontAwesome5 name="heartbeat" size={40} color="#ffffff" style={styles.headerIcon} />
          <Text style={styles.welcome}>Welcome to DoctorBook!</Text>
          <Text style={styles.subtitle}>Your health, our priority.</Text>
        </View>
      </LinearGradient>

      <View style={styles.contentContainer}>
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="calendar" size={24} color="#1976d2" />
            <Text style={styles.sectionTitle}>Upcoming Appointment</Text>
          </View>

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#1976d2" />
            </View>
          ) : error ? (
            <View style={styles.errorContainer}>
              <MaterialIcons name="error-outline" size={36} color="#f44336" />
              <Text style={styles.error}>{error}</Text>
            </View>
          ) : nextAppointment ? (
            <TouchableOpacity activeOpacity={0.9} style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={styles.doctorInfo}>
                  <View style={styles.avatarContainer}>
                    <FontAwesome5 name="user-md" size={24} color="#1976d2" style={styles.avatar} />
                  </View>
                  <View>
                    <Text style={styles.doctorName}>
                      {nextAppointment.user_full_name || nextAppointment.doctor_name || nextAppointment.doctor || 'Unknown Doctor'}
                    </Text>
                    <View style={[styles.statusBadge, { backgroundColor: getStatusColor(nextAppointment.status) }]}>
                      <Text style={styles.statusText}>{nextAppointment.status || 'Unknown'}</Text>
                    </View>
                  </View>
                </View>
              </View>

              <View style={styles.cardDivider} />

              <View style={styles.appointmentDetails}>
                <View style={styles.detailItem}>
                  <MaterialIcons name="event" size={18} color="#555" />
                  <Text style={styles.detailLabel}>Date:</Text>
                  <Text style={styles.detailValue}>{formatDate(nextAppointment.date)}</Text>
                </View>

                <View style={styles.detailItem}>
                  <MaterialIcons name="access-time" size={18} color="#555" />
                  <Text style={styles.detailLabel}>Time:</Text>
                  <Text style={styles.detailValue}>{nextAppointment.time || 'N/A'}</Text>
                </View>

                <View style={styles.detailItem}>
                  <MaterialIcons name="priority-high" size={18} color={getSeverityColor(nextAppointment.severity)} />
                  <Text style={styles.detailLabel}>Severity:</Text>
                  <Text style={[styles.detailValue, { color: getSeverityColor(nextAppointment.severity) }]}>
                    {nextAppointment.severity || 'N/A'}
                  </Text>
                </View>
              </View>

              <View style={styles.symptomsContainer}>
                <Text style={styles.symptomsLabel}>Symptoms:</Text>
                <Text style={styles.symptomsValue}>{nextAppointment.symptoms || 'No symptoms provided'}</Text>
              </View>

              <View style={styles.cardActions}>
                <TouchableOpacity
                  style={[styles.actionButton, nextAppointment.status === 'cancelled' && styles.disabledButton]}
                  onPress={() => handleCancelAppointment(nextAppointment.id)}
                  disabled={nextAppointment.status === 'cancelled'}
                >
                  <MaterialIcons name="cancel" size={16} color="#fff" />
                  <Text style={styles.actionText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.actionButton, styles.secondaryButton]}>
                  <MaterialIcons name="schedule" size={16} color="#1976d2" />
                  <Text style={[styles.actionText, styles.secondaryButtonText]}>Reschedule</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="calendar-outline" size={60} color="#ccc" />
              <Text style={styles.noUpcoming}>No upcoming appointments</Text>
              <TouchableOpacity
                style={styles.bookButton}
                onPress={() => navigation.navigate('Search & Book Doctor')}
              >
                <Text style={styles.bookButtonText}>Book Appointment</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="medical" size={24} color="#1976d2" />
            <Text style={styles.sectionTitle}>Health Services</Text>
          </View>

          <View style={styles.servicesGrid}>
            <TouchableOpacity
              style={styles.serviceCard}
              onPress={() => navigation.navigate('Search & Book Doctor')}
            >
              <MaterialIcons name="search" size={28} color="#1976d2" />
              <Text style={styles.serviceText}>Find Doctor</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.serviceCard}
              onPress={() => navigation.navigate('My Appointments')}
            >
              <MaterialIcons name="event-available" size={28} color="#1976d2" />
              <Text style={styles.serviceText}>My Appointments</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.serviceCard}
              onPress={() => navigation.navigate('Notifications')}
            >
              <MaterialIcons name="notifications" size={28} color="#1976d2" />
              <Text style={styles.serviceText}>Notifications</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.serviceCard}
              onPress={() => navigation.navigate('Profile')}
            >
              <MaterialIcons name="account-circle" size={28} color="#1976d2" />
              <Text style={styles.serviceText}>My Profile</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    backgroundColor: '#f5f6fa',
  },
  headerGradient: {
    paddingTop: 60,
    paddingBottom: 30,
  },
  headerContent: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  headerIcon: {
    marginBottom: 15,
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingBottom: 30,
  },
  welcome: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#fff',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#e1f5fe',
    textAlign: 'center',
  },
  section: {
    width: '100%',
    marginTop: 20,
    marginBottom: 15,
    backgroundColor: 'transparent',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1976d2',
    marginLeft: 8,
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  errorContainer: {
    padding: 30,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
  },
  error: {
    color: '#f44336',
    fontSize: 16,
    marginTop: 10,
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingVertical: 22,
    paddingHorizontal: 18,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 5 },
    elevation: 5,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  doctorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#e3f2fd',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  avatar: {
    textAlign: 'center',
  },
  doctorName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
  cardDivider: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginVertical: 15,
  },
  appointmentDetails: {
    marginBottom: 15,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  detailLabel: {
    fontWeight: 'bold',
    fontSize: 14,
    marginLeft: 8,
    width: 70,
  },
  detailValue: {
    fontSize: 15,
    color: '#444',
    flex: 1,
  },
  symptomsContainer: {
    backgroundColor: '#f5f5f5',
    padding: 12,
    borderRadius: 8,
    marginBottom: 15,
  },
  symptomsLabel: {
    fontWeight: 'bold',
    fontSize: 14,
    marginBottom: 5,
  },
  symptomsValue: {
    fontSize: 15,
    color: '#444',
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1976d2',
    borderRadius: 25,
    paddingVertical: 8,
    paddingHorizontal: 16,
    flex: 1,
    marginRight: 10,
    shadowColor: '#1976d2',
    shadowOpacity: 0.3,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  disabledButton: {
    backgroundColor: '#9E9E9E',
    shadowOpacity: 0,
    elevation: 0,
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#1976d2',
    marginRight: 0,
    shadowColor: 'transparent',
    shadowOpacity: 0,
    shadowRadius: 0,
    shadowOffset: { width: 0, height: 0 },
    elevation: 0,
  },
  actionText: {
    color: '#fff',
    fontWeight: '500',
    fontSize: 14,
    marginLeft: 5,
  },
  secondaryButtonText: {
    color: '#1976d2',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 40,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  noUpcoming: {
    fontSize: 16,
    color: '#666',
    marginVertical: 15,
    textAlign: 'center',
    fontWeight: '500',
  },
  bookButton: {
    backgroundColor: '#1976d2',
    borderRadius: 25,
    paddingVertical: 12,
    paddingHorizontal: 28,
    marginTop: 10,
    shadowColor: '#1976d2',
    shadowOpacity: 0.4,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4,
  },
  bookButtonText: {
    color: '#fff',
    fontWeight: '500',
    fontSize: 14,
  },
  servicesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 5,
  },
  serviceCard: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginBottom: 15,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  serviceText: {
    marginTop: 10,
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
  },
});