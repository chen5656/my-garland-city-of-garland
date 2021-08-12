import React, { useEffect, useRef, useState } from 'react';
import FeatureLayer from '@arcgis/core/layers/FeatureLayer';
import GarlandMapView from './GarlandMapView';
import { cityLimitUrl } from '../../../config/mapService.json'


const HeaderMap = (props) => {
  const layers = [{
    layer: new FeatureLayer({
      'url': cityLimitUrl,
    })
  }];
  return <GarlandMapView layers={layers} className='headMap' mapPoint={props.mapPoint} />;

}



export default HeaderMap;

