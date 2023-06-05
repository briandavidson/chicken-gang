import React, {useState, useContext} from 'react'
import { Redirect } from 'react-router-dom'
import AuthContext from "../store/auth-context";
import ChickenGangLogo from '../assets/images/chicken_gang3.png';
import bok1 from '../assets/sounds/bok1.mp3'
import bok2 from '../assets/sounds/bok2.mp3'
import bok3 from '../assets/sounds/bok3.mp3'
import bigok from '../assets/sounds/bigok.mp3'
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

  // redirect logged in user to private route
  if (authCtx.user) {
    return <Redirect to="dashboard" />;
  }

  // firebase vars
  const auth = getAuth(app);
  const db = getDatabase(app);

  // create user record in firebase auth
  const createAccountHandler = () => {
    if (newPassword === checkPassword && newPassword !== "") {
      playBigokSound()
      createUserWithEmailAndPassword(auth, email, newPassword)
        .then((userCredential) => {
          const user = userCredential.user;
          addUserToDatabase(user);
        })
        .catch((error) => {
          const errorCode = error.code;
          const errorMessage = error.message;
          console.log("errorCode, errorMessage:", errorCode, errorMessage);
          if (errorCode === "auth/weak-password") {
            alert("Password must be 6 characters!");
          }
        });
    }
  };

  // create user record in firebase db
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
    playBigokSound()
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

  const playBokSound = () => {
    let random_bok = Math.floor(Math.random() * 3);
    let bok = new Audio(bok1)
    if (random_bok === 1) {
      bok = new Audio(bok2)
    }
    if (random_bok === 2) {
      bok = new Audio(bok3)
    }
    bok.play()
  }

  const playBigokSound = () => {
    let bigok_sound = new Audio(bigok)
    bigok_sound.play()
  }

  const changeLoginEmail = (event) => {
    playBokSound()
    setEnteredEmail(event.target.value)
  }

  const changeLoginPassword = (event) => {
    playBokSound()
    setEnteredPassword(event.target.value)
  }

  const changeSignupEmail = (event) => {
    playBokSound()
    setEmail(event.target.value);
  }

  const changeSignupNewPassword = (event) => {
    playBokSound()
    setNewPassword(event.target.value);
  }

  const changeSignupCheckPassword = (event) => {
    playBokSound()
    setCheckPassword(event.target.value)
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
        <div className="wallpaper"></div>
        <div className="auth-container">
          <img src={ChickenGangLogo} alt="" className="auth-logo" />
          <hr />
          <p>Enter Email</p>
          <input
            className='auth-input'
            type="email"
            placeholder="email"
            onChange={(event) => changeLoginEmail(event)}
          />
          <p>Enter Password</p>
          <input
            className='auth-input'
            type="password"
            placeholder="password"
            onChange={(event) => changeLoginPassword(event)}
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
        <div className="wallpaper"></div>
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
              changeSignupEmail(event)
            }}
          />
          <p>Create Password</p>
          <input
            className="auth-input"
            type="password"
            placeholder="password"
            onChange={(event) => {
              changeSignupNewPassword(event)
            }}
          />
          <p>Confirm Password</p>
          <input
            className="auth-input"
            type="password"
            placeholder="password"
            onChange={(event) => {
              changeSignupCheckPassword(event)
            }}
          />
          <br/>
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
