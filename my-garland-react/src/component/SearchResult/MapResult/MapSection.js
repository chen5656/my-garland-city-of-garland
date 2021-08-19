import React, {useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';

import ListSubheader from '@material-ui/core/ListSubheader';
import List from '@material-ui/core/List';
import Divider from '@material-ui/core/Divider';
import Paper from '@material-ui/core/Paper';

import ListCollapse from '../ListCollapse';
import PavementMap from './PavementMap/PavementMap';
import CrimeMap from './CrimeMap/CrimeMap';

const useStyles = makeStyles((theme) => ({

    sectionPadding: { padding: '15px' },
    sectionHead: {
        borderRadius: '5px 5px 0 0', color: 'white', fontWeight: 600,
        backgroundImage: 'linear-gradient(to right,rgb(0 122 163 / 90%), rgb(0 122 163 / 54%), rgb(0 122 163 / 24%))',
        margin: 0
    },

}));



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
                         
                        <PavementMap  className='sectionMap'/>
                    </ListCollapse>
                    <Divider variant='middle' />
                    <ListCollapse name='Monthly Crime Map'>                       
                        <CrimeMap   className='sectionMap' />                            
                    </ListCollapse>
                </List>
            </Paper>      
        </div>
    )
}
export default MapSection;

