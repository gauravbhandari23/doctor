import React from 'react';
import { View, Text } from 'react-native';

export default function MyAppointmentsScreen() {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Text>My Appointments</Text>
      <Text>Upcoming, Completed, and Cancelled Appointments</Text>
      <Text>Reschedule or Cancel, Consultation History</Text>
      <Text>View previous appointments and consultation notes</Text>
    </View>
  );
}
