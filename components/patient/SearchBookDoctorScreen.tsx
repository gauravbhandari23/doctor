import React from 'react';
import { View, Text } from 'react-native';

export default function SearchBookDoctorScreen() {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Text>Search & Book Doctor</Text>
      <Text>Filter by specialization, location, availability, rating</Text>
      <Text>View doctor profiles & ratings</Text>
      <Text>Book appointment (online or offline)</Text>
    </View>
  );
}
