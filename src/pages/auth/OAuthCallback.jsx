import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const OAuthCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    if (token) {
      localStorage.setItem("accessToken", token);
      navigate("/", { replace: true });
      return;
    }
    navigate("/auth", { replace: true });
  }, [navigate]);

  return <div>Đang xử lý đăng nhập...</div>;
};

export default OAuthCallback;
