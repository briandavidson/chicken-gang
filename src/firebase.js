import { initializeApp } from "firebase/app";

let firebaseConfig = {
  apiKey: process.env.REACT_APP_API_KEY,
  authDomain: process.env.REACT_APP_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_PROJECT_ID,
  storageBucket: process.env.REACT_APP_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_APP_ID,
  measurementId: process.env.REACT_APP_MEASUREMENT_ID,
  databaseURL: process.env.REACT_APP_DATABASE_URL
};

let mode = process.env.REACT_APP_MODE || 'dev'
if (mode === 'prod') {
  firebaseConfig = {
    apiKey: process.env.REACT_APP_API_KEY_PROD,
    authDomain: process.env.REACT_APP_AUTH_DOMAIN_PROD,
    projectId: process.env.REACT_APP_PROJECT_ID_PROD,
    storageBucket: process.env.REACT_APP_STORAGE_BUCKET_PROD,
    messagingSenderId: process.env.REACT_APP_MESSAGING_SENDER_ID_PROD,
    appId: process.env.REACT_APP_APP_ID_PROD,
    measurementId: process.env.REACT_APP_MEASUREMENT_ID_PROD,
    databaseURL: process.env.REACT_APP_DATABASE_URL_PROD
  };
}

const app = initializeApp(firebaseConfig);

export default app;
