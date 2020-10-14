import React, { Component } from 'react';
import Grid from '@material-ui/core/Grid';
import Box from '@material-ui/core/Box';
import { makeStyles } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
const template = () => { };
const Query = () => { };
const QueryTask = () => { };
const domQuery = () => { };
const appSetting = {};
const containerStyle = {
  margin: '2px',
  padding: '50px 5px 50px 5px',
  background: '#fcfbfa',
}
const cardStyles = makeStyles({
  root: {
    minWidth: 275,
  },
  bullet: {
    display: 'inline-block',
    margin: '0 2px',
    transform: 'scale(0.8)',
  },
  title: {
    marginBottom: 12,
  },
});

export default class SuggestAddresses extends Component {
  constructor(props) {
    super(props);
  }

  addressClick (search) {
    search.search(this.textContent);
}

  getSuggestions (  searchTerm) {
    var AddrRoad, AddrNumber;
    var node = document.getElementById('');
    var str = searchTerm.split(",")[0].trim().toUpperCase();
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
  
    AddrRoad = findArrayInAliasExtend(AddrRoad);
  
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
        var str = closestNums(AddrNumber, AddList).map(function (val) {
          return template.generateSuggestAddress({
            "streetNumber": val.streetNumber,
            "streetLabel": val.streetLabel
          });
        }).join("");
  
        node.innerHTML = "<p>Did you mean?</p><ul>".concat(str, "</ul>");
  
        domQuery(".btn-link", "suggestedAddresses").forEach(function (btn) {
          btn.onclick = this.addressClick;
        });
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
            displayUniquleStreetList(results.features, AddrNumber);
          } else {
            //check alias table
            var query = new Query({
              where: "STREETNAME LIKE '%" + longestStr + "%'",
              returnGeometry: false,
              outFields: ["*"]
            });
            var queryTask = new QueryTask({
              url:  "https://maps.garlandtx.gov/arcgis/rest/services/WebApps/MyGarland/MapServer/16"
            });
            queryTask.execute(query).then(function (results) {
              if (results.features.length > 0) {
  
                console.log("wrong street label. find street name in alias table");
                displayUniquleStreetList(results.features, AddrNumber);
              } else {
                node.innerHTML = "<p>Couldn't find entered address. </p><p>Please check the address name.</p>";
              }
            });
          }
        });
      }
    });
  
    function closestNums(num, arr) {
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
  
    function displayUniquleStreetList(features, AddrNumber) {
      //get unique value
      debugger;
      var distinct = getUnique(features.map(function (feature) {
        return feature.attributes.STREETLABEL;
      }));
  
      var tempAddrNum;
      if (AddrNumber == 0) {
        tempAddrNum = "";
      } else {
        tempAddrNum = "" + AddrNumber + " ";
      }
  
      var str = distinct.slice(0, 5).map(function (val) {
        return template.generateSuggestAddress({
          "streetNumber": tempAddrNum,
          "streetLabel": val
        });
      }).join("");
      node.innerHTML = "<p>Did you mean?</p><ul>".concat(str, "</ul>");
  
      domQuery(".btn-link", "suggestedAddresses").forEach(function (btn) {
        btn.onclick = this.addressClick;
      });
    }
  
    function findArrayInAliasExtend(AddrRoad) {
      var str = AddrRoad.split(" ");
      str = str.map(function (val) {
        if (appSetting.aliasExtend[val]) {
          return appSetting.aliasExtend[val];
        } else {
          return val;
        }
  
      });
      return str.join(" ").trim();
    }
  }
  render() {
    const classes = cardStyles();
    return (
      <Grid style={containerStyle}
        direction='row' justify='center'  >
        <Grid item lg={4} md={8} sm={12} alignItems='stretch' direction='column' justify='center'  >
          <Card className={classes.root}>
            <CardContent className='card-body '>
              <Typography className={classes.title} color='colorTextPrimary' variant='h4' >
                Address not found.
                </Typography>
              <Typography id='address-links'>
                {this.props.items && this.props.items.map()}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

    );
  }
}



function getUnique(array) {
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