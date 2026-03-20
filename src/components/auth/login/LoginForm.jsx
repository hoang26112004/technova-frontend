/* eslint-disable */
import { ErrorMessage, Field, Form, Formik } from "formik";
import React, { useState } from "react";
import { FaRegEye, FaEyeSlash } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import { FiLock, FiUser } from "react-icons/fi";

import "./LoginForm.scss";
import { loginValidationSchema } from "@/utils/validation/authValidation";
import ForgotPassword from "../forgotPassword/ForgotPassword";
import { useNavigate } from "react-router-dom";
import authApi from "@/utils/api/authApi";
const LoginForm = ({ setIsLogin, compact = false }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isFogotPassword, setIsForgotPassword] = useState(false);
  const navigate = useNavigate();

  const initiateValues = {
    userName: "",
    password: "",
  };

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      const payload = {
        username: values.userName,
        password: values.password,
      };
      const res = await authApi.login(payload);
      const token = res?.data?.data?.token;
      if (token) {
        localStorage.setItem("accessToken", token);
      }
      navigate("/");
    } catch (error) {
      const message =
          error?.response?.data?.message ||
          "Đăng nhập thất bại. Vui lòng thử lại.";
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
    <div data-aos="fade-right" className={`login `}>
      {!compact && <h1>Đăng nhập</h1>}
      <div className="login-form">
        <Formik
          initialValues={initiateValues}
          validationSchema={loginValidationSchema}
          onSubmit={handleSubmit}
        >
          {({ handleSubmit }) => (
            <Form onSubmit={handleSubmit}>
              <div className="login-form_item">
                <label className="login-form_title" htmlFor="userName">
                  Tên đăng nhập
                </label>
                <div className="input-wrap">
                  <FiUser className="input-icon" />
                  <Field
                    className="login-form_input has-icon"
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
              <div className="login-form_item password">
                <label className="login-form_title" htmlFor="password">
                  Mật khẩu
                </label>
                <div className="input-wrap">
                  <FiLock className="input-icon" />
                  <Field
                    className="login-form_input has-icon"
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
              <button type="submit">
                {/*onClick={() => navigate("/")}*/}
                Đăng nhập
              </button>
              <p className="p_forgotPassword" onClick={() => setIsForgotPassword(true)}>
                Quên mật khẩu?
              </p>
              {isFogotPassword && <ForgotPassword />}
              <p>
                Bạn chưa có tài khoản?{" "}
                <span onClick={() => setIsLogin(false)}>Đăng ký</span>
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

export default LoginForm;
