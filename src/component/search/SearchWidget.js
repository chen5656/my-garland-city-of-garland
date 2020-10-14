import React, { Component } from 'react';
import { loadModules } from 'esri-loader';
import Grid from '@material-ui/core/Grid';

const containerStyle = {
  margin: '2px',
  padding: '50px 5px 50px 5px',
  background: 'linear-gradient(rgb(190, 188, 188), #e4e4e4, #fcfbfa)',
}

export default class SearchWidget extends Component {
  constructor(props) {
    super(props);
  }

  componentDidMount = () => {
    const that = this;
    // lazy load the required ArcGIS API for JavaScript modules and CSS
    loadModules(['esri/widgets/Search', 'esri/tasks/Locator'], { css: true })
      .then(([Search, Locator]) => {

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
          container: 'search-widget',
          includeDefaultSources: false,
          allPlaceholder: '.',
          locationEnabled: false,
          sources: [searchSource]
        });

        searchWidget.on('search-complete', function (e) {

          if (e.numResults === 0) {
            that.props.displayResult(e.searchTerm);
            //no address find from input, display suggestion.             
          }
        });

        searchWidget.on('select-result', function (e) {
          if (e.result) {
            that.props.displayResult(e.result.name,e.result.feature.attributes.Ref_ID);
          }
        });

        return () => {
          if (searchWidget) {
            searchWidget.destroy();
          }
        };
      });
  }

  render() {
    return   <Grid container style={containerStyle} direction='row' justify='center'>
    <Grid item lg={4} md={8} alignItems="stretch" direction='column' justify='center'>
        <Grid item   >Enter a valid City of Garland Address to look up City data.</Grid>
        <Grid item style={{ marginTop: '10px' }} >
        <div id='search-widget' className='searchwidget' />
            
        </Grid>
    </Grid>
</Grid>
  }
};



