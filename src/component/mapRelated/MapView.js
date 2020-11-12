import React, { useEffect, useRef } from 'react';
import { loadModules } from 'esri-loader';
const WebMapView = (props) => {
  const mapRef = useRef();
  if (!Array.isArray(window.mapViewList)) {
    window.mapViewList = [];
  } 
  if (!Array.isArray(window.layerViewList)) {
    window.layerViewList = [];
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
          layers.forEach(layer=>{
            view.whenLayerView(layer)
            .then(function() {
              if(layer.type==='feature'){
                window.layerViewList.push({
                  layer:layer,
                  type:'feature'
                });
              } 
              if(layer.type==='map-image'){
                layer.allSublayers.items.forEach(item=>{
                  window.layerViewList.push({
                    layer:item,
                    type:'map-image',
                    parentLayer:layer,
                  });  

                })   
                        
              }

              
            })
            .catch(function(error) {
              // An error occurred during the layerview creation
            });
          })
       


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
    {props.showButton ?<div id={props.showButton.id} >{props.showButton.value}</div>:null}
  </>
};

export default WebMapView;