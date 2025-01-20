import React, { useState, useEffect } from "react"
import { Text, View, StyleSheet, Button, Alert } from "react-native"
import { CameraView, Camera } from "expo-camera"
import { useNavigation } from "@react-navigation/native" // Import navigation hook

export default function App() {
  const [hasPermission, setHasPermission] = useState(null) // Camera permission state
  const [scanned, setScanned] = useState(false) // Barcode scanning state
  const navigation = useNavigation() // Access navigation

  useEffect(() => {
    const getCameraPermissions = async () => {
      const { status } = await Camera.requestCameraPermissionsAsync()
      setHasPermission(status === "granted") // Update state based on permission
    }

    getCameraPermissions() // Request permission when the app mounts
  }, [])

  // Handler for barcode scanning
  const handleBarcodeScanned = ({ data }) => {
    setScanned(true) // Mark as scanned to prevent duplicate scans
    handleScanSuccess({ data }) // Call scan success handler
  }

  // Handle QR code scanning success
  const handleScanSuccess = (scanData) => {
    console.log("Scanned Data:", scanData)
    const match = scanData.data.match(/\/subjects\/attendance\/(\d+)\/(.+)\//)
    if (match) {
      const [, subjectId, token] = match // Extract parameters
      console.log(match)
      navigation.navigate("PhotoCapture", { subjectId, token }) // Navigate to the PhotoCapture screen
    } else {
      Alert.alert("Invalid QR Code", "The scanned QR code is not valid.") // Show an error alert
    }
  }

  if (hasPermission === null) {
    return (
      <View style={styles.centered}>
        <Text>Requesting camera permission...</Text>
      </View>
    )
  }

  if (hasPermission === false) {
    return (
      <View style={styles.centered}>
        <Text>No access to camera. Please enable it in your settings.</Text>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      {/* CameraView renders the camera for barcode scanning */}
      <CameraView
        onBarcodeScanned={scanned ? undefined : handleBarcodeScanned} // Disable scanner after a successful scan
        barcodeScannerSettings={{
          barcodeTypes: ["qr", "pdf417"], // Specify the types of barcodes to scan
        }}
        style={StyleSheet.absoluteFillObject} // Fullscreen camera
      />
      {scanned && (
        <View style={styles.buttonContainer}>
          <Button
            title="Tap to Scan Again"
            onPress={() => setScanned(false)} // Reset scanning state
          />
        </View>
      )}
    </View>
  )
}

// Styles for layout and camera view
const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "column",
    justifyContent: "center",
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  buttonContainer: {
    position: "absolute",
    bottom: 50,
    alignSelf: "center",
  },
})
