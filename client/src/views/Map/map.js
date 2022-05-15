
import {StaticMap,NavigationControl,GeolocateControl} from 'react-map-gl';
import React, {useState,useRef, useCallback} from 'react';
import Geocoder from 'react-map-gl-geocoder';
import MapGL from "react-map-gl";
import Directions from './directions'
import mapboxgl from 'mapbox-gl';
// @ts-ignore
// eslint-disable-next-line import/no-webpack-loader-syntax
mapboxgl.workerClass = require('worker-loader!mapbox-gl/dist/mapbox-gl-csp-worker').default;


// Set your mapbox access token here
const MAPBOX_ACCESS_TOKEN = 'pk.eyJ1Ijoid2ViY29kZXJ6IiwiYSI6ImNrcjZ1N3oxeDB0cHoyd3FsYjk0am9kY3MifQ.lw9n5DtqV-PjMyL4k6jwQA';
mapboxgl.accessToken= MAPBOX_ACCESS_TOKEN



const NAV_CONTROL_STYLE = {
  position: 'fixed',
  bottom: 30,
  right :10
};




function GeoLocate() {
  const geolocateControlStyle= {
    position: 'fixed',
    right: 10,
    bottom: 118
  };
  return (
    
    <GeolocateControl
      style={geolocateControlStyle}
      positionOptions={{enableHighAccuracy: true}}
      trackUserLocation={true}
      auto = {false}
    />
  );
}



function Map() {
  const [viewport, setViewport] = useState({
    latitude: 37.7577,
    longitude: -122.4376,
    zoom: 8
  });
  const mapRef = useRef();
  const handleViewportChange = useCallback(
    (newViewport) => setViewport(newViewport),
    []
  );

  // if you are happy with Geocoder default settings, you can just use handleViewportChange directly
  const handleGeocoderViewportChange = useCallback(
    (newViewport) => {
      const geocoderDefaultOverrides = { transitionDuration: 1000 };

      return handleViewportChange({
        ...newViewport,
        ...geocoderDefaultOverrides
      });
    },
    [handleViewportChange]
  );

  // TODO remove directions pane
  return (
    <div style={{ height: "100vh" }}>

      <MapGL
        ref={mapRef}
        {...viewport}
        width="100%"
        height="100%"
        StaticMap={StaticMap}
        onViewportChange={handleViewportChange}
        mapboxApiAccessToken={MAPBOX_ACCESS_TOKEN}

      > 
        <Geocoder
          mapRef={mapRef}
          onViewportChange={handleGeocoderViewportChange}
          mapboxApiAccessToken={MAPBOX_ACCESS_TOKEN}
          position = "top-left"
        />
      <NavigationControl style={NAV_CONTROL_STYLE} />
     <GeoLocate/>
     <Directions mapRef={mapRef} mapboxApiAccessToken={MAPBOX_ACCESS_TOKEN} overflow-x = "scroll"/>
      </MapGL>
    </div>
  );
};


export default Map
