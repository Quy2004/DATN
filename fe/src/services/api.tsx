import axios from "axios";

// Tạo instance của axios với cấu hình cơ bản
const instance = axios.create({
  baseURL: "http://localhost:8000/",
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 3000,
});

export default instance;
