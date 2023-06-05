import React from "react";
import { GoogleMap, useLoadScript, Marker } from '@react-google-maps/api'
import usePlacesAutocomplete, { getGeocode, getLatLng, } from 'use-places-autocomplete'
import app from '../firebase.js'
import { getDatabase, get, child, ref, update } from "firebase/database";
import AuthContext from '../store/auth-context'
import NavbarComponent from '../navbar/Navbar'
import Map from '../map/Map'
import './Dashboard.scss';

const DashboardPage = () => {
  const [view, setView] = React.useState('list')
  const [zoom, setZoom] = React.useState(13)
  const [lat, setLat] = React.useState(42.637760)
  const [lng, setLng] = React.useState(-83.292260)
  const [chickenPlaces, setChickenPlaces] = React.useState([])
  const [showingNewPlaceForm, setShowingNewPlaceForm] = React.useState(false)
  const [showingPlacesAutocomplete, setShowingPlacesAutocomplete] = React.useState(false)
  const [newPlaceName, setNewPlaceName] = React.useState('')
  const [newPlaceScore, setNewPlaceScore] = React.useState(0)
  const [selected, setSelected] = React.useState(null)
  const authCtx = React.useContext(AuthContext)
  const db = ref(getDatabase(app));

  const { isLoaded } = useLoadScript({
    googleMapsApiKey: process.env.REACT_APP_MAP_API_KEY,
    libraries: ['places']
  })

  React.useEffect(() => {
    getChickenScores()
  }, [authCtx.user])

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

  const getPlaceAverages = async (place_uid) => {
    let placeData = await get(child(db, `places/${place_uid}/averages/`)).then((snapshot) => {
      return snapshot.val()
    })
    return placeData
  }

  const getChickenScores = async () => {
    get(child(db, `/users/${authCtx?.user?.uid}/places`)).then(async (snapshot) => {
      let places = [];
      let placesData = snapshot.val()
      for (var place_id in placesData) {
        let place = placesData[place_id]
        place.uid = place_id;
        let placeAverages = await getPlaceAverages(place.uid)
        place.averages = placeAverages
        places.push(place);
      }
      setChickenPlaces(places)
    });
  }

  const createNewPlace = () => {
    let updates = {}
    updates[`users/${authCtx.user.uid}/places/${selected.place_id}`] = {
      coordinates: selected.coordinates,
      description: selected.description,
      score: newPlaceScore
    }
    updates[`places/${selected.place_id}/description`] = selected.description
    updates[`places/${selected.place_id}/coordinates`] = selected.coordinates
    updates[`places/${selected.place_id}/scores/${authCtx.user.uid}/overall`] = newPlaceScore
    update((db), updates).then(() => {
      setShowingNewPlaceForm(false)
      setShowingPlacesAutocomplete(false)
      setView('list')
      getChickenScores()
    })
  }

  const PlacesAutocomplete = ({setSelected}) => {
    const {
      ready,
      value,
      setValue,
      suggestions: {status, data},
      clearSuggestions,
    } = usePlacesAutocomplete()

    const handleSelect = async (place) => {
      const results = await getGeocode({address: place.description})
      let lat_lng = await getLatLng(results[0])
      setLat(lat_lng.lat)
      setLng(lat_lng.lng)
      setSelected((prev) => {
        return {
          coordinates: lat_lng,
          place_id: place.place_id,
          description: place.description
        }
      })
      setShowingNewPlaceForm(true)
    }

    return (
      <>
        <input value={value} onChange={e => setValue(e.target.value)} disabled={!ready} className="places-input" placeholder="Search For Chicken"/>
          {status === "OK" && (
            <div className="places-results">
            {data.map((place) => (
              <span onClick={() => handleSelect(place)} className="places-result" key={place.place_id} value={place.description}>{place.description}</span>
            ))}
            </div>
          )}
      </>
    )
  }

  const ChickenPlacesList = () => {
    return (
      <>
        {chickenPlaces?.length > 0 && (
          <div className="chicken-places-list">
            <div className="column-headers">
              <span style={{'width': '50%', 'textAlign': 'left'}}>Place</span>
              <span style={{'width': '25%', 'textAlign': 'center'}}>Your Score</span>
              <span style={{'width': '25%', 'textAlign': 'center'}}>Chicken Gang Score</span>
            </div>
            <div className="chicken-places">
              {chickenPlaces.map((place, i) => (
                <div className="chicken-place" key={i}>
                  <span style={{'width': '50%', 'textAlign': 'left'}}>{place.description}</span>
                  <span style={{'width': '25%', 'textAlign': 'center'}}>{place.score}</span>
                  <span style={{'width': '25%', 'textAlign': 'center'}}>{place.averages.overall}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        {chickenPlaces?.length === 0 && (
          <div className="no-reviews">
            <span>What, don't you like chicken? You haven't reviewed any places! Click on the '+' button to get started!</span>
          </div>
        )}
      </>
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
              <Map zoom={zoom} lat={lat} lng={lng}/>
            </>
          )}
        </div>
      )}
      {showingNewPlaceForm && (
        <>
          <div className="modal-background" onClick={() => setShowingNewPlaceForm(false)}></div>
          <div className="modal new-place-modal">
            <span className="input-label">{selected.description}</span>
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
