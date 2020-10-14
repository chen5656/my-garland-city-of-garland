import React, { useState, useEffect, useRef, Component } from 'react';
import AddressNotFound from './AddressNotFound';
import ShowResult from './ShowResult';
import SearchWidget from './SearchWidget';
import Grid from '@material-ui/core/Grid';
import { render } from '@testing-library/react';

const containerStyle = {
    margin: '2px',
    padding: '50px 5px 50px 5px',
    background: 'linear-gradient(rgb(190, 188, 188), #e4e4e4, #fcfbfa)',
}

function SearchResult(props){
    return(<div>{props.isShowResult && (props.isAddressFound ? <ShowResult /> : <AddressNotFound />)}</div>  );
}

export default class AddressSearch extends Component {
    constructor(){
        super();
        this.   state={
            isShowResult:false,
            isAddressFound:false,
            address_ref_id: null,
        };
        this.handleDisplayResult= this.handleDisplayResult.bind(this);
     
    }

     handleDisplayResult(Ref_ID) {
         debugger   ;
        this.setState({            isShowResult:true        });
        if (!Ref_ID) {
            //no address return
            this.setState({            isAddressFound:false        });

            console.log('No address found')
        } else {
            this.setState({            isAddressFound:true        });
            this.setState({            address_ref_id:Ref_ID        });

            console.log(Ref_ID)
        }
    }

  render(){return (
        <div>
            <Grid container style={containerStyle} direction='row' justify='center'>
                <Grid item lg={4} md={8} alignItems="stretch" direction='column' justify='center'>
                    <Grid item   >Enter a valid City of Garland Address to look up City data.</Grid>
                    <Grid item style={{ marginTop: '10px' }} >
                        <SearchWidget displayResult={this.handleDisplayResult} ></SearchWidget>
                    </Grid>
                </Grid>
            </Grid>
            <SearchResult isShowResult= {this.state.isShowResult}  isAddressFound ={this.state.isAddressFound} RefID={this.state.address_ref_id}/>
        </div>
    );}  
}


