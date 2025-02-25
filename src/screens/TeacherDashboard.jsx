import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
} from "react-native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { BASE_API_URL } from "../../config.json";

const TeacherDashboard = ({ navigation }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchUserData = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        Alert.alert("Ошибка", "Authorization token not found.");
        navigation.replace("Login");
        return;
      }
      console.log("Токен:", token);

      const response = await axios.get(`${BASE_API_URL}/profile/`, {
        headers: { Authorization: `Token ${token}` },
      });

      setUser(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Ошибка при загрузке данных пользователя:", error);
      Alert.alert("Ошибка", "Не удалось загрузить данные пользователя.");
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      "Подтверждение",
      "Вы уверены, что хотите выйти?",
      [
        { text: "Отмена", style: "cancel" },
        {
          text: "Выйти",
          onPress: async () => {
            try {
              await AsyncStorage.removeItem("token");
              Alert.alert("Успех", "Вы вышли из системы.");
              navigation.replace("Login");
            } catch (error) {
              console.error("Ошибка при выходе:", error);
              Alert.alert("Ошибка", "Не удалось завершить выход.");
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  if (loading) {
    return <ActivityIndicator size="large" color="#659DBD" />;
  }

  if (!user) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorMessage}>
          Не удалось загрузить данные. Попробуйте снова.
        </Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchUserData}>
          <Text style={styles.retryButtonText}>Повторить попытку</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Верхний блок с кнопкой выхода */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>Выйти</Text>
        </TouchableOpacity>
      </View>

      {/* Данные профиля */}
      <View style={styles.profileContainer}>
        <Text style={styles.profileInfo}>Имя: {user.username}</Text>
        <Text style={styles.profileInfo}>Email: {user.email}</Text>
        <Text style={styles.profileInfo}>Роль: {user.role}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginBottom: 20,
  },
  logoutButton: {
    backgroundColor: "#659DBD",
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 5,
  },
  logoutButtonText: {
    color: "#fff",
    fontSize: 14,
  },
  profileContainer: {
    padding: 10,
    backgroundColor: "#f9f9f9",
    borderRadius: 8,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#eee",
  },
  profileInfo: {
    fontSize: 16,
    marginVertical: 5,
    color: "#555",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorMessage: {
    fontSize: 16,
    color: "#ff4d4d",
    marginBottom: 10,
    textAlign: "center",
  },
  retryButton: {
    backgroundColor: "#659DBD",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  retryButtonText: {
    color: "#fff",
    fontSize: 16,
  },
});

export default TeacherDashboard;
