import React from "react";
import useAuthStatus from "../hooks/useAuthStatus";
import LoaderScreen from "./common/Loader";
import { Navigate, Outlet } from "react-router-dom";

const PrivateComponent = () => {
  const { isLoggedIn, checkingUser } = useAuthStatus();

  if (checkingUser) {
    return <LoaderScreen />;
  }

  return isLoggedIn ? <Outlet /> : <Navigate to={"/login"} />;
};

export default PrivateComponent;
