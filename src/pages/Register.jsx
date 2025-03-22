import React, { useState, useCallback } from "react";
import { useNavigate, NavLink } from "react-router-dom";
import axios from "axios";
import { motion } from "framer-motion";

import "./Register.css";
import registerImage from "../assets/images/anhchologin.png";

// Cấu hình API – cập nhật URL và API_KEY khi cần
const API_URL = "http://your-api-url.com/api/register";
const API_KEY = "YOUR_API_KEY_HERE"; // Nếu API không cần key, bạn có thể xóa header này

const Register = () => {
  const navigate = useNavigate();

  // State quản lý thông tin form đăng ký
  const [user, setUserDetails] = useState({
    fname: "",
    lname: "",
    phone: "",
    email: "",
    cccd: "",
  });
  const [formErrors, setFormErrors] = useState({});
  const [submitError, setSubmitError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Hàm cập nhật giá trị input
  const changeHandler = (e) => {
    const { name, value } = e.target;
    setUserDetails((prev) => ({ ...prev, [name]: value }));
  };

  // Validate form và trả về object lỗi cho từng field
  const validateForm = useCallback((values) => {
    const errors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    if (!values.fname) errors.fname = "Vui lòng nhập họ.";
    if (!values.lname) errors.lname = "Vui lòng nhập tên.";
    if (!values.phone) errors.phone = "Vui lòng nhập số điện thoại.";
    if (!values.email) errors.email = "Vui lòng nhập email.";
    else if (!emailRegex.test(values.email)) errors.email = "Email không hợp lệ.";
    if (!values.cccd) errors.cccd = "Vui lòng nhập CCCD.";
    return errors;
  }, []);

  // Xử lý submit form đăng ký
  const handleRegister = async (e) => {
    e.preventDefault();
    setSubmitError("");
    const errors = validateForm(user);
    setFormErrors(errors);

    if (Object.keys(errors).length === 0) {
      setIsSubmitting(true);
      try {
        // Ghép họ và tên thành FullName
        const fullName = `${user.fname} ${user.lname}`;
        // Định dạng dữ liệu phù hợp với API (Customers)
        const customerData = {
          FullName: fullName,
          PhoneNumber: user.phone,
          IdentityNumber: user.cccd,
          Email: user.email,
        };
        const response = await axios.post(API_URL, customerData, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${API_KEY}`, // Xóa nếu API không cần key
          },
        });
        if (response.status === 200 || response.status === 201) {
          // Thành công: chuyển hướng sang trang đăng nhập
          navigate("/login", { replace: true });
        }
      } catch (error) {
        // Xử lý lỗi từ server và hiển thị thông báo lỗi dưới form
        const message =
          error.response?.data?.message ||
          "Đã xảy ra lỗi khi đăng ký. Vui lòng thử lại sau.";
        setSubmitError(message);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <div className="register-container">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="register-box form-container"
      >
        {/* Hình ảnh logo đăng ký */}
        <img
          src={registerImage}
          alt="Ảnh Register"
          className="anhchoregister"
        />
        <h1 className="register-title">Đăng ký tài khoản</h1>

        {/* Hiển thị lỗi submit nếu có */}
        {submitError && (
          <div className="submit-error" role="alert">
            {submitError}
          </div>
        )}

        <form onSubmit={handleRegister} className="register-form" noValidate>
          <div className="input-group">
            <input
              type="text"
              name="fname"
              placeholder="Họ"
              value={user.fname}
              onChange={changeHandler}
              className={formErrors.fname ? "input-error" : ""}
            />
            {formErrors.fname && (
              <span className="error-message" role="alert">
                {formErrors.fname}
              </span>
            )}
          </div>
          <div className="input-group">
            <input
              type="text"
              name="lname"
              placeholder="Tên"
              value={user.lname}
              onChange={changeHandler}
              className={formErrors.lname ? "input-error" : ""}
            />
            {formErrors.lname && (
              <span className="error-message" role="alert">
                {formErrors.lname}
              </span>
            )}
          </div>
          <div className="input-group">
            <input
              type="text"
              name="phone"
              placeholder="Số điện thoại"
              value={user.phone}
              onChange={changeHandler}
              className={formErrors.phone ? "input-error" : ""}
            />
            {formErrors.phone && (
              <span className="error-message" role="alert">
                {formErrors.phone}
              </span>
            )}
          </div>
          <div className="input-group">
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={user.email}
              onChange={changeHandler}
              className={formErrors.email ? "input-error" : ""}
            />
            {formErrors.email && (
              <span className="error-message" role="alert">
                {formErrors.email}
              </span>
            )}
          </div>
          <div className="input-group">
            <input
              type="text"
              name="cccd"
              placeholder="CCCD"
              value={user.cccd}
              onChange={changeHandler}
              className={formErrors.cccd ? "input-error" : ""}
            />
            {formErrors.cccd && (
              <span className="error-message" role="alert">
                {formErrors.cccd}
              </span>
            )}
          </div>
          <button
            type="submit"
            className="register-button"
            disabled={isSubmitting}
            aria-busy={isSubmitting ? "true" : "false"}
          >
            {isSubmitting ? "Đang xử lý..." : "Đăng ký"}
          </button>
        </form>
        <p className="register-login-link">
          Đã có tài khoản?{" "}
          <NavLink to="/login" className="login-link">
            Đăng nhập ngay
          </NavLink>
        </p>
        {/* Container cho các nút theme (nếu cần) */}
        <div className="theme-btn-container"></div>
      </motion.div>
    </div>
  );
};

export default Register;
