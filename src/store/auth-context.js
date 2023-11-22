import React, { useState } from "react";
import { useHistory } from 'react-router-dom';
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getDatabase, get, child, ref} from "firebase/database";
import app from '../firebase.js'

const AuthContext = React.createContext({
  user: null,
  login: () => {},
  logout: () => {},
});

const db = ref(getDatabase(app));
const auth = getAuth(app);

export const AuthContextProvider = (props) => {
  const [user, setUser] = useState(null);
  let history = useHistory();

  React.useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        get(child(db, `users/${firebaseUser.uid}`)).then((snapshot) => {
          if (snapshot.exists()) {
            console.log('snapshot exists')
            console.dir(firebaseUser)
            let authedUser = snapshot.val()
            authedUser.uid = firebaseUser.uid
            if (firebaseUser.emailVerified) {
              setUser(authedUser)
            } else {
              history.push('/verify')
            }
          } else {
            console.log('no user data in db')
            console.dir(firebaseUser)
            history.push('/verify')
            return null
          }
        }).catch((error) => {
          console.error(error);
        });
      } else {
        setUser(null)
        history.push('/')
      }
    })
    return unsubscribe;
  }, [history])

  const loginHandler = (loggedInUser) => {
    setUser(loggedInUser);
  };

  const logoutHandler = () => {
    auth.signOut()
  };

  const contextValue = {
    user: user,
    login: loginHandler,
    logout: logoutHandler,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {props.children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
