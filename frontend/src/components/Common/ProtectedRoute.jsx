import React from 'react'
import { useSelector } from 'react-redux'
import { Navigate, useLocation } from 'react-router-dom';
import { getCurrentRoute, getLoginUrl } from '../../utils/authRedirect';


const ProtectedRoute = ({children , role}) => {

  const {user} = useSelector((state)=> state.auth);
  const location = useLocation();

  if (!user) {
    return <Navigate to={getLoginUrl(getCurrentRoute(location))} replace />;
  }
  if (role && user.role !== role) {
    return <Navigate to='/login' replace />
  }
  return children;
}

export default ProtectedRoute