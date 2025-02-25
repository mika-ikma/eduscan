import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  Alert,
  ActivityIndicator,
  FlatList,
  TouchableOpacity,
} from "react-native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native"; 
import { BASE_API_URL } from "../../config.json";

const GroupScreen = () => {
  const [groups, setGroups] = useState([]);
  const [groupName, setGroupName] = useState("");
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [editingGroup, setEditingGroup] = useState(null);
  const [editingText, setEditingText] = useState("");

  const navigation = useNavigation(); 

  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        Alert.alert("Ошибка", "Не найден токен авторизации");
        return;
      }

      const response = await axios.get(`${BASE_API_URL}/groups/`, {
        headers: { Authorization: `Token ${token}` },
      });

      setGroups(response.data);
    } catch (error) {
      console.error("Ошибка при загрузке групп:", error);
      Alert.alert("Ошибка", "Не удалось загрузить группы");
    }
  };

  const handleCreateGroup = async () => {
    if (!groupName.trim()) {
      Alert.alert("Ошибка", "Введите название группы");
      return;
    }

    setLoading(true);

    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        Alert.alert("Ошибка", "Не найден токен авторизации");
        return;
      }

      const response = await axios.post(
        `${BASE_API_URL}/teacher/groups/create/`,
        { title: groupName },
        {
          headers: {
            Authorization: `Token ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 201) {
        Alert.alert("Успех", "Группа успешно создана");
        setGroupName("");
        setCreating(false);
        fetchGroups();

        // 🔥 После создания переходим на CreateSubject и передаем groupId
        navigation.navigate("CreateSubject", { groupId: response.data.id });
      } else {
        Alert.alert("Ошибка", "Не удалось создать группу");
      }
    } catch (error) {
      console.error("Ошибка при создании группы:", error);
      Alert.alert("Ошибка", "Не удалось создать группу. Попробуйте позже.");
    } finally {
      setLoading(false);
    }
  };

  const handleEditGroup = async (groupId) => {
    if (!editingText.trim()) {
      Alert.alert("Ошибка", "Название группы не может быть пустым");
      return;
    }

    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        Alert.alert("Ошибка", "Не найден токен авторизации");
        return;
      }

      await axios.put(
        `${BASE_API_URL}/teacher/groups/${groupId}/edit/`,
        { title: editingText },
        {
          headers: { Authorization: `Token ${token}` },
        }
      );

      Alert.alert("Успех", "Название группы обновлено");
      setEditingGroup(null);
      fetchGroups();
    } catch (error) {
      console.error("Ошибка при обновлении группы:", error);
      Alert.alert("Ошибка", "Не удалось обновить группу. Попробуйте позже.");
    }
  };

  const handleDeleteGroup = async (groupId) => {
    Alert.alert("Удаление", "Вы уверены, что хотите удалить эту группу?", [
      { text: "Отмена", style: "cancel" },
      {
        text: "Удалить",
        onPress: async () => {
          try {
            const token = await AsyncStorage.getItem("token");
            if (!token) {
              Alert.alert("Ошибка", "Не найден токен авторизации");
              return;
            }

            await axios.delete(`${BASE_API_URL}/teacher/groups/${groupId}/delete/`, {
              headers: { Authorization: `Token ${token}` },
            });

            Alert.alert("Успех", "Группа удалена");
            fetchGroups();
          } catch (error) {
            console.error("Ошибка при удалении группы:", error);
            Alert.alert("Ошибка", "Не удалось удалить группу. Попробуйте позже.");
          }
        },
      },
    ]);
  };

  
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Список групп</Text>
        <TouchableOpacity onPress={() => setCreating(!creating)} style={styles.createButton}>
          <Text style={styles.createButtonText}>+ Создать группу</Text>
        </TouchableOpacity>
      </View>

      {creating && (
        <View style={styles.form}>
          <TextInput
            style={styles.input}
            placeholder="Введите название группы"
            value={groupName}
            onChangeText={setGroupName}
          />
          {loading ? (
            <ActivityIndicator size="large" color="#659DBD" />
          ) : (
            <Button title="Создать" onPress={handleCreateGroup} />
          )}
        </View>
      )}

      <FlatList
        data={groups}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.groupItem}>
            {editingGroup === item.id ? (
              <TextInput
                style={styles.input}
                value={editingText}
                onChangeText={setEditingText}
                autoFocus
              />
            ) : (
              <TouchableOpacity
                onPress={() => navigation.navigate("GroupDetail", { groupId: item.id })}
              >
                <Text style={styles.groupText}>{item.title}</Text>
              </TouchableOpacity>
            )}
          
            <View style={styles.actions}>
              {editingGroup === item.id ? (
                <Button title="Сохранить" onPress={() => handleEditGroup(item.id)} />
              ) : (
                <TouchableOpacity onPress={() => {
                  setEditingGroup(item.id);
                  setEditingText(item.title);
                }}>
                  <Text style={styles.editText}>✏️</Text>
                </TouchableOpacity>
              )}
        
              <TouchableOpacity onPress={() => handleDeleteGroup(item.id)}>
                <Text style={styles.deleteText}>🗑️</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#fff" },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 },
  title: { fontSize: 24, color: "#659DBD" },
  createButton: { backgroundColor: "#659DBD", padding: 10, borderRadius: 5 },
  createButtonText: { color: "#fff", fontSize: 16 },
  form: { marginBottom: 20, padding: 15, backgroundColor: "#f9f9f9", borderRadius: 5 },
  input: { height: 40, borderColor: "#659DBD", borderWidth: 1, borderRadius: 5, paddingHorizontal: 10, marginBottom: 10 },
  groupItem: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 15, backgroundColor: "#eef", borderRadius: 5, marginBottom: 10 },
  groupText: { fontSize: 18, color: "#333" },
  actions: { flexDirection: "row", gap: 10 },
  editText: { fontSize: 18, color: "#659DBD" },
  deleteText: { fontSize: 18, color: "#d9534f" },
});

export default GroupScreen;
