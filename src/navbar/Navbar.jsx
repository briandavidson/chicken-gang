import React from "react";
import AuthContext from '../store/auth-context'
import Avatar from '../assets/images/avatar.png';
import './Navbar.scss';

const NavbarComponent = () => {
  const authCtx = React.useContext(AuthContext)

  const logout = () => {
    authCtx.logout()
  }

  return (
    <>
      <div className="navbar">
        <span className="navbar-text">Chicken Gang</span>
        <img src={Avatar} alt="" className="avatar-image" />
        <span className="logout-button" onClick={() => logout()}>logout</span>
      </div>
    </>
  );
};

export default NavbarComponent;
