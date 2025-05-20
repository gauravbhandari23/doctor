import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, Button, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import HomeScreen from './HomeScreen';
import SearchBookDoctorScreen from './SearchBookDoctorScreen';
import MyAppointmentsScreen from './MyAppointmentsScreen';
import ProfileManagementScreen from './ProfileManagementScreen';
import NotificationsScreen from './NotificationsScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

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

export default function PatientTabs({ navigation }: any) {
  const screenOptions = ({ route }: any) => ({
    headerShown: false,
    tabBarIcon: ({ color, size }: any) => {
      let iconName = '';
      switch (route.name) {
        case 'Home':
          iconName = 'home-outline';
          break;
        case 'Search & Book Doctor':
          iconName = 'magnify';
          break;
        case 'My Appointments':
          iconName = 'calendar-check-outline';
          break;
        case 'Profile':
          iconName = 'account-circle-outline';
          break;
        case 'Notifications':
          iconName = 'bell-outline';
          break;
        default:
          iconName = 'circle-outline';
      }
      return <MaterialCommunityIcons name={iconName} size={size} color={color} />;
    },
  });

  return (
    <Tab.Navigator initialRouteName="Home" screenOptions={screenOptions}>
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Search & Book Doctor" component={SearchBookDoctorScreen} />
      <Tab.Screen name="My Appointments" component={MyAppointmentsScreen} />
      <Tab.Screen name="Profile">
        {props => <ProfileManagementScreen {...props} />}
      </Tab.Screen>
      <Tab.Screen name="Notifications" component={NotificationsScreen} />
    </Tab.Navigator>
  );
}
