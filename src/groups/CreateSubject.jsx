import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import DropDownPicker from "react-native-dropdown-picker";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { BASE_API_URL } from "../../config.json";

const CreateSubject = ({ route, navigation }) => {
  const { groupId } = route.params;
  const [subjectTitle, setSubjectTitle] = useState("");
  const [subjectStartTime, setSubjectStartTime] = useState("");
  const [subjectEndTime, setSubjectEndTime] = useState("");
  const [subjectStartDate, setSubjectStartDate] = useState("");
  const [subjectEndDate, setSubjectEndDate] = useState("");
  const [loading, setLoading] = useState(false);

  // Стейт для выпадающего списка дней недели
  const [selectedDays, setSelectedDays] = useState([]);
  const [openDays, setOpenDays] = useState(false);

  const daysOfWeekOptions = [
    { label: "Понедельник", value: 1 },
    { label: "Вторник", value: 2 },
    { label: "Среда", value: 3 },
    { label: "Четверг", value: 4 },
    { label: "Пятница", value: 5 },
    { label: "Суббота", value: 6 },
    { label: "Воскресенье", value: 7 },
  ];

  const handleCreateSubject = async () => {
    // Проверка на пустые поля
    if (!subjectTitle.trim()) {
      Alert.alert("Ошибка", "Введите название предмета.");
      return;
    }
  
    if (!subjectStartTime || !subjectEndTime) {
      Alert.alert("Ошибка", "Введите время начала и окончания.");
      return;
    }
  
    if (!subjectStartDate || !subjectEndDate) {
      Alert.alert("Ошибка", "Введите дату начала и дату окончания.");
      return;
    }
  
    if (selectedDays.length === 0) {
      Alert.alert("Ошибка", "Выберите хотя бы один день недели.");
      return;
    }
  
    // Проверка формата времени (HH:MM)
    const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
  
    if (!timeRegex.test(subjectStartTime) || !timeRegex.test(subjectEndTime)) {
      Alert.alert("Ошибка", "Время должно быть в формате HH:MM (например, 09:30).");
      return;
    }
  
    // Проверка, чтобы время начала было раньше времени окончания
    const startTime = subjectStartTime.split(":").map(Number);
    const endTime = subjectEndTime.split(":").map(Number);
  
    if (
      startTime[0] > endTime[0] || 
      (startTime[0] === endTime[0] && startTime[1] >= endTime[1])
    ) {
      Alert.alert("Ошибка", "Время начала должно быть раньше времени окончания.");
      return;
    }
  
    // Проверка дат
    const startDateObj = new Date(subjectStartDate);
    const endDateObj = new Date(subjectEndDate);
  
    if (isNaN(startDateObj) || isNaN(endDateObj)) {
      Alert.alert("Ошибка", "Дата введена в неверном формате (YYYY-MM-DD).");
      return;
    }
  
    if (startDateObj > endDateObj) {
      Alert.alert("Ошибка", "Дата начала должна быть раньше даты окончания.");
      return;
    }
  
    // Если все проверки пройдены, включаем загрузку
    setLoading(true);
  
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        Alert.alert("Ошибка", "Не найден токен авторизации");
        return;
      }
  
      const formattedStartTime = `${subjectStartTime}:00`;
      const formattedEndTime = `${subjectEndTime}:00`;
  
      const response = await axios.post(
        `${BASE_API_URL}/teacher/subjects/create/`,
        {
          title: subjectTitle.trim(),
          start_time: formattedStartTime,
          end_time: formattedEndTime,
          days_of_week: selectedDays,
          start_date: subjectStartDate,
          end_date: subjectEndDate,
          group: groupId,
        },
        {
          headers: {
            Authorization: `Token ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
  
      if (response.status === 201) {
        Alert.alert("Успех", "Предмет и уроки успешно созданы");
        navigation.goBack();
      } else {
        Alert.alert("Ошибка", "Не удалось создать предмет");
      }
    } catch (error) {
      console.error("Ошибка при создании предмета:", error.response?.data || error.message);
      Alert.alert("Ошибка", `Ошибка сервера: ${JSON.stringify(error.response?.data)}`);
    } finally {
      setLoading(false);
    }
  };
  
  

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS == "ios" ? "padding": "height"}
      style={styles.container}
      >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.container}>
          <Text style={styles.title}>Создать предмет</Text>

          <TextInput
            style={styles.input}
            placeholder="Введите название предмета"
            value={subjectTitle}
            onChangeText={setSubjectTitle}
          />
          <TextInput
            style={styles.input}
            placeholder="Время начала (HH:MM)"
            value={subjectStartTime}
            onChangeText={setSubjectStartTime}
          />
          <TextInput
            style={styles.input}
            placeholder="Время окончания (HH:MM)"
            value={subjectEndTime}
            onChangeText={setSubjectEndTime}
          />

          {/* Выпадающий список для дней недели */}
          <View style={styles.dropdownWrapper}>
            <Text style={styles.label}>Выберите дни недели:</Text>
            <DropDownPicker
              open={openDays}
              value={selectedDays}
              items={daysOfWeekOptions}
              setOpen={setOpenDays}
              setValue={setSelectedDays}
              multiple={true} // Множественный выбор
              mode="BADGE" // Показывает выбранные значения в виде бейджей
              placeholder="Выберите дни"
              style={styles.dropdown}
              dropDownContainerStyle={styles.dropdownContainer}
            />
          </View>

          <TextInput
            style={styles.input}
            placeholder="Дата начала (YYYY-MM-DD)"
            value={subjectStartDate}
            onChangeText={setSubjectStartDate}
          />
          <TextInput
            style={styles.input}
            placeholder="Дата окончания (YYYY-MM-DD)"
            value={subjectEndDate}
            onChangeText={setSubjectEndDate}
          />

          {loading ? (
            <ActivityIndicator size="large" color="#659DBD" />
          ) : (
            <Button title="Создать предмет" onPress={handleCreateSubject} />
          )}
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
    justifyContent: "center",
  },
  title: {
    fontSize: 24,
    color: "#659DBD",
    marginBottom: 20,
    textAlign: "center",
  },
  input: {
    height: 40,
    borderColor: "#659DBD",
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 20,
  },
  dropdownWrapper: {
    marginBottom: 15,
    zIndex: 1000, // Убедимся, что список отображается поверх других элементов
  },
  dropdown: {
    borderColor: "#659DBD",
    borderRadius: 8,
    backgroundColor: "#FFFFFF",
  },
  dropdownContainer: {
    borderColor: "#659DBD",
    backgroundColor: "#FFFFFF",
  },
  label: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 5,
  },
});

export default CreateSubject;
