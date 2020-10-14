import React, { Component }  from 'react';
import { loadModules } from 'esri-loader';
import Box from '@material-ui/core/Box';

export default class ShowResult extends Component {

  constructor(props) {
    super(props);
    this.state = {
    };
  }

  componentDidUpdate = (prevProps) => {
    if (this.props.RefID === prevProps.RefID) {
      return;
    }
    const that = this;

    loadModules(["esri/tasks/support/Query", "esri/tasks/QueryTask"], { css: true })
    .then(([Query, QueryTask]) => {

    }
    );

  }

  render() {
    return <div>{this.props.RefID}</div>;
  }
}
//   return (
//     <article className="row grey-background py-4 d-none" id="nodeResult">
//           <section className="col-lg-4 col-md-12 col-sm-12 r-card">
//             <h2 className="r-title">
//               Location Data
//               </h2>
//             <div className="r-content">
//               <section className="card">
//                 <div className="card-header" id="headingOne">
//                   <div className="mb-0 btn btn-link collapsed" data-toggle="collapse" aria-controls="collapseOne">
//                     <i className="esri-icon-minus blue-icon" />
//                     <h3>Nearby City Facilities
//                       </h3>
//                   </div>
//                 </div>
//                 <div id="collapseOne" className="card-body collapse show" aria-labelledby="headingOne" data-parent="#accordion">
//                   <div id="nearestCityFacility">
//                     <div className="spinner-grow" role="status">
//                       <span className="sr-only">Loading...</span>
//                     </div>
//                     <ul> </ul>
//                   </div>
//                 </div>
//               </section>
//               <section className="card">
//                 <div className="card-header" id="headingTwo">
//                   <div className="mb-0 btn btn-link collapsed" data-toggle="collapse" aria-controls="collapseTwo">
//                     <i className="esri-icon-minus blue-icon" />
//                     <h3>Services</h3>
//                   </div>
//                 </div>
//                 <div id="collapseTwo" className="card-body collapse show" aria-labelledby="headingTwo" data-parent="#accordion">
//                   <div id="service">
//                     <div className="spinner-grow" role="status">
//                       <span className="sr-only">Loading...</span></div>
//                     <ul />
//                   </div>
//                   <div className="row" id="service-hyperlinks">
//                     <div id="ews_link" className="col hyperlink-button">
//                       <a href="https://issuu.com/garlandtx/docs/ews_calendar_2020_web" target="_blank" rel="noopener noreferrer"  title="goto Environmental Waste Services">* For Holiday Pickup Exceptions Click Here<br /> <img src="images/Env-Waste-Svcs.png" alt="Environmental Waste Services Logo" />
//                       </a>
//                     </div>
//                     <div id="eassist_link" className="col  hyperlink-button">
//                       <a href="https://iframe.publicstuff.com/#?client_id=417" target="_blank" rel="noopener noreferrer"  title="Report an issue and watch it get fixed">Report an issue and watch it get fixed.<br /> <img src="images/eassist.jpg" alt="Garland E Assist Logo" />
//                       </a>
//                     </div>
//                   </div>
//                 </div></section>
//             </div>
//           </section>
//           <section className="col-lg-4 col-md-12 col-sm-12 r-card">
//             <h2 className="r-title">
//               Reference Data
//               </h2>
//             <div className="r-content">
//               <section className="card">
//                 <div className="card-header" id="headingFour">
//                   <div className="mb-0 btn btn-link collapsed" data-toggle="collapse" aria-controls="collapseFour">
//                     <i className="esri-icon-minus blue-icon" />
//                     <h3>Reference</h3>
//                   </div>
//                 </div>
//                 <div id="collapseFour" className="card-body collapse show" aria-labelledby="headingFour" data-parent="#accordion">
//                   <div id="parcelInfo">
//                     <div className="spinner-grow" role="status">
//                       <span className="sr-only">Loading...</span>
//                     </div>
//                     <ul />
//                   </div>
//                 </div>
//               </section>
//               <section className="card">
//                 <div className="card-header" id="headingFive">
//                   <div className="mb-0 btn btn-link collapsed" data-toggle="collapse" aria-controls="collapseFive">
//                     <i className="esri-icon-minus blue-icon" />
//                     <h3>Neighborhoods</h3>
//                   </div>
//                 </div>
//                 <div id="collapseFive" className="card-body collapse show" aria-labelledby="headingFive" data-parent="#accordion">
//                   <div id="neighborhoods">
//                     <div className="spinner-grow" role="status">
//                       <span className="sr-only">Loading...</span></div>
//                     <ul />
//                   </div>
//                 </div>
//               </section>
//               <section className="card">
//                 <div className="card-header" id="headingThree">
//                   <div className="mb-0 btn btn-link collapsed" data-toggle="collapse" aria-controls="collapseThree">
//                     <i className="esri-icon-minus blue-icon" />
//                     <h3>Planning &amp; Development / Zoning
//                       </h3>
//                   </div>
//                 </div>
//                 <div id="collapseThree" className="card-body collapse show" aria-labelledby="headingThree" data-parent="#accordion">
//                   <div id="planning_development-zoning">
//                     <div className="spinner-grow" role="status">
//                       <span className="sr-only">Loading...</span></div>
//                     <ul />
//                   </div>
//                 </div>
//               </section>
//               <section className="card">
//                 {/*If want to make it default as hidden. Remove show in the card-body class, and change esri-icon-minus to esri-icon-plus */}
//                 <div className="card-header" id="headingEight">
//                   <div className="mb-0 btn btn-link collapsed" data-toggle="collapse" aria-controls="collapseEight">
//                     <i className="esri-icon-minus blue-icon" />
//                     <h3>Streets Condition
//                       </h3>
//                   </div>
//                 </div>
//                 <div id="collapseEight" className="card-body collapse show" aria-labelledby="headingEight" data-parent="#accordion">
//                   <div id="street-condition">
//                     <div id="street-condition-toggle" className="ios-toggle">
//                       <label>
//                         <span className="mb-2 pl-4">Add Street PCI to the map</span><br />
//                         <input type="checkbox" className="ios-switch" id="street-condition-checkbox" />
//                         <span className="switch" />
//                       </label>
//                     </div>
//                     <div className="p-2 mt-3 d-none black-border" id="street-condition-legend">
//                     </div>
//                   </div>
//                 </div>
//               </section>
//             </div>
//           </section>
//           <section className="col-lg-4 col-md-12 col-sm-12 r-card" aria-hidden="true">
//             <h2 className="r-title">
//               Map Data
//               </h2>
//             <div className="r-content">
//               <section className="card">
//                 <div className="card-header" id="headingSeven">
//                   <div className="btn btn-link collapsed" data-toggle="collapse" aria-controls="collapseSeven">
//                     <i className="esri-icon-minus blue-icon" />
//                     <h3>Pavement Condition</h3>
//                   </div>
//                 </div>
//                 <div id="collapseSeven" className="card-body collapse show" aria-labelledby="headingSeven" data-parent="#accordion">
//                   <div id="subMap">
//                     <div id="subMapView" style={{ width: '100%', height: '350px' }} />
//                   </div>
//                 </div>
//               </section>
//               <section className="card">
//                 <div className="card-header" id="headingSix">
//                   <div className="btn btn-link collapsed" data-toggle="collapse" aria-controls="collapseSix">
//                     <i className="esri-icon-minus blue-icon" />
//                     <h3>Crime Map<span id="crime_title_month" /></h3>
//                   </div>
//                 </div>
//                 <div id="collapseSix" className="card-body collapse show" aria-labelledby="headingSix" data-parent="#accordion">
//                   <div id="crimeMap">
//                     <div id="crimeView" style={{ width: '100%', height: '350px' }} />
//                   </div>
//                   <div id="crime-legend-toggle" className="ios-toggle">
//                     <label>
//                       <span className="mb-2 pl-4">Show Legend</span><br />
//                       <input type="checkbox" className="ios-switch" id="crime-legend-checkbox" />
//                       <span className="switch" />
//                     </label>
//                   </div>
//                   <div id="crime-legend" className=" d-none ">
//                     <img src="images/crime-legend.jpg" alt="Crime legend" />
//                   </div>
//                 </div>
//               </section>
//             </div>
//           </section>
//         </article>

//   );
// }