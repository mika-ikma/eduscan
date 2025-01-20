import axios from "axios";

// Базовый URL API
const API_URL = "http://127.0.0.1:8000/api/";

// Создаем экземпляр Axios
const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Установка токена аутентификации
export const setAuthToken = (token) => {
  if (token) {
    api.defaults.headers.common["Authorization"] = `Token ${token}`;
  } else {
    delete api.defaults.headers.common["Authorization"];
  }
};

// Функции для работы с API
export const registerUser = (data) => api.post("register/", data);
export const loginUser = (data) => api.post("login/", data);
export const fetchUserInfo = () => api.get("user/");

export default api;
