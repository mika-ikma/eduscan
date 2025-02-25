import React, { useState, useEffect, useCallback } from "react";
import { 
  View, Text, FlatList, TouchableOpacity, Alert, ActivityIndicator, StyleSheet, Platform 
} from "react-native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { BASE_API_URL } from "../../config.json";
import { useNavigation, useRoute, useFocusEffect } from "@react-navigation/native";
import DateTimePicker from "@react-native-community/datetimepicker";

const SubjectLessons = () => {
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  const navigation = useNavigation();
  const route = useRoute();
  const { subjectId } = route.params;

  useEffect(() => {
    fetchLessons();
  }, [subjectId]);

  useFocusEffect(
    useCallback(() => {
      fetchLessons();
    }, [])
  );

  const fetchLessons = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        Alert.alert("Ошибка", "Не найден токен авторизации");
        return;
      }

      const response = await axios.get(`${BASE_API_URL}/subjects/${subjectId}/lessons/`, {
        headers: { Authorization: `Token ${token}` },
      });

      setLessons(response.data.lessons || []);
    } catch (error) {
      console.error("Ошибка при загрузке занятий:", error);
      Alert.alert("Ошибка", "Не удалось загрузить занятия для предмета");
    } finally {
      setLoading(false);
    }
  };

  const rescheduleLesson = async (lessonId, newDate) => {
    try {
      const token = await AsyncStorage.getItem("token");
      const response = await axios.post(
        `${BASE_API_URL}/reschedule_lesson/${lessonId}/`,
        { new_date: newDate.toISOString().split("T")[0] },
        { headers: { Authorization: `Token ${token}` } }
      );

      Alert.alert("Успех", response.data.message);
      fetchLessons();
    } catch (error) {
      console.error("Ошибка переноса:", error);
      Alert.alert("Ошибка", "Не удалось перенести урок.");
    }
  };

  const onDateChange = (event, date) => {
    setShowDatePicker(false);
    if (date) {
      setSelectedDate(date);
      rescheduleLesson(selectedLesson, date);
    }
  };

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color="#659DBD" />
      ) : (
        <FlatList
          data={lessons}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View style={styles.lessonItem}>
              <Text style={styles.lessonText}>📅 Дата: {item.date}</Text>
              <TouchableOpacity
                onPress={() => {
                  setSelectedLesson(item.id);
                  setShowDatePicker(true);
                }}
                style={styles.rescheduleButton}
              >
                <Text style={styles.rescheduleButtonText}>Перенести</Text>
              </TouchableOpacity>
            </View>
          )}
        />
      )}

      {showDatePicker && (
        <DateTimePicker
          value={selectedDate}
          mode="date"
          display={Platform.OS === 'ios' ? 'inline' : 'default'}
          onChange={onDateChange}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: "#F5F5F5", 
    padding: 20 
  },
  lessonItem: {
    padding: 15,
    backgroundColor: "#FFFFFF",
    marginVertical: 8,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3, 
  },
  lessonText: {
    fontSize: 16,
    color: "#333",
    marginBottom: 3,
  },
  rescheduleButton: {
    backgroundColor: "#D3D3D3",
    paddingVertical: 6, 
    paddingHorizontal: 12, 
    marginTop: 6, 
    borderRadius: 4, 
    alignItems: "center",
  },
  rescheduleButtonText: {
    color: "#333", 
    fontWeight: "600", 
    fontSize: 14, 
  },
});

export default SubjectLessons;
