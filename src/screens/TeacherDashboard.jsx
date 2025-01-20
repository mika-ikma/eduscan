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
      <View style={styles.profileContainer}>

        <Text style={styles.profileInfo}>Имя: {user.username}</Text>
        <Text style={styles.profileInfo}>Email: {user.email}</Text>
        <Text style={styles.profileInfo}>Роль: {user.role}</Text>
        <TouchableOpacity style={styles.button} onPress={fetchUserData}>
          <Text style={styles.buttonText}>Обновить данные</Text>
        </TouchableOpacity>
      </View>
      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate("TeacherSubjects")}
      >
        <Text style={styles.buttonText}>Мои Предметы</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate("CreateSubject")}
      >
        <Text style={styles.buttonText}>Создать Предмет</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutButtonText}>Выйти</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#659DBD",
    marginBottom: 20,
  },
  profileContainer: {
    padding: 10,
    backgroundColor: "#f9f9f9",
    borderRadius: 8,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#eee",
  },
  profileTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
  },
  profileInfo: {
    fontSize: 16,
    marginVertical: 5,
    color: "#555",
  },
  button: {
    backgroundColor: "#659DBD",
    paddingVertical: 10,
    borderRadius: 5,
    marginVertical: 10,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 15,
  },
  logoutButton: {
    backgroundColor: "#ff4d4d",
    paddingVertical: 10,
    borderRadius: 5,
    alignItems: "center",
    marginTop: 30,
  },
  logoutButtonText: {
    color: "#fff",
    fontSize: 16,
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
