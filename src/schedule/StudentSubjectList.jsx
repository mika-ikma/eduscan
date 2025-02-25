import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASE_API_URL } from "../../config.json";
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { MaterialIcons } from "@expo/vector-icons";
import { Camera } from 'expo-camera';


const StudentSubjectList = () => {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigation = useNavigation();

  // Функция запроса разрешений и перехода на QR-сканер
  const requestCameraPermission = async () => {
    const { status } = await Camera.requestCameraPermissionsAsync();
    if (status === 'granted') {
      navigation.navigate("QRScanner"); // Переход на экран сканирования
    } else {
      Alert.alert("Ошибка", "Для сканирования QR-кода требуется доступ к камере.");
    }
  };

  // Запрос списка предметов
  const fetchSubjects = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) throw new Error("Не найден токен авторизации");

      const response = await axios.get(`${BASE_API_URL}/student/subjects/`, {
        headers: { Authorization: `Token ${token}` },
      });

      setSubjects(response.data);
    } catch (err) {
      setError(err.response ? `Ошибка ${err.response.status}: ${err.response.data.detail || "Неизвестная ошибка"}` : "Ошибка сети");
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchSubjects();
    }, [])
  );

  // Функция отписки от предмета
  const handleUnenroll = async (subjectId) => {
    Alert.alert(
      "Подтверждение",
      "Вы уверены, что хотите отписаться от курса?",
      [
        { text: "Отмена", style: "cancel" },
        {
          text: "Отписаться",
          onPress: async () => {
            try {
              const token = await AsyncStorage.getItem("token");
              await axios.delete(`${BASE_API_URL}/student/subjects/${subjectId}/unenroll/`, {
                headers: { Authorization: `Token ${token}` },
              });

              Alert.alert("Успех", "Вы успешно отписались от курса.");
              fetchSubjects();
            } catch (err) {
              Alert.alert("Ошибка", err.response?.data?.detail || "Не удалось отписаться.");
            }
          },
          style: "destructive",
        },
      ]
    );
  };

  // Отображение списка предметов
  const renderItem = ({ item }) => (
    <View style={styles.subjectContainer}>
      <TouchableOpacity onPress={() => navigation.navigate('StudentSubjectLessons', { subjectId: item.id })} style={styles.subjectInfo}>
        <Text style={styles.subjectTitle}>{item.title}</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.unenrollButton} onPress={() => handleUnenroll(item.id)}>
        <Text style={styles.unenrollButtonText}>Отписаться</Text>
      </TouchableOpacity>
    </View>
  );

  // Если идет загрузка
  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#4A90E2" />
        <Text style={styles.loadingText}>Загрузка...</Text>
      </View>
    );
  }

  // Если ошибка загрузки
  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  // Если предметов нет
  if (!loading && subjects.length === 0) {
    return (
      <View style={styles.centered}>
        <Text style={styles.noSubjectsText}>
          😔 У вас пока нет курсов.{"\n"}
          Вы не записаны ни в одну группу. Запишитесь в группу.
        </Text>
        <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Группы')}>
          <Text style={styles.buttonText}>Перейти к группам</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>📚 Ваши курсы</Text>

      <FlatList
        data={subjects}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
      />

      {/* Кнопка сканирования QR-кода */}
      <TouchableOpacity style={styles.scanButton} onPress={requestCameraPermission}>
        <MaterialIcons name="qr-code-scanner" size={30} color="white" />
        <Text style={styles.scanButtonText}>Сканировать QR</Text>
      </TouchableOpacity>
    </View>
  );
};

// ✅ **Стили**
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F7FA",
    padding: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    textAlign: 'center',
    color: "#333",
    marginBottom: 20,
  },
  subjectContainer: {
    backgroundColor: "white",
    padding: 15,
    marginVertical: 8,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  subjectInfo: {
    flex: 1,
  },
  subjectTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: "#4A90E2",
  },
  unenrollButton: {
    backgroundColor: "red",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  unenrollButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "bold",
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: "#4A90E2",
    marginTop: 10,
  },
  errorText: {
    fontSize: 16,
    color: "red",
    textAlign: "center",
  },
  noSubjectsText: {
    fontSize: 18,
    color: "#666",
    textAlign: "center",
    marginTop: 20,
  },
  scanButton: {
    backgroundColor: "#007AFF",
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
    alignSelf: "center",
  },
  scanButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 10,
  },
});

export default StudentSubjectList;
