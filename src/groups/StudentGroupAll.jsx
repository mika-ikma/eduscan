import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  Alert,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { BASE_API_URL } from "../../config.json";

const StudentGroupAll = () => {
  const [myGroups, setMyGroups] = useState([]);
  const [allGroups, setAllGroups] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showMyGroups, setShowMyGroups] = useState(true); // Переключатель между вкладками
  const navigation = useNavigation();

  // Функция загрузки данных
  const fetchGroups = async () => {
    setLoading(true);
    setError(null);

    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        Alert.alert("Ошибка", "Не найден токен авторизации");
        return;
      }

      const response = await axios.get(`${BASE_API_URL}/groups/`, {
        headers: { Authorization: `Token ${token}` },
      });

      if (response.status === 200) {
        const myGroupsData = response.data.my_groups;
        const allGroupsData = response.data.all_groups;

        // Получаем преподавателей для каждой группы
        const myGroupsWithTeachers = await fetchTeachersForGroups(myGroupsData, token);
        const allGroupsWithTeachers = await fetchTeachersForGroups(allGroupsData, token);

        setMyGroups(myGroupsWithTeachers);
        setAllGroups(allGroupsWithTeachers);
      } else {
        setError("Не удалось загрузить группы");
      }
    } catch (error) {
      console.error("Ошибка загрузки групп:", error.response || error.message);
      setError("Не удалось загрузить данные. Попробуйте позже.");
    } finally {
      setLoading(false);
    }
  };

  // Функция загрузки преподавателей по ID групп
  const fetchTeachersForGroups = async (groups, token) => {
    const updatedGroups = await Promise.all(
      groups.map(async (group) => {
        try {
          const response = await axios.get(`${BASE_API_URL}/group/${group.id}/`, {
            headers: { Authorization: `Token ${token}` },
          });

          if (response.status === 200 && response.data.subjects.length > 0) {
            return { ...group, teacher: response.data.subjects[0].teacher }; // Берем преподавателя первого предмета
          }
        } catch (error) {
          console.error(`Ошибка загрузки данных для группы ${group.id}:`, error.message);
        }
        return { ...group, teacher: "Неизвестен" }; // Если не удалось загрузить
      })
    );

    return updatedGroups;
  };

  // Автообновление данных при каждом входе на страницу
  useFocusEffect(
    useCallback(() => {
      fetchGroups();
    }, [])
  );

  const handleGroupPress = (groupId) => {
    navigation.navigate("GroupDetail", { groupId });
  };

  return (
    <View style={styles.container}>
      {/* Кнопки переключения между "Мои группы" и "Все группы" */}
      <View style={styles.toggleContainer}>
        <TouchableOpacity
          style={[styles.toggleButton, showMyGroups && styles.activeButton]}
          onPress={() => setShowMyGroups(true)}
        >
          <Text style={styles.toggleText}>Мои группы</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.toggleButton, !showMyGroups && styles.activeButton]}
          onPress={() => setShowMyGroups(false)}
        >
          <Text style={styles.toggleText}>Все группы</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#659DBD" />
      ) : error ? (
        <Text style={styles.error}>{error}</Text>
      ) : (
        <ScrollView>
          {(showMyGroups ? myGroups : allGroups).length > 0 ? (
            (showMyGroups ? myGroups : allGroups).map((group) => (
              <TouchableOpacity
                key={group.id}
                style={styles.groupContainer}
                onPress={() => handleGroupPress(group.id)}
              >
                <Text style={styles.groupName}>{group.title}</Text>
                <Text style={styles.teacherName}>
                  Преподаватель: {group.teacher ? group.teacher.toString() : "Неизвестен"}
                </Text>
              </TouchableOpacity>
            ))
          ) : (
            <Text style={styles.noGroupsText}>
              {showMyGroups
                ? "Вы пока не записаны в группы"
                : "Нет доступных групп"}
            </Text>
          )}
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#fff" },
  toggleContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 20,
  },
  toggleButton: {
    padding: 10,
    marginHorizontal: 5,
    borderWidth: 1,
    borderColor: "#444",
    borderRadius: 5,
  },
  activeButton: {
    borderWidth: 2,
    borderColor: "#000",
  },
  toggleText: {
    fontSize: 16,
    color: "#659DBD",
    fontWeight: "normal",
  },
  groupContainer: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
    backgroundColor: "#f9f9f9",
    marginBottom: 10,
    borderRadius: 5,
  },
  groupName: { fontSize: 18, fontWeight: "bold", color: "#333" },
  teacherName: { fontSize: 16, color: "#666", marginTop: 5 }, // ✅ Новый стиль для имени преподавателя
  error: { color: "red", textAlign: "center" },
  noGroupsText: { textAlign: "center", color: "#888", marginTop: 10 },
});

export default StudentGroupAll;
