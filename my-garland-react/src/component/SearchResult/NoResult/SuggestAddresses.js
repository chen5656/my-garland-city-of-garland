import React, { 
  useRef,
  useEffect,
  useState } from 'react';

  import Query from '@arcgis/core/tasks/support/Query';
  import QueryTask from '@arcgis/core/tasks/QueryTask';

import Button from '@material-ui/core/Button';
import Card from '@material-ui/core/Card';
import CardHeader from '@material-ui/core/CardHeader';
import CardContent from '@material-ui/core/CardContent';

import { useHistory } from 'react-router-dom';

import {addressUrl,streetUrl,streetAliasUrl} from '../../../config/mapService.json'


const containerStyle = {
  margin: '2px',
  padding: '30px 5px 30px 5px',
  background: '#fcfbfa',
  width: '100%'
}

const OneAddress = (props) => {
  const history = useHistory();
  const handleSearchAddress=()=>{
      props.setInput({address:props.address});
  }
  return (<li>
    <Button color="primary"onClick={handleSearchAddress}>
      {props.address}
    </Button >
  </li>);
}

const SuggestAddresses =(props)=>{
  const [addressList, setAddressList]=useState([]);

  const queryAliasTable = () => {

    if (!props.searchTerm) {
      setAddressList(  [] );
      return;
    }
    var addr_road, addr_number;
    var str = props.searchTerm.split(",")[0].replace(/\s\s+/g, ' ').trim().toUpperCase();
    var subStr = str.split(" ");
    if (subStr.length > 1) {
      var str1 = subStr[0];
      if (Number.isInteger(str1)) {
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

    var query = new Query({
      where: "STREETLABEL LIKE '%" + addr_road + "%'",
      returnGeometry: false,
      outFields: ["*"]
    });
    var queryTask = new QueryTask({
      url: addressUrl
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
        var addrList = nearestNums(addr_number, addr_list);
        setAddressList(addrList);

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
            var addrList = displayUniquleStreetList(results.features, addr_number);
            setAddressList(addrList);

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
              if (results.features.length > 0) {debugger
                console.log("wrong street label. find street name in alias table");
                var addrList = displayUniquleStreetList(results.features, addr_number);
                setAddressList(addrList);

              } else {
                console.log("wrong street label. Can't find it anywhere")
                setAddressList({ addressList: [] });

              }
            });
          }
        });
      }



    })

  }

  useEffect(()=>{
    queryAliasTable()
  },[props.searchTerm])
  
  const getUnique=(array) =>{
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
  const nearestNums=(num, arr) =>{
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

  const  displayUniquleStreetList=(features, addr_number)=> {
    //get unique value
    var distinct = getUnique(features.map(function (feature) {
      return feature.attributes.STREETLABEL;
    }));
    var tempAddrNum = "";
    if (addr_number !== 0) {
      tempAddrNum = "" + addr_number ;
    }

    var addrList = distinct.slice(0, 5).map(function (val) {
      return {
        "streetNumber": tempAddrNum,
        "streetLabel": val
      };
    })
    return addrList;
  }

  return (
      <div className="row justify-content-md-center pt-4 relative" style={containerStyle} >
        <div className="col-lg-4 col-md-8 col-sm-12">
          <Card>
            <CardHeader title="Address not found." />
            <CardContent style={{ textAlign: 'left' }}>
              {addressList.length > 0 ? <><p>Did you mean?</p>
                <ul>
                  {
                    addressList.map((item) => {
                      let address = '' + item.streetNumber + ' ' + item.streetLabel;
                      return <OneAddress key={address} address={address} setInput={props.setInput}/>
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

export default SuggestAddresses;