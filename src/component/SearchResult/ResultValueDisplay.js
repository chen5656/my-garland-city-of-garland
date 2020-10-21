import React, { Component, useState } from 'react';

const GoogleMapLink = (props) => {
    return (<span >
        <a href={'https://www.google.com/maps/dir/?api=1&origin=' + props.endPnt + '&destination=' + props.startPnt}
            target='_blank' rel="noopener noreferrer" title='Open in Google Map'> {props.name}</a>
    </span>)
}



const Nearest_city_facility = (props) => {
    var data = props.data;
    return (<div>
        <span >{data.outputData.attributeDate[0]}</span>
        <span > {data.outputData.distance}</span>
        {data.outputControl.hyperlink && data.outputControl.hyperlink === 'googleMap' &&
            <GoogleMapLink endPnt={data.outputData.attributeDate[0]} startPnt={data.outputData.fullAddress}
                name={data.outputData.attributeDate[1]} />}

    </div>)
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