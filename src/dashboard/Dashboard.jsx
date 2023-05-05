import React from "react";
import { Link, useHistory } from "react-router-dom";
import AuthContext from '../store/auth-context'
import { getDatabase, get, child, ref, remove, update, onValue, off } from "firebase/database";
import app from '../firebase.js'
import "./Dashboard.scss";

const DashboardPage = () => {
  const authCtx = React.useContext(AuthContext)
  const user = authCtx.user
  console.dir(user)
  const db = ref(getDatabase(app));
  let history = useHistory();
  return (
    <div className="dashboard">
      Welcome {authCtx.user?.email}, to the cynerge chicken experience!
    </div>
  );
};

export default DashboardPage;
