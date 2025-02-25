import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import SubjectsList from "./SubjectList";
import SubjectLessons from "./SubjectLessons";
import SubjectDetails from "./SubjectDetails";
import SelectGroupScreen from "../groups/SelectGroupScreen";
import CreateSubject from "../groups/CreateSubject";
const Stack = createStackNavigator();

const TeacherSchedule = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="SubjectsList" component={SubjectsList} />
      <Stack.Screen name="SelectGroup" component={SelectGroupScreen} options={{ title: "Выберите группу" }} />
      <Stack.Screen name="SubjectLessons" component={SubjectLessons} />
      <Stack.Screen name="SubjectDetails" component={SubjectDetails}/>
      <Stack.Screen name="CreateSubject" component={CreateSubject} />
    </Stack.Navigator>
  );
};

export default TeacherSchedule;