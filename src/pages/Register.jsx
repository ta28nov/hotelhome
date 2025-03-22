import React, { useState } from "react";
import { useNavigate, NavLink } from "react-router-dom";
import axios from "axios";
import "./Register.css";
import registerImage from "../assets/images/anhchologin.png"; // Ảnh đăng ký

// Cấu hình API (thay đổi URL và API_KEY theo thiết lập của bạn)
const API_URL = "http://your-api-url.com/api/register";
const API_KEY = "YOUR_API_KEY_HERE"; // Nếu API không cần key, có thể xóa header này

const Register = () => {
  const navigate = useNavigate();
  const [user, setUserDetails] = useState({
    fname: "",
    lname: "",
    phone: "",
    email: "",
    cccd: "",
  });
  const [formErrors, setFormErrors] = useState({});
  const [isSubmit, setIsSubmit] = useState(false);

  const changeHandler = (e) => {
    const { name, value } = e.target;
    setUserDetails({ ...user, [name]: value });
  };

  const validateForm = (values) => {
    const errors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    if (!values.fname) errors.fname = "Vui lòng nhập họ.";
    if (!values.lname) errors.lname = "Vui lòng nhập tên.";
    if (!values.phone) errors.phone = "Vui lòng nhập số điện thoại.";
    if (!values.email) errors.email = "Vui lòng nhập email.";
    else if (!emailRegex.test(values.email)) errors.email = "Email không hợp lệ.";
    if (!values.cccd) errors.cccd = "Vui lòng nhập CCCD.";
    return errors;
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    const errors = validateForm(user);
    setFormErrors(errors);
    setIsSubmit(true);

    if (Object.keys(errors).length === 0) {
      try {
        // Ghép họ và tên để tạo FullName
        const fullName = `${user.fname} ${user.lname}`;
        // Tạo đối tượng dữ liệu khớp với bảng Customers
        const customerData = {
          FullName: fullName,
          PhoneNumber: user.phone,
          IdentityNumber: user.cccd,
          Email: user.email,
        };
        // Gọi API đăng ký (POST) và truyền customerData
        const response = await axios.post(API_URL, customerData, {
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${API_KEY}`, // Nếu không cần key thì xóa dòng này
          },
        });
        if (response.status === 200 || response.status === 201) {
          alert("Đăng ký thành công!");
          navigate("/login", { replace: true });
        }
      } catch (error) {
        console.error("Registration error:", error);
        if (
          error.response &&
          error.response.data &&
          error.response.data.message
        ) {
          alert(error.response.data.message);
        } else {
          alert("Đã xảy ra lỗi khi đăng ký. Vui lòng thử lại sau.");
        }
      }
    }
  };

  return (
    <div className="register-container">
      <div className="register-box form-container">
        <img
          src={registerImage}
          alt="Ảnh Register"
          className="anhchoregister"
        />
        <h1 className="register-title opacity">Đăng ký tài khoản</h1>
        <form onSubmit={handleRegister} className="register-form">
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
              <span className="error-message">{formErrors.fname}</span>
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
              <span className="error-message">{formErrors.lname}</span>
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
              <span className="error-message">{formErrors.phone}</span>
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
              <span className="error-message">{formErrors.email}</span>
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
              <span className="error-message">{formErrors.cccd}</span>
            )}
          </div>
          <button type="submit" className="register-button">
            Đăng ký
          </button>
        </form>
        <p className="register-login-link">
          Đã có tài khoản?{" "}
          <NavLink to="/login" className="login-link">
            Đăng nhập ngay
          </NavLink>
        </p>
        <div className="theme-btn-container"></div>
      </div>
    </div>
  );
};

export default Register;
