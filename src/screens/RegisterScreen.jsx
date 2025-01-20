import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  Image,
  Alert,
  ActivityIndicator,
  StyleSheet,  // Добавьте StyleSheet
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import * as ImagePicker from "expo-image-picker";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { BASE_API_URL } from "../../config.json";

const RegisterScreen = ({ navigation }) => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState("student");
  const [photo, setPhoto] = useState(null);
  const [loading, setLoading] = useState(false);

  const pickImage = async () => {
    const permissionStatus = await askForPermission();

    if (permissionStatus !== "granted") {
      Alert.alert("Permission to access the camera is required!");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled && result.assets?.[0]?.uri) {
      setPhoto(result.assets[0].uri);
    } else {
      Alert.alert("Error", "No photo was taken or the operation was canceled.");
    }
  };

  const askForPermission = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    return status;
  };

  const handleSubmit = async () => {
    if (!username || !email || !password || !confirmPassword || !photo) {
      Alert.alert("Error", "All fields are required!");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match!");
      return;
    }

    const isValidEmail = (email) => /\S+@\S+\.\S+/.test(email);
    if (!isValidEmail(email)) {
      Alert.alert("Error", "Please enter a valid email address.");
      return;
    }

    const formData = new FormData();
    formData.append("username", username);
    formData.append("email", email);
    formData.append("password", password);
    formData.append("password2", confirmPassword);
    formData.append("role", role);
    formData.append("photo", {
      uri: photo,
      type: "image/jpeg",
      name: "photo.jpg",
    });

    try {
      setLoading(true);
      const response = await axios.post(`${BASE_API_URL}/register/`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.status === 201) {
        const { token, user } = response.data;
        if (token) {
          await AsyncStorage.setItem("token", token);
        }
        const userRole = user?.role || null;

        if (!userRole) {
          Alert.alert("Error", "Invalid role received from the server.");
          return;
        }

        Alert.alert("Success", "Registration successful!");

        if (userRole === "student") {
          navigation.navigate("StudentDashboard");
        } else if (userRole === "teacher") {
          navigation.navigate("TeacherDashboard");
        }
      } else {
        const errorMessage = response.data?.message || "Registration failed";
        Alert.alert("Error", errorMessage);
      }
    } catch (error) {
      Alert.alert("Error", error.response?.data?.detail || "An error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Регистрация</Text>

      <Text style={styles.label}>Имя пользователя:</Text>
      <TextInput
        style={styles.input}
        value={username}
        onChangeText={setUsername}
      />

      <Text style={styles.label}>Email:</Text>
      <TextInput
        style={styles.input}
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
      />

      <Text style={styles.label}>Придумайте пароль:</Text>
      <TextInput
        style={styles.input}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        placeholderTextColor="#000000"
      />

      <Text style={styles.label}>Подтвердите пароль:</Text>
      <TextInput
        style={styles.input}
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry
        placeholderTextColor="#000000"
      />

      <Text style={styles.roleLabel}>Выберите роль:</Text>
      <Picker
        selectedValue={role}
        onValueChange={setRole}
        style={styles.picker}
      >
        <Picker.Item label="Student" value="student" />
        <Picker.Item label="Teacher" value="teacher" />
      </Picker>

      <Text style={styles.label}>Загрузите фотографию:</Text>
      <Button title="Сделать фотографию" onPress={pickImage} />
      {photo && <Image source={{ uri: photo }} style={styles.image} />}

      <Button
        title={loading ? "Registering..." : "Зарегистрироваться"}
        onPress={handleSubmit}
        disabled={loading}
      />
      {loading && <ActivityIndicator size="large" color="#659DBD" />}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    padding: 20,
  },
  header: {
    fontSize: 24,
    color: "#659DBD",
    marginBottom: 20,
    fontWeight: "bold",
    textAlign: "center",
  },
  label: {
    color: "#659DBD",
    marginBottom: 5,
    fontSize: 16,
  },
  roleLabel: {
    color: "#659DBD",
    marginBottom: 5,
    fontSize: 18,
    fontWeight: "bold",
  },
  input: {
    height: 40,
    borderColor: "#659DBD",
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 10,
    paddingHorizontal: 10,
    backgroundColor: "#FFFFFF",
    color: "#000000",
  },
  picker: {
    height: 55,
    backgroundColor: "#FFFFFF",
    marginBottom: 10,
    borderRadius: 5,
  },
  image: {
    width: 100,
    height: 100,
    marginVertical: 10,
    alignSelf: "center",
    borderRadius: 5,
  },
});

export default RegisterScreen;
