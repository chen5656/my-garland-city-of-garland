import React from 'react';
import { makeStyles } from '@material-ui/core/styles';

import ListSubheader from '@material-ui/core/ListSubheader';
import List from '@material-ui/core/List';

import Paper from '@material-ui/core/Paper';

import MapView from '../mapRelated/MapView';
import ListCollapse from './ListCollapse';

const useStyles = makeStyles((theme) => ({
    sectionPadding: { padding: '15px' },
    sectionHead: {
        borderRadius: '5px 5px 0 0', color: 'white', fontWeight: 600,
        backgroundImage: 'linear-gradient(to right,rgb(0 122 163 / 90%), rgb(0 122 163 / 54%), rgb(0 122 163 / 24%))',
        margin: 0
    },
    nested: {
        paddingLeft: theme.spacing(4),
        paddingRight: theme.spacing(6),
    },
    nestedIcon: {
        minWidth: '40px',
    },
    listHeight: {
        minHeight: '64px',
    },
    circularProgressWrap: {
        paddingTop: '15px',
        paddingBottom: '18px',
    },
    circularProgress: {
        color: 'rgb(0 122 163 / 74%)',
        animationDuration: '1550ms',
    },

    itemIcon: {
        fontSize: '12px', color: '#c5d5da'
    }

}));

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

const MapSession = (props) => {
    const classes = useStyles();
    return (
        <div className={classes.sectionPadding + ' col-lg-4 col-md-12 col-sm-12'}>
            <Paper elevation={3} >
                <List component="section"
                    subheader={
                        <ListSubheader component="h2" className={classes.sectionHead} >
                            Map Data
          </ListSubheader>
                    }
                >
                    <ListCollapse name='Pavement Condition'>
                        <StreetConditionMap geometryWGS84={props.geometryWGS84} />
                    </ListCollapse>
                    <ListCollapse name='Crime Map'>
                        <CrimeMap geometryWGS84={props.geometryWGS84} />
                    </ListCollapse>
                </List>

            </Paper>
        </div>

    )
}
export default MapSession;
