import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import DateTimePicker from '@react-native-community/datetimepicker';
import Icon from 'react-native-vector-icons/FontAwesome';
import { Picker } from '@react-native-picker/picker';

const API_BASE = 'http://10.0.2.2:8000/api';

export default function ProfileManagementScreen() {
  const [profile, setProfile] = useState({
    email: '',
    username: '',
    phone: '',
    medical_history: '',
    date_of_birth: '',
    gender: '',
    address: '',
    blood_type: '',
    allergies: '',
    current_medications: '',
    chronic_conditions: '',
    insurance_provider: '',
  });
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = await AsyncStorage.getItem('access');
        const res = await axios.get(`${API_BASE}/patients/me/`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setProfile(res.data);
      } catch (error) {
        console.error('Failed to fetch profile:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const validateProfile = () => {
    const newErrors: Record<string, string> = {};

    if (!profile.email.includes('@')) {
      newErrors.email = 'Invalid email address.';
    }

    if (!profile.username.trim()) {
      newErrors.username = 'Username is required.';
    }

    if (!['Male', 'Female', 'Other'].includes(profile.gender)) {
      newErrors.gender = 'Gender must be Male, Female, or Other.';
    }

    if (profile.blood_type && profile.blood_type.length > 3) {
      newErrors.blood_type = 'Blood type must be 3 characters or less.';
    }

    if (!profile.phone.trim()) {
      newErrors.phone = 'Phone number is required.';
    }

    if (!profile.medical_history.trim()) {
      newErrors.medical_history = 'Medical history is required.';
    }

    if (!profile.date_of_birth.trim()) {
      newErrors.date_of_birth = 'Date of birth is required.';
    }

    if (!profile.address.trim()) {
      newErrors.address = 'Address is required.';
    }

    if (!profile.allergies.trim()) {
      newErrors.allergies = 'Allergies are required.';
    }

    if (!profile.current_medications.trim()) {
      newErrors.current_medications = 'Current medications are required.';
    }

    if (!profile.chronic_conditions.trim()) {
      newErrors.chronic_conditions = 'Chronic conditions are required.';
    }

    if (!profile.insurance_provider.trim()) {
      newErrors.insurance_provider = 'Insurance provider is required.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateProfile()) {
      return;
    }

    try {
      const token = await AsyncStorage.getItem('access');
      await axios.patch(
        `${API_BASE}/patients/me/`,
        profile,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update profile:', error);
    }
  };

  if (loading) {
    return (
      <View style={styles.centeredView}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.card}>
        <Text style={styles.title}>Profile Management</Text>

        <Text style={styles.label}>Email:</Text>
        <TextInput
          style={[styles.input, errors.email && styles.errorInput]}
          value={profile.email}
          editable={false}
        />
        {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}

        <Text style={styles.label}>Username:</Text>
        <TextInput
          style={[styles.input, errors.username && styles.errorInput]}
          value={profile.username}
          editable={false}
        />
        {errors.username && <Text style={styles.errorText}>{errors.username}</Text>}

        <Text style={styles.label}>Phone:</Text>
        <TextInput
          style={[styles.input, errors.phone && styles.errorInput]}
          value={profile.phone}
          onChangeText={(text) => setProfile({ ...profile, phone: text })}
          editable={isEditing}
        />
        {errors.phone && <Text style={styles.errorText}>{errors.phone}</Text>}

        <Text style={styles.label}>Medical History:</Text>
        <TextInput
          style={[styles.input, errors.medical_history && styles.errorInput]}
          value={profile.medical_history}
          onChangeText={(text) => setProfile({ ...profile, medical_history: text })}
          editable={isEditing}
        />
        {errors.medical_history && <Text style={styles.errorText}>{errors.medical_history}</Text>}

        <Text style={styles.label}>Date of Birth:</Text>
        {isEditing ? (
          <TouchableOpacity
            style={styles.datePickerButton}
            onPress={() => setShowDatePicker(true)}
          >
            <Text style={styles.datePickerText}>{profile.date_of_birth || 'Select Date'}</Text>
          </TouchableOpacity>
        ) : (
          <Text style={styles.value}>{profile.date_of_birth}</Text>
        )}
        {showDatePicker && (
          <DateTimePicker
            value={new Date(profile.date_of_birth || Date.now())}
            mode="date"
            display="default"
            onChange={(event, selectedDate) => {
              setShowDatePicker(false);
              if (selectedDate) {
                setProfile({ ...profile, date_of_birth: selectedDate.toISOString().split('T')[0] });
              }
            }}
          />
        )}
        {errors.date_of_birth && <Text style={styles.errorText}>{errors.date_of_birth}</Text>}

        <Text style={styles.label}>Address:</Text>
        <TextInput
          style={[styles.input, errors.address && styles.errorInput]}
          value={profile.address}
          onChangeText={(text) => setProfile({ ...profile, address: text })}
          editable={isEditing}
        />
        {errors.address && <Text style={styles.errorText}>{errors.address}</Text>}

        <Text style={styles.label}>Allergies:</Text>
        <TextInput
          style={[styles.input, errors.allergies && styles.errorInput]}
          value={profile.allergies}
          onChangeText={(text) => setProfile({ ...profile, allergies: text })}
          editable={isEditing}
        />
        {errors.allergies && <Text style={styles.errorText}>{errors.allergies}</Text>}

        <Text style={styles.label}>Current Medications:</Text>
        <TextInput
          style={[styles.input, errors.current_medications && styles.errorInput]}
          value={profile.current_medications}
          onChangeText={(text) => setProfile({ ...profile, current_medications: text })}
          editable={isEditing}
        />
        {errors.current_medications && <Text style={styles.errorText}>{errors.current_medications}</Text>}

        <Text style={styles.label}>Chronic Conditions:</Text>
        <TextInput
          style={[styles.input, errors.chronic_conditions && styles.errorInput]}
          value={profile.chronic_conditions}
          onChangeText={(text) => setProfile({ ...profile, chronic_conditions: text })}
          editable={isEditing}
        />
        {errors.chronic_conditions && <Text style={styles.errorText}>{errors.chronic_conditions}</Text>}

        <Text style={styles.label}>Insurance Provider:</Text>
        <TextInput
          style={[styles.input, errors.insurance_provider && styles.errorInput]}
          value={profile.insurance_provider}
          onChangeText={(text) => setProfile({ ...profile, insurance_provider: text })}
          editable={isEditing}
        />
        {errors.insurance_provider && <Text style={styles.errorText}>{errors.insurance_provider}</Text>}

        <Text style={styles.label}>Gender:</Text>
        {isEditing ? (
          <Picker
            selectedValue={profile.gender}
            onValueChange={(itemValue) => setProfile({ ...profile, gender: itemValue })}
            style={styles.picker}
          >
            <Picker.Item label="Male" value="Male" />
            <Picker.Item label="Female" value="Female" />
            <Picker.Item label="Other" value="Other" />
          </Picker>
        ) : (
          <Text style={styles.value}>{profile.gender}</Text>
        )}
        {errors.gender && <Text style={styles.errorText}>{errors.gender}</Text>}

        <Text style={styles.label}>Blood Type:</Text>
        <TextInput
          style={[styles.input, errors.blood_type && styles.errorInput]}
          value={profile.blood_type}
          onChangeText={(text) => setProfile({ ...profile, blood_type: text })}
          editable={isEditing}
        />
        {errors.blood_type && <Text style={styles.errorText}>{errors.blood_type}</Text>}

        {isEditing ? (
          <Button title="Save" onPress={handleSave} />
        ) : (
          <Button title="Edit" onPress={() => setIsEditing(true)} />
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    fontSize: 16,
    marginBottom: 10,
  },
  errorInput: {
    borderColor: 'red',
  },
  errorText: {
    color: 'red',
    fontSize: 12,
    marginBottom: 10,
  },
  picker: {
    height: 50,
    width: '100%',
    marginBottom: 10,
  },
  value: {
    fontSize: 16,
    marginBottom: 10,
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  datePickerButton: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    backgroundColor: '#fff',
    marginBottom: 10,
  },
  datePickerText: {
    fontSize: 16,
  },
});
