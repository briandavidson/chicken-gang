import React from "react";
import { useLoadScript } from '@react-google-maps/api'
import usePlacesAutocomplete, { getGeocode, getLatLng, } from 'use-places-autocomplete'
import app from '../firebase.js'
import { getDatabase, get, child, ref, update } from "firebase/database";
import AuthContext from '../store/auth-context'
import NavbarComponent from '../navbar/Navbar'
import Map from '../map/Map'
import './Dashboard.scss';

const DashboardPage = () => {
  const [view, setView] = React.useState('map')
  const [zoom, setZoom] = React.useState(13)
  const [lat, setLat] = React.useState(42.637760)
  const [lng, setLng] = React.useState(-83.292260)
  const [chickenPlaces, setChickenPlaces] = React.useState([])
  const [showingNewPlaceForm, setShowingNewPlaceForm] = React.useState(false)
  const [showingPlacesAutocomplete, setShowingPlacesAutocomplete] = React.useState(true)
  const [userScoreOverall, setUserScoreOverall] = React.useState(0)
  const [userScoreJuiciness, setUserScoreJuiciness] = React.useState(0)
  const [userScoreCrispiness, setUserScoreCrispiness] = React.useState(0)
  const [userScoreFlavor, setUserScoreFlavor] = React.useState(0)
  const [userScoreAcquisition, setUserScoreAcquisition] = React.useState(0)
  const [userScoreVisual, setUserScoreVisual] = React.useState(0)
  const [userScoreExperience, setUserScoreExperience] = React.useState(0)
  const [userScoreComments, setUserScoreComments] = React.useState('')
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

  // switch view between list and map mode
  const toggleMapView = () => {
    setView((prev) => {
      if (prev === 'list') {
        return 'map'
      } else {
        return 'list'
      }
    })
  }

  const clickNewPlace = () => {
    setView('map')
    setShowingPlacesAutocomplete(true)
  }

  // gets average scores (scores from all users)
  const getPlaceAverages = async (place_uid) => {
    let placeData = await get(child(db, `places/${place_uid}/averages/`)).then((snapshot) => {
      return snapshot.val()
    })
    return placeData
  }

  // gets scores for places the user has visited
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

  // submit user review
  const createNewPlace = () => {
    let updates = {}
    updates[`users/${authCtx.user.uid}/places/${selected.place_id}`] = {
      coordinates: selected.coordinates,
      description: selected.description,
      scores: {
        overall: userScoreOverall,
        crispiness: userScoreCrispiness,
        juiciness: userScoreJuiciness,
        flavor: userScoreFlavor,
        acquisition: userScoreAcquisition,
        visual: userScoreVisual,
        experience: userScoreExperience,
        comments: userScoreComments
      }
    }
    updates[`places/${selected.place_id}/description`] = selected.description
    updates[`places/${selected.place_id}/coordinates`] = selected.coordinates
    updates[`places/${selected.place_id}/user_scores/${authCtx.user.uid}/overall`] = userScoreOverall
    updates[`places/${selected.place_id}/user_scores/${authCtx.user.uid}/crispiness`] = userScoreCrispiness
    updates[`places/${selected.place_id}/user_scores/${authCtx.user.uid}/juiciness`] = userScoreJuiciness
    updates[`places/${selected.place_id}/user_scores/${authCtx.user.uid}/flavor`] = userScoreFlavor
    updates[`places/${selected.place_id}/user_scores/${authCtx.user.uid}/acquisition`] = userScoreAcquisition
    updates[`places/${selected.place_id}/user_scores/${authCtx.user.uid}/visual`] = userScoreVisual
    updates[`places/${selected.place_id}/user_scores/${authCtx.user.uid}/experience`] = userScoreExperience
    updates[`places/${selected.place_id}/user_scores/${authCtx.user.uid}/comments`] = userScoreComments
    update((db), updates).then(() => {
      setShowingNewPlaceForm(false)
      setShowingPlacesAutocomplete(true)
      setView('map')
      getChickenScores()
    })
  }

  const selectPlaceFromList = (place) => {
    setLat(place.coordinates.lat)
    setLng(place.coordinates.lng)
    setZoom(13)
    setUserScoreOverall(place.scores.overall)
    setUserScoreFlavor(place.scores.flavor)
    setUserScoreVisual(place.scores.visual)
    setUserScoreComments(place.scores.comments)
    setUserScoreJuiciness(place.scores.juiciness)
    setUserScoreCrispiness(place.scores.crispiness)
    setUserScoreAcquisition(place.scores.acquisition)
    setSelected(place)
    setShowingNewPlaceForm(true)
  }

  // autocomplete place search
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
      // get the scores for the selected place or set scores to 0 if the place is new
      let existingReview = chickenPlaces.find((chickenPlace) => chickenPlace.uid === place.place_id)
      if (existingReview) {
        setUserScoreOverall(existingReview.scores.overall)
        setUserScoreFlavor(existingReview.scores.flavor)
        setUserScoreVisual(existingReview.scores.visual)
        setUserScoreComments(existingReview.scores.comments)
        setUserScoreJuiciness(existingReview.scores.juiciness)
        setUserScoreCrispiness(existingReview.scores.crispiness)
        setUserScoreAcquisition(existingReview.scores.acquisition)
      } else {
        setUserScoreOverall(0)
        setUserScoreFlavor(0)
        setUserScoreVisual(0)
        setUserScoreComments('')
        setUserScoreJuiciness(0)
        setUserScoreCrispiness(0)
        setUserScoreAcquisition(0)
      }
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

  // list of places user has reviewed
  const ChickenPlacesList = () => {
    return (
      <>
        {chickenPlaces?.length > 0 && (
          <div className="chicken-places-list">
            <div className="column-headers">
              <span style={{'width': 'calc(50% - 40px)', 'textAlign': 'left'}}>Place</span>
              <span style={{'width': 'calc(25% - 40px)', 'textAlign': 'center'}}>Your Score</span>
              <span style={{'width': 'calc(25% - 40px)', 'textAlign': 'center'}}>Chicken Gang Score</span>
            </div>
            <div className="chicken-places">
              {chickenPlaces.map((place, i) => (
                <div className="chicken-place" key={i} onClick={() => selectPlaceFromList(place)}>
                  <span style={{'width': 'calc(50% - 40px)', 'textAlign': 'left'}}>{place.description}</span>
                  <span className="chicken-place-score">{place.scores?.overall}</span>
                  <span className="chicken-place-score">{place.averages?.overall}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        {chickenPlaces?.length === 0 && (
          <div className="chicken-places-list">
            <div className="no-reviews">
              <span>What, don't you like chicken? Search for a chicken place and leave a review to get started!</span>
            </div>
          </div>
        )}
      </>
    )
  }

  const ActionButtons = () => {
    return (
      <div className={view === 'list' ? 'action-buttons list-mode' : 'action-buttons'}>
        <span onClick={() => clickNewPlace()} className="action-button new-place">+</span>
      </div>
    )
  }

  return (
    <>
      <NavbarComponent/>
      {view === 'list' && (
        <div className="dashboard">
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
              <ChickenPlacesList/>
              {showingPlacesAutocomplete && (
                <div className="places-container">
                  <PlacesAutocomplete setSelected={setSelected}/>
                </div>
              )}
              <Map zoom={zoom} lat={lat} lng={lng}/>
            </>
          )}
        </div>
      )}
      {showingNewPlaceForm && (
        <>
          <div className="new-place-form">
            <span className="input-label description">{selected?.description}</span>
            <span className="input-label">Overall Score: {userScoreOverall}</span>
            <input
              className="place-score-input"
              type="range"
              min="0"
              max="10"
              step=".1"
              value={userScoreOverall}
              onChange={(event) => setUserScoreOverall(event.target.value)}
            />
            <span className="input-label">Crispiness: {userScoreCrispiness}</span>
            <input
              className="place-score-input"
              type="range"
              min="0"
              max="10"
              step=".1"
              value={userScoreCrispiness}
              onChange={(event) => setUserScoreCrispiness(event.target.value)}
            />
            <span className="input-label">Juiciness: {userScoreJuiciness}</span>
            <input
              className="place-score-input"
              type="range"
              min="0"
              max="10"
              step=".1"
              value={userScoreJuiciness}
              onChange={(event) => setUserScoreJuiciness(event.target.value)}
            />
            <span className="input-label">Seasoning/Flavor: {userScoreFlavor}</span>
            <input
              className="place-score-input"
              type="range"
              min="0"
              max="10"
              step=".1"
              value={userScoreFlavor}
              onChange={(event) => setUserScoreFlavor(event.target.value)}
            />
            <span className="input-label">Visual Appeal: {userScoreVisual}</span>
            <input
              className="place-score-input"
              type="range"
              min="0"
              max="10"
              step=".1"
              value={userScoreVisual}
              onChange={(event) => setUserScoreVisual(event.target.value)}
            />
            <span className="input-label">Chicken Acquisition (How easy was it to get the chicken?): {userScoreAcquisition}</span>
            <input
              className="place-score-input"
              type="range"
              min="0"
              max="10"
              step=".1"
              value={userScoreAcquisition}
              onChange={(event) => setUserScoreAcquisition(event.target.value)}
            />
            <span className="input-label">Chicken Experience (How did the chicken make you feel? How was the dining experience? How was the atmosphere?): {userScoreExperience}</span>
            <input
              className="place-score-input"
              type="range"
              min="0"
              max="10"
              step=".1"
              value={userScoreExperience}
              onChange={(event) => setUserScoreExperience(event.target.value)}
            />
            <span className="input-label">Comments</span>
            <textarea
              className="place-score-input comments"
              value={userScoreComments}
              onChange={(event) => setUserScoreComments(event.target.value)}
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
