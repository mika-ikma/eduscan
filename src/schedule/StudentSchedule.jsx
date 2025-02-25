import React, { useState, useEffect } from "react";
import { createStackNavigator } from "@react-navigation/stack";
import StudentSubjectList from "./StudentSubjectList";  
import StudentSubjectLessons from "./StudentSubjectLessons";
import QRScannerScreen from "./QRScanner";

const Stack = createStackNavigator();

const StudentSchedule = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="StudentSubjectList" component={StudentSubjectList} />
      <Stack.Screen name="StudentSubjectLessons" component={StudentSubjectLessons} />
      <Stack.Screen name="QRScanner" component={QRScannerScreen} />
    </Stack.Navigator>
  );
};

export default StudentSchedule;