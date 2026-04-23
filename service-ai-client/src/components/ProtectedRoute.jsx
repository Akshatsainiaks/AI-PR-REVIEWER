import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { useEffect, useState } from "react";

const ProtectedRoute = ({ children }) => {
  const [token, setToken] = useState(null);
  const user = useSelector((state) => state.auth);

  useEffect(() => {
    setToken(user.token);
  }, [user]);

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;