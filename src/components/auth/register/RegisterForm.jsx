/* eslint-disable */
import { ErrorMessage, Field, Form, Formik } from "formik";
import React, { useState } from "react";
import { FaRegEye, FaEyeSlash } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import { FiLock, FiMail, FiUser } from "react-icons/fi";

import "./RegisterForm.scss";
import { registerValidationSchema } from "@/utils/validation/authValidation";
import authApi from "@/utils/api/authApi";
const RegisterForm = ({ setIsLogin, compact = false }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const initiateValues = {
    firstName: "",
    lastName: "",
    email: "",
    userName: "",
    password: "",
    confirmPassword: "",
  };

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      const payload = {
        email: values.email,
        username: values.userName,
        password: values.password,
        confirmPassword: values.confirmPassword,
        firstName: values.firstName,
        lastName: values.lastName,
      };
      const res = await authApi.register(payload);
      const message =
          res?.data?.message || "Đăng ký thành công. Vui lòng đăng nhập.";
      alert(message);
      setIsLogin(true);
    } catch (error) {
      const message =
          error?.response?.data?.message ||
          "Đăng ký thất bại. Vui lòng thử lại.";
      alert(message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const res = await authApi.googleLogin();
      const data = res?.data;
      const dataField = data?.data;
      const redirectUrl =
        (typeof dataField === "string" ? dataField : null) ||
        dataField?.redirectUrl ||
        dataField?.url ||
        data?.redirectUrl ||
        data?.url;
      if (typeof redirectUrl === "string" && redirectUrl.trim().length > 0) {
        window.location.href = redirectUrl;
        return;
      }
      alert("Không lấy được URL đăng nhập Google từ server.");
    } catch (error) {
      console.error("Google login error:", error);
      alert("Không gọi được API đăng nhập Google. Kiểm tra lại BE/CORS.");
    }
  };

  return (
    <div data-aos="fade-right" className={`register `}>
      {!compact && <h1>Đăng ký</h1>}
      <div className="register-form">
        <Formik
          initialValues={initiateValues}
          validationSchema={registerValidationSchema}
          onSubmit={handleSubmit}
        >
          {({ handleSubmit }) => (
            <Form onSubmit={handleSubmit}>
              <div className="register-form_item">
                <label className="register-form_title" htmlFor="firstName">
                  Họ
                </label>
                <div className="input-wrap">
                  <FiUser className="input-icon" />
                  <Field
                    className="register-form_input has-icon"
                    type="text"
                    name="firstName"
                    placeholder="Họ"
                  />
                </div>
                <ErrorMessage
                  name="firstName"
                  component="div"
                  style={{ color: "red", fontSize: "12px" }}
                />
              </div>
              <div className="register-form_item">
                <label className="register-form_title" htmlFor="lastName">
                  Tên
                </label>
                <div className="input-wrap">
                  <FiUser className="input-icon" />
                  <Field
                    className="register-form_input has-icon"
                    type="text"
                    name="lastName"
                    placeholder="Tên"
                  />
                </div>
                <ErrorMessage
                  name="lastName"
                  component="div"
                  style={{ color: "red", fontSize: "12px" }}
                />
              </div>
              <div className="register-form_item">
                <label className="register-form_title" htmlFor="email">
                  Email
                </label>
                <div className="input-wrap">
                  <FiMail className="input-icon" />
                  <Field
                    className="register-form_input has-icon"
                    type="email"
                    name="email"
                    placeholder="Email"
                  />
                </div>
                <ErrorMessage
                  name="email"
                  component="div"
                  style={{ color: "red", fontSize: "12px" }}
                />
              </div>
              <div className="register-form_item">
                <label className="register-form_title" htmlFor="userName">
                  Tên đăng nhập
                </label>
                <div className="input-wrap">
                  <FiUser className="input-icon" />
                  <Field
                    className="register-form_input has-icon"
                    type="text"
                    name="userName"
                    placeholder="Tên đăng nhập"
                  />
                </div>
                <ErrorMessage
                  name="userName"
                  component="div"
                  style={{ color: "red", fontSize: "12px" }}
                />
              </div>
              <div className="register-form_item password">
                <label className="register-form_title" htmlFor="password">
                  Mật khẩu
                </label>
                <div className="input-wrap">
                  <FiLock className="input-icon" />
                  <Field
                    className="register-form_input has-icon"
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="Mật khẩu"
                  />
                </div>
                <ErrorMessage
                  name="password"
                  component="div"
                  style={{ color: "red", fontSize: "12px" }}
                />
                {showPassword ? (
                  <FaRegEye
                    className="eye"
                    onClick={() => setShowPassword(false)}
                  />
                ) : (
                  <FaEyeSlash
                    className="eye"
                    onClick={() => setShowPassword(true)}
                  />
                )}
              </div>
              <div className="register-form_item password">
                <label
                  className="register-form_title"
                  htmlFor="confirmPassword"
                >
                  Xác nhận lại mật khẩu
                </label>
                <div className="input-wrap">
                  <FiLock className="input-icon" />
                  <Field
                    className="register-form_input has-icon"
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    placeholder="Nhập lại mật khẩu"
                  />
                </div>
                <ErrorMessage
                  name="confirmPassword"
                  component="div"
                  style={{ color: "red", fontSize: "12px" }}
                />
                {showConfirmPassword ? (
                  <FaRegEye
                    className="eye"
                    onClick={() => setShowConfirmPassword(false)}
                  />
                ) : (
                  <FaEyeSlash
                    className="eye"
                    onClick={() => setShowConfirmPassword(true)}
                  />
                )}
              </div>
              <button type="submit">Đăng ký</button>
              <p>
                Bạn đã có tài khoản?{" "}
                <span onClick={() => setIsLogin(true)}>Đăng nhập</span>
              </p>
              <p className="p_divider">Hoặc</p>
              <div className="login-gg">
                <button type="button" onClick={handleGoogleLogin}>
                  <FcGoogle />
                  <p>Đăng nhập bằng Google</p>
                </button>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
};

export default RegisterForm;
