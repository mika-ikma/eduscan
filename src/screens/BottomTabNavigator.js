import React from "react"; 
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { MaterialIcons } from "@expo/vector-icons";

import TeacherDashboard from "./TeacherDashboard";
import StudentDashboard from "./StudentDashboard";
import StudentSchedule from "../schedule/StudentSchedule";
import TeacherSchedule from "../schedule/TeacherSchedule";
import TeacherAttendance from "../attendance/TeacherAttendance";
import StudentAttendance from "../attendance/StudentAttendance";
import TeacherGroup from "../groups/TeacherGroup"; 
import StudentGroup from "../groups/StudentGroup"; 

const Tab = createBottomTabNavigator();

const BottomTabNavigator = ({ route }) => {
  const { role } = route.params || {}; 

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let iconName;
          if (route.name === "Профиль") {
            iconName = "person";
          } else if (route.name === "Расписание") {
            iconName = "schedule";
          } else if (route.name === "Посещения") {
            iconName = "check-circle";
          } else if (route.name === "Группы") {
            iconName = "group";
          }
          return <MaterialIcons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: "#659DBD",
        tabBarInactiveTintColor: "gray",
      })}
    >
      <Tab.Screen
        name="Профиль"
        component={role === "teacher" ? TeacherDashboard : StudentDashboard}
        initialParams={{ role }}
      />
      <Tab.Screen
        name="Расписание"
        component={role === "teacher" ? TeacherSchedule : StudentSchedule}
      />
      <Tab.Screen
        name="Посещения"
        component={role === "teacher" ? TeacherAttendance : StudentAttendance}
      />
      <Tab.Screen
        name="Группы"
        component={role === "teacher" ? TeacherGroup : StudentGroup}
      />
    </Tab.Navigator>
  );
};

export default BottomTabNavigator;
