import React, { useEffect, useRef } from 'react';
import { loadModules } from 'esri-loader';
import Box from '@material-ui/core/Box';


const titleStyle = {
  fontWeight: '900',
  textShadow: '2px 2px DarkGray',
  top: '170px',
  right: 0,
  height: '85px',
  position: 'absolute',
  background: 'linear-gradient(0.25turn,rgb(0 122 163 / 90%), rgb(0 122 163 / 64%), rgb(0 122 163 / 24%))',
  padding: '5px 55px 5px 20px ',
  borderRadius: '8px 0 0 8px',

}

const WebMapView = () => {
  const mapRef = useRef();
  useEffect(
    () => {
      // lazy load the required ArcGIS API for JavaScript modules and CSS
      loadModules(['esri/Map', 'esri/views/MapView', 'esri/layers/MapImageLayer'], { css: true })
        .then(([ArcGISMap, MapView, MapImageLayer]) => {
          const map = new ArcGISMap({
            basemap: 'gray',
            layers: [new MapImageLayer({
              'url': 'https://maps.garlandtx.gov/arcgis/rest/services/WebApps/MyGarland/MapServer',
              'sublayers': [{
                'id': 1,
                'visible': true
              }]
            })]
          });

          // load the map view at the ref's DOM node
          const view = new MapView({
            container: mapRef.current,
            map: map,
            center: [-96.636269, 32.91676],
            zoom: 12
          });

          return () => {
            if (view) {
              // destroy the map view
              view.destroy();
            }
          };
        });
    }
  );
  return <div className='webmap' ref={mapRef} style={{ height: '350px' }} />;
};
const TitlePng = () => {
  const iconUrl = 'https://maps.garlandtx.gov/garlandlogos/static/media/COLOR.rev.horz.NOtag.3999f798.png';

  return <img className={'d-none d-sm-block' } src={iconUrl} style={titleStyle} alt='City of Garland' />;
};

export default function Header() {



  return (
    <Box overflow='hidden' position='relative'>
      <WebMapView />
      <TitlePng />
    </Box>
  );
}

