import React, { useState, useRef } from 'react';
import { View, StyleSheet, Alert, Image, Text, Keyboard } from 'react-native';
import { TextInput, Button } from 'react-native-paper';
import colors from './sub/colors';
import { useNavigation } from '@react-navigation/native';
import { basicAxios } from './api/axios'; // basicAxios 사용
import AsyncStorage from '@react-native-async-storage/async-storage'; // AsyncStorage 임포트

const Login = () => {
  const [id, setId] = useState('');
  const [password, setPassword] = useState('');
  const navigation = useNavigation();
  const passwordInputRef = useRef(null);

  // 로그인 요청 함수
  const signIn = async () => {
    try {
      const response = await basicAxios.post('/api/v1/auth/sign-in', {
        id: id,
        password: password,
      });

      const { accessToken } = response.data; // 응답에서 액세스 토큰 추출

      // 액세스 토큰을 AsyncStorage에 저장
      await AsyncStorage.setItem('accessToken', accessToken);

      Alert.alert('성공', '로그인에 성공했습니다!');
      navigation.navigate('Home'); // 로그인 후 홈 화면으로 이동
    } catch (error) {
      console.error('로그인 실패:', error.response || error.message);
      Alert.alert('로그인 실패', '사용자 정보가 일치하지 않습니다!');
    }
  };

  return (
    <View style={styles.container}>
      <Image source={require('../assets/logo.png')} style={styles.logo} />
      <Text style={styles.textLogo}>Hiking Planner</Text>

      {/* 아이디 입력 필드 */}
      <TextInput
        style={styles.input}
        mode="outlined"
        value={id}
        onChangeText={setId}
        placeholder="아이디"
        returnKeyType="next"
        onSubmitEditing={() => passwordInputRef.current?.focus()} // 다음 필드로 이동
      />

      {/* 비밀번호 입력 필드 */}
      <TextInput
        ref={passwordInputRef}
        style={styles.input}
        mode="outlined"
        value={password}
        onChangeText={setPassword}
        placeholder="비밀번호"
        secureTextEntry
        returnKeyType="done"
        onSubmitEditing={() => {
          Keyboard.dismiss(); // 키보드 닫기
          signIn(); // 로그인 요청
        }}
      />

      {/* 로그인 버튼 */}
      <Button mode="contained" onPress={signIn} style={styles.loginButton}>
        로그인
      </Button>

      {/* 회원가입 버튼 */}
      <Button
        mode="contained"
        onPress={() => navigation.navigate('Signup')}
        style={styles.signupButton}
      >
        회원가입
      </Button>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFFFFF',
  },
  logo: {
    width: 150,
    height: 150,
    marginBottom: 10,
  },
  textLogo: {
    fontSize: 24,
    fontWeight: '900',
    color: colors.mintGreen,
    marginBottom: 20,
  },
  input: {
    marginBottom: 16,
    width: '80%',
    height: 45,
    backgroundColor: '#FFFFFF',
  },
  loginButton: {
    width: '80%',
    height: 40,
    justifyContent: 'center',
    backgroundColor: colors.mintGreen,
    marginBottom: 10,
  },
  signupButton: {
    width: '80%',
    height: 40,
    justifyContent: 'center',
    backgroundColor: colors.mintGreen,
    marginBottom: 10,
  },
});

export default Login;
