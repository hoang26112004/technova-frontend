import React, { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { ensureAdminStatus, getAccessToken } from "@/utils/auth";

const AdminGuard = ({ children }) => {
  const location = useLocation();
  const [status, setStatus] = useState("checking");

  useEffect(() => {
    let isMounted = true;
    const token = getAccessToken();
    if (!token) {
      setStatus("no-auth");
      return;
    }
    ensureAdminStatus()
      .then((isAdmin) => {
        if (isMounted) {
          setStatus(isAdmin ? "allowed" : "denied");
        }
      })
      .catch(() => {
        if (isMounted) {
          setStatus("denied");
        }
      });
    return () => {
      isMounted = false;
    };
  }, [location.pathname]);

  if (status === "checking") return null;
  if (status === "no-auth") {
    return <Navigate to="/auth?mode=login" replace />;
  }
  if (status === "denied") {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
};

export default AdminGuard;
