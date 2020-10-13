import React, { useEffect, useRef } from 'react';
import { loadModules } from 'esri-loader';


export default function SearchWidget(props) {
  const searchRef = useRef();

  useEffect(
    () => {
      // lazy load the required ArcGIS API for JavaScript modules and CSS
      loadModules(['esri/widgets/Search', 'esri/tasks/Locator'], { css: true })
        .then(([Search, Locator]) => {

          const searchSource = {
            "outFields": ["Ref_ID"],
            "singleLineFieldName": "Single Line Input",
            "name": "GARLAND_ADDRESS_LOCATOR",
            "placeholder": "Enter a City of Garland Address",
            "suggestionsEnabled": true,
            "maxSuggestions": 6,
            "minSuggestCharacters": 6
          };
          searchSource.locator = new Locator({
            url: "https://maps.garlandtx.gov/arcgis/rest/services/Locator/GARLAND_ADDRESS_LOCATOR/GeocodeServer"
          });
          const searchWidget = new Search({
            // view: view,
            container: searchRef.current,
            includeDefaultSources: false,
            allPlaceholder: ".",
            locationEnabled: false,
            sources: [searchSource]
          });
          searchWidget.on("search-complete", function (e) {
            if (e.numResults === 0) {
              props.addressNotFound();
              //no address find from input, display suggestion.             
            }
          });

          searchWidget.on("select-result", function (e) {
            if (e.result) {
              props.displaySearchResult(e.result.feature.attributes.Ref_ID);
            }
          });

          return () => {
            if (searchWidget) {
              searchWidget.destroy();
            }
          };
        });
    }
  );
  return <div className="searchwidget" ref={searchRef} />;
};



