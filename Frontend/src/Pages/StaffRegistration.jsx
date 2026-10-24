import React from "react";
import { Navigate } from "react-router-dom";

const Registration = () => {
  return <Navigate to="/Register?role=staff" replace />;
};

export default Registration;
