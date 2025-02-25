import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { BASE_API_URL } from "../../config.json"; // Теперь BASE_API_URL без "/api"

const QRScannerScreen = ({ navigation }) => {
  const [scanned, setScanned] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();

  useEffect(() => {
    if (!permission) {
      requestPermission();
    }
  }, [permission]);

  const parseAttendanceUrl = (url) => {
    console.log("📌 Тип данных:", typeof url);  // Логируем тип

    if (typeof url !== "string") {
        console.error("❌ QR-код содержит некорректные данные:", url);
        return [null, null];
    }

    url = url.trim();  // Убираем лишние пробелы и символы

    const match = url.match(/\/api\/subjects\/attendance\/(\d+)\/([^/]+)/);
    console.log("📌 Совпадение регулярки:", match);

    return match ? [match[1], match[2]] : [null, null];
};


const handleBarCodeScanned = async ({ data }) => {
  if (scanned) return;
  setScanned(true);

  console.log("📌 QR-код содержит:", data);

  const [lessonId, token] = parseAttendanceUrl(data);
  console.log("📌 Извлеченный lessonId:", lessonId);
  console.log("📌 Извлеченный token:", token);

  if (!lessonId || !token) {
      Alert.alert("❌ Ошибка", "Некорректный QR-код!");
      console.log("❌ Ошибка: QR-код не соответствует формату!");
  } else {
      const requestUrl = `${BASE_API_URL.replace(/\/$/, "")}/subjects/attendance/${lessonId}/${token}/`;
      console.log("🚀 Отправляем запрос на:", requestUrl);

      try {
          const authToken = await AsyncStorage.getItem("token");
          if (!authToken) {
              Alert.alert("Ошибка", "Не найден токен авторизации!");
              setScanned(false);
              return;
          }

          console.log("🔑 Используем токен:", authToken);

          const response = await axios.post(
              requestUrl,
              {},
              {
                  headers: {
                      Authorization: `Token ${authToken}`,
                      "Content-Type": "application/json",
                  },
              }
          );

          console.log("✅ Ответ сервера:", response.data);

          if (response.data.success) {
              Alert.alert("✅ Успех", "Посещаемость успешно отмечена!", [
                  { text: "OK", onPress: () => navigation.goBack() },
              ]);
          } else if (response.data.info === "Посещаемость уже отмечена.") {
              Alert.alert("ℹ️ Внимание", "Посещаемость уже отмечена.");
          } else {
              Alert.alert("❌ Ошибка", response.data.error || "Ошибка при отметке посещаемости");
          }
      } catch (error) {
          console.error("❌ Ошибка запроса:", error);
          Alert.alert("❌ Ошибка", "Не удалось отметить посещаемость!");
      }
  }

  setTimeout(() => {
      setScanned(false);
  }, 2000);
};



  

  if (!permission) {
    return <Text>Запрос на доступ к камере...</Text>;
  }
  if (!permission.granted) {
    return <Text>Нет доступа к камере</Text>;
  }

  return (
    <View style={styles.container}>
      <CameraView
        style={styles.camera}
        facing="back"
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned} // Блокируем повторное сканирование
      >
        <View style={styles.overlay}>
          <Text style={styles.text}>Отсканируйте QR-код</Text>
        </View>
      </CameraView>
      <TouchableOpacity
        style={styles.closeButton}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.closeButtonText}>Закрыть</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
  },
  camera: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    fontSize: 18,
    color: "#fff",
    fontWeight: "bold",
  },
  closeButton: {
    position: "absolute",
    bottom: 40,
    alignSelf: "center",
    backgroundColor: "red",
    padding: 10,
    borderRadius: 5,
  },
  closeButtonText: {
    color: "white",
    fontWeight: "bold",
  },
});

export default QRScannerScreen;
