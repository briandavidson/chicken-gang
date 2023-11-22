import React, {useState, useContext} from 'react'
import { Redirect } from 'react-router-dom'
import AuthContext from "../store/auth-context";
import { useHistory } from 'react-router-dom';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, sendPasswordResetEmail, sendEmailVerification } from "firebase/auth";
import { getDatabase, get, child, ref, set } from "firebase/database";
import app from "../firebase.js"
import './Verify.scss'

const Verify = () => {
  const [sent, setSent] = React.useState(false)
  const auth = getAuth();
  const authCtx = useContext(AuthContext);
  let history = useHistory();

  React.useEffect(() => {
    if (auth?.currentUser?.emailVerified) {
      goToDashboard()
    }
  }, [authCtx.user])

  const goToDashboard = () => {
    history.push('/dashboard')
  }

  const logout = () => {
    authCtx.logout()
  }

  const resendVerifyEmail = () => {
    sendEmailVerification(auth.currentUser).then(() => {
      setSent((prev) => {
        return true
      })
    });
  }

  return (
    <div className="verify-container">
      <span onClick={() => logout()} className="logout">Log out</span>
      <span>Please verify your email address to ensure the highest quality chicken experience.</span>
      {!sent && (
        <span className="resend" onClick={() => resendVerifyEmail()}>Send verification email</span>
      )}
      {sent && (
        <span className="sent">Check your inbox to verify your account, thanks!</span>
      )}
    </div>
  )
}

export default Verify
