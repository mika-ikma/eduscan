import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Image,
  Alert,
} from "react-native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { BASE_API_URL } from "../../config.json";

const SubjectStudents = ({ route }) => {
  const { subjectId, subjectTitle } = route.params; // Получаем ID и название предмета
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  // Запрос на получение студентов
  const fetchStudents = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      const response = await axios.get(
        `${BASE_API_URL}/subjects/${subjectId}/students/`,
        {
          headers: { Authorization: `Token ${token}` },
        }
      );
      setStudents(response.data.students);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching students:", error);
      Alert.alert("Ошибка", "Не удалось загрузить список студентов.");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  if (loading) {
    return <ActivityIndicator size="large" color="#0000ff" />;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Студенты для: {subjectTitle}</Text>
      <FlatList
        data={students}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.studentItem}>
            <Text style={styles.studentName}>{item.username}</Text>
            <Text>
              Посещение: {item.attended ? "Да" : "Нет"}
              {item.attendance_time && ` (${item.attendance_time})`}
            </Text>
            {item.photo && (
              <Image
                source={{ uri: item.photo }}
                style={styles.photo}
              />
            )}
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 20 },
  studentItem: {
    marginBottom: 10,
    padding: 15,
    backgroundColor: "#659DBD",
    borderRadius: 8,
  },
  studentName: { fontSize: 18, fontWeight: "bold" },
  photo: { width: 50, height: 50, borderRadius: 25, marginTop: 10 },
});

export default SubjectStudents;
