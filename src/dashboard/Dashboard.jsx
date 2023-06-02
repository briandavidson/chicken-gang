import React from "react";
import AuthContext from '../store/auth-context'
import NavbarComponent from '../navbar/Navbar'
import './Dashboard.scss';

const DashboardPage = () => {
  const [chickenPlaces, setChickenPlaces] = React.useState([])
  const authCtx = React.useContext(AuthContext)

  React.useEffect(() => {
    setChickenPlaces((prev) => {
      return [{
        name: 'Honey Wings',
        score: 6.8
      }, {
        name: `My Ex-Wife's Famous Chicken`,
        score: 6.5
      }, {
        name: `Dave's Hot Chicken`,
        score: 9.7
      }, {
        name: `Chicken Shack`,
        score: 4.2
      }, {
        name: `Noori Chicken`,
        score: 9.5
      }]
    })
  }, [])

  const logout = () => {
    authCtx.logout()
  }

  return (
    <>
      <NavbarComponent/>
      <div className="dashboard">
        <div className="chicken-places-list">
          <div className="column-headers">
            <span>Place</span>
            <span>Score</span>
          </div>
          <div className="chicken-places">
            {chickenPlaces.map((place, i) => (
              <div className="chicken-place" key={i}>
                <span>{place.name}</span>
                <span>{place.score}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default DashboardPage;
