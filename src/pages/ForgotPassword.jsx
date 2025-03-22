import React, { useState, useEffect, useCallback } from "react";
import { Eye, EyeOff, Loader, ArrowLeftCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import axios from "axios";
import "./ForgotPassword.css";
import loginImage from "../assets/images/anhchologin.png";

// ------------------------
// API Configuration
// ------------------------
const API_URL = "http://your-api-url.com/api/forgot-password";
const API_KEY = "YOUR_API_KEY_HERE";

// ------------------------
// Theme Configuration
// ------------------------
const themes = [
  {
    background: "#000000",
    color: "#FFFFFF",
    primaryColor: "#333333",
  },
  {
    background: "#FFFFFF",
    color: "#000000",
    primaryColor: "#007bff",
  },
];

/**
 * setTheme: Cập nhật các biến CSS dựa trên theme được chọn
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
 * ThemeButtons: Component hiển thị nút chuyển đổi theme
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

// ------------------------
// ForgotPassword Component
// ------------------------
const ForgotPassword = () => {
  const navigate = useNavigate();

  // State quản lý dữ liệu form reset mật khẩu
  const [formData, setFormData] = useState({
    contact: "",
    cccd: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [formErrors, setFormErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState("");

  /**
   * validateContact: Kiểm tra tính hợp lệ của trường contact (Email hoặc SĐT)
   */
  const validateContact = (value) => {
    if (!value) return "Vui lòng nhập email hoặc số điện thoại.";
    if (value.includes("@")) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;
      if (!emailRegex.test(value)) return "Vui lòng nhập đúng email.";
    } else {
      const phoneRegex = /^\d{9,11}$/;
      if (!phoneRegex.test(value))
        return "Vui lòng nhập đúng số điện thoại.";
    }
    return "";
  };

  /**
   * validateForm: Kiểm tra tính hợp lệ của toàn bộ form
   */
  const validateForm = useCallback((values) => {
    const errors = {};

    const contactError = validateContact(values.contact);
    if (contactError) errors.contact = contactError;

    if (!values.cccd) {
      errors.cccd = "Vui lòng nhập CCCD.";
    } else {
      const cccdRegex = /^\d{9,12}$/;
      if (!cccdRegex.test(values.cccd)) {
        errors.cccd = "Vui lòng nhập đúng CCCD.";
      }
    }

    if (!values.newPassword) {
      errors.newPassword = "Vui lòng nhập mật khẩu mới.";
    } else if (values.newPassword.length < 6) {
      errors.newPassword = "Mật khẩu phải có ít nhất 6 ký tự.";
    }

    if (!values.confirmPassword) {
      errors.confirmPassword = "Vui lòng xác nhận mật khẩu mới.";
    } else if (values.confirmPassword !== values.newPassword) {
      errors.confirmPassword = "Mật khẩu không khớp.";
    }
    return errors;
  }, []);

  // Cập nhật state form khi input thay đổi
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Toggle hiển thị mật khẩu
  const togglePassword = () => setShowPassword((prev) => !prev);

  // Xử lý submit form reset mật khẩu
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError("");
    const errors = validateForm(formData);
    setFormErrors(errors);
    if (Object.keys(errors).length === 0) {
      setLoading(true);
      try {
        const response = await axios.post(API_URL, formData, {
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${API_KEY}`,
          },
        });
        if (response.status === 200) {
          alert("Mật khẩu đã được đặt lại thành công!");
          navigate("/login", { replace: true });
        }
      } catch (error) {
        const message =
          error.response?.data?.message ||
          "Đã xảy ra lỗi khi đặt lại mật khẩu. Vui lòng thử lại sau.";
        setSubmitError(message);
      } finally {
        setLoading(false);
      }
    }
  };

  // Áp dụng theme mặc định khi component mount
  useEffect(() => {
    setTheme(themes[0]);
  }, []);

  return (
    <div className="login-container">
      {/* Nút quay lại đăng nhập */}
      <button
        className="back-button"
        onClick={() => navigate("/login")}
        title="Quay lại đăng nhập"
        aria-label="Quay lại đăng nhập"
      >
        <ArrowLeftCircle size={36} />
      </button>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="login-box form-container"
      >
        <img
          src={loginImage}
          alt="Ảnh Reset Password"
          className="anhchologin"
        />
        <h1 className="login-title">Lấy lại mật khẩu</h1>

        {submitError && (
          <div className="submit-error" role="alert">
            {submitError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="login-form" noValidate>
          <div className="input-group">
            <label>Email hoặc SĐT</label>
            <input
              type="text"
              name="contact"
              placeholder="Nhập email hoặc số điện thoại"
              value={formData.contact}
              onChange={handleChange}
              className={formErrors.contact ? "input-error" : ""}
            />
            {formErrors.contact && (
              <span className="error-message" role="alert">
                {formErrors.contact}
              </span>
            )}
          </div>
          <div className="input-group">
            <label>CCCD</label>
            <input
              type="text"
              name="cccd"
              placeholder="Nhập CCCD"
              value={formData.cccd}
              onChange={handleChange}
              className={formErrors.cccd ? "input-error" : ""}
            />
            {formErrors.cccd && (
              <span className="error-message" role="alert">
                {formErrors.cccd}
              </span>
            )}
          </div>
          <div className="input-group">
            <label>Mật khẩu mới</label>
            <div className="password-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                name="newPassword"
                placeholder="Nhập mật khẩu mới"
                value={formData.newPassword}
                onChange={handleChange}
                className={formErrors.newPassword ? "input-error" : ""}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={togglePassword}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {formErrors.newPassword && (
              <span className="error-message" role="alert">
                {formErrors.newPassword}
              </span>
            )}
          </div>
          <div className="input-group">
            <label>Xác nhận mật khẩu</label>
            <input
              type={showPassword ? "text" : "password"}
              name="confirmPassword"
              placeholder="Xác nhận mật khẩu mới"
              value={formData.confirmPassword}
              onChange={handleChange}
              className={formErrors.confirmPassword ? "input-error" : ""}
            />
            {formErrors.confirmPassword && (
              <span className="error-message" role="alert">
                {formErrors.confirmPassword}
              </span>
            )}
          </div>
          <button type="submit" className="login-button" disabled={loading}>
            {loading ? (
              <Loader size={20} className="loading-icon" />
            ) : (
              "Đặt lại mật khẩu"
            )}
          </button>
        </form>
        <ThemeButtons themes={themes} />
      </motion.div>
    </div>
  );
};

export default ForgotPassword;
