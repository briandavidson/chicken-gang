import './App.scss';
import {Route, Switch} from "react-router-dom";
import AuthPage from './auth/AuthPage.jsx'
import DashboardPage from './dashboard/Dashboard.jsx'

const App = () => {
  return (
    <>
      <Switch>

        {/* public routes */}
        <Route path="/" exact>
          <AuthPage/>
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
