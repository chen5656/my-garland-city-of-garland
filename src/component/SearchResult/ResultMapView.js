import React, { PureComponent, useState } from 'react';
import { loadModules } from 'esri-loader';
import { makeStyles } from '@material-ui/core/styles';

import ListSubheader from '@material-ui/core/ListSubheader';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';

import AddIcon from '@material-ui/icons/Add';
import RemoveIcon from '@material-ui/icons/Remove';
import ExpandLess from '@material-ui/icons/ExpandLess';
import ExpandMore from '@material-ui/icons/ExpandMore';

import Collapse from '@material-ui/core/Collapse';
import Paper from '@material-ui/core/Paper';
import CircularProgress from '@material-ui/core/CircularProgress';
import Divider from '@material-ui/core/Divider';

import MapView from '../mapRelated/MapView';

const useStyles = makeStyles((theme) => ({
    sectionPadding: { padding: '15px' },
    sectionHead: {
      borderRadius: '5px 5px 0 0', color: 'white', fontWeight: 600,
      backgroundImage: 'linear-gradient(to right,rgb(0 122 163 / 90%), rgb(0 122 163 / 54%), rgb(0 122 163 / 24%))',
      margin: 0
    },
    categoryHead: {
      width: '100%',
      backgroundColor: theme.palette.background.paper,
      paddingBottom: 0,
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
  
const StreetConditionMap = () => {
    return <MapView
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
const CrimeMap = () => {
    return <MapView
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
    />
}

const MenuControl = (props) => {
    const [open, setOpen] = useState(true);
    const classes = useStyles();

    const handleClick = () => {
        setOpen(!open);
    };
    return (<div>
        <ListItem button onClick={handleClick} className={classes.categoryHead}>
            <ListItemIcon>
                {open ? <RemoveIcon /> : <AddIcon />}
            </ListItemIcon>
            <ListItemText primary={props.name} />
            {open ? <ExpandLess /> : <ExpandMore />}
        </ListItem>
        <Collapse in={open} timeout="auto" unmountOnExit>
            {props.children}
        </Collapse>
    </div>)
}
const AllMaps = () => {
    return (<>
        <MenuControl>
    <StreetConditionMap/>
        </MenuControl>
    <MenuControl>
<CrimeMap/>
    </MenuControl>
    </>)

}

export default AllMaps;
