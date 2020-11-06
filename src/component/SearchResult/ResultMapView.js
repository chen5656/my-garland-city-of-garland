import React from 'react';
import { makeStyles } from '@material-ui/core/styles';

import MapView from '../mapRelated/MapView';
import ListCollapse from './ListCollapse';

const StreetConditionMap = (props) => {
    return <MapView
        basemap='topo'
        geometryWGS84={props.geometryWGS84}
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

    />
}
const CrimeMap = (props) => {
    return <MapView
        basemap='topo'
        geometryWGS84={props.geometryWGS84}
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
    />
}

const AllMaps = (props) => {
    return (<>
        <ListCollapse name='Pavement Condition'>
            <StreetConditionMap geometryWGS84={props.geometryWGS84}/>
        </ListCollapse>
        <ListCollapse name='Crime Map'>
            <CrimeMap geometryWGS84={props.geometryWGS84}/>
        </ListCollapse>
    </>)
}
export default AllMaps;
