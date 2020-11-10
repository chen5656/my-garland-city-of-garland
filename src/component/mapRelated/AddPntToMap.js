import React, {  PureComponent } from 'react';
import { loadModules } from 'esri-loader';

class AddPoint extends PureComponent {

    addPoint(mapviews, geometry) {
        console.log(mapviews)
        loadModules(["esri/tasks/support/ProjectParameters", "esri/tasks/GeometryService", "esri/geometry/SpatialReference", "esri/Graphic"])
            .then(([ProjectParameters, GeometryService, SpatialReference, Graphic]) => {
                var geomSer = new GeometryService("https://maps.garlandtx.gov/arcgis/rest/services/Utilities/Geometry/GeometryServer");
                const mapviewSpatialReference = new SpatialReference({ wkid: 3857 });
                var params = new ProjectParameters({
                    geometries: [geometry],
                    outSpatialReference: mapviewSpatialReference,
                });
                geomSer.project(params).then((result) => {
                    var pnt = new Graphic({
                        geometry: result[0],
                        symbol: {
                            type: "simple-marker",
                            color: "#dc2533"
                        }
                    });

                    mapviews.forEach(mapview => {
                        mapview.view.graphics.removeAll();
                        mapview.view.graphics.add(pnt);
                        mapview.view.center = [result[0].longitude, result[0].latitude];
                    
                    });
                });


            }
            )

    }
    removePoint(mapviews) {
        mapviews.forEach(mapview => {
            mapview.view.graphics.removeAll();
        })
    }
    componentDidMount() {
        console.log('mount', this.props.geometry)
        if (this.props.geometry) {
            this.addPoint(this.props.mapviews, this.props.geometry);
        }
    }

    componentDidUpdate() {
        console.log('update', this.props.geometry)
        if (this.props.geometry) {
            this.addPoint(this.props.mapviews, this.props.geometry);
        } else {
            this.removePoint(this.props.mapviews);
        }

    }
    render() {
        return null
    }
}
// const AddPoint = (props) => {
//     useEffect(
//         () => {
//             if (props.geometry) {
//                 props.handleResultSelected(props.geometry);
//                 loadModules(["esri/tasks/support/ProjectParameters", "esri/tasks/GeometryService", "esri/Graphic"])
//                     .then(([ProjectParameters, GeometryService, Graphic]) => {
//                         var geomSer = new GeometryService("https://maps.garlandtx.gov/arcgis/rest/services/Utilities/Geometry/GeometryServer");
//                         props.mapviews.forEach(mapview => {
//                             var params = new ProjectParameters({
//                                 geometries: [props.geometry],
//                                 outSpatialReference: mapview.view.spatialReference,
//                             });

//                             geomSer.project(params).then((result) => {
//                                 var pnt = new Graphic({
//                                     geometry: result[0],
//                                     symbol: {
//                                         type: "simple-marker",
//                                         color: "#dc2533"
//                                     }
//                                 });
//                                 mapview.view.graphics.removeAll();
//                                 mapview.view.graphics.add(pnt);
//                                 mapview.view.center = [result[0].longitude, result[0].latitude];
//                             });
//                         })

//                     }
//                     )

//             }
//         }
//     );


//     return null;
// };

export default AddPoint;

