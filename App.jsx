import React from "react"
import { NavigationContainer } from "@react-navigation/native"
import { createStackNavigator } from "@react-navigation/stack"
import LoginScreen from "./src/screens/LoginScreen"
import RegisterScreen from "./src/screens/RegisterScreen"
import HomeScreen from "./src/screens/HomeScreen"
import TeacherDashboard from "./src/screens/TeacherDashboard"
import StudentDashboard from "./src/screens/StudentDashboard"
import QRScannerScreen from "./src/screens/QRScannerScreen"
import PhotoCaptureScreen from "./src/screens/PhotoCaptureScreen"
import TeacherSubjects from "./src/screens/TeacherSubjects"
import CreateSubject from "./src/screens/CreateSubject"
import SubjectStudents from "./src/screens/SubjectStudents"


const Stack = createStackNavigator()

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{ title: "Вход" }}
        />
        <Stack.Screen
          name="Register"
          component={RegisterScreen}
          options={{ title: "Регистрация" }}
        />
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{ title: "Главная" }}
        />
        <Stack.Screen
          name="TeacherDashboard"
          component={TeacherDashboard}
          options={{ title: "Преподавательская панель" }}
        />
        <Stack.Screen
          name="TeacherSubjects"
          component={TeacherSubjects}
          options={{ title: "Список предметов" }}
        />
        <Stack.Screen
          name="CreateSubject"
          component={CreateSubject}
          options={{ title: "Создать предмет" }}
        />
        <Stack.Screen
          name="StudentDashboard"
          component={StudentDashboard}
          options={{ title: "Студенческая панель" }}
        />
        <Stack.Screen
          name="QRScanner"
          component={QRScannerScreen}
          options={{ title: "QR Scanner" }}
        />
        <Stack.Screen
          name="PhotoCapture"
          component={PhotoCaptureScreen}
          options={{ title: "Capture Photo" }}
        />
          <Stack.Screen
          name="SubjectStudents"
          component={SubjectStudents} 
          options={{ title: "Студенты" }}
  />
      </Stack.Navigator>
    </NavigationContainer>
  )
}
