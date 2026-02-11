// routes/PublicRoute.jsx
import { Navigate } from "react-router-dom";
import { getAccessToken } from "../utils/auth";

const PublicRoute = ({ children }) => {
  const token = getAccessToken();

  if (token) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default PublicRoute;
