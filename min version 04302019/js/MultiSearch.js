define(["dojo/_base/declare","dojo/promise/all","esri/tasks/support/Query","esri/tasks/QueryTask","esri/geometry/SpatialReference"],function(e,t,i,r,s){return e("locationService.MultiSearch",null,{constructor:function(e){this.containerList=e.containerList,this.mapService=e.mapService,this.serviceZoneSourceList=e.serviceZoneSourceList,this.parcelDataList=e.parcelDataList,this.spatialReference=new s({wkid:2276}),this.getCityFacilityList(e.cityFacilitySourceList)},getCityFacilityList:function(e){var s=this,n=e.map(function(e){return new r({url:e.url}).execute(new i({where:e.where,returnGeometry:!0,outFields:["*"]}))}),c=new t(n);c.then(function(t){s.cityFacilityList=e.map(function(e,i){return e.features=t[i].features,e})})}})});