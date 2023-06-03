import React from "react";
import { GoogleMap, useLoadScript, Marker } from '@react-google-maps/api'
import usePlacesAutocomplete, { getGeocode, getLatLng, } from 'use-places-autocomplete'
import AuthContext from '../store/auth-context'
import NavbarComponent from '../navbar/Navbar'
import Map from '../map/Map'
import './Dashboard.scss';

const DashboardPage = () => {
  const [view, setView] = React.useState('list')
  const [chickenPlaces, setChickenPlaces] = React.useState([])
  const [showingNewPlaceForm, setShowingNewPlaceForm] = React.useState(false)
  const [showingPlacesAutocomplete, setShowingPlacesAutocomplete] = React.useState(false)
  const [newPlaceName, setNewPlaceName] = React.useState('')
  const [newPlaceScore, setNewPlaceScore] = React.useState(0)
  const [selected, setSelected] = React.useState(null)
  const authCtx = React.useContext(AuthContext)

  const { isLoaded } = useLoadScript({
    googleMapsApiKey: process.env.REACT_APP_MAP_API_KEY,
    libraries: ['places']
  })

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

  const toggleMapView = () => {
    setView((prev) => {
      if (prev === 'list') {
        return 'map'
      } else {
        return 'list'
      }
    })
  }

  const changeNewPlaceName = (event) => {
    setNewPlaceName(event.target.value)
  }

  const changeNewPlaceScore = (e) => {
    setNewPlaceScore((prev) => {
      return e.target.value
    })
  }

  const clickNewPlace = () => {
    setView('map')
    setShowingPlacesAutocomplete(true)
  }

  const createNewPlace = () => {
    console.log('create new place')
  }

  const PlacesAutocomplete = ({setSelected}) => {
    const {
      ready,
      value,
      setValue,
      suggestions: {status, data},
      clearSuggestions,
    } = usePlacesAutocomplete()

    return (
      <>
        <input value={value} onChange={e => setValue(e.target.value)} disabled={!ready} className="places-input" placeholder="Search For Chicken"/>
          {status === "OK" && (
            <div className="places-results">
            {data.map(({place_id, description}) => (
              <span className="places-result" key={place_id} value={description}>{description}</span>
            ))}
            </div>
          )}
      </>
    )
  }

  const NewPlaceForm = () => {
    return (
      <>
        <div className="modal new-place-modal">
          <span className="input-label">Name</span>
          <input
            className="place-name-input"
            type="text"
            onChange={(event) => changeNewPlaceName(event)}
          />
          <span className="input-label">Score</span>
          <input
            className="place-score-input"
            type="range"
            min="0"
            max="10"
            step=".1"
            default="0"
            onChange={(event) => changeNewPlaceScore(event)}
          />
        </div>
      </>
    )
  }

  const ChickenPlacesList = () => {
    return (
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
    )
  }

  const ActionButtons = () => {
    return (
      <div className={view === 'list' ? 'action-buttons list-mode' : 'action-buttons'}>
        <span onClick={() => clickNewPlace()} className="action-button new-place">+</span>
        <span onClick={() => toggleMapView()} className="action-button map-view">🚩</span>
      </div>
    )
  }

  return (
    <>
      <NavbarComponent/>
      {view === 'list' && (
        <div className="dashboard">
          <ActionButtons/>
          <ChickenPlacesList/>
        </div>
      )}
      {view === 'map' && (
        <div className="dashboard">
          {!isLoaded && (
            <div>Loading...</div>
          )}
          {isLoaded && (
            <>
              {showingPlacesAutocomplete && (
                <div className="places-container">
                  <PlacesAutocomplete setSelected={setSelected}/>
                </div>
              )}
              <ActionButtons/>
              <Map/>
            </>
          )}
        </div>
      )}
      {showingNewPlaceForm && (
        <>
          <div className="modal-background" onClick={() => setShowingNewPlaceForm(false)}></div>
          <div className="modal new-place-modal">
            <span className="input-label">Name</span>
            <input
              className="place-name-input"
              type="text"
              onChange={(event) => changeNewPlaceName(event)}
            />
            <span className="input-label">Score: {newPlaceScore}</span>
            <input
              className="place-score-input"
              type="range"
              min="0"
              max="10"
              step=".1"
              value={newPlaceScore}
              onChange={(event) => changeNewPlaceScore(event)}
            />
            <div className="modal-buttons">
              <span className="cancel-button" onClick={() => setShowingNewPlaceForm(false)}>Cancel</span>
              <span className="submit-button" onClick={() => createNewPlace()}>Submit</span>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default DashboardPage;
