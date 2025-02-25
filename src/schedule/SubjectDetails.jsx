import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Modal, FlatList, Image, ActivityIndicator } from "react-native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { BASE_API_URL } from "../../config.json";
import { useNavigation } from "@react-navigation/native";

const SubjectDetails = ({ route }) => {
  const { subjectId, subjectTitle } = route.params;
  const [lessons, setLessons] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [qrCodeUri, setQrCodeUri] = useState(null);
  const [loadingQr, setLoadingQr] = useState(false);
  const navigation = useNavigation();
  
  // Загружаем список уроков
  useEffect(() => {
    const fetchLessons = async () => {
      try {
        const token = await AsyncStorage.getItem("token");
        const response = await axios.get(`${BASE_API_URL}/subjects/${subjectId}/lessons/`, {
          headers: { Authorization: `Token ${token}` },
        });
  
        console.log("📚 Загруженные уроки:", response.data);
        const filteredLessons = (response.data.lessons || []).filter(lesson => lesson.qr_code === null);
        setLessons(filteredLessons);
      } catch (error) {
        console.error("Ошибка загрузки уроков:", error);
      }
    };
  
    fetchLessons();
  }, [subjectId]);
  

  // Функция для получения QR-кода
  const fetchQrCode = async (lessonId) => {
    try {
      setLoadingQr(true);
      const token = await AsyncStorage.getItem("token");

      const response = await axios.get(`${BASE_API_URL}/subjects/attendance/qr/${lessonId}/`, {
        headers: { Authorization: `Token ${token}` },
        responseType: "blob",
      });

      const reader = new FileReader();
      reader.onloadend = () => {
        setQrCodeUri(reader.result);
        console.log("📸 QR-код обновлен:", reader.result);
      };
      reader.readAsDataURL(response.data);
    } catch (error) {
      console.error("Ошибка загрузки QR-кода:", error);
    } finally {
      setLoadingQr(false);
    }
  };

  // Обновление QR-кода каждые 10 секунд
  useEffect(() => {
    if (selectedLesson) {
      fetchQrCode(selectedLesson.id); // Запрашиваем QR при выборе урока
      const interval = setInterval(() => fetchQrCode(selectedLesson.id), 10000);
      return () => clearInterval(interval); // Чистим интервал при изменении selectedLesson
    }
  }, [selectedLesson]);

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Назад</Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.header}>{subjectTitle}</Text>

      {/* Кнопка открытия модального окна для выбора урока */}
      <TouchableOpacity style={styles.button} onPress={() => setModalVisible(true)}>
        <Text style={styles.buttonText}>Сгенерировать QR</Text>
      </TouchableOpacity>

      {/* Модальное окно выбора урока */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Выберите урок</Text>
            {lessons.length > 0 ? (
              <FlatList
                data={lessons}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.lessonItem}
                    onPress={() => {
                      setSelectedLesson(item);
                      setModalVisible(false);
                    }}
                  >
                    <Text style={styles.lessonText}>{`${item.date} - ${item.time}`}</Text>
                  </TouchableOpacity>
                )}
              />
            ) : (
              <Text style={styles.noLessonsText}>Нет доступных уроков</Text>
            )}
            <TouchableOpacity style={styles.closeButton} onPress={() => setModalVisible(false)}>
              <Text style={styles.closeButtonText}>Закрыть</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Отображение QR-кода после выбора урока */}
      {selectedLesson && (
        <View style={styles.qrContainer}>
          <Text style={styles.qrText}>QR-код для урока {selectedLesson.date}:</Text>
          {loadingQr ? (
            <ActivityIndicator size="large" color="#007AFF" />
          ) : qrCodeUri ? (
            <Image source={{ uri: qrCodeUri }} style={styles.qrImage} />
          ) : (
            <Text style={styles.qrErrorText}>❌ QR-код не найден</Text>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
    alignItems: "center",
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  backButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: "#007AFF",
    borderRadius: 6,
    marginLeft: -150,
  },
  backButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#007AFF",
  },
  button: {
    backgroundColor: "#007AFF",
    padding: 10,
    borderRadius: 8,
    marginBottom: 20,
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    width: "90%",
    maxHeight: "80%",
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 15,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
  },
  lessonItem: {
    padding: 15,
    marginVertical: 5,
    borderRadius: 8,
    backgroundColor: "#f9f9f9",
    width: "100%",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  lessonText: {
    fontSize: 18,
  },
  closeButton: {
    backgroundColor: "#d9534f",
    paddingVertical: 12,
    paddingHorizontal: 30,
    marginTop: 15,
    borderRadius: 10,
    alignSelf: "center",
  },
  closeButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  qrContainer: {
    marginTop: 20,
    alignItems: "center",
  },
  qrImage: {
    width: 200,
    height: 200,
    marginTop: 20,
  },
  qrErrorText: {
    fontSize: 16,
    color: "red",
    marginTop: 10,
  },
});

export default SubjectDetails;
