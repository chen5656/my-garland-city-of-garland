import React, { PureComponent } from 'react';
import Button from '@material-ui/core/Button';
import Card from '@material-ui/core/Card';
import CardHeader from '@material-ui/core/CardHeader';
import CardContent from '@material-ui/core/CardContent';
import { loadModules } from 'esri-loader';

const addressURL = "https://maps.garlandtx.gov/arcgis/rest/services/WebApps/MyGarland/MapServer/4";
const streetUrl = "https://maps.garlandtx.gov/arcgis/rest/services/WebApps/MyGarland/MapServer/3";
const streetAliasUrl = "https://maps.garlandtx.gov/arcgis/rest/services/WebApps/MyGarland/MapServer/16";

const containerStyle = {
  margin: '2px',
  padding: '30px 5px 30px 5px',
  background: '#fcfbfa',
  width: '100%'
}

const OneAddress = (props) => {
  return (<li>
    <Button color="primary"
      onClick={() => { props.search(props.address) }}
    >
      {props.address}
    </Button >
  </li>);
}

class SuggestAddresses extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      addressList: {},
    };
  }

  doQuery() {

    const that = this;
    // lazy load the required ArcGIS API for JavaScript modules and CSS
    loadModules(["esri/tasks/support/Query", "esri/tasks/QueryTask"], { css: true })
      .then(([Query, QueryTask]) => {
        var addr_road, addr_number;
        var str = that.props.suggestTerm.split(",")[0].trim().toUpperCase();
        var subStr = str.split(" ");
        if (subStr.length > 1) {
          var str1 = subStr[0];
          if (str1 != parseInt(str1, 10)) {
            //not a number, try to use it as street name
            addr_road = str;
            addr_number = 0;
          } else {
            subStr.shift();
            addr_road = subStr.join(" ");
            addr_number = str1;
          }
        } else {
          // try to use it as street name
          addr_road = str;
          addr_number = 0;
        }

        addr_road = this.findArrayInAliasExtend(addr_road);

        var query = new Query({
          where: "STREETLABEL LIKE '%" + addr_road + "%'",
          returnGeometry: false,
          outFields: ["*"]
        });
        var queryTask = new QueryTask({
          url: addressURL
        });

        queryTask.execute(query).then(function (results) {
          var addr_list = [];
          if (results.features.length > 0) {
            //street entered correct
            console.log("correct street label, wrong address number");
            addr_list = results.features.map(function (val) {
              return {
                streetNumber: val.attributes.STREETNUM,
                streetLabel: val.attributes.STREETLABEL
              };
            }).sort(function (a, b) {
              return a.streetNumber - b.streetNumber;
            });
            //find close nums display data
            var addrList = that.nearestNums(addr_number, addr_list);
            that.setState({ addressList: addrList });

          } else {
            //street wrong        
            var str = addr_road.split(" ");

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
            var queryTask = new QueryTask({
              url: streetUrl
            });
            queryTask.execute(query).then(function (results) {
              if (results.features.length > 0) {
                console.log("wrong street label. find street name in road table");
                var addrList = that.displayUniquleStreetList(results.features, addr_number);
                that.setState({ addressList: addrList });

              } else {
                //check alias table
                var query = new Query({
                  where: "STREETNAME LIKE '%" + longestStr + "%'",
                  returnGeometry: false,
                  outFields: ["*"]
                });
                var queryTask = new QueryTask({
                  url: streetAliasUrl
                });
                queryTask.execute(query).then(function (results) {
                  if (results.features.length > 0) {

                    console.log("wrong street label. find street name in alias table");
                    var addrList = that.displayUniquleStreetList(results.features, addr_number);
                    that.setState({ addressList: addrList });

                  } else {
                    console.log("wrong street label. Can't find it anywhere")
                    that.setState({ addressList: [] });

                  }
                });
              }
            });
          }
        });


      })

  }
  componentDidMount = () => {
    this.doQuery();
  }
  componentDidUpdate = (prevProps) => {
    if (this.props.suggestTerm !== prevProps.suggestTerm) {
      this.doQuery();
    }
  }

  componentWillUnmount = () => {

  }

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
  nearestNums(num, arr) {
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

  displayUniquleStreetList(features, addr_number) {
    //get unique value
    var distinct = this.getUnique(features.map(function (feature) {
      return feature.attributes.STREETLABEL;
    }));
    var tempAddrNum = "";
    if (addr_number !== 0) {
      tempAddrNum = "" + addr_number + " ";
    }

    var addrList = distinct.slice(0, 5).map(function (val) {
      return {
        "streetNumber": tempAddrNum,
        "streetLabel": val
      };
    })
    return addrList;

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


  routingFunction = (value) => {
    this.props.history.push({
      pathname: '/' + value
    });
  }

  render() {

    return (
      <div className="row justify-content-md-center pt-4 relative" style={containerStyle} >
        <div className="col-lg-4 col-md-8 col-sm-12">
          <Card>
            <CardHeader title="Address not found." />
            <CardContent style={{ textAlign: 'left' }}>
              {this.state.addressList.length > 0 ? <><p>Did you mean?</p>
                <ul>
                  {
                    this.state.addressList.map((item) => {
                      let address = '' + item.streetNumber + ' ' + item.streetLabel;
                      return <OneAddress key={address} address={address} search={this.props.search} />
                    })
                  }
                </ul>
              </> : <><p>Couldn't find entered address. </p><p>Please check the address name.</p></>}

            </CardContent>
          </Card>
        </div>
      </div>
    );

  }
}

export default SuggestAddresses;