import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import DashboardScreen from './DashboardScreen';
import AppointmentManagementScreen from './AppointmentManagementScreen';
import PatientRecordsScreen from './PatientRecordsScreen';
import ProfileManagementScreen from './ProfileManagementScreen';
import AvailabilitySchedulerScreen from './AvailabilitySchedulerScreen';
import NotificationsScreen from './NotificationsScreen';
import { TouchableOpacity } from 'react-native';

const Tab = createBottomTabNavigator();

export default function DoctorTabs({ navigation }: any) {
  const handleLogout = () => {
    // Clear tokens or session here if needed
    navigation.replace('Login');
  };

  const screenOptions = ({ route }: any) => ({
    headerRight: () => (
      <TouchableOpacity onPress={handleLogout} style={{ marginRight: 16 }}>
        <MaterialCommunityIcons name="logout" size={24} color="#d00" />
      </TouchableOpacity>
    ),
    tabBarIcon: ({ color, size }: any) => {
      let iconName = '';
      switch (route.name) {
        case 'Dashboard':
          iconName = 'view-dashboard-outline';
          break;
        case 'Appointments':
          iconName = 'calendar-check-outline';
          break;
        case 'Patients':
          iconName = 'account-multiple-outline';
          break;
        case 'Profile':
          iconName = 'account-circle-outline';
          break;
        case 'Availability':
          iconName = 'clock-outline';
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
    <Tab.Navigator initialRouteName="Dashboard" screenOptions={screenOptions}>
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Appointments" component={AppointmentManagementScreen} />
      <Tab.Screen name="Patients" component={PatientRecordsScreen} />
      <Tab.Screen name="Profile" component={ProfileManagementScreen} />
      <Tab.Screen name="Availability" component={AvailabilitySchedulerScreen} />
      <Tab.Screen name="Notifications" component={NotificationsScreen} />
    </Tab.Navigator>
  );
} 