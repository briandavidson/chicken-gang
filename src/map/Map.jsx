import React from 'react'
import { GoogleMap } from '@react-google-maps/api'
import './Map.scss'

const Map = () => {
  return (
    <GoogleMap zoom={13} center={{lat: 42.637760, lng: -83.292260}} mapContainerClassName="map-container"></GoogleMap>
  )
}

export default Map
