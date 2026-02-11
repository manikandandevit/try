// routes/ProtectedRoute.jsx
import { Navigate } from "react-router-dom";
import { getAccessToken } from "../utils/auth";

const ProtectedRoute = ({ children }) => {
  const token = getAccessToken();

  if (!token) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
