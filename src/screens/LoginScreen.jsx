import React, { useState, useEffect } from "react";
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

  const checkAuth = async () => {
    try {
      console.log("Вызов checkAuth...");
      const token = await AsyncStorage.getItem("token");
      console.log("Токен из AsyncStorage:", token);
  
      if (token) {
        // Устанавливаем токен в заголовок по умолчанию
        axios.defaults.headers.common["Authorization"] = `Token ${token}`;
        console.log("Токен установлен в заголовок:", axios.defaults.headers.common["Authorization"]);
        
        // Выполняем запрос для проверки профиля пользователя
        const response = await axios.get(`${BASE_API_URL}/profile/`);
        console.log("Ответ профиля:", response.data);
        
        if (response.status === 200) {
          console.log("Профиль успешно получен, перенаправление на Dashboard");
          navigation.replace("Dashboard", { role: response.data.role });
        } else {
          console.log("Ошибка профиля, статус:", response.status);
          await AsyncStorage.removeItem("token"); // Удаляем токен, если запрос неудачен
          navigation.replace("Login");
        }
      } else {
        console.log("Токен отсутствует.");
      }
    } catch (error) {
      console.error("Ошибка проверки токена:", error.response?.data || error.message);
      await AsyncStorage.removeItem("token"); // Удаляем токен в случае ошибки
      navigation.replace("Login");
    }
  };
  

  useEffect(() => {
    checkAuth();
  }, []);

  // Получение CSRF-токена перед логином
  const getCsrfToken = async () => {
    try {
      const response = await axios.get(`${BASE_API_URL}/csrf/`);
      return response.data.csrfToken;
    } catch (error) {
      console.error("Ошибка получения CSRF-токена:", error);
      return null;
    }
  };

  // Обработчик входа
  const handleLogin = async () => {
    if (!username || !password) {
      Alert.alert("Ошибка", "Введите имя пользователя и пароль!");
      return;
    }

    setLoading(true);
    try {
      const csrfToken = await getCsrfToken();

      if (!csrfToken) {
        Alert.alert("Ошибка", "Не удалось получить CSRF-токен. Попробуйте еще раз.");
        setLoading(false);
        return;
      }

      const response = await axios.post(
        `${BASE_API_URL}/login/`,
        { username, password },
        { headers: { "X-CSRFToken": csrfToken, "Content-Type": "application/json" } }
      );

      if (response.status === 200) {
        const { token, role } = response.data;
        console.log("Токен, полученный после входа:", token);
        console.log("Роль пользователя после входа:", role);
      
        // Сохраняем токен и роль в AsyncStorage
        await AsyncStorage.setItem("token", token);
        await AsyncStorage.setItem("role", role);
        
        // Проверка, правильно ли сохранился токен
        const savedToken = await AsyncStorage.getItem("token");
        const savedRole = await AsyncStorage.getItem("role");
        console.log("Сохранённый токен в AsyncStorage:", savedToken);
        console.log("Сохранённая роль в AsyncStorage:", savedRole);
      
        axios.defaults.headers.common["Authorization"] = `Token ${token}`;
        console.log("Токен установлен в заголовок:", axios.defaults.headers.common["Authorization"]);
      
        navigation.replace("Dashboard", { role });
        Alert.alert("Успешно", "Вы успешно вошли в систему!");
      }
    } catch (error) {
      console.error("Login Error:", error.response?.data || error.message);
      Alert.alert("Ошибка", "Неправильное имя пользователя или пароль.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {loading && <ActivityIndicator size="large" color="#0000ff" />}
      <Text style={styles.title}>Вход</Text>
      <TextInput
        style={styles.input}
        placeholder="Имя пользователя"
        value={username}
        onChangeText={setUsername}
        autoCapitalize="none"
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

// Стили для экрана
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
