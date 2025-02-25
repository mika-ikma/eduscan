import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { BASE_API_URL } from "../../config.json";

const AllSubjectsScreen = ({ navigation }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

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
      { cancelable: true },
    );
  };

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
      console.error("Ошибка получения данных пользователя:", error);
      Alert.alert("Ошибка", "Не удалось загрузить данные пользователя.");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  if (loading) {
    return <ActivityIndicator size="large" color="#659DBD" />;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        {/* Logout button */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>Выйти</Text>
        </TouchableOpacity>
      </View>

      {user && (
        <View style={styles.userInfoContainer}>
          <Text style={styles.userInfo}>Имя: {user.username}</Text>
          <Text style={styles.userInfo}>Email: {user.email}</Text>
          <Text style={styles.userInfo}>Роль: {user.role}</Text>
        </View>
      )}
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

  userInfoContainer: {
    marginBottom: 20,
    backgroundColor: "#F9F9F9",
    borderRadius: 10,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },

  userInfo: {
    fontSize: 16,
    color: "#333",
  },

  toggleButton: {
    backgroundColor: "#659DBD",
    paddingVertical: 12,
    borderRadius: 5,
    marginTop: 20,
    alignItems: "center",
  },

  toggleButtonText: {
    color: "#fff",
    fontSize: 18,
  },
});

export default AllSubjectsScreen;
