import React, { useEffect ,useRef,useState} from 'react';
import { withRouter } from 'react-router-dom';
import Search from '@arcgis/core/widgets/Search';
import Locator from '@arcgis/core/tasks/Locator';

const containerStyle = {
  margin: '2px',
  padding: '50px 5px 50px 5px',
  background: 'linear-gradient(rgb(190, 188, 188), #e4e4e4, #fcfbfa)',
  borderRadius: '3px',
}
const SearchContainer=(props)=>{
  const searchDiv = useRef(null);
  const [esriSearchWidget, setSearchWidget] = useState(null);

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
        url: 'https://maps.garlandtx.gov/arcgis/rest/services/Locator/GARLAND_ADDRESS_LOCATOR/GeocodeServer'
      });
      const searchWidget = new Search({
        // view: view,
        container: searchDiv.current,
        includeDefaultSources: false,
        allPlaceholder: '.',
        locationEnabled: false,
        sources: [searchSource]
      });

      setSearchWidget(searchWidget);

      searchWidget.on('search-start', function (e) {
        props.resetSearch();
      })

      searchWidget.on('search-complete', function (e) {
        if (e.numResults === 0 && e.searchTerm) {
          //no address find from input, display suggestion.  
          routingFunction(`nomatch?searchTerm=${e.searchTerm}`);///${e.searchTerm}
        }
      });

      searchWidget.on('select-result', function (e) {
        console.log('select-result');
        if (e.result) {
          routingFunction(`match/?addressid=${e.result.feature.attributes.Ref_ID}`);
        }
      });
    }

  }, []);

  const routingFunction = (value) => {
    props.history.push({
      pathname: '/' + value
    });
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

export default withRouter(SearchContainer);

