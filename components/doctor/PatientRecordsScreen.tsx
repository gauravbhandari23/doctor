import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, ActivityIndicator, Modal, ScrollView } from 'react-native';
import { fetchDoctorAppointments } from '../../services/doctorApi';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function PatientRecordsScreen() {
  const [patients, setPatients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [patientAppointments, setPatientAppointments] = useState<any[]>([]);
  const [profileLoading, setProfileLoading] = useState(false);
  const [patientProfile, setPatientProfile] = useState<any>(null);

  useEffect(() => {
    loadPatients();
  }, []);

  const loadPatients = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await fetchDoctorAppointments();
      // Group appointments by patient
      const patientMap: Record<string, any> = {};
      data.forEach((appt: any) => {
        if (!patientMap[appt.patient]) {
          patientMap[appt.patient] = {
            id: appt.patient,
            name: appt.patient_name || appt.patient, // fallback to ID
            email: appt.patient_email || '',
            phone: appt.patient_phone || '',
            appointments: [],
          };
        }
        patientMap[appt.patient].appointments.push(appt);
      });
      setPatients(Object.values(patientMap));
    } catch (e) {
      setError('Failed to fetch patients');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPatient = async (patient: any) => {
    setSelectedPatient(patient);
    setPatientAppointments(patient.appointments);
    setProfileLoading(true);
    setPatientProfile(null);
    try {
      const token = await AsyncStorage.getItem('access');
      const res = await fetch(`${require('../../services/apiConfig').API_BASE}/patients/by-user/?user_id=${patient.id}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setPatientProfile(data);
      } else {
        setPatientProfile(null);
      }
    } catch {
      setPatientProfile(null);
    } finally {
      setProfileLoading(false);
    }
    setModalVisible(true);
  };

  if (loading) return <ActivityIndicator style={{ flex: 1 }} size="large" />;
  if (error) return <View style={styles.center}><Text style={{ color: 'red' }}>{error}</Text></View>;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Patients</Text>
      <FlatList
        data={patients}
        keyExtractor={item => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.card} onPress={() => handleSelectPatient(item)}>
            <Text style={styles.label}>Name:</Text>
            <Text style={styles.value}>{item.name}</Text>
            <Text style={styles.label}>Email:</Text>
            <Text style={styles.value}>{item.email}</Text>
            <Text style={styles.label}>Phone:</Text>
            <Text style={styles.value}>{item.phone}</Text>
            <Text style={styles.label}>Appointments:</Text>
            <Text style={styles.value}>{item.appointments.length}</Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={<Text style={{ textAlign: 'center', marginTop: 40 }}>No patients found.</Text>}
      />
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <ScrollView contentContainerStyle={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.title}>Patient Details</Text>
              <TouchableOpacity style={styles.closeIcon} onPress={() => setModalVisible(false)}>
                <Text style={styles.closeIconText}>✕</Text>
              </TouchableOpacity>
            </View>
            {profileLoading ? (
              <ActivityIndicator style={{ marginVertical: 20 }} />
            ) : !patientProfile ? (
              <Text style={styles.noProfile}>No profile data available.</Text>
            ) : (
              <>
                <Text style={styles.sectionHeader}>Basic Info</Text>
                <Text style={styles.label}>Name:</Text>
                <Text style={styles.value}>{patientProfile.full_name || selectedPatient.name}</Text>
                <Text style={styles.label}>Email:</Text>
                <Text style={styles.value}>{patientProfile.email || selectedPatient.email}</Text>
                <Text style={styles.label}>Phone:</Text>
                <Text style={styles.value}>{patientProfile.phone || selectedPatient.phone}</Text>
                <Text style={styles.label}>Date of Birth:</Text>
                <Text style={styles.value}>{patientProfile.date_of_birth || '-'}</Text>
                <Text style={styles.label}>Gender:</Text>
                <Text style={styles.value}>{patientProfile.gender || '-'}</Text>
                <Text style={styles.label}>Blood Type:</Text>
                <Text style={styles.value}>{patientProfile.blood_type || '-'}</Text>
                <Text style={styles.sectionHeader}>Medical Info</Text>
                <Text style={styles.label}>Medical History:</Text>
                <Text style={styles.value}>{patientProfile.medical_history || '-'}</Text>
                <Text style={styles.label}>Allergies:</Text>
                <Text style={styles.value}>{patientProfile.allergies || '-'}</Text>
                <Text style={styles.label}>Chronic Conditions:</Text>
                <Text style={styles.value}>{patientProfile.chronic_conditions || '-'}</Text>
                <Text style={styles.label}>Current Medications:</Text>
                <Text style={styles.value}>{patientProfile.current_medications || '-'}</Text>
                <Text style={styles.label}>Insurance Provider:</Text>
                <Text style={styles.value}>{patientProfile.insurance_provider || '-'}</Text>
                <Text style={styles.label}>Address:</Text>
                <Text style={styles.value}>{patientProfile.address || '-'}</Text>
              </>
            )}
            <Text style={styles.sectionHeader}>Appointment History</Text>
            <FlatList
              data={patientAppointments}
              keyExtractor={item => item.id.toString()}
              renderItem={({ item }) => (
                <View style={styles.apptCard}>
                  <Text style={styles.label}>Date:</Text>
                  <Text style={styles.value}>{item.date}</Text>
                  <Text style={styles.label}>Time:</Text>
                  <Text style={styles.value}>{item.time}</Text>
                  <Text style={styles.label}>Severity:</Text>
                  <Text style={styles.value}>{item.severity}</Text>
                  <Text style={styles.label}>Symptoms:</Text>
                  <Text style={styles.value}>{item.symptoms}</Text>
                  <Text style={styles.label}>Status:</Text>
                  <Text style={styles.value}>{item.status}</Text>
                </View>
              )}
              ListEmptyComponent={<Text style={{ textAlign: 'center', marginTop: 10 }}>No appointments found.</Text>}
            />
          </ScrollView>
        </View>
      </Modal>
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
  apptCard: {
    backgroundColor: '#f0f4ff',
    borderRadius: 6,
    padding: 10,
    marginBottom: 10,
  },
  closeButton: {
    backgroundColor: '#1976d2',
    padding: 10,
    borderRadius: 6,
    marginTop: 20,
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    width: 340,
    alignItems: 'center',
    position: 'relative',
  },
  modalHeader: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  closeIcon: {
    position: 'absolute',
    right: 10,
    top: 10,
    zIndex: 10,
    padding: 5,
  },
  closeIconText: {
    fontSize: 22,
    color: '#888',
    fontWeight: 'bold',
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1976d2',
    marginTop: 18,
    marginBottom: 6,
    alignSelf: 'flex-start',
  },
  noProfile: {
    color: '#888',
    fontSize: 16,
    marginVertical: 20,
    textAlign: 'center',
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
}); 