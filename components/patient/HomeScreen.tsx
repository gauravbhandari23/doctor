import React from 'react';
import { View, Text } from 'react-native';

export default function HomeScreen() {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Text>Home / Dashboard</Text>
      <Text>Upcoming Appointments</Text>
      <Text>Suggested Doctors</Text>
      <Text>Recently Visited</Text>
    </View>
  );
}
