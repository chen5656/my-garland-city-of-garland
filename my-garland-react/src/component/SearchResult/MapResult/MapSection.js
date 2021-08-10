import React, {useRef, useEffect, useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';

import ListSubheader from '@material-ui/core/ListSubheader';
import List from '@material-ui/core/List';
import Divider from '@material-ui/core/Divider';

import Paper from '@material-ui/core/Paper';

import MapView from '../../MapRelated/MapView';
import ListCollapse from '../ListCollapse';
import LargeMapButton from '../../MapRelated/LargeMapButton';


import Switch from '@material-ui/core/Switch';
import FormControlLabel from '@material-ui/core/FormControlLabel';

import PavementMap from './PavementMap';


const useStyles = makeStyles((theme) => ({

    sectionPadding: { padding: '15px' },
    sectionHead: {
        borderRadius: '5px 5px 0 0', color: 'white', fontWeight: 600,
        backgroundImage: 'linear-gradient(to right,rgb(0 122 163 / 90%), rgb(0 122 163 / 54%), rgb(0 122 163 / 24%))',
        margin: 0
    },

}));

// const StreetConditionMap =({mapPoint}) => {// use PureComponent to prevent rerender when nothing changed.
//     const [layerOn,setLayerOn]=useState(true);
//     const [layerList, setLayerList] = useState([{
//         type: 'map-image',
//         url: 'https://maps.garlandtx.gov/arcgis/rest/services/WebApps/MyGarland/MapServer',
//         sublayers: [
//             { "id": 5, "visible": true, title: 'Parcels' },
//             { "id": 4, "visible": true,title: 'Address' },
//         ],
//     },{
//         type: 'map-image',
//         url: 'https://maps.garlandtx.gov/arcgis/rest/services/WebApps/MyGarland/MapServer',
//         sublayers: [
//             { "id": 37, "visible": true, title: 'pavement-condition' }
//         ],
//     }]);
    
//     // useEffect(() => {
//     //     let layerList = [{
//     //         type: 'map-image',
//     //         url: 'https://maps.garlandtx.gov/arcgis/rest/services/WebApps/MyGarland/MapServer',
//     //         sublayers: [
//     //             { "id": 5, "visible": true, title: 'Parcels' },
//     //             { "id": 4, "visible": true,title: 'Address' },
//     //             { "id": 37, "visible": layerOn, title: 'pavement-condition' }
//     //         ],
//     //     }];
//     //     setLayerList(layerList);

//     // }, [layerOn]);

//     return    (<div className='px-2'>
//     <MapView
//         id='pavement-condition'
//         basemap='topo'
//         zoomLevel={15}
//         viewHeight={'300px'}
//         layerList={layerList}            
//         mapPoint={mapPoint}
//         showButton={
//             {
//                 'value': <LargeMapButton
//                     name='pavement-condition'
//                     body={<MapView
//                         id='pavement-condition-large'
//                         basemap='topo'
//                         zoomLevel={15}
//                         viewHeight={'100%'}     
//                         mapPoint={mapPoint}
//                         layerList={layerList}
//                         widgets={['Legend', 'LayerList']} />}
//                 />,
//                 'id': 'street-pci-show-large',
//             }
//         }
//     />
//     <StreetConditionLegendToggle layerOn={layerOn} setLayerOn={setLayerOn}/>
// </div>)
    

// }

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
const CrimeMap =( {mapPoint}) =>{ 
    const layerList = [{
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
    }];
    return ( <div className='px-2'>
        <p>
            <a href="https://garlandtx.gov/396/Crime-Statistics-Maps" target="_blank" 
            title="Crime-Statistics-Maps"> Link to more reports/resources</a>
        </p>
        <MapView
            id='crime-map'
            basemap='topo'
            zoomLevel={15}
            viewHeight={'300px'}
            layerList={layerList}
            mapPoint={mapPoint}
            showButton={
                {
                    'value': <LargeMapButton
                        name='crime-map'
                        body={<MapView
                            id='crime-map-large'
                            basemap='topo'
                            zoomLevel={15}
                            viewHeight={'100%'}        
                            mapPoint={mapPoint}
                            layerList={layerList}
                            widgets={['Legend', 'LayerList']}
                        />}
                    />,
                    'id': 'crime-show-large',
                }
            }
        />
        <CrimeMapLegendToggle />
    </div>
    )

}
const MapSection = ({mapPoint}) => {
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
                        <PavementMap  mapPoint={mapPoint}/>
                    </ListCollapse>
                    <Divider variant='middle' />
                    <ListCollapse name='Monthly Crime Map'>                       
                        <CrimeMap   mapPoint={mapPoint}/>                            
                    </ListCollapse>
                </List>

            </Paper>
        </div>

    )
}
export default MapSection;

