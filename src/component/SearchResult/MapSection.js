import React, { PureComponent } from 'react';
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


}));

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

        />
    }
}
class CrimeMap extends PureComponent  {
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
    />}
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
                        <StreetConditionMap />
                    </ListCollapse>
                    <ListCollapse name='Crime Map'>
                        <CrimeMap />
                    </ListCollapse>
                </List>

            </Paper>
        </div>

    )
}
export default MapSection;
