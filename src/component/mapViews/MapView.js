import React, { useEffect, useRef } from 'react';
import { loadModules } from 'esri-loader';
//props.basemap
//props.layerUrl
//props.subLayerArray
//props.mapCenter
//props.zoomLevel
//props.viewHeight
const WebMapView = (props) => {
    const mapRef = useRef();
    useEffect(
      () => {
        // lazy load the required ArcGIS API for JavaScript modules and CSS
        loadModules(['esri/Map', 'esri/views/MapView', 'esri/layers/MapImageLayer'], { css: true })
          .then(([ArcGISMap, MapView, MapImageLayer]) => {
            const map = new ArcGISMap({
              basemap: props.basemap,
              layers: [new MapImageLayer({
                'url': props.layerUrl,
                'sublayers': props.subLayerArray
              })]
            });
  
            // load the map view at the ref's DOM node
            const view = new MapView({
              container: mapRef.current,
              map: map,
              center: props.mapCenter,
              zoom: props.zoomLevel
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
    return <div className='webmap' ref={mapRef} style={{ height:props.viewHeight }} />;
  };

  export default WebMapView;