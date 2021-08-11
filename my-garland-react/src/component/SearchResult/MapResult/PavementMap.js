import React, { useEffect, useRef ,useState} from 'react';

import MapView from "@arcgis/core/views/MapView";
import Map from "@arcgis/core/Map";
import MapImageLayer from "@arcgis/core/layers/MapImageLayer";
import Legend from '@arcgis/core/widgets/Legend';
import LayerList from '@arcgis/core/widgets/LayerList';
import Graphic from '@arcgis/core/Graphic';
import StreetConditionLegendToggle from './StreetConditionLegendToggle';
import LargeMapButton from '../../MapRelated/LargeMapButton';

const PavementMap = (props) => {
    const mapDiv = useRef(null);
    const showLargeBtn=useRef(null);
    const [mapView, setView] = useState(null);
    const [thisMap, setMap] = useState(null);
  
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
            setMap(map);
            setView(view);

            var toggleableLayers=[];
            props. layers.forEach(layer=>{
                map.add(layer.layer);
                if(layer.enableToggle){toggleableLayers.push(toggleableLayers)};                
            });
            if(props.setToggleableLayers)props.setToggleableLayers(toggleableLayers);

            if(props.largerVersion){
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
        <LargeMapButton
            name='crime-map'
            body={<PavementMap 
                mapPoint={props.mapPoint} 
                largerVersion={true}
                layers={props.layers}
                />}
        /></div>
    </>
      
  
};

const PavementDiv = (props) => {
    const [layerOn,setLayerOn]=useState(true);
    const [toggleableLayers,setToggleableLayers]=useState([]);
    const layers = [
        {
            layer: new MapImageLayer({
                'url': 'https://maps.garlandtx.gov/arcgis/rest/services/WebApps/MyGarland/MapServer',
                'title': 'Baselayers',
                'sublayers': [
                    { "id": 5, "visible": true, title: 'Parcels' },
                    { "id": 4, "visible": true, title: 'Address' },
                ],
            }),
            enableToggle:false
        },
        {
            layer: new MapImageLayer({
                'url': 'https://maps.garlandtx.gov/arcgis/rest/services/WebApps/MyGarland/MapServer',
                'title': 'Pavement Condition',
                'sublayers': [
                    { "id": 37, "visible": true, title: 'pavement-condition' }
                ],
            }),
            enableToggle:true

        },
    ];
    return (<div className='px-2'>
        <PavementMap layerOn={layerOn} setLayerOn={setLayerOn} mapPoint={ props.mapPoint} layers={layers} setToggleableLayers={setToggleableLayers}/>
        <StreetConditionLegendToggle layerOn={layerOn} setLayerOn={setLayerOn}/>
       
    </div>)

}

  
  export default PavementDiv;
