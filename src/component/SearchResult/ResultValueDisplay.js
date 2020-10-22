import React, { Component, } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import Avatar from '@material-ui/core/Avatar';
import ImageIcon from '@material-ui/icons/Image';
import WorkIcon from '@material-ui/icons/Work';
import BeachAccessIcon from '@material-ui/icons/BeachAccess';
import { SignalCellularNullOutlined } from '@material-ui/icons';

String.prototype.capitalize = function () {
    return this.charAt(0).toUpperCase() + this.slice(1).toLocaleLowerCase();
}


const BLDGName = (props) => {
    debugger;
    const name=props.data.outputData.attributeDate[1].capitalize();
    if(props.data.outputControl.hyperlink&&props.data.outputControl.hyperlink==='Google map' ){
        let endPnt=props.data.outputData.attributeDate[0] ;
        let startPnt=props.data.outputData.fullAddress;
       return (<span >
            <a href={'https://www.google.com/maps/dir/?api=1&origin=' + endPnt + '&destination=' + startPnt}
                target='_blank' rel="noopener noreferrer" title='Open in Google Map'> {name}</a>
        </span>)
    }else{
        return <span>{name}</span>;
    }
    
}

const Distance = (props) => {
    return <span> ({props.value} miles)</span>
}

const FactorValue_Building = (props) => {
    var data = props.data;
    console.log(data);
    return (<ListItem>
        <ListItemText primary={<BLDGName data={data} />}
            secondary={<div>
                <span >{data.outputData.attributeDate[0]}</span>
                {data.outputControl.displayDistance && <Distance value={data.outputData.distance} />}
            </div>} />
    </ListItem>)
}

export default class ResultValueDisplay extends Component {
    constructor(props) {
        super(props);
    }

    renderResult(param) {
        switch (param) {
            case 'nearest-city-facility':
                return <FactorValue_Building data={this.props.data[0]} />;
            case 'nearest-city-1':
                return null;
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