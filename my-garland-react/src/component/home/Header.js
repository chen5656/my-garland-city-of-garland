import React  from 'react';
import MapView from '../MapRelated/MapView';

const titleStyle = {
  top: '170px',
  right: 0,
  height: '85px',
  position: 'absolute',
  background: 'linear-gradient(0.25turn,rgb(0 122 163 / 90%), rgb(0 122 163 / 64%), rgb(0 122 163 / 24%))',
  padding: '5px 55px 5px 20px ',
  borderRadius: '8px 0 0 8px',
}

const TitlePng = () => {
  return <img className='d-none d-sm-block' src='./images/COLOR.rev.horz.NOtag.3999f798.png' style={titleStyle} alt='City of Garland' />;
};
export default function Header(props) {
  return (
    <header className='overflow-hidden position-relative'>
      <MapView
        viewHeight={'350px'}     
        id={'header'}
      />
      <TitlePng />
    </header>
  );
}

