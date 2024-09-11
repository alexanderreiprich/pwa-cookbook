import { Navigate, Route, RouteProps, useLocation } from "react-router-dom";
import { useAuth } from "./Authentication";

const PrivateRoute = ({children}: {children: any}) => {
  const { currentUser } = useAuth();
  const location = useLocation();
  if (!currentUser) {
    return <Navigate to="/login" state={{from: location}} replace />
   }
  return children; 
}

export default PrivateRoute;