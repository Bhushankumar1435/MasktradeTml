import { Navigate } from "react-router-dom";
 
const AuthRoute = ({ children }) => {
  const token = localStorage.getItem("admin_token");
 
  if (token) {
    return <Navigate to="/" replace />;
  }
 
  return children;
};
 
export default AuthRoute;