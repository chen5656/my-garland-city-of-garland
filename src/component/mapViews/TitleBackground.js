import React, { useEffect, useRef } from 'react';
import { loadModules } from 'esri-loader';

const WebMapView = () => {
    const mapRef = useRef();
    useEffect(
      () => {
        // lazy load the required ArcGIS API for JavaScript modules and CSS
        loadModules(['esri/Map', 'esri/views/MapView', 'esri/layers/MapImageLayer'], { css: true })
          .then(([ArcGISMap, MapView, MapImageLayer]) => {
            const map = new ArcGISMap({
              basemap: 'gray',
              layers: [new MapImageLayer({
                'url': 'https://maps.garlandtx.gov/arcgis/rest/services/WebApps/MyGarland/MapServer',
                'sublayers': [{
                  'id': 1,
                  'visible': true
                }]
              })]
            });
  
            // load the map view at the ref's DOM node
            const view = new MapView({
              container: mapRef.current,
              map: map,
              center: [-96.636269, 32.91676],
              zoom: 12
            });
  
            return () => {
              if (view) {
                // destroy the map view
                view.destroy();
              }
            };
          });
      }
    );
    return <div className='webmap' ref={mapRef} style={{ height: '350px' }} />;
  };

  export default WebMapView;