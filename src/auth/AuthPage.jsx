import React, {useState, useContext} from 'react'
import { Link, Redirect } from 'react-router-dom'
import AuthContext from "../store/auth-context";
import ChickenGangLogo from '../assets/images/chicken_gang2.png';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import { getDatabase, get, child, ref, set } from "firebase/database";
import app from "../firebase.js"
import './AuthPage.scss'

const AuthPage = () => {
  const [mode, setMode] = useState('login')
  const [enteredEmail, setEnteredEmail] = useState();
  const [enteredPassword, setEnteredPassword] = useState();
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [checkPassword, setCheckPassword] = useState("");

  const authCtx = useContext(AuthContext);
  //
  // if (authCtx.user?.type === "student") {
  //   return <Redirect to="student/dashboard" />;
  // }
  //
  // if (authCtx.user?.type === "teacher") {
  //   return <Redirect to="teacher/dashboard" />;
  // }
  //
  // if (authCtx.user?.type === "admin") {
  //   return <Redirect to="admin" />;
  // }

  // firebase vars
  const auth = getAuth(app);
  const db = ref(getDatabase(app));

  const createAccountHandler = () => {
    if (newPassword === checkPassword && newPassword !== "") {
      createUserWithEmailAndPassword(auth, email, newPassword)
        .then((userCredential) => {
          const user = userCredential.user;
          addUserToDatabase(user);
        })
        .catch((error) => {
          const errorCode = error.code;
          const errorMessage = error.message;
          console.log("errorCode, errorMessage:", errorCode, errorMessage);
        });
    }
  };

  const addUserToDatabase = (user) => {
    let newUser = {
      first_name: "Unknown",
      last_name: "User",
      email: email,
      uid: user.uid,
    }
    set(ref(db, "users/" + user.uid), newUser).then(()=>{
      authCtx.login(newUser)
    })
  };

  const loginHandler = () => {
    signInWithEmailAndPassword(auth, enteredEmail, enteredPassword).then((userCredential) => {
      getUserData(userCredential)
    }).catch((error) => {
      console.dir(error)
    })
  };

  const switchToSignup = () => {
    setMode(() => {
      return 'signup'
    })
  }

  const switchToLogin = () => {
    setMode(() => {
      return 'login'
    })
  }

  const getUserData = (userCredential) => {
    get(child(db, `users/${userCredential.user.uid}`)).then((snapshot) => {
      if (snapshot.exists()) {
        const user = snapshot.val()
        user.uid = userCredential.user.uid
        authCtx.login(user)
      } else {
        console.log("No user data available");
      }
    }).catch((error) => {
      console.error(error);
    });
  };
  return (
    <>
    {mode === 'login' && (
      <div className="auth-page">
        <div className="auth-container">
          <img src={ChickenGangLogo} alt="" className="auth-logo" />
          <hr />
          <p>Enter Email</p>
          <input
            className='auth-input'
            type="email"
            placeholder="email"
            onChange={(event) => setEnteredEmail(event.target.value)}
          />
          <p>Enter Password</p>
          <input
            className='auth-input'
            type="password"
            placeholder="password"
            onChange={(event) => setEnteredPassword(event.target.value)}
          />
          <div className="auth-button-container">
            <button
              className="auth-btn"
              onClick={() => {
                loginHandler();
              }}
              color="info"
            >
              Login
            </button>
            <button className="auth-btn" color="info" onClick={() => switchToSignup()}>
              Signup
            </button>
          </div>
        </div>
      </div>
    )}
    {mode === 'signup' && (
      <div className="auth-page">
      <div className="auth-container">
        <img
          src={ChickenGangLogo}
          alt="class bucks logo"
          className="auth-logo"
        />
        <p>Enter Email</p>
        <input
          className="auth-input"
          type="email"
          placeholder="email"
          onChange={(event) => {
            setEmail(event.target.value);
          }}
        />
        <p>Create Password</p>
        <input
          className="auth-input"
          type="password"
          placeholder="password"
          onChange={(event) => {
            setNewPassword(event.target.value);
          }}
        />
        <p>Confirm Password</p>
        <input
          className="auth-input"
          type="password"
          placeholder="password"
          onChange={(event) => {
            setCheckPassword(event.target.value);
          }}
        />
        <br />
        <div className="auth-button-container">
          <button className="auth-btn" onClick={createAccountHandler}>
            Submit
          </button>
          <button className="auth-btn" onClick={() => switchToLogin()}>Already Have An Account</button>
        </div>
      </div>
    </div>
    )}
    </>
  );
}

export default AuthPage
