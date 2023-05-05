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
            let authedUser = snapshot.val()
            authedUser.uid = firebaseUser.uid
            setUser(authedUser)
          } else {
            console.log('no user data in db')
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
