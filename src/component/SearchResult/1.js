import React, { Component, } from 'react';
import { makeStyles } from '@material-ui/core/styles';

String.prototype.capitalize = function () {
    return this.charAt(0).toUpperCase() + this.slice(1).toLocaleLowerCase();
}

const getEWSRecyclingDay = (value) => {
    var ancore = value;
    if (isNaN(ancore)) {
        return "NULL".concat("*");
    }
    var ancoreDate = new Date(ancore);
    var today = new Date();
    var dayDiff = Math.floor((today - ancoreDate) / (1000 * 60 * 60 * 24));
    var dayMod = dayDiff % 14;
    var newRecyclingDay;
    if (dayDiff >= 0) {
        newRecyclingDay = addDays(today, (14 - dayMod));

    } else if (dayDiff >= -14) {
        newRecyclingDay = ancoreDate;
    } else {
        newRecyclingDay = addDays(today, (-dayMod));

    }
    //format the new day
    return newRecyclingDay.toDateString().concat("*");

    function addDays(date, days) {
        const copy = new Date(Number(date))
        copy.setDate(date.getDate() + days)
        return copy
    }
}


const useStyles = makeStyles((theme) => ({
    listItem: {
        paddingLeft: '12px',
        paddingRight: '8px',
        width: '100%',
        position: 'relative',
        boxSizing: 'border-box',
        textAlign: 'left',
        alignItems: 'center',
        paddingTop: '10px',
        paddingBottom: '10px',
        justifyContent: 'flex-start',
        textDecoration: 'none',

    },
    primary: {
        display: 'block',
        fontSize: '1rem',
        fontFamily: '"Roboto", "Helvetica", "Arial", "sans-serif"',
        fontWeight: 400,
        lineHeight: 1.5,
        letterSpacing: '0.00938em',

    },
    secondary: {
        display: 'block',
        color: 'rgba(0, 0, 0, 0.54)',
        fontSize: '0.875rem',
        fontFamily: '"Roboto", "Helvetica", "Arial", "sans-serif"',
        fontWeight: 400,
        lineHeight: 1.43,
        letterSpacing: '0.01071em',

    },
    council: {
        fontWeight: 900,
        color: 'white',
        padding: '4px',
        backgroundColor: '#207ff7',
    }

}));

const fillNullInfo = (input) => {
    if (input) {
        return input
    } else {
        return 'NULL'
    }
}
const GoogleMapLink = (props) => {
    return (
        <a href={'https://www.google.com/maps/dir/?api=1&origin=' + props.startPnt + '&destination=' + props.endPnt}
            target='_blank' rel="noopener noreferrer" title='Open in Google Map'>
            {props.children}
        </a>
    )
}
const FieldLink = (props) => {
    return (
        <a href={props.url} target='_blank' rel="noopener noreferrer"
            title='Open to see details'>
            {props.children}
        </a>
    )
}
const Name = (props) => {

    if (props.data.outputControl.hyperlink) {
        if (props.data.outputControl.hyperlink === 'Google map') {
            return (
                <GoogleMapLink startPnt={props.data.outputData.fullAddress} endPnt={props.data.outputData.attributeData[props.data.outputControl.address]}>
                    {props.children}
                </GoogleMapLink>
            )
        } else if (props.data.outputControl.hyperlink === 'field') {
            return (
                <FieldLink url={props.data.outputData.attributeData[props.data.outputControl.hyperlinkFieldname]}>
                    {props.children}
                </FieldLink>
            )

        }

    } else {
        return <span>{props.children}</span>;
    }

}

const Address = (props) => {
    return <span>{props.children}</span>;
}
const Distance = (props) => {
    return <span> ({props.children} miles)</span>;
}
const Phone = (props) => {

}
const Email = (props) => {

}
const FactorValue_SingleValue = (props) => {
    return <div> {props.children}</div>;
}

const FactorValue_NameAddressDistance = (props) => {
    const classes = useStyles();
    var data = props.data;
    var name = null, address = null;
    if (data.outputControl.name) {
        name = fillNullInfo(data.outputData.attributeData[data.outputControl.name]);
    }
    if (data.outputControl.address) {
        address = data.outputData.attributeData[data.outputControl.address];
    }

    return (<div className={classes.listItem}>
        <div className={classes.primary}>
            {name && <Name data={data} >{name}</Name>}
        </div>
        <div className={classes.secondary}>
            {<div>
                {address && <Address>{address}</Address>}
                {data.outputControl.distance && <Distance>{data.outputData.distance}</Distance>}
            </div>}

        </div>

    </div>)
}

export default class ResultValueDisplay extends Component {
    renderResult(category, data) {
        let name = null,
            address = null,
            distance = null,
            newValue = null,
            link = null;

        if (data.outputControl.name) {
            name = fillNullInfo(data.outputData.attributeData[data.outputControl.name]);
        }

        switch (category) {
            case 'name-address-distance':
                if (data.outputControl.address) {
                    address = data.outputData.attributeData[data.outputControl.address];
                }
                if (data.outputControl.distance) {
                    distance = data.outputData.distance
                }
                return <FactorValue_NameAddressDistance data={data}
                    name={name} address={address} distance={distance}
                />;
            case 'singleValue':
                if (data.outputControl.hyperlink === 'field') {
                    link = data.outputData.attributeData[data.outputControl.hyperlinkFieldname];
                }
                return <FactorValue_SingleValue  >
                    <Link type={data.outputControl.hyperlink} url={link}>
                        <Name data={data}>
                            {name}
                        </Name>
                    </Link>
                </FactorValue_SingleValue>;
            case 'name_phone_email':
                return <div></div>
            case 'ews_recycling_day':
                name = data.outputData.attributeData[data.outputControl.name];
                newValue = getEWSRecyclingDay(name);
                return <FactorValue_SingleValue name={newValue} />;
            default:
                return <div></div>;

        }
    }
    render() {
        return <>
            {this.renderResult(this.props.data[0].outputControl.formatType, this.props.data[0])}
        </>;
    }


}