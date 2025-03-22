import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useNavigate, NavLink } from "react-router-dom";
import { Eye, EyeOff, Loader, ArrowLeftCircle } from "lucide-react";
import { motion } from "framer-motion";

import "./Login.css";
import loginImage from "../assets/images/anhchologin.png";

// API endpoint – sau này bạn chỉ cần cập nhật API_KEY
const API_URL = "http://your-api-url.com/api/login";
// Để trống API_KEY hiện tại, bạn có thể điền sau nếu cần
const API_KEY = ""; 

// 2 theme: Dark và Light
const themes = [
  {
    // Dark Theme
    background: "#000000",
    color: "#FFFFFF",
    primaryColor: "#333333",
  },
  {
    // Light Theme
    background: "#FFFFFF",
    color: "#000000",
    primaryColor: "#007bff",
  },
];

/**
 * setTheme: Áp dụng các biến CSS theo theme chọn
 */
const setTheme = (theme) => {
  const root = document.documentElement;
  if (root) {
    root.style.setProperty("--background", theme.background);
    root.style.setProperty("--color", theme.color);
    root.style.setProperty("--primary-color", theme.primaryColor);
  }
};

/**
 * ThemeButtons: Render nút chuyển theme dựa vào mảng themes
 */
const ThemeButtons = ({ themes }) => {
  return (
    <div className="theme-btn-container" aria-label="Theme Selector">
      {themes.map((theme, index) => (
        <button
          key={index}
          className="theme-btn"
          style={{ background: theme.background }}
          onClick={() => setTheme(theme)}
          title={theme.background === "#000000" ? "Dark Theme" : "Light Theme"}
          aria-label={
            theme.background === "#000000"
              ? "Chọn giao diện tối"
              : "Chọn giao diện sáng"
          }
        />
      ))}
    </div>
  );
};

const Login = () => {
  const navigate = useNavigate();

  // Quản lý trạng thái form (không còn API key)
  const [user, setUser] = useState({ email: "", password: "" });
  const [formErrors, setFormErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Xử lý nút Back về trang chủ
  const handleBack = useCallback(() => {
    navigate("/");
  }, [navigate]);

  // Validate form
  const validateForm = useCallback((values) => {
    const errors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;
    if (!values.email) errors.email = "Vui lòng nhập email.";
    else if (!emailRegex.test(values.email))
      errors.email = "Email không hợp lệ.";
    if (!values.password) errors.password = "Vui lòng nhập mật khẩu.";
    else if (values.password.length < 6)
      errors.password = "Mật khẩu phải có ít nhất 6 ký tự.";
    return errors;
  }, []);

  // Cập nhật giá trị form
  const handleChange = (e) => {
    const { name, value } = e.target;
    setUser((prev) => ({ ...prev, [name]: value }));
  };

  // Toggle hiển thị mật khẩu
  const togglePassword = () => setShowPassword((prev) => !prev);

  // Xử lý đăng nhập
  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    const errors = validateForm(user);
    setFormErrors(errors);
    if (Object.keys(errors).length === 0) {
      setLoading(true);
      try {
        const response = await axios.post(
          API_URL,
          { email: user.email, password: user.password },
          {
            headers: {
              Authorization: `Bearer ${API_KEY}`,
            },
          }
        );
        if (response.status === 200) {
          localStorage.setItem("user", JSON.stringify(response.data.user));
          navigate("/", { replace: true });
        }
      } catch (error) {
        const message =
          error.response?.data?.message ||
          "Đã xảy ra lỗi khi đăng nhập. Vui lòng thử lại sau.";
        setErrorMessage(message);
      } finally {
        setLoading(false);
      }
    }
  };

  // Áp dụng theme mặc định (Dark)
  useEffect(() => {
    setTheme(themes[0]);
  }, []);

  return (
    <div className="login-container">
      {/* Nút Back */}
      <button
        className="back-button"
        onClick={handleBack}
        title="Trở về trang chủ"
        aria-label="Trở về trang chủ"
      >
        <ArrowLeftCircle size={36} />
      </button>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="login-box form-container"
      >
        <img src={loginImage} alt="Ảnh Login" className="anhchologin" />
        <h1 className="login-title">Đăng nhập</h1>

        {/* Thông báo lỗi nếu có */}
        {errorMessage && (
          <div className="error-message" role="alert">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleLogin} className="login-form" noValidate>
          {/* Input Email */}
          <div className="input-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              name="email"
              placeholder="Nhập email của bạn"
              onChange={handleChange}
              value={user.email}
              aria-invalid={formErrors.email ? "true" : "false"}
            />
            {formErrors.email && (
              <p className="error-text" role="alert">
                {formErrors.email}
              </p>
            )}
          </div>

          {/* Input Mật khẩu */}
          <div className="input-group">
            <label htmlFor="password">Mật khẩu</label>
            <div className="password-wrapper">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Nhập mật khẩu"
                onChange={handleChange}
                value={user.password}
                aria-invalid={formErrors.password ? "true" : "false"}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={togglePassword}
                aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {formErrors.password && (
              <p className="error-text" role="alert">
                {formErrors.password}
              </p>
            )}
          </div>

          {/* Link Quên mật khẩu */}
          <div className="forgot-password">
            <NavLink to="/forgot-password">Quên mật khẩu?</NavLink>
          </div>

          {/* Nút đăng nhập */}
          <button
            type="submit"
            className="login-button"
            disabled={loading}
            aria-busy={loading ? "true" : "false"}
          >
            {loading ? (
              <Loader className="loading-icon" size={20} />
            ) : (
              "Đăng nhập"
            )}
          </button>

          {/* Link đăng ký */}
          <div className="register-link">
            <span>Bạn chưa có tài khoản? </span>
            <NavLink to="/register" className="login-link">
              Đăng ký ngay
            </NavLink>
          </div>
        </form>

        {/* Nút chuyển theme */}
        <ThemeButtons themes={themes} />
      </motion.div>
    </div>
  );
};

export default Login;
