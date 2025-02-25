import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import GroupScreen from "./GroupScreen"; 
import CreateSubject from "./CreateSubject"; 
import GroupDetail from "../groups/GroupDetail";
import SelectGroupScreen from "./SelectGroupScreen";
const Stack = createStackNavigator();

const TeacherGroup = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen name="GroupScreen" component={GroupScreen} options={{ headerShown: false }} />
      <Stack.Screen name="SelectGroup" component={SelectGroupScreen} options={{ title: "Выберите группу" }} />
      <Stack.Screen name="CreateSubject" component={CreateSubject} options={{ title: "Создать предмет" }} />
      <Stack.Screen name="GroupDetail" component={GroupDetail} options={{ title: "Детали группы"}} />
      
    </Stack.Navigator>
  );
};

export default TeacherGroup;
