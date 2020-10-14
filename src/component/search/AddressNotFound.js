import React, { Component } from 'react';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Typography from '@material-ui/core/Typography';
import { loadModules } from 'esri-loader';

const containerStyle = {
  margin: '2px',
  padding: '50px 5px 50px 5px',
  background: '#fcfbfa',
}
export default class SuggestAddresses extends Component {
  constructor(props) {
    super(props);
    this.state = {
      addressList: {},
    };
  }

  componentDidUpdate = (prevProps) => {
    if (this.props.searchTerm === prevProps.searchTerm) {
      return;
    }
    const that = this;
    // lazy load the required ArcGIS API for JavaScript modules and CSS
    loadModules(["esri/tasks/support/Query", "esri/tasks/QueryTask"], { css: true })
      .then(([Query, QueryTask]) => {
        var AddrRoad, AddrNumber;
        var str = that.props.searchTerm.split(",")[0].trim().toUpperCase();
        var subStr = str.split(" ");
        if (subStr.length > 1) {
          var str1 = subStr[0];
          if (str1 != parseInt(str1, 10)) {
            //not a number, try to use it as street name
            AddrRoad = str;
            AddrNumber = 0;
          } else {
            subStr.shift();
            AddrRoad = subStr.join(" ");
            AddrNumber = str1;
          }
        } else {
          // try to use it as street name
          AddrRoad = str;
          AddrNumber = 0;
        }

        AddrRoad = this.findArrayInAliasExtend(AddrRoad);


        var query = new Query({
          where: "STREETLABEL LIKE '%" + AddrRoad + "%'",
          returnGeometry: false,
          outFields: ["*"]
        });
        var queryTask = new QueryTask({
          url: "https://maps.garlandtx.gov/arcgis/rest/services/WebApps/MyGarland/MapServer/4"
        });

        queryTask.execute(query).then(function (results) {
          var AddList = [];
          if (results.features.length > 0) {
            //street entered correct
            console.log("correct street label, wrong address number");
            AddList = results.features.map(function (val) {
              return {
                streetNumber: val.attributes.STREETNUM,
                streetLabel: val.attributes.STREETLABEL
              };
            }).sort(function (a, b) {
              return a.streetNumber - b.streetNumber;
            });
            //find close nums display data
            var addrList = that.closestNums(AddrNumber, AddList);
            that.setState({ addressList: addrList });
            console.log(that.state.addressList)


          } else {
            //street wrong        
            var str = AddrRoad.split(" ");

            var longestStr = str[0];
            for (var i = 1; i < str.length; i++) {
              if (longestStr.length < str[i].length) {
                longestStr = str[i];
              }
            }
            var query = new Query({
              where: "STREETLABEL LIKE '%" + longestStr + "%'",
              returnGeometry: false,
              outFields: ["*"]
            });
            console.log(query.where);
            var queryTask = new QueryTask({
              url: "https://maps.garlandtx.gov/arcgis/rest/services/WebApps/MyGarland/MapServer/3"
            });
            queryTask.execute(query).then(function (results) {
              if (results.features.length > 0) {
                console.log("wrong street label. find street name in road table");
                that.displayUniquleStreetList(results.features, AddrNumber);
              } else {
                //check alias table
                var query = new Query({
                  where: "STREETNAME LIKE '%" + longestStr + "%'",
                  returnGeometry: false,
                  outFields: ["*"]
                });
                var queryTask = new QueryTask({
                  url: "https://maps.garlandtx.gov/arcgis/rest/services/WebApps/MyGarland/MapServer/16"
                });
                queryTask.execute(query).then(function (results) {
                  if (results.features.length > 0) {

                    console.log("wrong street label. find street name in alias table");
                    that.displayUniquleStreetList(results.features, AddrNumber);
                  }
                });
              }
            });
          }
        });
      })
  }

