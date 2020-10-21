import React, { Component,  } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import Avatar from '@material-ui/core/Avatar';
import ImageIcon from '@material-ui/icons/Image';
import WorkIcon from '@material-ui/icons/Work';
import BeachAccessIcon from '@material-ui/icons/BeachAccess';
const GoogleMapLink = (props) => {
    return (<span >
        <a href={'https://www.google.com/maps/dir/?api=1&origin=' + props.endPnt + '&destination=' + props.startPnt}
            target='_blank' rel="noopener noreferrer" title='Open in Google Map'> {props.name}</a>
    </span>)
}

const Distance = (props)=>{
    return <span>({props.value} miles)</span>
}

{/*
     <ListItem>
<ListItemAvatar>
  <Avatar>
    <ImageIcon />
  </Avatar>
</ListItemAvatar>
<ListItemText primary="Photos" secondary="Jan 9, 2014" />
</ListItem> 
*/}

const Nearest_city_facility = (props) => {
    var data = props.data;
    return ( <ListItem>
        <ListItemText primary={<GoogleMapLink endPnt={data.outputData.attributeDate[0]} startPnt={data.outputData.fullAddress}
                name={data.outputData.attributeDate[1]} />} 
                secondary={<div> <span >{data.outputData.attributeDate[0]}</span>
                <Distance value= {data.outputData.distance}/></div>} />
        </ListItem> )
}

export default class ResultValueDisplay extends Component {
    constructor(props) {
        super(props);
    }

    renderResult(param) {
        switch (param) {
            case 'nearest-city-facility':
                return <Nearest_city_facility data={this.props.data[0]} />;
            default:
                return <div></div>;
        }
    }

    render() {
        var data = this.props.data[0];
        console.log(data.outputControl.category, this.props)
        return <>
            {this.renderResult(data.outputControl.category)}
        </>;
    }


}