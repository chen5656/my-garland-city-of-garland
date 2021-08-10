import React, { PureComponent, } from 'react';
import { makeStyles } from '@material-ui/core/styles';

import Button from '@material-ui/core/Button';
import PhoneIcon from '@material-ui/icons/Phone';
import EmailIcon from '@material-ui/icons/Email';


String.prototype.capitalize = function () {
    return this.charAt(0).toUpperCase() + this.slice(1).toLocaleLowerCase();
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
        return 'NONE'
    }
}

const getEWSRecyclingDay = (value) => {
    var ancore = value;
    if (isNaN(ancore)) {
        return "NONE".concat("*");
    }
    var ancoreDate = new Date(ancore);
    var today = new Date();
    var dayDiff = Math.floor((today - ancoreDate) / (1000 * 60 * 60 * 24));
    var dayMod = dayDiff % 14;
    var newRecyclingDay = null;
    if (dayDiff >= 0) {
        newRecyclingDay = addDays(today, (14 - dayMod));

    } else if (dayDiff >= -14) {
        newRecyclingDay = ancoreDate;
    } else {
        newRecyclingDay = addDays(today, (-dayMod));
    }
    //format the new day
    return newRecyclingDay.toDateString() + "*";

    function addDays(date, days) {
        const copy = new Date(Number(date))
        copy.setDate(date.getDate() + days)
        return copy
    }
}


const formatPhoneNumber = (phoneNumberString) => {
    var cleaned = ('' + phoneNumberString).replace(/\D/g, '')
    var match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/)
    if (match) {
        return '' + match[1] + '-' + match[2] + '-' + match[3]
    }
    return null
}
const Link = (props) => {
    if (props.url) {
        return (
            <a href={props.url} target='_blank' rel='noopener noreferrer'
                title={props.title} >
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
    return <span className={classes.secondary}>{props.children}</span>;
}
const Distance = (props) => {
    const classes = useStyles();
    return <span className={classes.secondary}> ({props.children} miles)</span>;
}
const Phone = (props) => {
    return <SymbolButton title={props.value} href={`tel:${props.value}`} icon={<PhoneIcon />} />;
}
const Email = (props) => {
    return <SymbolButton title={props.value} href={`mailto:${props.value}`} icon={<EmailIcon />} />;

}

const SymbolButton = (props) => {
    return <Button color="primary" title={props.title} onClick={() => { window.open(props.href, '_blank', 'noopener') }}> {props.icon}</Button>;
}


const FactorValueOneLine = (props) => {
    const classes = useStyles();
    return <div className={classes.listItem_oneLine}> {props.children}</div>;
}

const FactorValueTwoLine = (props) => {
    const classes = useStyles();

    return (<div className={classes.listItem_twoLine}>
        {props.children}

    </div>)
}

export default class ResultValueDisplay extends PureComponent {
    renderResult(category, data) {
        let name = null,
            address = null,
            distance = null,
            url = null,
            title = null;

        const attributes = data.outputData.attributeData;

        if (data.outputControl.name) {
            name = fillNullInfo(attributes[data.outputControl.name]);
        }
        if (data.outputControl.address) {
            address = attributes[data.outputControl.address];
        }
        if (data.outputControl.distance) {
            distance = data.outputData.distance
        }

        if (data.outputControl.hyperlink === 'field') {
            url = attributes[data.outputControl.hyperlinkFieldname];
            title = 'Open to see details';
        } else if (data.outputControl.hyperlink === 'Google map') {
            let startPnt = data.outputData.fullAddress;
            let endPnt = attributes[data.outputControl.address]
            url = `https://www.google.com/maps/dir/?api=1&origin=${startPnt}&destination=${endPnt}`;
            title = 'Open in Google Map';
        }

        switch (category) {
            case 'name-address-distance':
                return <FactorValueTwoLine >
                    <Link url={url} title={title}>
                        {name && <Name >{name.capitalize()}</Name>}
                    </Link>
                    {address && <Address>{address}</Address>}
                    {distance && <Distance>{distance}</Distance>}
                </FactorValueTwoLine>;
            case 'single-value':
                return <FactorValueOneLine >
                    {name && <Name >{name}</Name>}
                </FactorValueOneLine>;
            case 'single-value-hyperlink':
                if (data.outputControl.hyperlink === 'field') {
                    url = data.outputData.attributeData[data.outputControl.hyperlinkFieldname];
                    title = 'Open to see details'
                }
                return <FactorValueOneLine >
                    <Link url={url} title={title}>
                        {name && <Name >{name.capitalize()}</Name>}
                    </Link>
                </FactorValueOneLine>;

            case 'single-value-button':
                if (data.outputControl.hyperlink === 'field') {
                    url = data.outputData.attributeData[data.outputControl.hyperlinkFieldname];
                    title = 'Open to see details'
                }
                return <FactorValueOneLine >
                    <Name >
                        <SymbolButton tilte={title} href={url} icon={name} />
                    </Name>
                </FactorValueOneLine>;
            case 'ews-recycling-day':
                return <FactorValueOneLine  >
                    {name && <Name >{getEWSRecyclingDay(name)}</Name>}
                </FactorValueOneLine>;
            case 'name-with-phone-email':
                return <FactorValueOneLine  >
                    {data.outputControl.outputItems &&
                        data.outputControl.outputItems.map((item) => {
                            return (
                                <Name key={item.name}>
                                    {item.name ? attributes[item.name] : null}
                                    {item.phone ? <Phone
                                        value={formatPhoneNumber(attributes[item.phone])} /> : null}
                                    {item.email ? <Email
                                        value={attributes[item.email]} /> : null}
                                </Name>
                            )
                        })}
                </FactorValueOneLine>;
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