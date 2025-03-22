import React, { useState, useEffect } from "react";
import { useNavigate, NavLink } from "react-router-dom";
import { Eye, EyeOff, Loader } from "lucide-react";
import { motion } from "framer-motion";
import axios from "axios";
import "./ForgotPassword.css"; // Sử dụng file CSS riêng cho ForgotPassword (hoặc bạn có thể dùng Login.css)
import loginImage from "../assets/images/anhchologin.png";

// Cấu hình API cho chức năng lấy lại mật khẩu
const API_URL = "http://your-api-url.com/api/forgot-password"; // Thay đổi đường dẫn API thật của bạn
const API_KEY = "YOUR_API_KEY_HERE"; // Thay API key thật của bạn vào đây (nếu cần)

// Theme code tích hợp trực tiếp (giống trang Login)
const themes = [
  {
    background: "#1A1A2E",
    color: "#FFFFFF",
    primaryColor: "#0F3460",
  },
  {
    background: "#461220",
    color: "#FFFFFF",
    primaryColor: "#E94560",
  },
  {
    background: "#192A51",
    color: "#FFFFFF",
    primaryColor: "#967AA1",
  },
  {
    background: "#231F20",
    color: "#FFF",
    primaryColor: "#BB4430",
  },
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

const ForgotPassword = () => {
  const navigate = useNavigate();
  // Sử dụng 4 trường: contact (Email hoặc SĐT), CCCD, newPassword, confirmPassword
  const [formData, setFormData] = useState({
    contact: "",
    cccd: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [formErrors, setFormErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Kiểm tra trường contact: nếu chứa "@" thì kiểm tra email, nếu không thì kiểm tra số điện thoại
  const validateContact = (value) => {
    if (!value) return "Vui lòng nhập email hoặc số điện thoại.";
    if (value.includes("@")) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;
      if (!emailRegex.test(value)) return "Vui lòng nhập đúng email.";
    } else {
      const phoneRegex = /^\d{9,11}$/; // Giả sử số điện thoại từ 9 đến 11 số
      if (!phoneRegex.test(value)) return "Vui lòng nhập đúng số điện thoại.";
    }
    return "";
  };

  const validateForm = (values) => {
    const errors = {};
    const contactError = validateContact(values.contact);
    if (contactError) errors.contact = contactError;

    if (!values.cccd) {
      errors.cccd = "Vui lòng nhập CCCD.";
    } else {
      const cccdRegex = /^\d{9,12}$/; // CCCD có thể từ 9 đến 12 số
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
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const togglePassword = () => setShowPassword((prev) => !prev);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = validateForm(formData);
    setFormErrors(errors);
    if (Object.keys(errors).length === 0) {
      setLoading(true);
      try {
        // Gọi API đặt lại mật khẩu với dữ liệu formData
        const response = await axios.post(API_URL, formData, {
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${API_KEY}`, // Nếu API không cần key, xóa dòng này
          },
        });
        if (response.status === 200) {
          alert("Mật khẩu đã được đặt lại thành công!");
          navigate("/login", { replace: true });
        }
      } catch (error) {
        if (
          error.response &&
          error.response.data &&
          error.response.data.message
        ) {
          alert(error.response.data.message);
        } else {
          alert("Đã xảy ra lỗi khi đặt lại mật khẩu. Vui lòng thử lại sau.");
        }
      } finally {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    // Hiển thị các nút chuyển theme khi component mount
    displayThemeButtons();
  }, []);

  return (
    <div className="login-container">
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
        <h1 className="login-title opacity">Lấy lại mật khẩu</h1>
        <form onSubmit={handleSubmit} className="login-form">
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
              <span className="error-message">{formErrors.contact}</span>
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
              <span className="error-message">{formErrors.cccd}</span>
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
              <span className="error-message">{formErrors.newPassword}</span>
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
              <span className="error-message">{formErrors.confirmPassword}</span>
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
        <div className="theme-btn-container"></div>
      </motion.div>
    </div>
  );
};

export default ForgotPassword;
