import { Routes, Route, Navigate } from "react-router-dom";

import Home from "./Home";
import Feed from "./Feed";
import Login from "./Login";
import Register from "./Register";
import Profile from "./Profile";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />

      <Route path="/feed" element={<Feed />} />
      <Route path="/profile" element={<Profile />} />

      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
} 