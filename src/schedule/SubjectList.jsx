import React, { useState, useEffect, useCallback } from "react";
import { 
  View, Text, FlatList, TouchableOpacity, Alert, TextInput, StyleSheet 
} from "react-native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { MaterialIcons } from "@expo/vector-icons";
import { BASE_API_URL } from "../../config.json";
import { useNavigation, useFocusEffect } from "@react-navigation/native";

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

const SubjectsList = () => {
  const [subjects, setSubjects] = useState([]);
  const [editingSubject, setEditingSubject] = useState(null);
  const [newTitle, setNewTitle] = useState("");
  const navigation = useNavigation();
  const [groups, setGroups] = useState({});

  useFocusEffect(
    useCallback(() => {
      fetchSubjects();
    }, [])
  );

  const fetchSubjects = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      const groupsResponse = await axios.get(`${BASE_API_URL}/groups/`, {
        headers: { Authorization: `Token ${token}` },
      });
      const groupsMap = {};
      groupsResponse.data.forEach(group => {
        groupsMap[group.id] = group.title;
      });
      setGroups(groupsMap);

      const response = await axios.get(`${BASE_API_URL}/teacher/subjects/`, {
        headers: { Authorization: `Token ${token}` },
      });

      setSubjects(response.data || []);
    } catch (error) {
      console.error("Ошибка загрузки предметов:", error);
    }
  };

  const handleEditSubject = (subject) => {
    setEditingSubject(subject.id);
    setNewTitle(subject.title);
  };

  const updateSubject = async (subjectId, updatedData) => {
    if (!subjectId) {
      console.error("Ошибка: subjectId не указан!");
      return;
    }
    try {
      const token = await AsyncStorage.getItem("token");
      await axios.patch(`${BASE_API_URL}/teacher/update_subject/${subjectId}/`, updatedData, {
        headers: { Authorization: `Token ${token}` },
      });

      fetchSubjects();
      setEditingSubject(null);
    } catch (error) {
      console.error("Ошибка при обновлении предмета:", error);
      Alert.alert("Ошибка", "Не удалось обновить предмет");
    }
  };

  const handleDeleteSubject = async (subjectId) => {
    Alert.alert(
      "Подтверждение удаления",
      "Вы уверены, что хотите удалить этот предмет?",
      [
        { text: "Отмена", style: "cancel" },
        {
          text: "Удалить",
          onPress: async () => {
            try {
              const token = await AsyncStorage.getItem("token");
              await axios.delete(`${BASE_API_URL}/teacher/delete_subject/${subjectId}/`, {
                headers: { Authorization: `Token ${token}` },
              });
              fetchSubjects();
            } catch (error) {
              Alert.alert("Ошибка", "Не удалось удалить предмет");
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Ваши курсы</Text>

      <FlatList
        data={subjects}
        keyExtractor={(item) => item?.id?.toString() || Math.random().toString()}
        renderItem={({ item }) => {
          const formattedDays = item.days_of_week
            .map(day => daysMap[day] || "Неизвестный день")
            .join(", ");

          return (
            <View style={styles.subjectContainer}>
              {editingSubject === item.id ? (
                <TextInput
                  style={styles.editInput}
                  value={newTitle}
                  onChangeText={setNewTitle}
                  autoFocus
                  onSubmitEditing={() => updateSubject(item.id, { title: newTitle })}
                />
              ) : (
                <TouchableOpacity
                  style={styles.subjectItem}
                  onPress={() =>
                    navigation.navigate("SubjectLessons", {
                      subjectId: item.id,
                      subjectTitle: item.title,
                    })
                  }
                >
                  <Text style={styles.subjectText}>{item.title}</Text>
                  <Text style={styles.groupText}>
                    Группа: {groups[item.group] ? groups[item.group] : "Неизвестная группа"} 
                  </Text>
                  <Text style={styles.daysText}>Дни недели: {formattedDays}</Text>
                </TouchableOpacity>
              )}

              <View style={styles.buttonsContainer}>
                <TouchableOpacity
                  style={styles.editButton}
                  onPress={() => {
                    if (editingSubject === item.id) {
                      updateSubject(item.id, { title: newTitle });
                    } else {
                      handleEditSubject(item);
                    }
                  }}
                >
                  <MaterialIcons name={editingSubject === item.id ? "check" : "edit"} size={24} color="#659DBD" />
                </TouchableOpacity>

                <TouchableOpacity style={styles.deleteButton} onPress={() => handleDeleteSubject(item.id)}>
                  <MaterialIcons name="delete" size={24} color="#ff4444" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.detailsButton}
                  onPress={() => navigation.navigate("SubjectDetails", { 
                    subjectId: item.id, 
                    subjectTitle: item.title 
                  })}
                >
                  <MaterialIcons name="qr-code-scanner" size={24} color="#000000" />
                </TouchableOpacity>
              </View>
            </View>
          );
        }}
      />

      <TouchableOpacity
        style={styles.floatingButton}
        onPress={() => navigation.navigate("SelectGroup")}
      >
        <MaterialIcons name="add" size={30} color="#fff" />
        <Text style={styles.floatingButtonText}>Добавить предмет</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#F5F5F5",
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
    color: "#007AFF",
  },
  subjectContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  subjectItem: {
    flex: 1,
    paddingVertical: 10,
  },
  subjectText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  editInput: {
    flex: 1,
    padding: 12,
    backgroundColor: "#fff",
    borderColor: "#007AFF",
    borderWidth: 1,
    borderRadius: 8,
    fontSize: 16,
  },
  buttonsContainer: {
    flexDirection: "row",
  },
  editButton: {
    padding: 8,
    backgroundColor: "#ffffff",
    borderRadius: 5,
    marginRight: 5,
  },
  deleteButton: {
    padding: 8,
    backgroundColor: "#ffffff",
    borderRadius: 5,
  },
  detailsButton: {
    padding: 8,
    backgroundColor: "#ffffff",
    borderRadius: 5,
  },

  /* СТИЛИ ДЛЯ КНОПКИ "ДОБАВИТЬ ПРЕДМЕТ" */
  floatingButton: {
    position: "absolute",
    bottom: 20,
    right: 20,
    backgroundColor: "#007AFF",
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 30,
    elevation: 5,
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  floatingButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    marginLeft: 10,
  },
  groupText: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
  },
  
});

export default SubjectsList;
