import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, FlatList, TouchableOpacity, Modal, ActivityIndicator, Alert } from 'react-native';
import { createAppointment, fetchDoctorProfile, fetchDoctorAvailability } from '../../services/doctorApi';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';

export default function SearchBookDoctorScreen() {
  const [doctors, setDoctors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedDoctor, setSelectedDoctor] = useState<any>(null);
  const [availability, setAvailability] = useState<any[]>([]);
  const [bookingModalVisible, setBookingModalVisible] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<any>(null);
  const [severity, setSeverity] = useState('mild');
  const [symptoms, setSymptoms] = useState('');
  const [bookingLoading, setBookingLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);

  useEffect(() => {
    const loadDoctors = async () => {
      setLoading(true);
      setError('');
      try {
        const token = await AsyncStorage.getItem('access');
        const res = await fetch(`${require('../../services/apiConfig').API_BASE}/doctors/`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        const data = await res.json();
        console.log('Fetched doctors:', data);
        setDoctors(data);
      } catch (e: any) {
        console.log('Error fetching doctors:', e);
        setError('Failed to fetch doctors');
      } finally {
        setLoading(false);
      }
    };
    loadDoctors();
  }, []);

  const handleBookClick = async (doctor: any) => {
    setSelectedDoctor(doctor);
    setBookingModalVisible(true);
    setSelectedSlot(null);
    setSeverity('mild');
    setSymptoms('');
    setMessage('');
    setAvailability([]);
    try {
      setBookingLoading(true);
      const allSlots = await fetchDoctorAvailability();
      console.log('Fetched all slots:', allSlots);
      const slots = allSlots.filter((slot: any) => slot.doctor === doctor.id);
      console.log('Filtered slots for doctor', doctor.id, ':', slots);
      setAvailability(slots);
    } catch (e) {
      console.log('Error fetching slots:', e);
      setAvailability([]);
    } finally {
      setBookingLoading(false);
    }
  };

  const handleBookAppointment = async () => {
    if (!selectedDoctor || !selectedSlot) {
      setMessage('Please select a time slot.');
      return;
    }
    if (!selectedDate) {
      setMessage('Please select a date.');
      return;
    }
    setBookingLoading(true);
    setMessage('');
    const data = {
      doctor: selectedDoctor.id,
      date: selectedDate.toISOString().slice(0, 10), // YYYY-MM-DD
      time: selectedSlot.start_time,
      severity,
      symptoms,
    };
    console.log('Booking appointment with data:', data);
    try {
      const response = await createAppointment(data);
      console.log('Appointment booked successfully:', response);
      setMessage('Appointment booked successfully!');
      setBookingModalVisible(false);
      setSelectedDoctor(null);
      setSelectedSlot(null);
      setSelectedDate(null);
      setSeverity('mild');
      setSymptoms('');
    } catch (e: any) {
      console.log('Error booking appointment:', e);
      setMessage(e.message || 'Failed to book appointment');
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) {
    return <ActivityIndicator style={{ flex: 1 }} size="large" />;
  }
  if (error) {
    return <View style={styles.center}><Text style={{ color: 'red' }}>{error}</Text></View>;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Book a Doctor</Text>
      <FlatList
        data={doctors}
        keyExtractor={item => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.doctorCard}>
            <Text style={styles.doctorName}>{item.user_full_name}</Text>
            <Text>Specialty: {item.specialty}</Text>
            <Text>Location: {item.clinic_location}</Text>
            <TouchableOpacity style={styles.bookButton} onPress={() => handleBookClick(item)}>
              <Text style={styles.bookButtonText}>Book</Text>
            </TouchableOpacity>
          </View>
        )}
      />
      <Modal
        visible={bookingModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setBookingModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.title}>Book Appointment with {selectedDoctor?.user_full_name}</Text>
            {bookingLoading ? (
              <ActivityIndicator size="large" />
            ) : (
              <>
                <Text style={styles.label}>Select Time Slot:</Text>
                <FlatList
                  data={availability}
                  keyExtractor={item => item.id.toString()}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={[styles.slotButton, selectedSlot?.id === item.id && styles.selectedSlot]}
                      onPress={() => setSelectedSlot(item)}
                    >
                      <Text>{item.date} {item.start_time} - {item.end_time}</Text>
                    </TouchableOpacity>
                  )}
                  ListEmptyComponent={<Text>No available slots.</Text>}
                />
                <Text style={styles.label}>Select Date:</Text>
                <TouchableOpacity
                  style={[styles.input, { justifyContent: 'center', alignItems: 'flex-start', flexDirection: 'row' }]}
                  onPress={() => setShowDatePicker(true)}
                >
                  <Text style={{ color: selectedDate ? '#000' : '#888' }}>
                    {selectedDate ? selectedDate.toISOString().slice(0, 10) : 'Select Date'}
                  </Text>
                </TouchableOpacity>
                {showDatePicker && (
                  <DateTimePicker
                    value={selectedDate || new Date()}
                    mode="date"
                    display="default"
                    onChange={(event, date) => {
                      setShowDatePicker(false);
                      if (date) setSelectedDate(date);
                    }}
                  />
                )}
                <Text style={styles.label}>Severity:</Text>
                <View style={{ width: '100%', borderWidth: 1, borderColor: '#ccc', borderRadius: 6, marginBottom: 15 }}>
                  <Picker
                    selectedValue={severity}
                    onValueChange={setSeverity}
                    style={{ width: '100%' }}
                  >
                    <Picker.Item label="Mild" value="mild" />
                    <Picker.Item label="Moderate" value="moderate" />
                    <Picker.Item label="Severe" value="severe" />
                  </Picker>
                </View>
                <TextInput
                  style={styles.input}
                  placeholder="Symptoms"
                  value={symptoms}
                  onChangeText={setSymptoms}
                />
                <Button title={bookingLoading ? 'Booking...' : 'Book Appointment'} onPress={handleBookAppointment} disabled={bookingLoading} />
                {message ? <Text style={styles.message}>{message}</Text> : null}
                <Button title="Cancel" onPress={() => setBookingModalVisible(false)} color="#888" />
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#f5f6fa',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  doctorCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    width: 320,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  doctorName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  bookButton: {
    backgroundColor: '#1976d2',
    padding: 10,
    borderRadius: 6,
    marginTop: 10,
    alignItems: 'center',
  },
  bookButtonText: {
    color: '#fff',
    fontWeight: 'bold',
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
  },
  input: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    padding: 10,
    marginBottom: 15,
    fontSize: 16,
  },
  label: {
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 5,
  },
  slotButton: {
    padding: 10,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#1976d2',
    marginBottom: 8,
    backgroundColor: '#f0f4ff',
  },
  selectedSlot: {
    backgroundColor: '#1976d2',
    borderColor: '#1976d2',
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
