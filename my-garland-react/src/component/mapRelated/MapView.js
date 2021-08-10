import React, { useEffect, useRef ,useState} from 'react';

import MapView from "@arcgis/core/views/MapView";
import Map from "@arcgis/core/Map";
import MapImageLayer from "@arcgis/core/layers/MapImageLayer";
import FeatureLayer from "@arcgis/core/layers/FeatureLayer";
import Legend from '@arcgis/core/widgets/Legend';
import LayerList from '@arcgis/core/widgets/LayerList';
import Graphic from '@arcgis/core/Graphic';

const CustomMapView = (props) => {
  const mapDiv = useRef(null);
  const [mapView, setView] = useState(null);

//mapPoint
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
          setView(view);
          if (props.showButton ) {
            view.ui.add(props.showButton.id , 'bottom-right');
          }
          if(props.widgets&&Array.isArray(props.widgets)){
            if(props.widgets.find(item=>{return item==='Legend'})){
              var legend = new Legend({
                view: view
              });            
              view.ui.add(legend, "bottom-left");
            }
            if(props.widgets.find(item=>{return item==='LayerList'})){
              var layerList = new LayerList({
                view: view
              });            
              view.ui.add(layerList, "top-right");
            }
            
          }
        }
    },[]  );

  
  useEffect(() => {
    if(props.mapPoint&&mapView){   
      var pnt = new Graphic({
          geometry: props.mapPoint.geometry,
          symbol: {
              type: "simple-marker",
              color: "#dc2533"
          }
      });
      pnt.popupTemplate = {
          content: props.mapPoint.fullAddress,
      };
      mapView.graphics.removeAll();
      mapView.graphics.add(pnt);
      mapView.center = props.mapPoint.geometry;
    }
  },[props.mapPoint,mapView]);

  
  
  return <>
    <div className='webmap' ref={mapDiv} style={{ height: props.viewHeight ? props.viewHeight : '300px' }} />
    {props.showButton ?<div id={props.showButton.id} >{props.showButton.value}</div>:null}
  </>
};

export default CustomMapView;