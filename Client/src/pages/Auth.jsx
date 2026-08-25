import React from 'react';
import { useParams, Navigate } from 'react-router-dom';
import Navbar from '../components/AuthComponents/Navbar/Navbar';
import SignUp from '../components/AuthComponents/SignUp/SignUp';
import SignIn from '../components/AuthComponents/SignIn/SignIn';

const Auth = () => {
  const { mode } = useParams(); // "signin" or "signup"

  const renderAuthComponent = () => {
    switch (mode) {
      case 'signin':
        return <SignIn />;
      case 'signup':
        return <SignUp />;
      default:
        return <Navigate to="/auth/signin" replace />;
    }
  };

  return (
    <>
      <Navbar mode={mode} />
      {renderAuthComponent()}
    </>
  );
};

export default Auth;