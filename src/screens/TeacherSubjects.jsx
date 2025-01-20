import React, { useState, useEffect } from "react"
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Alert,
  Modal,
  Image,
} from "react-native"
import axios from "axios"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { BASE_API_URL } from "../../config.json"
import { Buffer } from "buffer"
import { useNavigation } from '@react-navigation/native';


const TeacherSubjects = () => {
  const navigation = useNavigation()


  const [subjects, setSubjects] = useState([]) // State for subjects
  const [loading, setLoading] = useState(true) // Loading state
  const [qrCodeUrl, setQrCodeUrl] = useState(null) // State for QR code URL
  const [showModal, setShowModal] = useState(false) // Modal visibility
  const [selectedSubject, setSelectedSubject] = useState(null) // Selected subject for modal


  // Fetch subjects from API
  const fetchSubjects = async () => {
    try {
      const token = await AsyncStorage.getItem("token")
      const response = await axios.get(`${BASE_API_URL}/teacher/subjects/`, {
        headers: { Authorization: `Token ${token}` },
      })
      setSubjects(response.data)
      setLoading(false)
    } catch (error) {
      console.error("Error fetching subjects:", error)
      Alert.alert("Ошибка", "Не удалось загрузить список предметов.")
      setLoading(false)
    }
  }

  // Fetch QR code for attendance
  const fetchQRCode = async (subjectId, subject) => {
    try {
      const token = await AsyncStorage.getItem("token")
      const response = await fetch(
        `${BASE_API_URL}/subjects/attendance/qr/${subjectId}/`,
        {
          method: "GET",
          headers: { Authorization: `Token ${token}` },
        }
      )

      // Convert the response into a buffer and then to base64
      const buffer = await response.arrayBuffer()
      const b64 = Buffer.from(buffer).toString("base64")

      // Set the base64 image URL to the state
      const qrCodeUrl = `data:image/png;base64,${b64}`
      setQrCodeUrl(qrCodeUrl)
      setSelectedSubject(subject) // Set the selected subject for the modal
      setShowModal(true) // Show the modal with QR code
    } catch (error) {
      console.error("Error fetching QR code:", error)
      Alert.alert("Ошибка", "Не удалось сгенерировать QR код.")
    }
  }

  const deleteSubject = async (subjectId) => {
    const token = await AsyncStorage.getItem("token")
    try {
      const response = await fetch(
        `${BASE_API_URL}/subjects/${subjectId}/delete/`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Token ${token}`,
            "Content-Type": "application/json",
          },
        }
      )

      console.log(`response: ${response.message}`)

      if (!response.ok) {
        throw new Error("Failed to delete subject")
      }

      // Filter out the deleted subject from the subjects list
      setSubjects((prevSubjects) =>
        prevSubjects.filter((subject) => subject.id !== subjectId)
      )

      const data = await response.json()
      console.log("Subject deleted:", data)
    } catch (error) {
      if (error.message === "Network request failed") {
        setSubjects((prevSubjects) =>
          prevSubjects.filter((subject) => subject.id !== subjectId)
        )
      }
      // Ignore Network request failed errors
      if (error.message !== "Network request failed") {
        console.error("Error deleting subject:", error.message)
        Alert.alert("Ошибка", "Не удалось удалить предмет.")
      }
    }
  }

  // Handle delete confirmation
  const handleDeleteConfirmation = (subjectId) => {
    Alert.alert(
      "Удалить предмет?",
      "Вы уверены, что хотите удалить этот предмет?",
      [
        {
          text: "Отмена",
          style: "cancel",
        },
        {
          text: "Удалить",
          onPress: () => deleteSubject(subjectId),
          style: "destructive",
        },
      ]
    )
  }

  const fetchStudents = async (subjectId) => {
    console.log(`Fetching students for subjectId: ${subjectId}`);
    try {
      const token = await AsyncStorage.getItem("token");
      const response = await axios.get(`${BASE_API_URL}/api/subjects/${subjectId}/students/`, {
        headers: { Authorization: `Token ${token}` },
      });
      console.log('Students:', response.data);
    } catch (error) {
      console.error("Error fetching students:", error);
      Alert.alert("Ошибка", "Не удалось загрузить список студентов.");
    }
  };
  
  

  useEffect(() => {
    fetchSubjects()
  }, [])

  if (loading) {
    return <ActivityIndicator size="large" color="#0000ff" />
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Мои Предметы</Text>
      <FlatList
        data={subjects}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.subjectItem}>
            <Text style={styles.subjectTitle}>{item.title}</Text>
            <Text style={styles.subjectDetails}>
              Дата: {item.date}, Время: {item.time}
            </Text>
            <View style={styles.buttonContainer}>
              <Text
                style={styles.qrButton}
                onPress={() => fetchQRCode(item.id, item)} // Pass item as the subject
              >
                Генерировать QR
              </Text>
              <Text
                style={styles.deleteButton}
                onPress={() => handleDeleteConfirmation(item.id)} // Confirm delete
              >
                Удалить
              </Text>
              <Text
                style={styles.viewStudentsButton}
                onPress={() =>
                  navigation.navigate("SubjectStudents", {
                    subjectId: item.id,
                    subjectTitle: item.title,
                  })
                } // Переход на экран студентов
              >
                Просмотреть студентов
              </Text>
            </View>
          </View>
        )}
      />

      <Modal visible={showModal} animationType="slide">
        <View style={styles.modalContainer}>
          {selectedSubject && (
            <>
              <Text style={styles.modalTitle}>
                QR код для "{selectedSubject.title}"
              </Text>
              {qrCodeUrl && (
                <Image source={{ uri: qrCodeUrl }} style={styles.qrImage} />
              )}
            </>
          )}
          <Text style={styles.closeButton} onPress={() => setShowModal(false)}>
            Закрыть
          </Text>
        </View>
      </Modal>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 20 },
  subjectItem: {
    marginBottom: 10,
    padding: 15,
    backgroundColor: "#f8f9fa",
    borderRadius: 8,
  },
  subjectTitle: { fontSize: 18, fontWeight: "bold" },
  subjectDetails: { fontSize: 14, color: "#6c757d" },
  buttonContainer: { marginTop: 10 },
  qrButton: {
    backgroundColor: "#659DBD",
    color: "#fff",
    padding: 10,
    borderRadius: 5,
    textAlign: "center",
  },
  deleteButton: {
    backgroundColor: "#dc3545", // Red color for delete button
    color: "#fff",
    padding: 10,
    borderRadius: 5,
    textAlign: "center",
    marginTop: 10,
  },
  modalContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  modalTitle: { fontSize: 20, marginBottom: 20 },
  qrImage: { width: 200, height: 200, marginBottom: 20 },
  closeButton: { fontSize: 18, color: "#007bff" },

  viewStudentsButton: {
    backgroundColor: "#28a745",
    color: "#fff",
    padding: 10,
    borderRadius: 5,
    textAlign: "center",
    marginTop: 10,
  },
})


export default TeacherSubjects
