import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, NavLink } from "react-router-dom";
import { Eye, EyeOff, Loader, ArrowLeftCircle } from "lucide-react";
import { motion } from "framer-motion";

import "./Login.css";
import loginImage from "../assets/images/anhchologin.png";

// Cấu hình API
const API_URL = "http://your-api-url.com/api/login"; // Thay đường dẫn API thật của bạn
const API_KEY = "YOUR_API_KEY_HERE"; // Thay API key thật của bạn (nếu cần)

// Theme code tích hợp trực tiếp
const themes = [
  { background: "#1A1A2E", color: "#FFFFFF", primaryColor: "#0F3460" },
  { background: "#461220", color: "#FFFFFF", primaryColor: "#E94560" },
  { background: "#192A51", color: "#FFFFFF", primaryColor: "#967AA1" },
  { background: "#231F20", color: "#FFF", primaryColor: "#BB4430" },
];

const setTheme = (theme) => {
  const root = document.querySelector(":root");
  if (root) {
    root.style.setProperty("--background", theme.background);
    root.style.setProperty("--color", theme.color);
    root.style.setProperty("--primary-color", theme.primaryColor);
  }
};

const displayThemeButtons = () => {
  const btnContainer = document.querySelector(".theme-btn-container");
  if (!btnContainer) return;
  btnContainer.innerHTML = "";
  themes.forEach((theme) => {
    const btn = document.createElement("div");
    btn.className = "theme-btn";
    btn.style.cssText = `
      background: ${theme.background};
      width: 25px;
      height: 25px;
      border-radius: 50%;
      cursor: pointer;
    `;
    btnContainer.appendChild(btn);
    btn.addEventListener("click", () => setTheme(theme));
  });
};

const Login = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState({ email: "", password: "" });
  const [formErrors, setFormErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Xử lý nút Back
  const handleBack = () => {
    navigate("/");
  };

  const validateForm = (values) => {
    const errors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;
    if (!values.email) errors.email = "Vui lòng nhập email.";
    else if (!emailRegex.test(values.email))
      errors.email = "Email không hợp lệ.";
    if (!values.password) errors.password = "Vui lòng nhập mật khẩu.";
    else if (values.password.length < 6)
      errors.password = "Mật khẩu phải có ít nhất 6 ký tự.";
    return errors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUser((prev) => ({ ...prev, [name]: value }));
  };

  const togglePassword = () => setShowPassword(!showPassword);

  const handleLogin = async (e) => {
    e.preventDefault();
    const errors = validateForm(user);
    setFormErrors(errors);
    if (Object.keys(errors).length === 0) {
      setLoading(true);
      try {
        const response = await axios.post(API_URL, user, {
          headers: {
            "Authorization": `Bearer ${API_KEY}`,
          },
        });
        if (response.status === 200) {
          alert("Đăng nhập thành công!");
          localStorage.setItem("user", JSON.stringify(response.data.user));
          navigate("/", { replace: true });
        }
      } catch (error) {
        if (
          error.response &&
          error.response.data &&
          error.response.data.message
        ) {
          alert(error.response.data.message);
        } else {
          alert("Đã xảy ra lỗi khi đăng nhập. Vui lòng thử lại sau.");
        }
      } finally {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    displayThemeButtons();
  }, []);

  return (
    <div className="login-container">
      {/* Nút Back */}
      <div className="back-button" onClick={handleBack}>
        <ArrowLeftCircle size={36} />
      </div>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="login-box form-container"
      >
        <img src={loginImage} alt="Ảnh Login" className="anhchologin" />
        <h1 className="login-title opacity">Đăng nhập</h1>
        <form onSubmit={handleLogin} className="login-form">
          <div className="input-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              placeholder="Nhập email của bạn"
              onChange={handleChange}
              value={user.email}
            />
            {formErrors.email && (
              <p className="error-text">{formErrors.email}</p>
            )}
          </div>
          <div className="input-group">
            <label>Mật khẩu</label>
            <div className="password-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Nhập mật khẩu"
                onChange={handleChange}
                value={user.password}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={togglePassword}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {formErrors.password && (
              <p className="error-text">{formErrors.password}</p>
            )}
          </div>
          <div className="forgot-password">
            <NavLink to="/forgot-password">Quên mật khẩu?</NavLink>
          </div>
          <button type="submit" className="login-button" disabled={loading}>
            {loading ? (
              <Loader className="loading-icon" size={20} />
            ) : (
              "Đăng nhập"
            )}
          </button>
        </form>
        <div className="register-link">
          <p>{/* Nội dung đăng ký nếu có */}</p>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
