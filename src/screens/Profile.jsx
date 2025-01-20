import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ActivityIndicator, Alert } from "react-native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { BASE_API_URL } from "../../config.json";

const Profile = () => {
  const [user, setUser] = useState(null); // Храним данные пользователя
  const [loading, setLoading] = useState(true); // Флаг загрузки

  const fetchUserData = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        Alert.alert("Ошибка", "Authorization token not found.");
        navigation.replace("Login"); // Navigate to login screen if token is missing
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
    return <ActivityIndicator size="large" color="#0000ff" />;
  }
  if (user) {
    return (
      <View style={styles.profileContainer}>
        <Text style={styles.profileTitle}>Профиль пользователя</Text>
        <View style={styles.profileInfoContainer}>
          <Text style={styles.profileInfo}>Имя: {user.username}</Text>
          <Text style={styles.profileInfo}>Email: {user.email}</Text>
          <Text style={styles.profileInfo}>Роль: {user.role}</Text>
          {user.photo && (
            <View style={styles.profileInfo}>
              <Text>Фото:</Text>
              <Image source={{ uri: user.photo }} style={styles.photo} />
            </View>
          )}
        </View>
      </View>
    );
  }

  return null;
};

const styles = StyleSheet.create({
  profileContainer: {
    padding: 20,
    backgroundColor: "#f4f4f4",
    borderRadius: 8,
    marginBottom: 20,
  },
  profileTitle: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 10,
  },
  profileInfoContainer: {
    marginTop: 10,
  },
  profileInfo: {
    fontSize: 16,
    marginVertical: 5,
  },
});

export default Profile;
