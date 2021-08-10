import React, { useEffect, useRef ,useState} from 'react';

import MapView from "@arcgis/core/views/MapView";
import Map from "@arcgis/core/Map";
import MapImageLayer from "@arcgis/core/layers/MapImageLayer";
import FeatureLayer from "@arcgis/core/layers/FeatureLayer";
import Legend from '@arcgis/core/widgets/Legend';
import LayerList from '@arcgis/core/widgets/LayerList';
import Graphic from '@arcgis/core/Graphic';
import { PanoramaVertical } from '@material-ui/icons';
import StreetConditionLegendToggle from './StreetConditionLegendToggle';

const PavementMap = (props) => {
    const mapDiv = useRef(null);
    const [layerOn,setLayerOn]=useState(true);
    const [mapView, setView] = useState(null);
  
    useEffect(() => {   
        if(mapDiv.current&&props.mapPoint){
            const layers=[
                 new MapImageLayer({
                    'url': 'https://maps.garlandtx.gov/arcgis/rest/services/WebApps/MyGarland/MapServer',
                    'sublayers':  [
                        { "id": 5, "visible": true, title: 'Parcels' },
                        { "id": 4, "visible": true,title: 'Address' },
                        { "id": 37, "visible": layerOn, title: 'pavement-condition' }
                    ],
                  })
            ];
            const map = new Map({
                basemap:  'topo',
                layers: layers
            });
            const view = new MapView({
                container: mapDiv.current,
                map: map,
                center: props.mapPoint.geometry,
                zoom: 15,
            });

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
            view.graphics.removeAll();
            view.graphics.add(pnt);
            view.center = props.mapPoint.geometry;
        }

     },[props.mapPoint,layerOn]  );


  
    
    
    return (<div className='px-2'>
      <div className='webmap' ref={mapDiv} style={{ height:  '300px' }} />
      <StreetConditionLegendToggle layerOn={layerOn} setLayerOn={setLayerOn}/>
    </div>)
  };
  
  export default PavementMap;
