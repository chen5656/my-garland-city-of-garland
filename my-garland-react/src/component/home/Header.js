import React, { useEffect, useRef, useState } from 'react';
import GarlandMapView from '../SearchResult/MapResult/GarlandMapView';
import FeatureLayer from '@arcgis/core/layers/FeatureLayer';
import { useRouteMatch } from "react-router-dom";
import { makeStyles } from '@material-ui/core/styles';

import { cityLimitUrl } from '../../config/mapService.json'
const useStyles = makeStyles((theme) => ({

  title: {
    top: '170px',
    right: 0,
    height: '85px',
    position: 'absolute',
    background: 'linear-gradient(0.25turn,rgb(0 122 163 / 90%), rgb(0 122 163 / 64%), rgb(0 122 163 / 24%))',
    padding: '5px 55px 5px 20px ',
    borderRadius: '8px 0 0 8px',
    zIndex:999,
  },
}))
const TitlePng = () => {
  const classes = useStyles();
  return <img className='d-none d-sm-block' src='./images/COLOR.rev.horz.NOtag.3999f798.png' className={classes.title} alt='City of Garland' />;
};
const Header = (props) => {
  let match = useRouteMatch("/match");
  const layers = [{
    layer: new FeatureLayer({
      'url': cityLimitUrl,
    })
  }];
  return (<div style={{height:'350px'}}>
     <div style={{visible:!match}}> <GarlandMapView layers={layers} className='headMap'/></div>
    <TitlePng />
  </div>
  );
}

export default Header;

