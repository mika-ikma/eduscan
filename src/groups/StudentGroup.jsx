import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import StudentGroupAll from "../groups/StudentGroupAll"; 
import GroupDetail from "../groups/GroupDetail"; 

const Stack = createNativeStackNavigator();

const StudentGroup = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen name="StudentGroupAll" component={StudentGroupAll} options={{ headerShown: false }} />
      <Stack.Screen name="GroupDetail" component={GroupDetail} options={{ title: "Детали группы" }} />
    </Stack.Navigator>
  );
};

export default StudentGroup;
