import {GeolocateControl} from 'react-map-gl';

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

  export default GeoLocate;