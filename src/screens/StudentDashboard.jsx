import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Image,
} from "react-native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { BASE_API_URL } from "../../config.json";

const AllSubjectsScreen = ({ navigation }) => {
  const [subjects, setSubjects] = useState([]); 
  const [mySubjects, setMySubjects] = useState([]); 
  const [user, setUser] = useState(null); 
  const [loading, setLoading] = useState(true); 
  const [viewMySubjects, setViewMySubjects] = useState(false); 

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

  const fetchSubjects = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        Alert.alert("Ошибка", "Authorization token not found.");
        return;
      }

      const response = await axios.get(`${BASE_API_URL}/subjects/`, {
        headers: { Authorization: `Token ${token}` },
      });

      setSubjects(response.data.filter((subject) => !subject.is_enrolled)); 
      setMySubjects(response.data.filter((subject) => subject.is_enrolled)); 
    } catch (error) {
      console.error("Ошибка загрузки занятий:", error);
      Alert.alert("Ошибка", "Не удалось загрузить занятия.");
    }
  };

  const enrollSubject = async (subjectId) => {
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        Alert.alert("Ошибка", "Authorization token not found.");
        return;
      }

      const response = await axios.post(
        `${BASE_API_URL}/subjects/${subjectId}/enroll/`,
        {},
        { headers: { Authorization: `Token ${token}` } },
      );

      if (response.status === 201) {
        Alert.alert("Успех", "Вы успешно записались на занятие.");
        fetchSubjects(); 
      }
    } catch (error) {
      console.error("Ошибка записи на занятие:", error);
      Alert.alert("Ошибка", "Не удалось записаться на занятие.");
    }
  };

  const unenrollSubject = async (subjectId) => {
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        Alert.alert("Ошибка", "Authorization token not found.");
        return;
      }

      const response = await axios.delete(
        `${BASE_API_URL}/subjects/${subjectId}/unenroll/`,
        { headers: { Authorization: `Token ${token}` } },
      );

      if (response.status === 200) {
        Alert.alert("Успех", "Вы успешно отписались от занятия.");
        fetchSubjects(); 
      }
    } catch (error) {
      console.error("Ошибка отписки от занятия:", error);
      Alert.alert("Ошибка", "Не удалось отписаться от занятия.");
    }
  };

  useEffect(() => {
    fetchUserData();
    fetchSubjects();
  }, []);

  if (loading) {
    return <ActivityIndicator size="large" color="#659DBD" />;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        {/* QR button and logout */}
        <TouchableOpacity
          onPress={() => navigation.navigate("QRScanner")}
          style={styles.qrButton}
        >
          <Image
            source={require("../../assets/qr_icon.png")}
            style={styles.qrImage}
          />
        </TouchableOpacity>

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

      <TouchableOpacity
        style={styles.toggleButton}
        onPress={() => setViewMySubjects(!viewMySubjects)}
      >
        <Text style={styles.toggleButtonText}>
          {viewMySubjects ? "Посмотреть все занятия" : "Мои занятия"}
        </Text>
      </TouchableOpacity>

      {viewMySubjects ? (
        <>
          <Text style={styles.title}>Мои занятия</Text>
          <FlatList
            data={mySubjects}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <View style={styles.subjectItem}>
                <Text style={styles.subjectTitle}>{item.title}</Text>
                <Text>{`Дата: ${item.date}`}</Text>
                <Text>{`Время: ${item.time}`}</Text>
                <TouchableOpacity
                  style={styles.button}
                  onPress={() => unenrollSubject(item.id)}
                >
                  <Text style={styles.buttonText}>Отписаться</Text>
                </TouchableOpacity>
              </View>
            )}
          />
        </>
      ) : (
        <>
          <Text style={styles.title}>Все занятия</Text>
          <FlatList
            data={subjects}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <View style={styles.subjectItem}>
                <Text style={styles.subjectTitle}>{item.title}</Text>
                <Text>{`Дата: ${item.date}`}</Text>
                <Text>{`Время: ${item.time}`}</Text>
                <TouchableOpacity
                  style={styles.button}
                  onPress={() => enrollSubject(item.id)}
                >
                  <Text style={styles.buttonText}>Записаться</Text>
                </TouchableOpacity>
              </View>
            )}
          />
        </>
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
    justifyContent: "space-between",
    marginBottom: 20,
  },
  qrButton: {
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 50,
    width: 50,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#659DBD",
  },
  qrImage: {
    width: 25,
    height: 25,
  },
  logoutButton: {
    backgroundColor: "#659DBD",
    paddingVertical: 5, // Reduced vertical padding
    paddingHorizontal: 10, // Adjusted horizontal padding for smaller width
    borderRadius: 5,
  },
  logoutButtonText: {
    color: "#fff",
    fontSize: 14, // Reduced font size for a more compact appearance
  },
  
  userInfoContainer: {
    marginBottom: 20,
    backgroundColor: "#F9F9F9", // Светлый фон
    borderRadius: 10, // Закругленные углы
    padding: 20,
    shadowColor: "#000", // Тень для эффекта карточки
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5, // Для Android
  },
  userInfoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  userInfoLabel: {
    color: "#659DBD", // Цвет акцента
    fontSize: 16,
    fontWeight: "bold",
    marginRight: 10, // Расстояние между лейблом и значением
  },
  userInfoText: {
    fontSize: 16,
    color: "#333", // Темный текст для контраста
  },
  userInfoIcon: {
    width: 20,
    height: 20,
    marginRight: 10,
  },
  
  toggleButton: {
    backgroundColor: "#659DBD",
    paddingVertical: 12,
    borderRadius: 5,
    marginBottom: 20,
    alignItems: "center",
  },
  toggleButtonText: {
    color: "#fff",
    fontSize: 18,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#659DBD",
    marginBottom: 20,
  },
  subjectItem: {
    padding: 15,
    borderRadius: 8,
    backgroundColor: "#f9f9f9",
    marginVertical: 8,
    borderWidth: 1,
    borderColor: "#eee",
  },
  subjectTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
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
    fontSize: 16,
  },
});

export default AllSubjectsScreen;
