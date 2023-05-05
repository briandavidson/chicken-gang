import './App.scss';
import {Route, Switch} from "react-router-dom";
import AuthPage from './auth/AuthPage.jsx'

const App = () => {
  return (
    <>
      <Switch>
        {/* public routes */}
        <Route path="/" exact>
          <AuthPage/>
        </Route>
      </Switch>
    </>
  );
}

export default App;
