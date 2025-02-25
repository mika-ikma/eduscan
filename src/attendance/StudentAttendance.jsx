import React, { useState, useEffect } from "react";
import { 
  View, Text, FlatList, ActivityIndicator, StyleSheet 
} from "react-native";
import DropDownPicker from "react-native-dropdown-picker";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { BASE_API_URL } from "../../config.json";

const StudentAttendance = () => {
  const [subjects, setSubjects] = useState([]);
  const [attendanceData, setAttendanceData] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [loading, setLoading] = useState(false);
  const [openSubject, setOpenSubject] = useState(false);

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const token = await AsyncStorage.getItem("token");
        const response = await axios.get(`${BASE_API_URL}/student/subjects/`, {
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
  
    const fetchAttendance = async () => {
      setLoading(true);
      try {
        const token = await AsyncStorage.getItem("token");
        const response = await axios.get(`${BASE_API_URL}/attendance/journal/?subject=${selectedSubject}`, {
          headers: { Authorization: `Token ${token}` },
        });

        if (response.data.error === "No attendance records found") {
          setAttendanceData(null);
        } else {
          setAttendanceData(response.data.attendance_data || []);
        }
      } catch (error) {
        if (error.response && error.response.status === 404 && error.response.data.error === "No attendance records found") {
          setAttendanceData(null);
        } else {
          console.error("Ошибка загрузки посещаемости:", error);
        }
      } finally {
        setLoading(false);
      }
    };
  
    fetchAttendance();
  }, [selectedSubject]);

  return (
    <View style={styles.container}>
      <Text style={styles.header}>📌 Журнал посещаемости</Text>

      <View style={styles.dropdownWrapper}>
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

      {loading ? (
        <ActivityIndicator size="large" color="#007AFF" />
      ) : attendanceData === null ? (
        <Text style={styles.emptyText}>📌 Данных о посещаемости нет</Text>
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
    padding: 20,
    backgroundColor: "#fff",
  },
  header: {
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 15,
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
    marginTop: 20,
    fontSize: 16,
  },
  attendanceItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
    padding: 10,
    marginVertical: 5,
    borderRadius: 8,
  },
  cell: {
    fontSize: 14,
    fontWeight: "bold",
    flex: 1,
    textAlign: "center",
  },
  dateTimeContainer: {
    flex: 1,
    alignItems: "center",
  },
  dateText: {
    fontSize: 14,
    fontWeight: "bold",
  },
  timeText: {
    fontSize: 12,
    color: "#555",
  },
  present: {
    color: "#155724",
    backgroundColor: "#d4edda",
    padding: 5,
    borderRadius: 5,
  },
  absent: {
    color: "white",
    backgroundColor: "#ff6f61",
    padding: 5,
    borderRadius: 5,
  },
});

export default StudentAttendance;
