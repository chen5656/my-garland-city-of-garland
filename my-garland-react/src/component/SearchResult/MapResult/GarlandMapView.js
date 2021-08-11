import React, { useEffect, useRef ,useState} from 'react';

import MapView from "@arcgis/core/views/MapView";
import Map from "@arcgis/core/Map";
import Legend from '@arcgis/core/widgets/Legend';
import LayerList from '@arcgis/core/widgets/LayerList';
import Graphic from '@arcgis/core/Graphic';
import LargeMapButton from '../../MapRelated/LargeMapButton';

const GarlandMapView = (props) => {
    const mapDiv = useRef(null);
    const showLargeBtn=useRef(null);
    const [mapView, setView] = useState(null);
  
    useEffect(() => {   
        if(mapDiv.current){
            const map = new Map({
                basemap: 'topo',
            });
            const view = new MapView({
                container: mapDiv.current,
                map: map,
                center: props.mapPoint.geometry,
                zoom: 15,
            });            
            setView(view);

            if(props.largerVersion){
                props.layers.forEach(layer=>{
                    map.add(layer.layer);                
                });
                showLargeBtn.current.style.display='none';
                mapDiv.current.style.height='100%';
                var legend = new Legend({
                    view: view
                  });            
                  view.ui.add(legend, "bottom-left");
                  var layerList = new LayerList({
                    view: view
                  });            
                  view.ui.add(layerList, "top-right");

            }else{
                var toggleableLayers=[];
                props.layers.forEach(layer=>{
                    map.add(layer.layer);
                    if(layer.enableToggle){toggleableLayers.push(layer.layer)};                
                });
                if(props.setToggleableLayers)props.setToggleableLayers(toggleableLayers);
                view.ui.add(showLargeBtn.current , 'bottom-right');
            }
            if(props.mapPoint){
                addSearchPnt(props.mapPoint.geometry,props.mapPoint.fullAddress,view);
            }
            
        }
     },[]  );
    useEffect(() => {   
        if(mapView&&props.mapPoint){
            addSearchPnt(props.mapPoint.geometry,props.mapPoint.fullAddress,mapView);    
        }

     },[props.mapPoint]  );

     
    useEffect(() => {   
        let toggleableLayers=props.toggleableLayers;
        if(toggleableLayers&&toggleableLayers.length){
            toggleableLayers.forEach(layer=>layer.visible = props.layerOn)
        }
    },[props.layerOn]  );

    const addSearchPnt=(geometry,popupContent,view)=>{
        var pnt = new Graphic({
            geometry: geometry,
            symbol: {
                type: "simple-marker",
                color: "#dc2533"
            }
        });
        pnt.popupTemplate = {
            content:popupContent ,
        };
        view.graphics.removeAll();
        view.graphics.add(pnt);
        view.center = geometry;
    }
    
    return <>
    <div className='webmap' ref={mapDiv} style={{ height:  '300px' }} />
    <div  ref={showLargeBtn} >
        <LargeMapButton>
            <GarlandMapView 
                {...props}
                largerVersion={true}
            />
        </LargeMapButton>    
        </div>
    </>
      
  
};

  
  export default GarlandMapView;
