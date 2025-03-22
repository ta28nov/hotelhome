import React from "react";
import { Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword"; // Import ForgotPassword
import HomePage from "./pages/HomePage";

const AppRoutes = () => {
  return (
    <Routes>
      {/* Trang chủ mặc định là HomePage */}
      <Route path="/" element={<HomePage />} />
      
      {/* Các route khác */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />

      {/* Nếu không tìm thấy route nào */}
      <Route path="*" element={<h1>DCM kiểm tra lại đê</h1>} />
    </Routes>
  );
};

export default AppRoutes;
