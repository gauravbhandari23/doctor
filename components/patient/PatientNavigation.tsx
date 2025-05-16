import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { View, Text, Button } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Stack = createStackNavigator();

function PatientProfileScreen({ navigation }: any) {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Text>Patient Profile Screen</Text>
      <Button title="Go to Doctor Search" onPress={() => navigation.navigate('DoctorSearch')} />
      <Button title="Go to Booking History" onPress={() => navigation.navigate('BookingHistory')} />
      <Button title="Go to Appointment Details" onPress={() => navigation.navigate('AppointmentDetails')} />
    </View>
  );
}

function DoctorSearchScreen(props: any) {
  const { navigation } = props;
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Text>Doctor Search Screen</Text>
      <Button title="Go to Profile" onPress={() => navigation.navigate('PatientProfile')} />
      <Button title="Go to Booking History" onPress={() => navigation.navigate('BookingHistory')} />
      <Button title="Go to Appointment Details" onPress={() => navigation.navigate('AppointmentDetails')} />
    </View>
  );
}

function BookingHistoryScreen(props: any) {
  const { navigation } = props;
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Text>Booking History Screen</Text>
      <Button title="Go to Profile" onPress={() => navigation.navigate('PatientProfile')} />
      <Button title="Go to Doctor Search" onPress={() => navigation.navigate('DoctorSearch')} />
      <Button title="Go to Appointment Details" onPress={() => navigation.navigate('AppointmentDetails')} />
    </View>
  );
}

function AppointmentDetailsScreen(props: any) {
  const { navigation } = props;
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Text>Appointment Details Screen</Text>
      <Button title="Go to Profile" onPress={() => navigation.navigate('PatientProfile')} />
      <Button title="Go to Doctor Search" onPress={() => navigation.navigate('DoctorSearch')} />
      <Button title="Go to Booking History" onPress={() => navigation.navigate('BookingHistory')} />
    </View>
  );
}

export default function PatientNavigation({ onLogout }: { onLogout: () => void }) {
  const handleLogout = async (navigation: any) => {
    await AsyncStorage.clear(); // Clear all stored tokens and session data
    navigation.replace('Login'); // Navigate back to the login screen
  };

  return (
    <Stack.Navigator initialRouteName="PatientProfile">
      <Stack.Screen 
        name="PatientProfile" 
        component={PatientProfileScreen} 
        options={({ navigation }) => ({ 
          title: 'Profile', 
          headerRight: () => (
            <Button title="Logout" onPress={() => handleLogout(navigation)} color="#d00" />
          ),
        })} 
      />
      <Stack.Screen name="DoctorSearch" component={DoctorSearchScreen} options={{ title: 'Doctor Search' }} />
      <Stack.Screen name="BookingHistory" component={BookingHistoryScreen} options={{ title: 'Booking History' }} />
      <Stack.Screen name="AppointmentDetails" component={AppointmentDetailsScreen} options={{ title: 'Appointment Details' }} />
    </Stack.Navigator>
  );
}
