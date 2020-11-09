import React, { useEffect, useRef } from 'react';
import { loadModules } from 'esri-loader';

const WebMapView = (props) => {
  const mapRef = useRef();
  useEffect(
    () => {
      // lazy load the required ArcGIS API for JavaScript modules and CSS
      loadModules(['esri/Map', 'esri/views/MapView', 'esri/layers/MapImageLayer',
        'esri/layers/FeatureLayer', "esri/Graphic"], { css: true })
        .then(([ArcGISMap, MapView, MapImageLayer, FeatureLayer, Graphic]) => {
          var layers = [];
          if (props.layerList) {
            layers = props.layerList.map((layer) => {
              switch (layer.type) {
                case 'feature':
                  let featureLayer = new FeatureLayer({
                    'url': layer.url
                  });
                  if (layer.template) {
                    featureLayer.popupTemplate = layer.template;
                  }
                  return featureLayer;
                case 'map-image':
                  return new MapImageLayer({
                    'url': layer.url,
                    'sublayers': layer.sublayers,
                  })
              }

            });
          } else {
            layers.push(new FeatureLayer({
              url: 'https://maps.garlandtx.gov/arcgis/rest/services/WebApps/MyGarland/MapServer/1'
            }))
          }
          // 79aad46c670740dea5f9e1acf1f3d540
          const map = new ArcGISMap({
            basemap: props.basemap ? props.basemap : 'gray-vector',
            layers: layers
          });

          // load the map view at the ref's DOM node
          const view = new MapView({
            container: mapRef.current,
            map: map,
            center: props.mapCenter ? props.mapCenter : [-96.636269, 32.91676],
            zoom: props.zoomLevel ? props.zoomLevel : 11,
          });

          window. mapViewArray.push(view);
          console.log( window.mapViewArray)
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