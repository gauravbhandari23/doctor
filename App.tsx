import React from 'react';
import { StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import SplashScreen from './components/SplashScreen';
import OnboardingScreen from './components/OnboardingScreen';
import SignUpScreen from './components/SignUpScreen';
import LoginScreen from './components/LoginScreen';
import PatientNavigation from './components/patient/PatientTabs';
import DoctorTabs from './components/doctor/DoctorTabs';

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Splash">
        <Stack.Screen 
          name="Splash" 
          component={SplashScreen} 
          options={{ headerShown: false }} 
        />
        <Stack.Screen 
          name="Onboarding" 
          component={OnboardingScreen} 
          options={{ headerShown: false }} 
        />
        <Stack.Screen 
          name="Login" 
          options={{ headerShown: false }}
        >
          {props => (
            <LoginScreen 
              {...props} 
              onLogin={(role) => {
                if (role === 'doctor') {
                  props.navigation.replace('Doctor');
                } else if (role === 'patient') {
                  props.navigation.replace('Patient');
                }
              }} 
              onSignUp={() => props.navigation.navigate('SignUp')} 
            />
          )}
        </Stack.Screen>
        <Stack.Screen 
          name="SignUp" 
          options={{ headerShown: false }}
        >
          {props => (
            <SignUpScreen 
              {...props} 
              onSignUp={() => {}} 
              onLogin={() => props.navigation.navigate('Login')} 
            />
          )}
        </Stack.Screen>
       
        <Stack.Screen 
          name="Patient" 
          options={{ headerShown: false }}
        >
          {props => <PatientNavigation {...props} onLogout={() => {}} />}
        </Stack.Screen>

        <Stack.Screen 
          name="Doctor" 
          options={{ headerShown: false }}
        >
          {props => <DoctorTabs {...props} />}
        </Stack.Screen>
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
