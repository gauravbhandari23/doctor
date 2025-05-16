import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, Button, ScrollView, ActivityIndicator, Image, StyleSheet, Alert, TouchableOpacity, Platform } from 'react-native';
import { fetchDoctorProfile, updateDoctorProfile, fetchDoctorAvailability } from '../../services/doctorApi';

export default function ProfileManagementScreen() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState<any>({});
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [slots, setSlots] = useState([]);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const fetchedProfile = await fetchDoctorProfile();
        console.log("Fetched Profile:", fetchedProfile);
        setProfile(fetchedProfile);
        setForm({
          name: fetchedProfile.user_username,
          email: fetchedProfile.user_email,
          phone: fetchedProfile.user_phone,
          specialty: fetchedProfile.specialty,
          years_of_experience: fetchedProfile.years_of_experience,
          certification: fetchedProfile.certification,
          degree: fetchedProfile.degree,
          clinic_location: fetchedProfile.clinic_location,
        });
      } catch (error) {
        console.error("Error fetching profile:", error);
        setError("Failed to load profile");
      }
    };

    loadProfile();
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await fetchDoctorAvailability();
      // Only show slots belonging to this doctor
      if (profile) {
        setSlots(data.filter(slot => slot.doctor === profile.id));
      } else {
        setSlots(data);
      }
    } catch (e: any) {
      setError(e.message || 'Failed to load availability');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setForm({ ...form, [field]: value });
  };

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2000);
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    try {
      const updates = {
        specialty: form.specialty,
        years_of_experience: form.years_of_experience,
        certification: form.certification,
        degree: form.degree,
        clinic_location: form.clinic_location,
        latitude: form.latitude,
        longitude: form.longitude,
        phone: form.phone,
        // Add more fields as needed
      };
      const updated = await updateDoctorProfile(profile.id, updates);
      setProfile(updated);
      setEditMode(false);
      showToast('Profile updated successfully');
    } catch (e: any) {
      setError(e.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <ActivityIndicator style={{ flex: 1 }} size="large" />;
  if (error) return <View style={styles.center}><Text style={{ color: 'red' }}>{error}</Text></View>;
  if (!profile) return <View style={styles.center}><Text>No profile data found.</Text></View>;

  return (
    <>
      <ScrollView style={{ flex: 1, backgroundColor: '#f6f8fa' }} contentContainerStyle={{ padding: 24, alignItems: 'center' }}>
        <View style={styles.card}>
          <TouchableOpacity style={styles.avatarContainer} activeOpacity={0.7}>
            {profile.profile_photo ? (
              <Image source={{ uri: profile.profile_photo }} style={styles.avatar} />
            ) : (
              <View style={[styles.avatar, styles.avatarPlaceholder]}>
                <Text style={{ color: '#888', fontWeight: 'bold' }}>Add Photo</Text>
              </View>
            )}
          </TouchableOpacity>
          <Text style={styles.name}>{form.name}</Text>
          <Text style={styles.email}>{form.email}</Text>

          {/* Field: Phone */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Phone</Text>
            <TextInput
              style={[styles.input, !editMode && styles.inputDisabled]}
              value={form.phone}
              editable={editMode}
              placeholder="Phone"
              onChangeText={v => handleChange('phone', v)}
              keyboardType="phone-pad"
            />
          </View>
          {/* Field: Specialization */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Specialization</Text>
            <TextInput
              style={[styles.input, !editMode && styles.inputDisabled]}
              value={form.specialty}
              editable={editMode}
              placeholder="Specialization"
              onChangeText={v => handleChange('specialty', v)}
            />
          </View>
          {/* Field: Years of Experience */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Years of Experience</Text>
            <View style={styles.stepperRowImproved}>
              <TouchableOpacity
                style={[styles.stepperBtnImproved, form.years_of_experience <= 0 && styles.stepperBtnDisabledImproved]}
                onPress={() => editMode && form.years_of_experience > 0 && handleChange('years_of_experience', String(Number(form.years_of_experience) - 1))}
                disabled={!editMode || form.years_of_experience <= 0}
                activeOpacity={0.7}
              >
                <Text style={styles.stepperBtnTextImproved}>-</Text>
              </TouchableOpacity>
              <View style={styles.stepperValueBox}>
                <Text style={styles.stepperValue}>{form.years_of_experience?.toString() || '0'}</Text>
                <Text style={styles.stepperValueLabel}>years</Text>
              </View>
              <TouchableOpacity
                style={styles.stepperBtnImproved}
                onPress={() => editMode && handleChange('years_of_experience', String(Number(form.years_of_experience || 0) + 1))}
                disabled={!editMode}
                activeOpacity={0.7}
              >
                <Text style={styles.stepperBtnTextImproved}>+</Text>
              </TouchableOpacity>
            </View>
          </View>
          {/* Field: Certification */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Certification</Text>
            <TextInput
              style={[styles.input, !editMode && styles.inputDisabled]}
              value={form.certification}
              editable={editMode}
              placeholder="Certification"
              onChangeText={v => handleChange('certification', v)}
            />
          </View>
          {/* Field: Degree */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Degree</Text>
            <TextInput
              style={[styles.input, !editMode && styles.inputDisabled]}
              value={form.degree}
              editable={editMode}
              placeholder="Degree"
              onChangeText={v => handleChange('degree', v)}
            />
          </View>
          {/* Field: Clinic Address */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Clinic Address</Text>
            <TextInput
              style={[styles.input, !editMode && styles.inputDisabled]}
              value={form.clinic_location}
              editable={editMode}
              placeholder="Clinic Address"
              onChangeText={v => handleChange('clinic_location', v)}
            />
          </View>
          {error ? <Text style={{ color: 'red', marginTop: 10 }}>{error}</Text> : null}
        </View>
        <TouchableOpacity
          style={[styles.fab, { backgroundColor: editMode ? '#2ecc71' : '#007bff' }]}
          onPress={editMode ? handleSave : () => setEditMode(true)}
          disabled={saving}
          activeOpacity={0.8}
        >
          <Text style={styles.fabText}>{editMode ? (saving ? 'Saving...' : 'Save') : 'Edit'}</Text>
        </TouchableOpacity>
      </ScrollView>
      {toast && (
        <View style={styles.toast} pointerEvents="none">
          <Text style={styles.toastText}>{toast}</Text>
        </View>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
    marginBottom: 32,
    alignItems: 'center',
  },
  avatarContainer: {
    marginBottom: 16,
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#eaeaea',
    marginBottom: 0,
  },
  avatarPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#eaeaea',
    width: 96,
    height: 96,
    borderRadius: 48,
  },
  name: {
    fontSize: 22,
    fontWeight: '700',
    color: '#222',
    marginBottom: 2,
  },
  email: {
    fontSize: 15,
    color: '#888',
    marginBottom: 18,
  },
  fieldGroup: {
    width: '100%',
    marginBottom: 16,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
    marginLeft: 2,
  },
  input: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: Platform.OS === 'ios' ? 14 : 10,
    marginBottom: 10,
    backgroundColor: '#fafbfc',
    fontSize: 16,
  },
  inputDisabled: {
    backgroundColor: '#f0f0f0',
    color: '#aaa',
  },
  fab: {
    position: 'absolute',
    bottom: 32,
    alignSelf: 'center',
    minWidth: 120,
    paddingVertical: 14,
    borderRadius: 30,
    alignItems: 'center',
    shadowColor: '#007bff',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 4,
  },
  fabText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
    letterSpacing: 1,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperRowImproved: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    paddingVertical: 8,
    marginTop: 6,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 2,
    elevation: 2,
  },
  stepperBtnImproved: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#007bff',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 10,
    shadowColor: '#007bff',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  stepperBtnDisabledImproved: {
    backgroundColor: '#e0e0e0',
    shadowOpacity: 0,
  },
  stepperBtnTextImproved: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: Platform.OS === 'ios' ? -2 : 0,
  },
  stepperValueBox: {
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 60,
    marginHorizontal: 8,
  },
  stepperValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#222',
    marginBottom: 0,
  },
  stepperValueLabel: {
    fontSize: 13,
    color: '#888',
    marginTop: 0,
    fontWeight: '500',
    letterSpacing: 0.5,
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
}); 