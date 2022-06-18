import React from 'react';

import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import '@mapbox/mapbox-gl-directions/dist/mapbox-gl-directions.css';
import MapboxDirections from '@mapbox/mapbox-gl-directions/dist/mapbox-gl-directions'
import MapboxGeocoder from '@mapbox/mapbox-gl-geocoder';
import MapboxTraffic from '@mapbox/mapbox-gl-traffic';
import '@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css';

import maplibregl from 'maplibre-gl';

import { ArcLayer, ContourLayer } from 'deck.gl';
import { COORDINATE_SYSTEM } from '@deck.gl/core';
import { Deck } from "@deck.gl/core";
import GL from '@luma.gl/constants';
import { ScatterplotLayer } from "@deck.gl/layers";
import { MapboxLayer } from "@deck.gl/mapbox";
import { TerrainLayer } from '@deck.gl/geo-layers';
import { PointCloudLayer } from '@deck.gl/layers';
import { GeoJsonLayer, PolygonLayer } from '@deck.gl/layers';
import { LightingEffect, AmbientLight, _SunLight as SunLight } from '@deck.gl/core';

import { scaleThreshold } from 'd3-scale';
import MapState from 'react-map-gl/src/utils/map-state';

import logo from "assets/img/webi-rides.png"

import { Fab } from "@material-ui/core";
import { LocalTaxi } from "@material-ui/icons";

import axios from 'axios';


mapboxgl.accessToken = 'pk.eyJ1Ijoid2ViY29kZXJ6IiwiYSI6ImNrcjZ1N3oxeDB0cHoyd3FsYjk0am9kY3MifQ.lw9n5DtqV-PjMyL4k6jwQA';




// eslint-disable-line


export const COLOR_SCALE = scaleThreshold()
  .domain([-0.6, -0.45, -0.3, -0.15, 0, 0.15, 0.3, 0.45, 0.6, 0.75, 0.9, 1.05, 1.2])
  .range([
    [65, 182, 196],
    [127, 205, 187],
    [199, 233, 180],
    [237, 248, 177],
    // zero
    [255, 255, 204],
    [255, 237, 160],
    [254, 217, 118],
    [254, 178, 76],
    [253, 141, 60],
    [252, 78, 42],
    [227, 26, 28],
    [189, 0, 38],
    [128, 0, 38]
  ]);


class Map extends React.Component {

  constructor() {
    super();
    this.mapRef = React.createRef();
  }

