import React from "react";
import AuthContext from '../store/auth-context'
import './Dashboard.scss';

const DashboardPage = () => {
  const authCtx = React.useContext(AuthContext)

  const logout = () => {
    authCtx.logout()
  }

  return (
    <>
      <div className="dashboard">
        Welcome {authCtx.user?.email}, to the cynerge chicken experience!
      </div>
      <button onClick={() => logout()}>logout</button>
    </>
  );
};

export default DashboardPage;
