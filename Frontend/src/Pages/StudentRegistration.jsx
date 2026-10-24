import React from "react";
import { Navigate } from "react-router-dom";

const StudentRegistration = () => {
  return <Navigate to="/Register?role=student" replace />;
};

export default StudentRegistration;
