import React, { Component } from 'react';
import { loadModules } from 'esri-loader';
import { Grid, Row, Col } from 'react-flexbox-grid/lib';
import { withRouter } from 'react-router-dom';

const containerStyle = {
  margin: '2px',
  padding: '50px 5px 50px 5px',
  background: 'linear-gradient(rgb(190, 188, 188), #e4e4e4, #fcfbfa)',
}

class SearchWidget extends Component {
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
          container: 'my-garland-search',
          includeDefaultSources: false,
          allPlaceholder: '.',
          locationEnabled: false,
          sources: [searchSource]
        });
        searchWidget.on('search-start', function (e) {
          that.props.newSearch();
          that.routingFunction('');
        })

        searchWidget.on('search-complete', function (e) {
          if (e.numResults === 0 && e.searchTerm) {
            //no address find from input, display suggestion.  
            that.props.displaySuggestion(e.searchTerm);
            that.routingFunction('nomatch' + '/' + e.searchTerm);

          }
        });

        searchWidget.on('select-result', function (e) {
          console.log('select-result');
          if (e.result) {
            that.routingFunction('id' + '/' + e.result.feature.attributes.Ref_ID);
          }
        });

        return () => {
          if (searchWidget) {
            searchWidget.destroy();
          }
        };
      });
  }


  routingFunction = (value) => {
    this.props.history.push({
      pathname: '/' + value
    });
  }

  render() {
    return <Grid fluid style={containerStyle} >
      <Row center="xs">
        <Col xl={4} lg={6} md={8} xs={12}>
          Enter a valid City of Garland Address to look up City data.
            </Col>
      </Row>
      <Row center="xs">
        <Col xl={4} lg={6} md={8} xs={12} style={{ marginTop: '10px' }}>
          <div id='my-garland-search' className='searchwidget' />
        </Col>
      </Row>
    </Grid>
  }
};

export default withRouter(SearchWidget);

