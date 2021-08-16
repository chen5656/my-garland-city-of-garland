import React, {useState } from 'react';

import Switch from '@material-ui/core/Switch';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FeatureLayer from "@arcgis/core/layers/FeatureLayer";
import GarlandMapView from '../GarlandMapView';
import {crimeLayer} from '../../../../config/mapService.json';


const CrimeMapLegendToggle = () => {
    const [checked, setChecked] = useState(false);
    const handleChange = () => {
        setChecked((prev) => !prev);
    };
    return <div>
        <FormControlLabel
            control={
                <Switch
                    checked={checked}
                    onChange={handleChange}
                    color='primary'
                />
            }
            label='Show Legend'
        />
        {checked &&
            <div style={{ marginLeft: '45px' }}>
                <img src='./images/crimeLegend.jpg' alt="Crime legend"></img>
            </div>}
    </div>
}


const CrimeMapDiv=(props)=>{
    const layers = [{
        layer:new FeatureLayer(crimeLayer)
    }];
    return (<div className='px-2'>
    <p>
        <a href="https://garlandtx.gov/396/Crime-Statistics-Maps" target="_blank" 
        title="Crime-Statistics-Maps"> Link to more reports/resources</a>
    </p>
    <GarlandMapView   mapPoint={ props.mapPoint} layers={layers}   />
     <CrimeMapLegendToggle />
    </div>)
}

export default CrimeMapDiv;