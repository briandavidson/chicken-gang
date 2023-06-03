import React from 'react'
import { GoogleMap, Marker } from '@react-google-maps/api'
import './Map.scss'

const Map = ({zoom, lat, lng}) => {
  return (
    <GoogleMap zoom={zoom} center={{lat: lat, lng: lng}} mapContainerClassName="map-container">
      {(lat && lng) && (
        <Marker position={{lat: lat, lng: lng}}/>
      )}
    </GoogleMap>
  )
}

export default Map
