import React, { Component, } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';

String.prototype.capitalize = function () {
    return this.charAt(0).toUpperCase() + this.slice(1).toLocaleLowerCase();
}

const useStyles = makeStyles((theme) => ({
    primary:{
        display: 'block',
        fontSize: '1rem',
        fontFamily: '"Roboto", "Helvetica", "Arial", "sans-serif"',
        fontWeight: 400,
        lineHeight: 1.5,
        letterSpacing: '0.00938em',

    },
    secondary:{
        display: 'block',        
    color: 'rgba(0, 0, 0, 0.54)',
    fontSize: '0.875rem',
    fontFamily: '"Roboto", "Helvetica", "Arial", "sans-serif"',
    fontWeight: 400,
    lineHeight: 1.43,
    letterSpacing: '0.01071em',

    }
  
  }));
  
// name={name} address ={address} data={data}
const Name = (props) => {
    if(props.data.outputControl.hyperlink&&props.data.outputControl.hyperlink==='Google map' ){
        let startPnt=props.data.outputData.fullAddress;
       return (<span >
            <a href={'https://www.google.com/maps/dir/?api=1&origin=' + props.address + '&destination=' + startPnt}
                target='_blank' rel="noopener noreferrer" title='Open in Google Map'> {props.name}</a>
        </span>)
    }else{
        return <span>{props.name}</span>;
    }
    
}

const Address =(props)=>{
return <span>{props.value}</span>;
}
const Distance = (props) => {
    return <span> ({props.value} miles)</span>
}
const FactorValue_Building = (props) => {
    const classes = useStyles();
    var data = props.data;
    var name=null, address=null, distance=null;
    if(data.outputControl.name){
        name=data.outputData.attributeDate[data.outputControl.name].capitalize();
    }
    if(data.outputControl.address){
        address=data.outputData.attributeDate[data.outputControl.address];
    }
    if(data.outputControl.distance){
        distance=data.outputData.distance;
    }

    console.log(data);
    // <ListItemText primary={name && <Name  name={name} address ={address} data={data}/>}             
    //         secondary={<div>                
    //             {address && <Address value={address} />}
    //             {distance && <Distance value={distance} />}
    //         </div>} />
    return (<div>
        <div className={classes.primary}>
            {name && <Name  name={name} address ={address} data={data}/>}   
        </div>
        <div  className={classes.secondary}>
            {<div>                
                {address && <Address value={address} />}
                 {distance && <Distance value={distance} />}
             </div>} 

        </div>
        
    </div>)
}

export default class ResultValueDisplay extends Component {
    constructor(props) {
        super(props);
    }

    renderResult(category,data) {
        switch (category) {
            case 'nearest-city-facility':
                return <FactorValue_Building data={data} />;
            case 'nearest-city-1':
                return null;
            default:
                return <div></div>;
        }
    }

    render() {
        console.log(this.props.data[0])
        return <>
            {this.renderResult(this.props.data[0].outputControl.category,this.props.data[0])}
        </>;
    }


}