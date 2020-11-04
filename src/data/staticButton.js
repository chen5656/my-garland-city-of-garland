import React from 'react';
import ews_png from '../images/ews.png'
import eassist_jpg from '../images/eassist.jpg'



const PicButton = (props) => {
  //url
  //imageUrl
  console.log(props)
  return (<div style={{
    backgroundImage: `url(${props.imageUrl})`,
  }} className='pictureButtonStyle front'>
    <h3>
      <a href={props.url} title={props.title} target='_blank' rel='noopener noreferrer'>
        {props.value}
      </a>
    </h3>
  </div>)
}

const staticButtons = [{
  "id": "ews-link",
  "displayID": 11,
  "component": <PicButton url={"https://issuu.com/garlandtx/docs/ews_calendar_2020_web"}
    value={"* For Holiday Pickup Exceptions Click Here"} title={"goto Environmental Waste Services"} imageUrl={ews_png} />,
}, {
  "id": "eassist-link",
  "displayID": 12,
  "component": <PicButton url={"https://iframe.publicstuff.com/#?client_id=417"}
  value={"Report an issue and watch it get fixed."} title={"Report an issue and watch it get fixed."} imageUrl={eassist_jpg} />,
}]

export default staticButtons;