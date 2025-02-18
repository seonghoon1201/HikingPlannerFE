import React, { useState, useRef } from 'react';
import { View, StyleSheet, Alert, Text } from 'react-native';
import { TextInput, Button } from 'react-native-paper';
import colors from './sub/colors';
import { useNavigation } from '@react-navigation/native';
import { basicAxios } from './api/axios'; // basicAxios 사용

const SignUp = () => {
  const [id, setId] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [certificationNumber, setCertificationNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [isCertificationSent, setIsCertificationSent] = useState(false);
  const navigation = useNavigation();
  const phoneInputRef = useRef(null); // 전화번호 입력 필드 참조

  // 이메일 인증 요청
  const sendEmailCertification = async () => {
    try {
      const response = await basicAxios.post('/api/v1/auth/email-certification', {
        id,
        email,
      });
      Alert.alert('성공', '인증 이메일이 발송되었습니다.');
      setIsCertificationSent(true);
    } catch (error) {
      console.error('이메일 인증 오류:', error.response || error.message);
  
      // 네트워크 에러인지 확인
      if (error.message === 'Network Error') {
        Alert.alert('네트워크 오류', '네트워크 연결을 확인하세요.');
      } else if (error.response) {
        // 서버 응답이 있는 경우
        console.error('서버 응답:', error.response.data);
        Alert.alert('오류', `서버 오류: ${error.response.data.message}`);
      } else {
        // 기타 오류
        Alert.alert('오류', '알 수 없는 오류가 발생했습니다.');
      }
    }
  };

  // 인증 번호 확인 요청
  const checkCertification = async () => {
    try {
      await basicAxios.post('/api/v1/auth/check-certification', {
        id,
        email,
        certificationNumber,
      });
      Alert.alert('성공', '인증 번호가 확인되었습니다.');
      setIsEmailVerified(true);
    } catch (error) {
      console.error('인증 번호 확인 오류:', error.response || error.message);
      Alert.alert('오류', '인증 번호 확인에 실패했습니다.');
    }
  };

  // 회원가입 요청
  const signUp = async () => {
    if (!isEmailVerified) {
      Alert.alert('오류', '이메일 인증을 먼저 완료해주세요.');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('오류', '비밀번호가 일치하지 않습니다.');
      return;
    }

    try {
      await basicAxios.post('/api/v1/auth/sign-up', {
        id,
        password,
        email,
        phoneNumber,
        certificationNumber,
      });
      Alert.alert('성공', '회원가입에 성공했습니다!');
      navigation.navigate('Login'); // 로그인 화면으로 이동
    } catch (error) {
      console.error('회원가입 오류:', error.response || error.message);
      Alert.alert('오류', '회원가입에 실패했습니다.');
    }
  };

  const isPasswordMatch = password === confirmPassword;
  const isPasswordValid =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,13}$/.test(password);

  return (
    <View style={styles.container}>
      <Text style={styles.label}>아이디</Text>
      <TextInput
        style={styles.input}
        mode="outlined"
        value={id}
        onChangeText={setId}
        placeholder="아이디를 입력하세요"
        returnKeyType="next"
        onSubmitEditing={() => phoneInputRef.current?.focus()}
      />
      <View style={styles.emailContainer}>
        <View style={styles.emailInputContainer}>
          <Text style={styles.label}>이메일</Text>
          <TextInput
            style={styles.input}
            mode="outlined"
            value={email}
            onChangeText={setEmail}
            placeholder="이메일을 입력하세요"
            keyboardType="email-address"
          />
        </View>
        <Button
          mode="contained"
          onPress={sendEmailCertification}
          style={styles.emailButton}
        >
          {isCertificationSent ? '재전송' : '이메일 인증'}
        </Button>
      </View>
      {isCertificationSent && (
        <>
          <Text style={styles.label}>인증 번호</Text>
          <TextInput
            style={styles.input}
            mode="outlined"
            value={certificationNumber}
            onChangeText={setCertificationNumber}
            placeholder="인증 번호를 입력하세요"
            returnKeyType="next"
          />
          <Button
            mode="contained"
            onPress={checkCertification}
            style={styles.verifyButton}
          >
            인증 번호 확인
          </Button>
        </>
      )}
      <Text style={styles.label}>비밀번호</Text>
      <TextInput
        style={styles.input}
        mode="outlined"
        value={password}
        onChangeText={setPassword}
        placeholder="비밀번호를 입력하세요"
        secureTextEntry
        returnKeyType="next"
      />
      {!isPasswordValid && (
        <Text style={styles.errorMessage}>
          비밀번호는 최소 8자에서 13자이며, 대소문자와 숫자가 포함되어야 합니다.
        </Text>
      )}
      <Text style={styles.label}>비밀번호 확인</Text>
      <TextInput
        style={styles.input}
        mode="outlined"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        placeholder="비밀번호를 다시 입력하세요"
        secureTextEntry
        returnKeyType="next"
      />
      {confirmPassword.length > 0 && (
        <Text
          style={[
            styles.passwordMatchText,
            { color: isPasswordMatch ? 'green' : 'red' },
          ]}
        >
          {isPasswordMatch
            ? '비밀번호가 일치합니다.'
            : '비밀번호가 일치하지 않습니다.'}
        </Text>
      )}
      <Text style={styles.label}>전화번호</Text>
      <TextInput
        ref={phoneInputRef}
        style={styles.input}
        mode="outlined"
        value={phoneNumber}
        onChangeText={setPhoneNumber}
        placeholder="전화번호를 입력하세요"
        keyboardType="phone-pad"
        returnKeyType="done"
        onSubmitEditing={signUp}
      />
      <Button mode="contained" onPress={signUp} style={styles.signUpButton}>
        회원가입
      </Button>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
  },
  input: {
    marginBottom: 16,
    height: 45,
    backgroundColor: '#FFFFFF',
  },
  emailContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  emailInputContainer: {
    flex: 1,
  },
  emailButton: {
    marginLeft: 8,
    height: 40,
    justifyContent: 'center',
    backgroundColor: colors.mintGreen,
  },
  verifyButton: {
    marginTop: 16,
    height: 40,
    justifyContent: 'center',
    backgroundColor: colors.mintGreen,
  },
  passwordMatchText: {
    marginBottom: 16,
    fontSize: 14,
  },
  signUpButton: {
    marginTop: 32,
    height: 40,
    justifyContent: 'center',
    backgroundColor: colors.mintGreen,
  },
  errorMessage: {
    color: 'red',
    marginBottom: 8,
  },
});

export default SignUp;
