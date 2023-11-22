import './App.scss';
import {Route, Switch} from "react-router-dom";
import AuthPage from './auth/AuthPage.jsx'
import DashboardPage from './dashboard/Dashboard.jsx'
import Verify from './verify/Verify.jsx'

const App = () => {
  return (
    <>
      <Switch>

        {/* public routes */}
        <Route path="/" exact>
          <AuthPage/>
        </Route>
        <Route path="/verify">
        <Verify/>
        </Route>

        {/* private routes */}
        <Switch>
          <Route path="/dashboard">
            <DashboardPage/>
          </Route>
        </Switch>

      </Switch>
    </>
  );
}

export default App;