  // addressClick(search) {
  //   search.search(this.textContent);
  // }
  getUnique(array) {
    //get unique value
    var unique = {};
    var distinct = [];
    for (var i in array) {
      if (typeof (unique[array[i]]) == "undefined") {
        distinct.push(array[i]);
      }
      unique[array[i]] = 0;
    }
    return distinct;
  }
  closestNums(num, arr) {
    var numsIndex = arr.length - 1;
    if (arr.length > 5) {
      for (var i = 0; i < arr.length; i++) {
        if (num < arr[i].streetNumber) {
          if (arr.length - (i + 3) < 0) {
            numsIndex = arr.length - 1;
          } else {
            numsIndex = i + 2;
          }
          break;
        }
      }
      if (numsIndex < 4) {
        numsIndex = 4;
      }
      return [arr[numsIndex - 4], arr[numsIndex - 3], arr[numsIndex - 2], arr[numsIndex - 1], arr[numsIndex]];

    } else {
      return arr;
    }
  }

  displayUniquleStreetList(features, AddrNumber) {
    //get unique value
    var distinct = this.getUnique(features.map(function (feature) {
      return feature.attributes.STREETLABEL;
    }));

    var tempAddrNum;
    if (AddrNumber == 0) {
      tempAddrNum = "";
    } else {
      tempAddrNum = "" + AddrNumber + " ";
    }

    var addrList = distinct.slice(0, 5);

    this.setState({ addressList: addrList });

  }

  findArrayInAliasExtend(AddrRoad) {
    const aliasExtend = {
      "1ST": "FIRST",
      "2ND": "SECOND",
      "3RD": "THIRD",
      "4TH": "FOURTH",
      "5TH": "FIFTH",
      "6TH": "SIXTH",
      "7TH": "SEVENTH",
      "9TH": "NINTH",
      "10TH": "TENTH",
      "11TH": "ELEVENTH",
      "12TH": "TWELFTH",
      "13TH": "THIRTEENTH",
      "15TH": "FIFTEENTH",
      "16TH": "SIXTEENTH",
      "17TH": "SEVENTEENTH",
      "1": "FIRST",
      "2": "SECOND",
      "3": "THIRD",
      "4": "FOURTH",
      "5": "FIFTH",
      "6": "SIXTH",
      "7": "SEVENTH",
      "9": "NINTH",
      "10": "TENTH",
      "11": "ELEVENTH",
      "12": "TWELFTH",
      "13": "THIRTEENTH",
      "15": "FIFTEENTH",
      "16": "SIXTEENTH",
      "17": "SEVENTEENTH"
    }
    var str = AddrRoad.split(" ");
    str = str.map(function (val) {
      if (aliasExtend[val]) {
        return aliasExtend[val];
      } else {
        return val;
      }

    });
    return str.join(" ").trim();
  }
  render() {
    // "<p>Couldn't find entered address. </p><p>Please check the address name.</p>"
    // node.innerHTML = "<p>Did you mean?</p><ul>".concat(str, "</ul>");

    // domQuery(".btn-link", "suggestedAddresses").forEach(function (btn) {
    //   btn.onclick = this.addressClick;
    // });
    return (
      <Grid style={containerStyle}
        direction='row' justify='center'  >
        <Grid item lg={4} md={8} sm={12} alignItems='stretch' direction='column' justify='center'  >
          <Card style={{ minWidth: 275 }}>
            <CardContent className='card-body '>
              <Typography style={{ marginBottom: 12 }} color='colorTextPrimary' variant='h4' >
                Address not found.
                </Typography>
              <Typography id='address-links'>
                {this.state.addressList.length > 0 ? <><p>Did you mean?</p>
                  <ul>
                    {
                      this.state.addressList.map((item) => {
                        return <li><Button color="primary">{item.streetNumber} {item.streetLabel}</Button ></li>
                      })
                    }
                  </ul>
                </> : <><p>Couldn't find entered address. </p><p>Please check the address name.</p></>}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

    );
  }
}

