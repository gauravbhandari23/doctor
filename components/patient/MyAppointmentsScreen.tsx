import React, { useEffect, useState } from 'react';
import { API_BASE } from '../../services/apiConfig';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, ActivityIndicator, Modal, TextInput, Alert } from 'react-native';
import { fetchDoctorAppointments, createAppointment, fetchDoctorAvailability } from '../../services/doctorApi';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';

export default function MyAppointmentsScreen() {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null);
  const [editSeverity, setEditSeverity] = useState('mild');
  const [editSymptoms, setEditSymptoms] = useState('');
  const [editLoading, setEditLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [editDate, setEditDate] = useState<Date | null>(null);
  const [editTime, setEditTime] = useState<Date | null>(null);
  const [showEditDatePicker, setShowEditDatePicker] = useState(false);
  const [showEditTimePicker, setShowEditTimePicker] = useState(false);
  const [availableSlots, setAvailableSlots] = useState<any[]>([]);
  const [availableTimes, setAvailableTimes] = useState<string[]>([]);

  useEffect(() => {
    loadAppointments();
  }, []);

  const loadAppointments = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await fetchDoctorAppointments();
      setAppointments(data);
    } catch (e: any) {
      setError('Failed to fetch appointments');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (appointment: any) => {
    Alert.alert('Cancel Appointment', 'Are you sure you want to cancel this appointment?', [
      { text: 'No' },
      {
        text: 'Yes',
        onPress: async () => {
          try {
            setLoading(true);
            const token = await AsyncStorage.getItem('access');
            const res = await fetch(`${API_BASE}/appointments/${appointment.id}/`, {
              method: 'PATCH',
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ status: 'canceled' }),
            });
            if (!res.ok) throw new Error('Failed to cancel appointment');
            setMessage('Appointment canceled');
            loadAppointments();
          } catch (e) {
            setMessage('Failed to cancel appointment');
          } finally {
            setLoading(false);
          }
        },
      },
    ]);
  };

  const handleEdit = async (appointment: any) => {
    setSelectedAppointment(appointment);
    setEditSeverity(appointment.severity);
    setEditSymptoms(appointment.symptoms);
    const dateObj = new Date(appointment.date + 'T' + (appointment.time || '00:00:00'));
    setEditDate(dateObj);
    setEditTime(dateObj);
    setEditModalVisible(true);
    setMessage('');
    // Fetch doctor's slots
    try {
      const allSlots = await fetchDoctorAvailability();
      const doctorSlots = allSlots.filter((slot: any) => slot.doctor === appointment.doctor);
      setAvailableSlots(doctorSlots);
      // Set available times for the current date
      const dayOfWeek = dateObj.toLocaleDateString('en-US', { weekday: 'long' });
      const times = doctorSlots.filter((slot: any) => slot.day_of_week === dayOfWeek)
        .map((slot: any) => slot.start_time);
      setAvailableTimes(times);
    } catch (e) {
      setAvailableSlots([]);
      setAvailableTimes([]);
    }
  };

  const handleSaveEdit = async () => {
    if (!selectedAppointment) return;
    setEditLoading(true);
    setMessage('');
    try {
      const token = await AsyncStorage.getItem('access');
      const body: any = { severity: editSeverity, symptoms: editSymptoms };
      if (editDate) body.date = editDate.toISOString().slice(0, 10);
      if (editTime) body.time = editTime.toTimeString().slice(0, 8);
      const res = await fetch(`${API_BASE}/appointments/${selectedAppointment.id}/`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error('Failed to update appointment');
      setMessage('Appointment updated');
      setEditModalVisible(false);
      loadAppointments();
    } catch (e) {
      setMessage('Failed to update appointment');
    } finally {
      setEditLoading(false);
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

  // When editDate changes, update availableTimes
  useEffect(() => {
    if (!editDate || !availableSlots.length) return;
    const dayOfWeek = editDate.toLocaleDateString('en-US', { weekday: 'long' });
    const times = availableSlots.filter((slot: any) => slot.day_of_week === dayOfWeek)
      .map((slot: any) => slot.start_time);
    setAvailableTimes(times);
    // If current editTime is not in availableTimes, reset it
    if (editTime && !times.includes(editTime.toTimeString().slice(0, 8))) {
      if (times.length > 0) {
        const [h, m, s] = times[0].split(':');
        const newTime = new Date(editDate);
        newTime.setHours(Number(h), Number(m), Number(s));
        setEditTime(newTime);
      }
    }
  }, [editDate, availableSlots]);

  if (loading) return <ActivityIndicator style={{ flex: 1 }} size="large" />;
  if (error) return <View style={styles.center}><Text style={{ color: 'red' }}>{error}</Text></View>;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Appointments</Text>
      <TouchableOpacity style={styles.reloadButton} onPress={loadAppointments} disabled={loading}>
        <Text style={styles.reloadButtonText}>{loading ? 'Reloading...' : 'Reload'}</Text>
      </TouchableOpacity>
      {message ? <Text style={styles.message}>{message}</Text> : null}
      <FlatList
        data={appointments}
        keyExtractor={item => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.label}>Doctor:</Text>
            <Text style={styles.value}>{item.doctor_name}</Text>
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
            {item.status === 'pending' && (
              <View style={{ flexDirection: 'row', marginTop: 10 }}>
                <TouchableOpacity style={styles.editButton} onPress={() => handleEdit(item)}>
                  <Text style={styles.editButtonText}>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.cancelButton} onPress={() => handleCancel(item)}>
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}
        ListEmptyComponent={<Text style={{ textAlign: 'center', marginTop: 40 }}>No appointments found.</Text>}
      />
      <Modal
        visible={editModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setEditModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.title}>Edit Appointment</Text>
            <Text style={styles.label}>Date:</Text>
            <TouchableOpacity
              style={[styles.input, { justifyContent: 'center', alignItems: 'flex-start', flexDirection: 'row' }]}
              onPress={() => setShowEditDatePicker(true)}
            >
              <Text style={{ color: editDate ? '#000' : '#888' }}>
                {editDate ? editDate.toISOString().slice(0, 10) : 'Select Date'}
              </Text>
            </TouchableOpacity>
            {showEditDatePicker && (
              <DateTimePicker
                value={editDate || new Date()}
                mode="date"
                display="default"
                onChange={(event, date) => {
                  setShowEditDatePicker(false);
                  if (date) setEditDate(date);
                }}
              />
            )}
            <Text style={styles.label}>Time:</Text>
            <View style={{ width: '100%', borderWidth: 1, borderColor: '#ccc', borderRadius: 6, marginBottom: 15 }}>
              <Picker
                selectedValue={editTime ? editTime.toTimeString().slice(0, 8) : ''}
                onValueChange={val => {
                  if (editDate) {
                    const [h, m, s] = val.split(':');
                    const newTime = new Date(editDate);
                    newTime.setHours(Number(h), Number(m), Number(s));
                    setEditTime(newTime);
                  }
                }}
                style={{ width: '100%' }}
              >
                {availableTimes.length === 0 && <Picker.Item label="No available times" value="" />}
                {availableTimes.map(time => (
                  <Picker.Item key={time} label={time.slice(0, 5)} value={time} />
                ))}
              </Picker>
            </View>
            <Text style={styles.label}>Severity:</Text>
            <View style={{ width: '100%', borderWidth: 1, borderColor: '#ccc', borderRadius: 6, marginBottom: 15 }}>
              <Picker
                selectedValue={editSeverity}
                onValueChange={setEditSeverity}
                style={{ width: '100%' }}
              >
                <Picker.Item label="Mild" value="mild" />
                <Picker.Item label="Moderate" value="moderate" />
                <Picker.Item label="Severe" value="severe" />
              </Picker>
            </View>
            <Text style={styles.label}>Symptoms:</Text>
            <TextInput
              style={styles.input}
              value={editSymptoms}
              onChangeText={setEditSymptoms}
              placeholder="Symptoms"
            />
            <TouchableOpacity style={styles.saveButton} onPress={handleSaveEdit} disabled={editLoading}>
              <Text style={styles.saveButtonText}>{editLoading ? 'Saving...' : 'Save'}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelButton} onPress={() => setEditModalVisible(false)}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            {message ? <Text style={styles.message}>{message}</Text> : null}
          </View>
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
  editButton: {
    backgroundColor: '#1976d2',
    padding: 10,
    borderRadius: 6,
    marginRight: 10,
  },
  editButtonText: {
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
  saveButton: {
    backgroundColor: '#388e3c',
    padding: 10,
    borderRadius: 6,
    marginTop: 10,
    marginBottom: 10,
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
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
  reloadButton: {
    backgroundColor: '#1976d2',
    padding: 10,
    borderRadius: 6,
    alignItems: 'center',
    marginBottom: 10,
    width: 120,
    alignSelf: 'center',
  },
  reloadButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
