import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASE_API_URL } from "../../config.json";

const StudentSubjectLessons = ({ route, navigation }) => {
  const { subjectId } = route.params;
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLessons = async () => {
      try {
        const token = await AsyncStorage.getItem("token");
        const response = await axios.get(`${BASE_API_URL}/lessons/`, {
          params: { subject_id: subjectId },
          headers: { Authorization: `Token ${token}` },
        });

        setLessons(response.data.lessons);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchLessons();
  }, [subjectId]);

  const renderItem = ({ item }) => (
    <View style={styles.lessonContainer}>
      <Text style={styles.lessonTitle}>{item.subject_name}</Text>
      <Text style={styles.lessonText}>📌 Группа: {item.group_name}</Text>
      <Text style={styles.lessonText}>📅 Дата: {item.date}</Text>
      <Text style={styles.lessonText}>⏰ Время: {item.time}</Text>
      <Text style={styles.lessonText}>👨‍🏫 Преподаватель: {item.teacher_name}</Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#4A90E2" />
        <Text style={styles.loadingText}>Загрузка...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Ошибка: {error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Text style={styles.backButtonText}>← Назад</Text>
      </TouchableOpacity>

      <Text style={styles.title}>📚 Занятия текущего курса</Text>

      {lessons.length === 0 ? (
        <Text style={styles.noLessons}>Нет занятий</Text>
      ) : (
        <FlatList
          data={lessons}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F7FA",
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    color: "#333",
    marginBottom: 20,
  },
  lessonContainer: {
    backgroundColor: "white",
    padding: 15,
    marginVertical: 8,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  lessonTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#4A90E2",
    marginBottom: 5,
    textAlign: "center",
  },
  lessonText: {
    fontSize: 14,
    color: "#555",
    marginBottom: 3,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
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
  noLessons: {
    textAlign: "center",
    fontSize: 16,
    color: "gray",
    marginTop: 20,
  },
  backButton: {
    backgroundColor: "#4A90E2",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    alignSelf: "flex-start",
  },
  backButtonText: {
    color: "white",
    fontSize: 16,
  },
});

export default StudentSubjectLessons;
