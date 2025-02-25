import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  Alert,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import DropDownPicker from "react-native-dropdown-picker";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { BASE_API_URL } from "../../config.json";

const RegisterScreen = ({ navigation }) => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(false);

  // Стейт для открытия выпадающего списка
  const [openRole, setOpenRole] = useState(false);

  // Доступные роли
  const roles = [
    { label: "Студент", value: "student" },
    { label: "Учитель", value: "teacher" },
  ];

  const handleSubmit = async () => {
    if (!username || !email || !password || !confirmPassword || !role) {
      Alert.alert("Ошибка", "Все поля обязательны для заполнения!");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Ошибка", "Пароли не совпадают!");
      return;
    }

    const isValidEmail = (email) => /\S+@\S+\.\S+/.test(email);
    if (!isValidEmail(email)) {
      Alert.alert("Ошибка", "Введите корректный email.");
      return;
    }

    const formData = {
      username,
      email,
      password,
      password2: confirmPassword, // Оставил password2, если API так ожидает
      role,
    };

    try {
      setLoading(true);
      const response = await axios.post(`${BASE_API_URL}/register/`, formData);

      if (response.status === 201) {
        const { token, user } = response.data;
        if (token) {
          await AsyncStorage.setItem("token", token);
        }

        const userRole = user?.role || null;
        if (!userRole) {
          Alert.alert("Ошибка", "Роль пользователя не получена.");
          return;
        }

        Alert.alert("Успешно", "Вы успешно зарегистрировались!");
        navigation.replace("Dashboard", { role: userRole });
      } else {
        Alert.alert("Ошибка", response.data?.message || "Ошибка регистрации.");
      }
    } catch (error) {
      Alert.alert("Ошибка", error.response?.data?.detail || "Ошибка сети.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Регистрация</Text>

      <Text style={styles.label}>Имя пользователя:</Text>
      <TextInput
        style={styles.input}
        value={username}
        onChangeText={setUsername}
      />

      <Text style={styles.label}>Email:</Text>
      <TextInput
        style={styles.input}
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
      />

      <Text style={styles.label}>Придумайте пароль:</Text>
      <TextInput
        style={styles.input}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <Text style={styles.label}>Подтвердите пароль:</Text>
      <TextInput
        style={styles.input}
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry
      />

      <Text style={styles.label}>Выберите роль:</Text>
      <DropDownPicker
        open={openRole}
        value={role}
        items={roles}
        setOpen={setOpenRole}
        setValue={setRole}
        setItems={() => roles}
        placeholder="Выберите роль"
        style={styles.dropdown}
        dropDownContainerStyle={styles.dropdownContainer}
      />

      <Button
        title={loading ? "Регистрация..." : "Зарегистрироваться"}
        onPress={handleSubmit}
        disabled={loading}
      />
      {loading && <ActivityIndicator size="large" color="#659DBD" />}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    padding: 20,
    paddingTop: 80,
  },
  header: {
    fontSize: 24,
    color: "#007AFF",
    marginBottom: 20,
    fontWeight: "bold",
    textAlign: "center",
  },
  label: {
    color: "#007AFF",
    marginBottom: 5,
    fontSize: 16,
    fontWeight: "bold",
  },
  input: {
    height: 45,
    borderColor: "#007AFF",
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 10,
    paddingHorizontal: 10,
    backgroundColor: "#FFFFFF",
    color: "#000000",
  },
  dropdown: {
    borderColor: "#007AFF",
    borderRadius: 8,
    backgroundColor: "#F5F5F5",
    marginBottom: 10,
  },
  dropdownContainer: {
    borderColor: "#007AFF",
  },
});

export default RegisterScreen;
