import React, { useEffect, useRef ,useState} from 'react';

import MapView from "@arcgis/core/views/MapView";
import Map from "@arcgis/core/Map";
import Legend from '@arcgis/core/widgets/Legend';
import LayerList from '@arcgis/core/widgets/LayerList';
import Graphic from '@arcgis/core/Graphic';
import LargeMapButton from './LargeMapButton';

const GarlandMapView = (props) => {
    const mapDiv = useRef(null);
    const showLargeBtn=useRef(null);
    const [mapView, setView] = useState(null);
  
    useEffect(() => {        
        if(mapDiv.current){
            
            const map = new Map({ basemap: 'topo'});
            const view = new MapView({
                container: mapDiv.current,
                map: map,
                zoom: 15,
            });
            if(props.mapPoint){
                view.center=props.mapPoint.geometry;
            }
            if(props.className==='headMap'){
                map.basemap='gray';
                view.center=[-96.636269, 32.91676];
                view.zoom=12;
            }
                        
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
                addResultPnt(props.mapPoint.geometry,props.mapPoint.fullAddress,view);
            }
            
        }
     },[]  );
    useEffect(() => {   
        if(mapView){
            if(props.mapPoint){
                addResultPnt(props.mapPoint.geometry,props.mapPoint.fullAddress,mapView);    
            }else{
                mapView.graphics.removeAll();
            }
        }

     },[props.mapPoint]  );

     
    useEffect(() => {   
        let toggleableLayers=props.toggleableLayers;
        if(toggleableLayers&&toggleableLayers.length){
            toggleableLayers.forEach(layer=>layer.visible = props.layerOn)
        }
    },[props.layerOn]  );

    const addResultPnt=(geometry,popupContent,view)=>{
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
        if(props.className==='headMap'){
            view.popup.close()
            view.popup.open({
                features: [pnt]  ,
                updateLocationEnabled:true
              })

        }
    }
    
    return <>
    <div className='webmap' ref={mapDiv}  className={props.className} style={{minHeight:'300px'}}/>
    <div  ref={showLargeBtn} >
    {props.className!=='headMap'&&<LargeMapButton>
            <GarlandMapView 
                {...props}
                largerVersion={true}
            />
        </LargeMapButton>   } 
    </div>
    </>
      
  
};

  
  export default GarlandMapView;
