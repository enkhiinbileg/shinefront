import React, { useState } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ImageBackground,
  Dimensions,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { login } from '../redux/slices/authSlice';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import Icon from "react-native-vector-icons/FontAwesome5";

const { width, height } = Dimensions.get('window');

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state) => state.auth);

  const handleLogin = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    dispatch(login({ email, password }))
      .unwrap()
      .then((response) => {
        navigation.navigate('PostList');
      })
      .catch((err) => {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      });
  };

  return (
    <ImageBackground
      source={{ 
        uri: 'https://images.pexels.com/photos/13058155/pexels-photo-13058155.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1' 
      }}
      style={styles.container}
    >
      <LinearGradient
        colors={['rgba(0,0,0,0.1)', 'rgba(0,0,0,0.8)']}
        style={styles.gradient}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <View style={styles.logoContainer}>
            <Icon name="plane-departure" size={60} color="#fff" style={styles.logoIcon} />
            <Text style={styles.welcomeText}>Аяллын Апп</Text>
            <Text style={styles.subText}>Таны аяллын түүх эхэлж байна</Text>
          </View>

          <View style={styles.inputContainer}>
            <View style={styles.inputWrapper}>
              <Icon name="envelope" size={18} color="#fff" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="И-мэйл хаяг"
                placeholderTextColor="rgba(255,255,255,0.7)"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputWrapper}>
              <Icon name="lock" size={18} color="#fff" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Нууц үг"
                placeholderTextColor="rgba(255,255,255,0.7)"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
            </View>

            <TouchableOpacity
              style={styles.forgotPassword}
              onPress={() => navigation.navigate('ForgotPassword')}
            >
              <Text style={styles.forgotPasswordText}>Нууц үгээ мартсан?</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.loginButton}
              onPress={handleLogin}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Text style={styles.loginButtonText}>Нэвтрэх</Text>
                  <Icon name="arrow-right" size={16} color="#fff" />
                </>
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.registerContainer}>
            <Text style={styles.registerText}>Шинэ хэрэглэгч үү?</Text>
            <TouchableOpacity
              onPress={() => navigation.navigate('Register')}
              style={styles.registerButton}
            >
              <Text style={styles.registerButtonText}>Бүртгүүлэх</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </LinearGradient>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: width,
    height: height,
  },
  gradient: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  keyboardView: {
    flex: 1,
    justifyContent: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 50,
  },
  logoIcon: {
    marginBottom: 15,
  },
  welcomeText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 10,
  },
  subText: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
  },
  inputContainer: {
    width: '100%',
    marginBottom: 25,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 15,
    marginBottom: 15,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  inputIcon: {
    marginRight: 15,
  },
  input: {
    flex: 1,
    color: '#fff',
    fontSize: 16,
    paddingVertical: 15,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 20,
  },
  forgotPasswordText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
  },
  loginButton: {
    backgroundColor: '#FF385C', // Airbnb-style color
    borderRadius: 15,
    paddingVertical: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginRight: 10,
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  registerText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 16,
  },
  registerButton: {
    marginLeft: 5,
  },
  registerButtonText: {
    color: '#FF385C',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default LoginScreen;