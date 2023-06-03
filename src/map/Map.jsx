import React from 'react'
import { GoogleMap } from '@react-google-maps/api'
import './Map.scss'

const Map = () => {
  return (
    <GoogleMap zoom={10} center={{lat: 44, lng: -80}} mapContainerClassName="map-container"></GoogleMap>
  )
}

export default Map
