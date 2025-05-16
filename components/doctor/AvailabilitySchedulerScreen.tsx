import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, Modal, TextInput, Platform, Alert, ScrollView } from 'react-native';
import { fetchDoctorAvailability, addDoctorAvailability, deleteDoctorAvailability, fetchDoctorProfile } from '../../services/doctorApi';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

// Helper to generate hour and minute options
// const HOURS = Array.from({ length: 24 }, (_, i) => (i < 10 ? '0' : '') + i);
// const MINUTES = ['00', '15', '30', '45'];

const START_TIME = { hour: '09', minute: '23' };
const END_TIME = { hour: '20', minute: '00' };

// Set default values for start and end time
const DEFAULT_START_HOUR = '10';
const DEFAULT_START_MINUTE = '00';
const DEFAULT_END_HOUR = '17';
const DEFAULT_END_MINUTE = '00';

function getTimeFromParts(hour: string, minute: string) {
  return `${hour}:${minute}`;
}

export default function AvailabilitySchedulerScreen() {
  const [slots, setSlots] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [form, setForm] = useState<any>({
    day_of_week: 'Monday',
    start_hour: DEFAULT_START_HOUR,
    start_minute: DEFAULT_START_MINUTE,
    end_hour: DEFAULT_END_HOUR,
    end_minute: DEFAULT_END_MINUTE,
    slot_duration_minutes: '30',
  });
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  useEffect(() => {
    loadData();
    fetchDoctorProfile().then(setProfile).catch(() => {});
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await fetchDoctorAvailability();
      setSlots(data);
    } catch (e: any) {
      setError(e.message || 'Failed to load availability');
    } finally {
      setLoading(false);
    }
  };

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2000);
  };

  const handleDelete = async (id: number) => {
    setDeletingId(id);
    try {
      await deleteDoctorAvailability(id);
      setSlots(slots.filter(s => s.id !== id));
      showToast('Slot deleted');
    } catch (e: any) {
      let msg = 'Failed to delete';
      if (e && e.message) msg = e.message;
      showToast(msg);
    } finally {
      setDeletingId(null);
    }
  };

  const handleAdd = async () => {
    if (!form.start_hour || !form.start_minute || !form.end_hour || !form.end_minute || !form.slot_duration_minutes) {
      showToast('Fill all fields');
      return;
    }
    // Validate hour/minute
    const pad = (v: string) => v.length === 1 ? '0' + v : v;
    const start_time = pad(form.start_hour) + ':' + pad(form.start_minute);
    const end_time = pad(form.end_hour) + ':' + pad(form.end_minute);
    setSaving(true);
    try {
      const payload = {
        doctor: profile.id,
        day_of_week: form.day_of_week,
        start_time,
        end_time,
        slot_duration_minutes: Number(form.slot_duration_minutes),
      };
      const newSlot = await addDoctorAvailability(payload);
      setSlots([...slots, newSlot]);
      setModalVisible(false);
      setForm({
        day_of_week: 'Monday',
        start_hour: DEFAULT_START_HOUR,
        start_minute: DEFAULT_START_MINUTE,
        end_hour: DEFAULT_END_HOUR,
        end_minute: DEFAULT_END_MINUTE,
        slot_duration_minutes: '30',
      });
      showToast('Slot added');
    } catch (e: any) {
      let msg = 'Failed to add';
      if (e && e.message) msg = e.message;
      showToast(msg);
    } finally {
      setSaving(false);
    }
  };

  const renderSlot = ({ item }: { item: any }) => (
    <View style={styles.slotCard}>
      <View style={{ flex: 1 }}>
        <Text style={styles.slotDay}>{item.day_of_week}</Text>
        <Text style={styles.slotTime}>{item.start_time} - {item.end_time}</Text>
        <Text style={styles.slotDuration}>Duration: {item.slot_duration_minutes} min</Text>
      </View>
      <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDelete(item.id)} disabled={deletingId === item.id}>
        <Text style={styles.deleteBtnText}>{deletingId === item.id ? 'Deleting...' : 'Delete'}</Text>
      </TouchableOpacity>
    </View>
  );

  const openAddModal = () => {
    setForm({
      day_of_week: 'Monday',
      start_hour: DEFAULT_START_HOUR,
      start_minute: DEFAULT_START_MINUTE,
      end_hour: DEFAULT_END_HOUR,
      end_minute: DEFAULT_END_MINUTE,
      slot_duration_minutes: '30',
    });
    setModalVisible(true);
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#f6f8fa' }}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>My Availability</Text>
        <TouchableOpacity style={styles.addBtn} onPress={openAddModal}>
          <Text style={styles.addBtnText}>+ Add</Text>
        </TouchableOpacity>
      </View>
      {loading ? (
        <ActivityIndicator style={{ marginTop: 40 }} size="large" />
      ) : error ? (
        <Text style={{ color: 'red', textAlign: 'center', marginTop: 40 }}>{error}</Text>
      ) : (
        <FlatList
          data={slots}
          keyExtractor={item => item.id.toString()}
          renderItem={renderSlot}
          contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
          ListEmptyComponent={<Text style={{ textAlign: 'center', color: '#888', marginTop: 40 }}>No slots yet. Add your availability.</Text>}
        />
      )}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Add Availability</Text>
            <Text style={styles.label}>Day of Week</Text>
            <View style={styles.pickerRow}>
              {DAYS.map(day => (
                <TouchableOpacity
                  key={day}
                  style={[styles.pickerBtn, form.day_of_week === day && styles.pickerBtnActive]}
                  onPress={() => setForm({ ...form, day_of_week: day })}
                >
                  <Text style={[styles.pickerBtnText, form.day_of_week === day && styles.pickerBtnTextActive]}>{day.slice(0, 3)}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <Text style={styles.label}>Start Time</Text>
            <View style={styles.timeInputRow}>
              <TextInput
                style={styles.timeInput}
                value={form.start_hour || ''}
                onChangeText={v => setForm({ ...form, start_hour: v.replace(/[^0-9]/g, '').slice(0, 2) })}
                placeholder="HH"
                keyboardType="numeric"
                maxLength={2}
              />
              <Text style={styles.timeColon}>:</Text>
              <TextInput
                style={styles.timeInput}
                value={form.start_minute || ''}
                onChangeText={v => setForm({ ...form, start_minute: v.replace(/[^0-9]/g, '').slice(0, 2) })}
                placeholder="MM"
                keyboardType="numeric"
                maxLength={2}
              />
            </View>
            <Text style={styles.label}>End Time</Text>
            <View style={styles.timeInputRow}>
              <TextInput
                style={styles.timeInput}
                value={form.end_hour || ''}
                onChangeText={v => setForm({ ...form, end_hour: v.replace(/[^0-9]/g, '').slice(0, 2) })}
                placeholder="HH"
                keyboardType="numeric"
                maxLength={2}
              />
              <Text style={styles.timeColon}>:</Text>
              <TextInput
                style={styles.timeInput}
                value={form.end_minute || ''}
                onChangeText={v => setForm({ ...form, end_minute: v.replace(/[^0-9]/g, '').slice(0, 2) })}
                placeholder="MM"
                keyboardType="numeric"
                maxLength={2}
              />
            </View>
            <Text style={styles.label}>Slot Duration (minutes)</Text>
            <TextInput
              style={styles.input}
              value={form.slot_duration_minutes}
              onChangeText={v => setForm({ ...form, slot_duration_minutes: v.replace(/[^0-9]/g, '') })}
              placeholder="30"
              keyboardType="numeric"
              maxLength={3}
            />
            <View style={styles.modalBtnRow}>
              <TouchableOpacity style={styles.modalCancelBtn} onPress={() => setModalVisible(false)}>
                <Text style={styles.modalCancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalSaveBtn} onPress={handleAdd} disabled={saving}>
                <Text style={styles.modalSaveBtnText}>{saving ? 'Saving...' : 'Save'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      {toast && (
        <View style={styles.toast} pointerEvents="none">
          <Text style={styles.toastText}>{toast}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    paddingBottom: 0,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#222',
  },
  addBtn: {
    backgroundColor: '#007bff',
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 20,
    shadowColor: '#007bff',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 2,
  },
  addBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  slotCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 18,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 2,
    elevation: 2,
  },
  slotDay: {
    fontSize: 17,
    fontWeight: '600',
    color: '#007bff',
    marginBottom: 2,
  },
  slotTime: {
    fontSize: 15,
    color: '#333',
    marginBottom: 2,
  },
  slotDuration: {
    fontSize: 13,
    color: '#888',
  },
  deleteBtn: {
    backgroundColor: '#ff4d4f',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
    marginLeft: 12,
  },
  deleteBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.18)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCard: {
    width: '90%',
    backgroundColor: '#fff',
    borderRadius: 18,
    paddingHorizontal: 10,
    paddingVertical: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 6,
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 19,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 24,
    textAlign: 'center',
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    marginLeft: 2,
    marginTop: 10,
  },
  pickerRow: {
    flexDirection: 'row',
    flexWrap: 'nowrap',
    justifyContent: 'center',
    marginBottom: 12,
    marginTop: 2,
  },
  pickerBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: '#f0f0f0',
    marginHorizontal: 1,
  },
  pickerBtnActive: {
    backgroundColor: '#007bff',
  },
  pickerBtnText: {
    color: '#555',
    fontWeight: '600',
    fontSize: 15,
  },
  pickerBtnTextActive: {
    color: '#fff',
  },
  input: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: Platform.OS === 'ios' ? 14 : 10,
    marginBottom: 16,
    backgroundColor: '#fafbfc',
    fontSize: 16,
  },
  modalBtnRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 18,
  },
  modalCancelBtn: {
    backgroundColor: '#e0e0e0',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 10,
  },
  modalCancelBtnText: {
    color: '#333',
    fontWeight: 'bold',
    fontSize: 15,
  },
  modalSaveBtn: {
    backgroundColor: '#007bff',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 20,
  },
  modalSaveBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
  },
  toast: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 40,
    alignItems: 'center',
    zIndex: 100,
  },
  toastText: {
    backgroundColor: '#222',
    color: '#fff',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
    fontSize: 16,
    fontWeight: '600',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  timeInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    marginTop: 2,
  },
  timeInput: {
    width: 48,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: Platform.OS === 'ios' ? 14 : 10,
    backgroundColor: '#fafbfc',
    fontSize: 16,
    textAlign: 'center',
    marginHorizontal: 2,
  },
  timeColon: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginHorizontal: 4,
  },
}); 