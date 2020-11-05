import React, { useEffect, useRef } from 'react';
import { loadModules } from 'esri-loader';
//props.basemap
//props.mapCenter
//props.zoomLevel
//props.viewHeight
//props.layerList
const WebMapView = (props) => {
  const mapRef = useRef();
  useEffect(
    () => {
      // lazy load the required ArcGIS API for JavaScript modules and CSS
      loadModules(['esri/Map', 'esri/views/MapView', 'esri/layers/MapImageLayer',
        'esri/layers/FeatureLayer'], { css: true })
        .then(([ArcGISMap, MapView, MapImageLayer, FeatureLayer]) => {
          var layers = [];
          if (props.layerList) {
            layers = props.layerList.map((layer) => {
              switch (layer.type) {
                case 'feature-layer':
                  return  new FeatureLayer({
                    'url': layer.url,
                    'outFields': ["*"],
                    // 'popupTemplate': appSetting.subMap.crimeMap.popUpTemplate
                });
                case 'map-image-layer':
                  return new MapImageLayer({
                    'url': layer.url,
                    'sublayers': layer.sublayers,
                  })
              }

            });
          } else {
            layers.push(new MapImageLayer({
              'url': 'https://maps.garlandtx.gov/arcgis/rest/services/WebApps/MyGarland/MapServer',
              'sublayers': [{ 'id': 1, 'visible': true }],
            }))
          }

          const map = new ArcGISMap({
            basemap: props.basemap ? props.basemap : 'topo',
            layers: layers
          });

          // load the map view at the ref's DOM node
          const view = new MapView({
            container: mapRef.current,
            map: map,
            center: props.mapCenter ? props.mapCenter : [-96.636269, 32.91676],
            zoom: props.zoomLevel ? props.zoomLevel : 12,
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
  return <div className='webmap' ref={mapRef} style={{ height: props.viewHeight ? props.viewHeight : '300px' }} />;
};

export default WebMapView;