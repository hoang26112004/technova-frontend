import React, { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { clearAdminFlag, ensureAdminStatus } from "@/utils/auth";

const OAuthCallback = () => {
  const navigate = useNavigate();
  const hasHandled = useRef(false);

  useEffect(() => {
    if (hasHandled.current) {
      return;
    }
    hasHandled.current = true;
    const queryParams = new URLSearchParams(window.location.search);
    const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ""));
    const token =
      queryParams.get("token") ||
      queryParams.get("accessToken") ||
      hashParams.get("token") ||
      hashParams.get("accessToken");
    if (token) {
      localStorage.setItem("accessToken", token);
      clearAdminFlag();
      ensureAdminStatus()
        .then((isAdmin) => {
          window.dispatchEvent(new CustomEvent("auth:changed"));
          navigate(isAdmin ? "/admin" : "/", { replace: true });
        })
        .catch(() => {
          window.dispatchEvent(new CustomEvent("auth:changed"));
          navigate("/", { replace: true });
        });
      return;
    }
    const existingToken = localStorage.getItem("accessToken");
    if (existingToken) {
      clearAdminFlag();
      ensureAdminStatus()
        .then((isAdmin) => {
          navigate(isAdmin ? "/admin" : "/", { replace: true });
        })
        .catch(() => {
          navigate("/", { replace: true });
        });
      return;
    }
    navigate("/auth", { replace: true });
  }, [navigate]);

  return <div>Đang xử lý đăng nhập...</div>;
};

export default OAuthCallback;
