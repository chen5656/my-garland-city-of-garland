
import React from 'react';

import Switch from '@material-ui/core/Switch';
import FormControlLabel from '@material-ui/core/FormControlLabel';

const LegendProperties = [{
  'color': 'rgba(36,116,0,1)',
  'label': 'Excellent',
}, {
  'color': 'rgba(77,230,0,1)',
  'label': 'Good',
}, {
  'color': 'rgba(230,230,0,1)',
  'label': 'Fair',
}, {
  'color': 'rgba(225,167,127,1)',
  'label': 'Poor',
}, {
  'color': 'rgba(255,0,0,1)',
  'label': 'Failed',
}];

const LegendItem = (props) => {
  return <tr>
    <td width='35'>
      <svg height='20' width='20'>
        <line x1='0' y1='10' x2='20' y2='10' style={{ stroke: props.color, strokeWidth: 2 }} />


      </svg>
    </td>
    <td>{props.label}</td>
  </tr>
}
const StreetConditionLegendToggle = () => {
  const [checked, setChecked] = React.useState(false);


  const handleChange = () => {
    setChecked((prev) => !prev);
  };


  return <div>
    <FormControlLabel
      control={
        <Switch
          checked={checked}
          onChange={handleChange}
          color='primary'
        />
      }
      label='Show Legend'
    />
    {checked &&
      <div>
      <table style={{marginLeft:'45px'}}>
          <tbody>
            {
              LegendProperties.map((item) => {
                return <LegendItem key={item.label} label={item.label} color={item.color} />
              })
            }
          </tbody>
        </table>
      </div>}
  </div>
}

export default StreetConditionLegendToggle;

