import React, { useEffect, useRef } from 'react';

import MapView from "@arcgis/core/views/MapView";
import Map from "@arcgis/core/Map";
import MapImageLayer from "@arcgis/core/layers/MapImageLayer";
import FeatureLayer from "@arcgis/core/layers/FeatureLayer";
import Legend from '@arcgis/core/widgets/Legend';
import LayerList from '@arcgis/core/widgets/LayerList';

const WebMapView = (props) => {
  const mapDiv = useRef(null);
  if (!Array.isArray(window.mapViewList)) {
    window.mapViewList = [];
  } 
  if (!Array.isArray(window.layerViewList)) {
    window.layerViewList = [];
  } 

  useEffect(() => {
      if(mapDiv.current){
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
          
          const map = new Map({
            basemap: props.basemap ? props.basemap : 'gray-vector',
            layers: layers
          });

          // load the map view at the ref's DOM node
          const view = new MapView({
            container: mapDiv.current,
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
          })
          if (props.showButton ) {
            view.ui.add(props.showButton.id , 'bottom-right');
          }
          if(props.widgets&&Array.isArray(props.widgets)){
            if(props.widgets.find(item=>{return item.toLowerCase()==='legend'})){
              var legend = new Legend({
                view: view
              });            
              view.ui.add(legend, "bottom-left");
            }
            if(props.widgets.find(item=>{return item.toLowerCase()==='layerlist'})){
              var layerList = new LayerList({
                view: view
              });            
              view.ui.add(layerList, "top-right");
            }
            
          }
          window.mapViewList.push({ id: props.id, view: view });
        }
    },[]
  );
  
  
  return <>
    <div className='webmap' ref={mapDiv} style={{ height: props.viewHeight ? props.viewHeight : '300px' }} />
    {props.showButton ?<div id={props.showButton.id} >{props.showButton.value}</div>:null}
  </>
};

export default WebMapView;