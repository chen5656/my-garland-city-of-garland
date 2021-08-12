import React, {useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';

import MapImageLayer from "@arcgis/core/layers/MapImageLayer";
import FeatureLayer from "@arcgis/core/layers/FeatureLayer";

import ListSubheader from '@material-ui/core/ListSubheader';
import List from '@material-ui/core/List';
import Divider from '@material-ui/core/Divider';
import Switch from '@material-ui/core/Switch';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Paper from '@material-ui/core/Paper';

import ListCollapse from '../ListCollapse';
import StreetConditionLegendToggle from './StreetConditionLegendToggle';
import GarlandMapView from './GarlandMapView';
import {pavementLayer,crimeLayer} from '../../../config/mapService.json'

const useStyles = makeStyles((theme) => ({

    sectionPadding: { padding: '15px' },
    sectionHead: {
        borderRadius: '5px 5px 0 0', color: 'white', fontWeight: 600,
        backgroundImage: 'linear-gradient(to right,rgb(0 122 163 / 90%), rgb(0 122 163 / 54%), rgb(0 122 163 / 24%))',
        margin: 0
    },

}));

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
        <GarlandMapView layerOn={layerOn} mapPoint={ props.mapPoint} layers={layers} setToggleableLayers={setToggleableLayers}
        toggleableLayers={toggleableLayers}/>
        <StreetConditionLegendToggle layerOn={layerOn} setLayerOn={setLayerOn}/>       
    </div>)
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


const MapSection = (props) => {
    const classes = useStyles();
    return (
        <div className={classes.sectionPadding + ' col-lg-4 col-md-12 col-sm-12 ' }>
            <Paper elevation={3} >
                <List component="section"
                    subheader={
                        <ListSubheader component="h2" className={classes.sectionHead} >Map Data</ListSubheader>
                    }
                >
                    <ListCollapse name='Pavement Condition'>
                        
                        <PavementDiv  mapPoint={props.mapPoint} className='sectionMap'/>
                    </ListCollapse>
                    <Divider variant='middle' />
                    <ListCollapse name='Monthly Crime Map'>                       
                        <CrimeMapDiv   mapPoint={props.mapPoint} className='sectionMap' />                            
                    </ListCollapse>
                </List>
            </Paper>      
        </div>
    )
}
export default MapSection;

