import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ActivityIndicator, Alert } from "react-native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { BASE_API_URL } from "../../config.json";

const Profile = () => {
  const [user, setUser] = useState(null); 
  const [loading, setLoading] = useState(true); 

  const fetchUserData = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      console.log("Токен, полученный из AsyncStorage:", token);
      
      if (!token) {
        Alert.alert("Ошибка", "Authorization token not found.");
        navigation.replace("Login"); 
        return;
      }

      axios.defaults.headers.common["Authorization"] = `Token ${token}`;
      console.log("Установленный заголовок Authorization:", axios.defaults.headers.common["Authorization"]);

      const response = await axios.get(`${BASE_API_URL}/profile/`, {
        headers: { Authorization: `Token ${token}` },
      });

      console.log("Ответ профиля пользователя:", response.data);

      setUser(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Ошибка получения данных пользователя:", error.response?.data || error.message);
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
