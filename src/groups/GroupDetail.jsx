import React, { useEffect, useState } from "react";
import { 
  View, 
  Text, 
  ActivityIndicator, 
  StyleSheet, 
  Alert, 
  Button, 
  FlatList 
} from "react-native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import { BASE_API_URL } from "../../config.json";

const daysMap = {
  1: "Понедельник",
  2: "Вторник",
  3: "Среда",
  4: "Четверг",
  5: "Пятница",
  6: "Суббота",
  7: "Воскресенье",
  monday: "Понедельник",
  tuesday: "Вторник",
  wednesday: "Среда",
  thursday: "Четверг",
  friday: "Пятница",
  saturday: "Суббота",
  sunday: "Воскресенье",
};

const GroupDetail = ({ route }) => {
  const navigation = useNavigation();
  const { groupId } = route.params;
  const [groupData, setGroupData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Получаем роль пользователя
        const role = await AsyncStorage.getItem("role");
        console.log("User role:", role);
        setUserRole(role);
        
        // Получаем данные группы
        const token = await AsyncStorage.getItem("token");
        if (!token) {
          Alert.alert("Ошибка", "Не найден токен авторизации");
          return;
        }

        const response = await axios.get(`${BASE_API_URL}/group/${groupId}/`, {
          headers: { Authorization: `Token ${token}` },
        });

        if (response.status === 200) {
          setGroupData(response.data);
        } else {
          setError("Не удалось загрузить данные группы");
        }
      } catch (error) {
        console.error("Ошибка загрузки:", error.response || error.message);
        setError("Ошибка загрузки данных.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const enrollInSubject = async (subjectId) => {
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        Alert.alert("Ошибка", "Не найден токен авторизации");
        return;
      }

      const response = await axios.post(
        `${BASE_API_URL}/student/subjects/${subjectId}/enroll/`,
        {},
        { headers: { Authorization: `Token ${token}` } }
      );

      if (response.status === 201) {
        Alert.alert("Успех", "Вы успешно записались на занятие!", [
          {
            text: "OK",
            onPress: () => navigation.navigate("StudentGroupAll"),
          },
        ]);
      } else {
        Alert.alert("Ошибка", "Не удалось записаться на занятие.");
      }
    } catch (error) {
      Alert.alert("Ошибка", error.response?.data?.detail || "Не удалось записаться.");
    }
  };

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color="#659DBD" />
      ) : error ? (
        <Text style={styles.error}>{error}</Text>
      ) : (
        <View>
          <Text style={styles.title}>Группа: {groupData.group_name}</Text>

          {groupData.subjects.length > 0 ? (
            // Исправленная версия FlatList
            <FlatList
              data={groupData.subjects}
              keyExtractor={(item) => item.subject_id.toString()}
              renderItem={({ item }) => {
                const formattedDays = item.days_of_week
                  .map(day => {
                    const normalizedDay = typeof day === 'string' 
                      ? day.toLowerCase() 
                      : day;
                    return daysMap[normalizedDay] || "Неизвестный день";
                  })
                  .join(", ");

                return ( // Добавлен обязательный return
                  <View style={styles.subjectContainer}>
                    <Text style={styles.subjectText}>Занятие: {item.subject}</Text>
                    <Text style={styles.text}>Преподаватель: {item.teacher}</Text>
                    <Text style={styles.text}>Дни занятий: {formattedDays}</Text>
                    <Text style={styles.text}>Время занятия: {item.time}</Text>

                    {userRole === "student" && (
                      <Button 
                        title="Записаться" 
                        onPress={() => enrollInSubject(item.subject_id)} 
                        color="#659DBD" 
                      />
                    )}
                  </View>
                );
              }} // Фигурная скобка закрывает renderItem
            /> // Закрывающий тег FlatList
          ) : (
            <Text style={styles.noSubjects}>В этой группе пока нет предметов</Text>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#fff", justifyContent: "center" },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 10, color: "#659DBD" },
  subjectContainer: {
    backgroundColor: "#F5F5F5",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  subjectText: { fontSize: 20, fontWeight: "bold", color: "#333" },
  text: { fontSize: 16, marginBottom: 5 },
  noSubjects: { fontSize: 18, color: "#666", textAlign: "center", marginTop: 20 },
  error: { color: "red", textAlign: "center", marginTop: 20 },
});

export default GroupDetail;
