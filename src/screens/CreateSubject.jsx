import React, { useState, useEffect } from "react"
import { View, Text, TextInput, Button, StyleSheet, Alert } from "react-native"
import AsyncStorage from "@react-native-async-storage/async-storage"
import DateTimePicker from "@react-native-community/datetimepicker"
import axios from "axios"

import { BASE_API_URL } from "../../config.json"

const CreateSubject = ({ navigation }) => {
  const [title, setTitle] = useState("")
  const [date, setDate] = useState(new Date()) // Date picker default value
  const [time, setTime] = useState(new Date()) // Time picker default value
  const [teacher, setTeacher] = useState(null) // Teacher object
  const [loading, setLoading] = useState(false)
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [showTimePicker, setShowTimePicker] = useState(false)

  useEffect(() => {
    // Automatically assign the current logged-in user to the teacher field
    const fetchUser = async () => {
      const token = await AsyncStorage.getItem("token")

      if (token) {
        try {
          const response = await axios.get(`${BASE_API_URL}/profile/`, {
            headers: { Authorization: `Token ${token}` },
          })

          setTeacher(response.data) // Set the full user object as teacher
        } catch (error) {
          console.log("Error fetching user data:", error)
          Alert.alert("Error", "Failed to fetch user data.")
        }
      }
    }
    fetchUser()
  }, [])

  const createSubject = async () => {
    if (!title) {
      Alert.alert("Validation Error", "Subject title is required.")
      return
    }
    // Ensure that the teacher object is set correctly
    if (!teacher || !teacher.id) {
      Alert.alert("Validation Error", "Teacher information is required.")
      return
    }

    setLoading(true)

    try {
      const token = await AsyncStorage.getItem("token")

      if (!token) {
        Alert.alert(
          "Authentication Error",
          "You must log in to create a subject."
        )
        setLoading(false)
        return
      }

      const response = await fetch(`${BASE_API_URL}/teacher/subjects/create/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Token ${token}`,
        },
        body: JSON.stringify({
          title,
          date: date.toISOString().split("T")[0], // Format date to YYYY-MM-DD
          time: time.toISOString().split("T")[1].slice(0, 5), // Format time to HH:MM
          teacher: teacher.id, // Pass only the teacher's ID
        }),
      })

      if (response.ok) {
        const data = await response.json()
        Alert.alert("Success", `Subject "${data.title}" created successfully.`)
        setTitle("")
        setDate(new Date()) // Reset date picker
        setTime(new Date()) // Reset time picker
        navigation.navigate("TeacherSubjects")
      } else {
        const errorData = await response.json()
        console.log(errorData)
        Alert.alert("Error", errorData.error || "Failed to create subject.")
      }
    } catch (error) {
      Alert.alert("Error", "An error occurred while creating the subject.")
      console.log(`subject general creation error: ${error.data}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Subject Title</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter subject title"
        value={title}
        onChangeText={setTitle}
      />

      <Text style={styles.label}>Date</Text>
      <Button
        title={`Select Date: ${date.toLocaleDateString()}`}
        onPress={() => setShowDatePicker(true)}
      />
      {showDatePicker && (
        <DateTimePicker
          value={date}
          mode="date"
          display="default"
          onChange={(event, selectedDate) => {
            setShowDatePicker(false)
            if (selectedDate) {
              setDate(selectedDate)
            }
          }}
        />
      )}

      <Text style={styles.label}>Time</Text>
      <Button
        title={`Select Time: ${time.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })}`}
        onPress={() => setShowTimePicker(true)}
      />
      {showTimePicker && (
        <DateTimePicker
          value={time}
          mode="time"
          display="default"
          onChange={(event, selectedTime) => {
            setShowTimePicker(false)
            if (selectedTime) {
              setTime(selectedTime)
            }
          }}
        />
      )}

      <Button
        title={loading ? "Creating..." : "Create Subject"}
        onPress={createSubject}
        disabled={loading}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#659DBD",
    borderRadius: 5,
    padding: 10,
    marginBottom: 16,
  },
})

export default CreateSubject
