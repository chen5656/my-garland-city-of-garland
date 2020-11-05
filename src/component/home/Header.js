import React from 'react';
import logo from '../../images/COLOR.rev.horz.NOtag.3999f798.png';
import MapView from '../mapRelated/MapView';

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

const TitlePng = () => {
  return <img className={'d-none d-sm-block'} src={logo} style={titleStyle} alt='City of Garland' />;
};
export default function Header() {
  return (
    <header className='overflow-hidden position-relative'>
      <MapView
        basemap='gray'
        viewHeight={'350px'}
      />
      <TitlePng />
    </header>
  );
}

