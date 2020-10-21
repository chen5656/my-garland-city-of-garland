import React, { Component, useState } from 'react';



const FactorValue_Address_Distant_GoogleMapLink = (props) => {
    return (<>
        <span></span>
        <span></span>
        <span></span>
    </>)
}


const MyGarlandFactorValue = (props) => {
    // const classes = useStyles();
    console.log(props.data, props.outputControl);
    // if(props.outputControl.hardcode){
    //   var str =props.outputControl.hardcode.split('{{displayValue}}');
    //   var newStr =[];
    //   for(let i=0;i<str.length;i++){
    //     newStr.push(str[i]);
    //     if(i<props.data.length){
    //       newStr.push(props.data[i])
    //     }
    //   }
    //   return <div>{newStr}</div>

    // }
    return <div>{props.data.length}</div>
}

export default class ResultValueDisplay extends Component {
    constructor(props) {
        super(props);

    }

    render() {
        console.log(this.props.data[0].outputControl.category,this.props)
        var str = <div></div>;
        if (this.props.data[0].outputControl.category==="nearest-city-facility") {
            str = <div> <span class='location-data-value'>{this.props.data[0].outputData[0]}</span>
                <span class='location-data-distance'> {this.props.data[0].outputData[2]}</span>
                <span class='location-data-value'><a href={'https://www.google.com/maps/dir/?api=1&origin='+this.props.data[0].outputData[0]+'&destination='+this.props.fullAddress}
                    target='_blank' title='Open in Google Map'> {this.props.data[0].outputData[1]}</a></span></div>;
        }
        return <>
            {str}
        </>;
    }


}