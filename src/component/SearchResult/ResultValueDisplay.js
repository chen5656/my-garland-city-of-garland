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
    constructor(props){
        super(props);

    }

render (){
     console.log(this.props)
     debugger;
    return null
}


}