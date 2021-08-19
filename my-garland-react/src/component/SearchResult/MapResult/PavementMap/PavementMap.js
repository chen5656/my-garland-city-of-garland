import React, {useState } from 'react';

import MapImageLayer from "@arcgis/core/layers/MapImageLayer";
import StreetConditionLegendToggle from './StreetConditionLegendToggle';
import GarlandMapView from '../GarlandMapView';
import {pavementLayer} from '../../../../config/mapService.json';

const PavementDiv = (props) => {
    const [layerOn,setLayerOn]=useState(true);
    const [toggleableLayers,setToggleableLayers]=useState([]);
    const layers = [
        {
            layer: new MapImageLayer(pavementLayer.layer_no_toggle),
            enableToggle:false
        },
        {
            layer: new MapImageLayer(pavementLayer.layer_toggle),
            enableToggle:true

        },
    ];
    return (<div className='px-2'>
        <GarlandMapView layerOn={layerOn}   layers={layers} setToggleableLayers={setToggleableLayers}
        toggleableLayers={toggleableLayers}/>
        <StreetConditionLegendToggle layerOn={layerOn} setLayerOn={setLayerOn}/>       
    </div>)
}

export default PavementDiv;