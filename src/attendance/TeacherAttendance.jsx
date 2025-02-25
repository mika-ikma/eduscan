import React, { useState, useEffect } from "react";
import { View, Text, FlatList, ActivityIndicator, StyleSheet } from "react-native";
import DropDownPicker from "react-native-dropdown-picker";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { BASE_API_URL } from "../../config.json";

const TeacherAttendance = () => {
  const [subjects, setSubjects] = useState([]);
  const [students, setStudents] = useState([]);
  const [attendanceData, setAttendanceData] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [loading, setLoading] = useState(false);

  // Стейт для открытия выпадающих списков
  const [openSubject, setOpenSubject] = useState(false);
  const [openStudent, setOpenStudent] = useState(false);

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const token = await AsyncStorage.getItem("token");
        const response = await axios.get(`${BASE_API_URL}/teacher/subjects/`, {
          headers: { Authorization: `Token ${token}` },
        });

        const formattedSubjects = response.data.map((subject) => ({
          label: subject.title,
          value: subject.id.toString(),
        }));

        setSubjects(formattedSubjects);
      } catch (error) {
        console.error("Ошибка загрузки предметов:", error);
      }
    };
    fetchSubjects();
  }, []);

  useEffect(() => {
    if (!selectedSubject) return;

    const fetchStudents = async () => {
      try {
        const token = await AsyncStorage.getItem("token");
        const response = await axios.get(`${BASE_API_URL}/subjects/${selectedSubject}/students/`, {
          headers: { Authorization: `Token ${token}` },
        });

        const formattedStudents = response.data.students.map((student) => ({
          label: student.username,
          value: student.id.toString(),
        }));

        // Добавляем опцию "Все студенты"
        setStudents([{ label: "Все студенты", value: null }, ...formattedStudents]);
      } catch (error) {
        console.error("Ошибка загрузки студентов:", error);
      }
    };
    fetchStudents();
  }, [selectedSubject]);

  useEffect(() => {
    if (!selectedSubject) return;

    const fetchAttendance = async () => {
      setLoading(true);
      try {
        const token = await AsyncStorage.getItem("token");
        let url = `${BASE_API_URL}/attendance/journal/?subject=${selectedSubject}`;
        if (selectedStudent) {
          url += `&student=${selectedStudent}`;
        }

        const response = await axios.get(url, {
          headers: { Authorization: `Token ${token}` },
        });

        setAttendanceData(response.data.attendance_data || []);
      } catch (error) {
        if (error.response && error.response.data.error === "No attendance records found") {
          setAttendanceData([]); // Если данных нет, устанавливаем пустой массив
        } else {
          console.error("Ошибка загрузки посещаемости:", error);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchAttendance();
  }, [selectedSubject, selectedStudent]);

  return (
    <View style={styles.container}>
      <Text style={styles.header}>📌 Журнал посещаемости</Text>

      {/* Выпадающий список предметов */}
      <View style={[styles.dropdownWrapper, { zIndex: 3000 }]}>
        <Text style={styles.label}>Выберите предмет:</Text>
        <DropDownPicker
          open={openSubject}
          value={selectedSubject}
          items={subjects}
          setOpen={setOpenSubject}
          setValue={setSelectedSubject}
          setItems={setSubjects}
          placeholder="Выберите предмет"
          style={styles.dropdown}
          dropDownContainerStyle={styles.dropdownContainer}
        />
      </View>

      {/* Выпадающий список студентов с опцией "Все студенты" */}
      {students.length > 0 && (
        <View style={[styles.dropdownWrapper, { zIndex: 2000 }]}>
          <Text style={styles.label}>Выберите студента:</Text>
          <DropDownPicker
            open={openStudent}
            value={selectedStudent}
            items={students}
            setOpen={setOpenStudent}
            setValue={setSelectedStudent}
            setItems={setStudents}
            placeholder="Все студенты"
            style={styles.dropdown}
            dropDownContainerStyle={styles.dropdownContainer}
            onChangeValue={(value) => setSelectedStudent(value)}
          />
        </View>
      )}

      {/* Отображение посещаемости */}
      {loading ? (
        <ActivityIndicator size="large" color="#007AFF" />
      ) : (
        <FlatList
          data={attendanceData}
          keyExtractor={(item) => item.id.toString()}
          ListEmptyComponent={<Text style={styles.emptyText}>📌 Данных о посещаемости нет</Text>}
          renderItem={({ item, index }) => {
            const [date, time] = item.attendance_time.split(" ");
            return (
              <View style={styles.attendanceItem}>
                <View style={styles.dateTimeContainer}>
                  <Text style={styles.dateText}>{date}</Text>
                  <Text style={styles.timeText}>{time}</Text>
                </View>
                <Text style={styles.cell}>{item.student || "—"}</Text>
                <Text style={[styles.cell, item.attended ? styles.present : styles.absent]}>
                  {item.attended ? "✅" : "❌"}
                </Text>
              </View>
            );
          }}
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 20,
  },
  header: {
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
    color: "#007AFF",
  },
  dropdownWrapper: {
    marginBottom: 15,
  },
  dropdown: {
    borderColor: "#007AFF",
    borderRadius: 8,
    backgroundColor: "#F5F5F5",
  },
  dropdownContainer: {
    borderColor: "#007AFF",
  },
  label: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 5,
  },
  emptyText: {
    textAlign: "center",
    color: "#666",
    fontSize: 16,
    marginTop: 20,
  },
  attendanceItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
    padding: 12,
    marginVertical: 6,
    borderRadius: 8,
  },
  cell: {
    fontSize: 14,
    fontWeight: "bold",
    flex: 1,
    textAlign: "center",
  },
  present: {
    color: "#155724",
    backgroundColor: "#D4EDDA",
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 5,
  },
  absent: {
    color: "#721C24",
    backgroundColor: "#F8D7DA",
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 5,
  },
});

export default TeacherAttendance;
