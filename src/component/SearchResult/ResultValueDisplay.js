import React, { Component, } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { PinDropSharp } from '@material-ui/icons';

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
    listItem_oneLine: {
        paddingLeft: '12px',
        paddingRight: '8px',
        width: '100%',
        position: 'relative',
        boxSizing: 'border-box',
        textAlign: 'left',
        alignItems: 'center',
        paddingTop: '20px',
        paddingBottom: '10px',
        justifyContent: 'flex-start',
        textDecoration: 'none',

    },
    listItem_twoLine: {
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
        display: 'inline',
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
        return 'Null'
    }
}

const Link = (props) => {
    if (props.url) {
        return (
            <a href={props.url} target='_blank' rel="noopener noreferrer"
                title={props.title}>
                {props.children}
            </a>
        )
    }
    return <span>{props.children}</span>;
}
const Name = (props) => {
    const classes = useStyles();
    return <div className={classes.primary}>{props.children}</div>;
}

const Address = (props) => {    
    const classes = useStyles();
    return <span  className={classes.secondary}>{props.children}</span>;
}
const Distance = (props) => {
    const classes = useStyles();
    return <span  className={classes.secondary}> ({props.children} miles)</span>;
}
const Phone = (props) => {

}
const Email = (props) => {

}
const FactorValue_SingleValue = (props) => {
    const classes = useStyles();
    return <div className={classes.listItem_oneLine}> {props.children}</div>;
}

const FactorValue_NameAddressDistance = (props) => {
    const classes = useStyles();

    return (<div className={classes.listItem_twoLine}>
        {props.children}

    </div>)
}

export default class ResultValueDisplay extends Component {
    renderResult(category, data) {
        let name = null,
            address = null,
            distance = null,
            newValue = null,
            url = null,
            title = null;

        if (data.outputControl.name) {
            name = fillNullInfo(data.outputData.attributeData[data.outputControl.name]);
        }
        if (data.outputControl.address) {
            address = data.outputData.attributeData[data.outputControl.address];
        }
        if (data.outputControl.distance) {
            distance = data.outputData.distance
        }

        if (data.outputControl.hyperlink === 'field') {
            url = data.outputData.attributeData[data.outputControl.hyperlinkFieldname];
            title = 'Open to see details';
        } else if (data.outputControl.hyperlink === 'Google map') {
            let startPnt = data.outputData.fullAddress;
            let endPnt = data.outputData.attributeData[data.outputControl.address]
            url = `https://www.google.com/maps/dir/?api=1&origin=${startPnt}&destination=${endPnt}`;
            title = 'Open in Google Map';
        }

        switch (category) {
            case 'name-address-distance':

                return <FactorValue_NameAddressDistance >
                    <Link url={url} title={title}>
                        {name && <Name >{name}</Name>}
                    </Link>
                    {address && <Address>{address}</Address>}
                    {distance && <Distance>{distance}</Distance>}
                </FactorValue_NameAddressDistance>;

            case 'singleValue':
                if (data.outputControl.hyperlink === 'field') {
                    url = data.outputData.attributeData[data.outputControl.hyperlinkFieldname];
                    title = 'Open to see details'
                }
                return <FactorValue_SingleValue  >
                    <Link url={url} title={title}>
                        {name && <Name >{name}</Name>}
                    </Link>
                </FactorValue_SingleValue>;
            case 'name_phone_email':
                return <div></div>
            case 'ews-recycling-day':
                name = data.outputData.attributeData[data.outputControl.name];
                newValue = getEWSRecyclingDay(name);
                return <FactorValue_SingleValue  >
                    {name && <Name >{name}</Name>}
                </FactorValue_SingleValue>;
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