  componentDidMount() {


    // Creates new map instance
    const map = new maplibregl.Map({
      container: this.mapRef.current,
      style: 'https://api.maptiler.com/maps/streets/style.json?key=Z2xVIwqvxK06NnhO6lTM', // stylesheet location - https://api.maptiler.com/maps/streets/style.json?key=Z2xVIwqvxK06NnhO6lTM
      center: [-122.5233, 37.6493], // starting position [lng, lat]
      zoom: 9 // starting zoom
    });

    const directions = new MapboxDirections({
      accessToken: mapboxgl.accessToken,
      unit: 'imperial',
      profile: 'mapbox/driving',
      controls: {
        instructions: false,
        profileSwitcher: false
      }
    });
    directions.on('route', function(response) {
      const origin = directions.getOrigin().geometry.coordinates;
      const destination = directions.getDestination().geometry.coordinates;
      localStorage.setItem('sourceLng', origin[0]);
      localStorage.setItem('sourceLat', origin[1]);
      localStorage.setItem('destinationLng', destination[0]);
      localStorage.setItem('destinationLat', destination[1]);

      axios.get('https://api.geoapify.com/v1/geocode/reverse?format=json&apiKey=df9f30a3e5bb4a80839133682e3489e5&lat=' + localStorage.getItem('sourceLat') + '&lon=' + localStorage.getItem('sourceLng'))
        .then((response) => {
          localStorage.setItem('sourceName', response.data.results[0].formatted);
        }).catch ((e) => {
          console.log(e);
        });
      
      axios.get('https://api.geoapify.com/v1/geocode/reverse?format=json&apiKey=df9f30a3e5bb4a80839133682e3489e5&lat=' + localStorage.getItem('destinationLat') + '&lon=' + localStorage.getItem('destinationLng'))
        .then((response) => {
          localStorage.setItem('destinationName', response.data.features[0].properties.display_name);
        }).catch ((e) => {
          console.log(e);
        });

      const routeUrl = 'https://api.geoapify.com/v1/routing?waypoints='+ localStorage.getItem('sourceLat') +'%2C' + localStorage.getItem('sourceLng') + '%7C'
        + localStorage.getItem('destinationLat') + '%2C' + localStorage.getItem('destinationLng') + '&mode=drive&units=imperial'
        + '&apiKey=df9f30a3e5bb4a80839133682e3489e5';
      axios.get(routeUrl)
        .then((response) => {
          localStorage.setItem('distance', response.data.features[0].properties.distance.toFixed(1) + ' miles');
          const timeMinutes = Math.round(response.data.features[0].properties.time / 60);
          localStorage.setItem('time', timeMinutes + ' minutes');
        }).catch ((e) => {
          console.log(e);
        });
    });



    // Integrates directions control with map

    var geocoder = new MapboxGeocoder({ // Initialize the geocoder
      accessToken: mapboxgl.accessToken, // Set the access token
      mapboxgl: mapboxgl, // Set the mapbox-gl instance
      marker: false, // Do not use the default marker style
    });

    const ambientLight = new AmbientLight({
      color: [255, 255, 255],
      intensity: 1.0
    });
    const dirLight = new SunLight({
      timestamp: Date.UTC(2019, 7, 1, 22),
      color: [255, 255, 255],
      intensity: 1.0,
      _shadow: true
    });
    const lightingEffect = new LightingEffect({ ambientLight, dirLight });
    lightingEffect.shadowColor = [0, 0, 0, 0.5];


    // Add geolocate control to the map.
    map.addControl(
      new mapboxgl.GeolocateControl({
        positionOptions: {
          enableHighAccuracy: true
        },
        trackUserLocation: true
      }), "top-right"
    );
    //nav controls
    map.addControl(new mapboxgl.NavigationControl(), "top-right");
    //map.addControl(new MapboxTraffic(),"top-right"); //requires mapbox-gl map
    map.addControl(directions, 'top-left');


    //deck layers

    //scatterplot
    const scatterLayer = new ScatterplotLayer({
      id: "scatter-plot",
      data:
        "https://raw.githubusercontent.com/visgl/deck.gl-data/master/examples/scatterplot/manhattan.json", //will take json geo json etc
      radiusScale: 40,
      radiusMinPixels: 0.5,
      getPosition: d => [d[0], d[1]],
      getFillColor: [255, 0, 0, 100],
      parameters: {
        depthMask: true,
        depthTest: true,
        blendFunc: [GL.SRC_ALPHA, GL.ONE_MINUS_SRC_ALPHA, GL.ONE, GL.ONE_MINUS_SRC_ALPHA],
        blendEquation: GL.FUNC_ADD
      }
    });

    //terrain
    const terrainLayer = new TerrainLayer({
      elevationDecoder: {
        rScaler: 2,
        gScaler: 0,
        bScaler: 0,
        offset: 0
      },
      // Digital elevation model from https://www.usgs.gov/
      elevationData: 'https://raw.githubusercontent.com/visgl/deck.gl-data/master/website/terrain.png',
      texture: 'https://raw.githubusercontent.com/visgl/deck.gl-data/master/website/terrain-mask.png',
      bounds: [-122.5233, 37.6493, -122.3566, 37.8159],
    });

    const landCover = [[[-123.0, 49.196], [-123.0, 49.324], [-123.306, 49.324], [-123.306, 49.196]]];

    const polygonLayer = new PolygonLayer({
      id: 'ground',
      data: landCover,
      stroked: false,
      getPolygon: f => f,
      getFillColor: [0, 0, 0, 0]
    });

    const geoJSONLayer = new GeoJsonLayer({
      id: 'geojson',
      data: 'https://raw.githubusercontent.com/visgl/deck.gl-data/master/examples/geojson/vancouver-blocks.json',
      opacity: 0.8,
      stroked: false,
      filled: true,
      extruded: true,
      wireframe: true,
      getElevation: f => Math.sqrt(f.properties.valuePerSqm) * 10,
      getFillColor: f => COLOR_SCALE(f.properties.growth),
      getLineColor: [255, 255, 255],
      pickable: true
    });

    //arc layer
    const arclayer = new ArcLayer({
      id: 'deckgl-arc',
      type: ArcLayer,
      data: [
        { source: [-122.3998664, 37.7883697], target: [-122.400068, 37.7900503] }
      ],
      getSourcePosition: d => d.source,
      getTargetPosition: d => d.target,
      getSourceColor: [255, 208, 0],
      getTargetColor: [0, 128, 255],
      getWidth: 8
    });

    // contour layer
    const contourLayer = new ContourLayer({
      id: 'contourLayer',
      data:
        'https://raw.githubusercontent.com/visgl/deck.gl-data/master/examples/screen-grid/ca-transit-stops.json',
      getPosition: d => d,
      contours: [
        { threshold: 1, color: [255, 0, 0], strokeWidth: 4 },
        { threshold: 5, color: [0, 255, 0], strokeWidth: 2 },
        { threshold: [6, 10], color: [0, 0, 255, 128] }
      ]
    });

    //point cloud layer
    const pointCloudLayer = new PointCloudLayer({
      coordinateSystem: COORDINATE_SYSTEM.METER_OFFSETS,
      coordinateOrigin: [-122.4004935, 37.7900486, 100],  // anchor point in longitude/latitude/altitude
      data: [
        { position: [33.22, 109.87, 1.455] }, // meter offsets from the coordinate origin
      ],
    })

    //deck integration
    const deck = new Deck({
      gl: map.painter.context.gl,
      layers: [geoJSONLayer],//scatterLayer, terrainLayer, arclayer, contourLayer, pointCloudLayer ,geoJSONLayer, polygonLayer,
      effects: [lightingEffect],
      initialViewState: {
        latitude: 37.6493,
        longitude: -122.5233,
        zoom: 15
      },
      controller: true
    });


    //add deck layer
    const deckLayers = new MapboxLayer({ id: "deck-gl-layer", deck });
    map.on("load", () => {
      map.addLayer(deckLayers);
    });
  }

  render() {
    return (
      <div style={{width: "100%", height:"80vh"}} ref={this.mapRef}>
        <img src={logo} style={{position:"absolute", left:"10px", bottom:"15px", zIndex:"999"}} width="90" height="75" alt="webI logo"></img>
        <Fab variant="extended"
          color="secondary"
          href="/dash/rider/steps"
          style={{
            position: "absolute",
            right: "55px",
            bottom: "25px",
            zIndex: "1000"
          }}
        >
          <LocalTaxi />
          Ride Now
        </Fab>
      </div>
    );
  }
}

export default Map;
