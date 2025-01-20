import React, { useRef, useState } from "react"
import { View, StyleSheet, Text, TouchableOpacity, Alert } from "react-native"
import { CameraView, CameraType, useCameraPermissions } from "expo-camera"
import AsyncStorage from "@react-native-async-storage/async-storage" // Ensure AsyncStorage is imported
import axios from "axios"
import { BASE_API_URL } from "../../config.json" // Make sure this is correct

const PhotoCaptureScreen = ({ route, navigation }) => {
  const { subjectId, token } = route.params // Extract subjectId and token from route params
  const [facing, setFacing] = useState("front") // Default to front camera
  const [permission, requestPermission] = useCameraPermissions() // Manage permissions for the camera
  const cameraRef = useRef(null) // Reference for the camera
  const [capturing, setCapturing] = useState(false) // State to track if photo is being captured

  // Handle camera permission
  if (!permission) {
    // If permissions are still loading
    return <View />
  }

  if (!permission.granted) {
    // If permission is not granted
    return (
      <View style={styles.container}>
        <Text style={styles.message}>
          We need your permission to show the camera
        </Text>
        <TouchableOpacity style={styles.button} onPress={requestPermission}>
          <Text style={styles.text}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    )
  }

  // Toggle between front and back camera
  const toggleCameraFacing = () => {
    setFacing((current) =>
      current === CameraType.back ? CameraType.front : CameraType.back
    )
  }

  // Take a photo using the camera
  const takePhoto = async () => {
    if (cameraRef.current && !capturing) {
      setCapturing(true) // Set capturing state to true
      const photo = await cameraRef.current.takePictureAsync({ quality: 0.7 })
      uploadPhoto(photo.uri) // Upload the captured photo
      setCapturing(false) // Reset capturing state
    }
  }

  // Upload the photo to the server
  const uploadPhoto = async (photoUri) => {
    try {
      // Retrieve token from AsyncStorage (for authentication)
      const tokenAuth = await AsyncStorage.getItem("token")

      // Prepare FormData for uploading
      const formData = new FormData()
      formData.append("photo", {
        uri: photoUri,
        name: "photo.jpg",
        type: "image/jpeg", // Make sure to set the correct mime type for the image
      })

      // Send the photo to the backend API
      const response = await axios.post(
        `${BASE_API_URL}/subjects/attendance/${subjectId}/${token}/`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data", // Proper header for file upload
            Authorization: `Token ${tokenAuth}`, // Include token for authentication
          },
        }
      )

      // Handle the response
      if (response.status === 201) {
        Alert.alert("Success", "Attendance marked successfully!")
        navigation.navigate("StudentDashboard") // Navigate to the student dashboard
      } else {
        Alert.alert("Error", "Failed to mark attendance.")
      }
    } catch (err) {
      // Handle any errors during the API call
      Alert.alert("Error", "An error occurred while submitting.")
    }
  }

  return (
    <View style={styles.container}>
      {/* Camera view for capturing photo */}
      <CameraView style={styles.camera} ref={cameraRef} facing={facing}>
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.button} onPress={toggleCameraFacing}>
            <Text style={styles.text}>Flip Camera</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.captureButton} onPress={takePhoto}>
            <Text style={styles.text}>Capture Photo</Text>
          </TouchableOpacity>
        </View>
      </CameraView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center" },
  message: {
    textAlign: "center",
    paddingBottom: 10,
  },
  camera: {
    flex: 1,
    width: "100%",
  },
  buttonContainer: {
    position: "absolute",
    bottom: 50,
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    paddingHorizontal: 20,
  },
  button: {
    padding: 10,
    backgroundColor: "#4CAF50",
    borderRadius: 5,
    alignItems: "center",
  },
  captureButton: {
    padding: 10,
    backgroundColor: "#FF5722",
    borderRadius: 5,
    alignItems: "center",
  },
  text: {
    fontSize: 18,
    fontWeight: "bold",
    color: "white",
  },
})

export default PhotoCaptureScreen
