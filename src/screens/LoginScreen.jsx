import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  Button,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { BASE_API_URL } from "../../config.json";

export default function LoginScreen({ navigation }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!username || !password) {
      Alert.alert("Ошибка", "Введите имя пользователя и пароль!");
      return;
    }

    if (username.length < 3 || password.length < 6) {
      Alert.alert("Ошибка", "Имя пользователя или пароль слишком короткие.");
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${BASE_API_URL}/login/`, {
        username,
        password,
      });

      if (response.status === 200) {
        const { token, role } = response.data;
        await AsyncStorage.setItem("token", token);
        await AsyncStorage.setItem("role", role);

        if (role === "teacher") {
          navigation.replace("TeacherDashboard");
        } else {
          navigation.replace("StudentDashboard");
        }

        Alert.alert("Успешно", "Вы успешно вошли в систему!");
      }
    } catch (error) {
      console.error("Login Error:", error.response || error.message);
      if (error.response?.data?.detail) {
        Alert.alert("Ошибка", error.response.data.detail);
      } else {
        Alert.alert("Ошибка", "Не удалось авторизоваться. Попробуйте еще раз.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {loading ? <ActivityIndicator size="large" color="#0000ff" /> : null}
      <Text style={styles.title}>Вход</Text>
      <TextInput
        style={styles.input}
        placeholder="Имя пользователя"
        value={username}
        onChangeText={setUsername}
      />
      <TextInput
        style={styles.input}
        placeholder="Пароль"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      <Button title="Войти" onPress={handleLogin} disabled={loading} />
      <View style={styles.registerContainer}>
        <Text>У вас нет аккаунта? </Text>
        <TouchableOpacity onPress={() => navigation.navigate("Register")}>
          <Text style={styles.link}>Зарегистрируйтесь</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  title: {
    fontSize: 24,
    color: "#659DBD",
    marginBottom: 20,
    fontWeight: "bold",
    textAlign: "center",
  },
  input: {
    width: "100%",
    height: 40,
    borderWidth: 1,
    borderColor: "#659DBD",
    borderRadius: 5,
    marginBottom: 10,
    paddingHorizontal: 10,
    backgroundColor: "#FFFFFF",
  },
  registerContainer: {
    flexDirection: "row",
    marginTop: 10,
  },
  link: {
    color: "blue",
  },
});
