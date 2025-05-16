import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity } from 'react-native';
import Swiper from 'react-native-swiper';

const OnboardingScreen = ({ navigation }: { navigation: any }) => {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Welcome to Doctor Book</Text>
      <Text style={styles.subtitle}>Your one-stop solution for managing doctor appointments and patient records.</Text>
        
      <Swiper style={styles.swiper} showsButtons={true} loop={false}>
        <View style={styles.slide}>
          <Image
            source={require('../assets/DoctorbookAdmin.png')}
            style={styles.image}
          />
        </View>
        <View style={styles.slide}>
          <Image
            source={require('../assets/doctorbookSplash.png')}
            style={styles.image}
          />
        </View>
        <View style={styles.slide}>
          <Image
            source={require('../assets/AppLogo.png')}
            style={styles.image}
          />
        </View>
      </Swiper>

      <TouchableOpacity
        style={[styles.button, { backgroundColor: '#1976d2' }]}
        onPress={() => navigation.navigate('SignUp')}
      >
        <Text style={styles.buttonText}>Sign Up</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.button, { backgroundColor: '#42a5f5' }]}
        onPress={() => navigation.navigate('Login')}
      >
        <Text style={styles.buttonText}>Login</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f5f6fa',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1976d2',
    marginBottom: 10,
    marginTop: 60, // Increased margin top for spacing
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#555',
    marginBottom: 20,
    textAlign: 'center',
  },
  swiper: {
    height: 200, // Reduced height of the swiper section
    marginBottom: 30,
  },
  slide: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '80%', // Reduced size of the image
    height: 200, // Adjusted height
    resizeMode: 'contain',
    marginBottom: 20, // Added margin bottom for spacing
  },
  buttonContainer: {
    width: '90%',
    marginTop: 20,
    marginBottom: 20, // Added margin bottom for spacing
    borderRadius: 10,
    overflow: 'hidden',
    gap: 10, // Added gap between buttons
  },
  button: {
    width: '90%',
    borderRadius: 60, // Added rounded corners for buttons
    paddingVertical: 10,
    alignItems: 'center',
    marginVertical: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default OnboardingScreen;
