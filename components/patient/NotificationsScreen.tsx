import React from 'react';
import { View, Text } from 'react-native';

export default function NotificationsScreen() {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Text>Notifications</Text>
      <Text>Appointment reminders</Text>
      <Text>Doctor communication</Text>
    </View>
  );
}
