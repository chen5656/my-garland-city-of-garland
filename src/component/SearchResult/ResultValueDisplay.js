import React, { Component, useState } from 'react';

const GoogleMapLink =(props)=>{
    return(
null
    )
}


const FactorValue_Address_Distant_GoogleMapLink = (props) => {
    return (<>
        <span></span>
        <span></span>
        <span></span>
    </>)
}

const Nearest_city_facility = (props) => {
        var data = props.data;
    return (<div> 
        <span class='location-data-value'>{data.outputData.attributeDate[0]}</span>
        <span class='location-data-distance'> {data.outputData.distance}</span>
        <span class='location-data-value'><a href={'https://www.google.com/maps/dir/?api=1&origin=' + data.outputData.attributeDate[0] + '&destination=' + data.outputData.fullAddress}
            target='_blank' title='Open in Google Map'> {data.outputData.attributeDate[1]}</a>
        </span>
    </div>)
}

export default class ResultValueDisplay extends Component {
    constructor(props) {
        super(props);
    }

    renderResult(param) {
        switch(param) {
          case 'nearest-city-facility':
            return <Nearest_city_facility data= {this.props.data[0]}/>;
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