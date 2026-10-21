import React from "react";
import { useSelector } from "react-redux";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import useAuthStatus from "../hooks/useAuthStatus";
import LoaderScreen from "./common/Loader";

const isAdminRole = (user) =>
  String(user?.userType ?? "").toUpperCase() === "ADMIN";

const AdminRoute = () => {
  const { user } = useSelector((state) => state.auth);
  const { isLoggedIn, checkingUser } = useAuthStatus();
  const location = useLocation();

  if (checkingUser) {
    return <LoaderScreen />;
  }

  if (!isLoggedIn || !user?.token) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (!isAdminRole(user)) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default AdminRoute;
