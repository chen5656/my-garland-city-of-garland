import React, { useState, PureComponent } from 'react';
import { makeStyles } from '@material-ui/core/styles';

import ListSubheader from '@material-ui/core/ListSubheader';
import List from '@material-ui/core/List';

import Paper from '@material-ui/core/Paper';

import MapView from '../mapRelated/MapView';
import ListCollapse from './ListCollapse';


import Switch from '@material-ui/core/Switch';
import FormControlLabel from '@material-ui/core/FormControlLabel';

import crimeLegend from '../../images/crimeLegend.jpg';
import StreetConditionLegendToggle from './StreetConditionLegendToggle';

const crimeMapUrl = 'http://maps.garlandtx.gov/cogmap/apps/MapTools/index.html?appid=c40a513390e14f199f4b3953529c4f77';

const useStyles = makeStyles((theme) => ({

    sectionPadding: { padding: '15px' },
    sectionHead: {
        borderRadius: '5px 5px 0 0', color: 'white', fontWeight: 600,
        backgroundImage: 'linear-gradient(to right,rgb(0 122 163 / 90%), rgb(0 122 163 / 54%), rgb(0 122 163 / 24%))',
        margin: 0
    },

}));

const ShowStreetCondition = () => {

}

const ShowLargeMapButton = () => {

}

class StreetConditionMap extends PureComponent {// use PureComponent to prevent rerender when nothing changed.
    render() {
        return <MapView
            id='street-codition'
            basemap='topo'
            zoomLevel={15}
            viewHeight={'300px'}
            layerList={[{
                type: 'map-image',
                url: 'https://maps.garlandtx.gov/arcgis/rest/services/WebApps/MyGarland/MapServer',
                sublayers: [
                    { "id": 5, "visible": true },
                    { "id": 4, "visible": true }
                ],
            }, {
                type: 'map-image',
                url: 'https://maps.garlandtx.gov/arcgis/rest/services/WebApps/MyGarland/MapServer/',
                sublayers: [
                    { "id": 37, "visible": true }
                ],
            }]}
            showButton={
                {
                    'value': 'Show Large',
                    'onClick': '11',
                    'id': 'street-pci-show-large',
                }
            }
        />
    }
}

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
                <img src={crimeLegend} alt="Crime legend"></img>
            </div>}
    </div>
}

class CrimeMap extends PureComponent {
    render() {
        return <MapView
            id='crime-map'
            basemap='topo'
            zoomLevel={15}
            viewHeight={'300px'}
            layerList={[{
                type: 'feature',
                url: 'https://maps.garlandtx.gov/arcgis/rest/services/dept_POLICE/Crime/MapServer/0',
                template: {
                    "title": "<b>{OFFENSE}</b>",
                    "content": "<b>OCCURRED ON: </b>{OCCURRED_O}<br>" +
                        "<b>CASE ID: </b>{CASEID}<br>" +
                        "<b>OFFENSE: </b>{OFFENSE}<br>",
                    "fieldInfos": [
                        {
                            "fieldName": "OCCURRED_O",
                            "format": {
                                "dateFormat": "short-date"
                            }
                        }
                    ]
                }
            }]}
            showButton={
                {
                    'value': 'Show Large',
                    'onClick': '11',
                    'id': 'crime-map-show-large',
                }
            }
        />
    }
}
const MapSection = (props) => {
    const classes = useStyles();
    return (
        <div className={classes.sectionPadding + ' col-lg-4 col-md-12 col-sm-12 ' + (props.isVisible ? '' : 'd-none')}>
            <Paper elevation={3} >
                <List component="section"
                    subheader={
                        <ListSubheader component="h2" className={classes.sectionHead} >Map Data</ListSubheader>
                    }
                >
                    <ListCollapse name='Pavement Condition'>
                        <div className='px-2'>
                            <StreetConditionMap />
                            {/* <StreetConditionToggle /> */}
                            <StreetConditionLegendToggle />
                        </div>
                    </ListCollapse>
                    <ListCollapse name='Crime Map'>
                        <div className='px-2'>
                            <CrimeMap />
                            <CrimeMapLegendToggle />
                        </div>
                    </ListCollapse>
                </List>

            </Paper>
        </div>

    )
}
export default MapSection;

