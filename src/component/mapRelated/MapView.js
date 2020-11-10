import React, { useEffect, useRef } from 'react';
import { loadModules } from 'esri-loader';
import Button from '@material-ui/core/Button';
import Modal from '@material-ui/core/Modal';


const ShowLargeMapButton=(props)=>{



  return <Button variant="contained" size="small" color="primary" id={props.id } onClick={props.onClick}>{props.value}</Button>
}
const WebMapView = (props) => {
  const mapRef = useRef();
  if (!Array.isArray(window.mapViewList)) {
    window.mapViewList = [];
  }
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
                default:
                  return null;

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

          if (props.showButton ) {
            view.ui.add(props.showButton.id , 'bottom-right');
          }
          window.mapViewList.push({ id: props.id, view: view });
          return () => {
            if (view) {
              // destroy the map view
              view.destroy();
            }
          };
        });
    }
  );
  
  
  return <>
    <div className='webmap' ref={mapRef} style={{ height: props.viewHeight ? props.viewHeight : '300px' }} />
    {props.showButton ?<ShowLargeMapButton id={props.showButton.id} onClick={props.showButton.onClick} value={props.showButton.value} />:null}
  </>
};

export default WebMapView;