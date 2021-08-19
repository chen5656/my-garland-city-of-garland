import React, { useEffect ,useRef,useState,useContext} from 'react';
import Search from '@arcgis/core/widgets/Search';
import Locator from '@arcgis/core/tasks/Locator';
import * as restLocator from "@arcgis/core/rest/locator";

import { useHistory } from 'react-router-dom';
import {locatorUrl} from '../../config/mapService.json';

import { SearchContext } from '../../context/GlobalState';

const containerStyle = {
  margin: '2px',
  padding: '50px 5px 50px 5px',
  background: 'linear-gradient(rgb(190, 188, 188), #e4e4e4, #fcfbfa)',
  borderRadius: '3px',
}
const SearchContainer=(props)=>{
  const searchDiv = useRef(null);
  const [searchWidget,setSearch]=useState(null);
  const history = useHistory();
  
  //reverse locator
  const serviceUrl = locatorUrl;
      
  
  const {setMapPoint} = useContext(SearchContext);

  useEffect(() => {
    if (searchDiv.current) {
      const searchSource = {
        'outFields': ['Ref_ID'],
        'singleLineFieldName': 'Single Line Input',
        'name': 'GARLAND_ADDRESS_LOCATOR',
        'placeholder': 'Enter a City of Garland Address',
        'suggestionsEnabled': true,
        'maxSuggestions': 6,
        'minSuggestCharacters': 6
      };
      searchSource.locator = new Locator({
        url: locatorUrl
      });
      console.log( searchSource.locator)
      const search = new Search({
        // view: view,
        container: searchDiv.current,
        includeDefaultSources: false,
        allPlaceholder: '.',
        locationEnabled: false,
        sources: [searchSource]
      });


      search.on('search-complete', function (e) {
       resetSearch();
        if (e.numResults === 0 && e.searchTerm) {
          //no address find from input, display suggestion.  
          history.push(`/unmatch?searchTerm=${e.searchTerm}`)
        }
      });

      search.on('select-result', function (e) {
        if (e.result) {
          history.push(`/match?addressid=${e.result.feature.attributes.Ref_ID}`)        
        }
      });

      setSearch(search);

    }

  }, []);

  useEffect(() => {
    if(props.searchInput){
      searchWidget.search(props.searchInput.address)
    }
    if(props.searchInput&&props.searchInput.  location){
      let params = {
        location: props.searchInput.  location
      };

      restLocator.locationToAddress(serviceUrl, params)
      .then(function(response) { // Show the address found
        searchWidget.search(response.address)
      }, function(err) { // Show no address found
      });
    }
  }, [props.searchInput ]);

  const resetSearch=()=>{
    props.setInput(null);
    setMapPoint(null);
  }

  return  (
    <div className="row justify-content-md-center" style={containerStyle}>
    <div className=" col-lg-5 col-md-8 col-sm-12">
      <div className="m-3 col-12">
        Enter a valid City of Garland Address to look up City data.
        </div>
        <div className="searchwidget" ref={searchDiv} style={{width:'100%'}}></div>
    </div>

  </div>

  ) ;

}

export default SearchContainer;

