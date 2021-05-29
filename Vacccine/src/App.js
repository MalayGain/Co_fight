
import React, { useState, useEffect } from "react";
import ReactMapGL, { Marker, Popup } from 'react-map-gl';
import './index.css';

function App() {

  const url_cases = "https://disease.sh/v3/covid-19/countries"
  const url_vaccinations = "https://disease.sh/v3/covid-19/vaccine/coverage/countries?lastdays=1&fullData=false"

  const [dataCountries, setDataCountries] = useState({})
  const [tooltipData, setTooltipData] = useState(null)

  const [viewport, setViewport] = useState({
    width: "100vw",
    height: "100vh",
    latitude: 20,
    longitude: 77,
    zoom: 2
  });

  

  const prepareData = (data) => {
    let vaccinations = []
    Object.values(data).forEach((obj) => {
      if(obj.total_vaccinations){
        vaccinations.push(parseInt(obj.total_vaccinations))
      }
    })
    vaccinations.sort((a,b) => a - b)
    let firstq = vaccinations[Math.floor(vaccinations.length/4)]
    let secondq = vaccinations[Math.floor(vaccinations.length/2)]
    let thirdq = vaccinations[Math.floor(vaccinations.length*3/4)]

    Object.values(data).forEach((obj) => {
      if(!obj.total_vaccinations){
        obj.size = 0
      }
      else if(obj.total_vaccinations > 0 && obj.total_vaccinations <= firstq){
        obj.size = 15
      }
      else if(obj.total_vaccinations > firstq && obj.total_vaccinations <= secondq){
        obj.size = 30
      }
      else if(obj.total_vaccinations > secondq && obj.total_vaccinations <= thirdq){
        obj.size = 45
      }
      else{
        obj.size = 60
      }
    })

    setDataCountries(data)
  }

  useEffect(() => {
    async function fetchData() 
    {
    let full_data =  {}

    let res_items = await Promise.all([ fetch(url_cases), fetch(url_vaccinations) ])

    let data_cases = await res_items[0].json()
    data_cases.forEach((item) => {
      const {country, countryInfo, cases, deaths, population} = item

      full_data[country] = {country, countryInfo, cases, deaths, population}
    })

    let data_vaccinations = await res_items[1].json()
    data_vaccinations.forEach((item, index) => {
     if(full_data[item.country]){
       full_data[item.country]['total_vaccinations'] = Object.values(item.timeline)[0]
     }
    })

    prepareData(full_data)
    }
    fetchData();
  }, []);
  

  return (
    <>
    <div className="header">
      <div className="navbar navbar-dark bg-dark">
        <div className="container-fluid">
          <h6 className="mx-auto navbar-brand">
            Global Vaccination Tracker
          </h6>
        </div>
      </div>
    </div>
    <div className="map">
       <ReactMapGL
        {...viewport}
        mapboxApiAccessToken="pk.eyJ1IjoiYWJoaWMxMzAzIiwiYSI6ImNrcDhiYnNzcjA3N3Myem9nOGZoeTk4NDQifQ.qwVw_1Zkhn4mRMqXNqRDbg"
        onViewportChange={nextViewport => setViewport(nextViewport)}
        mapStyle="mapbox://styles/saket2000/ckolf18ga1lxq17l31rw3lrxk"
      > 
        {dataCountries && Object.values(dataCountries).map((country, index) => {
          return(
            <Marker key={index} latitude={country.countryInfo.lat} longitude={country.countryInfo.long}>
              <div 
              style={{height: country.size, width: country.size}}
              className="map-marker"
              onClick = {() => setTooltipData(country)} 
              > 
              </div>
            </Marker>
          )
        })}
        {tooltipData && <Popup
          latitude={tooltipData.countryInfo.lat}
          longitude={tooltipData.countryInfo.long}
          anchor="bottom"
          closeButton={true}
          onClose={() => setTooltipData(null)}
        >
            <div className="tooltip-card">
              <div className="tooltip-header">
                <img className="tooltip-img" alt="tool-img " src={tooltipData.countryInfo.flag}></img>
                {tooltipData.country}
              </div>
              <div className="tooltip-content">
                <div className="content-row">
                  <div className="small heading text-secondary me-2">Total doses given</div>
                  <div className="h6 heading">{tooltipData.total_vaccinations.toLocaleString()}</div>
                </div>
                <div className="content-row">
                  <div className="small heading text-secondary me-2">Doses per hundred people</div>
                  <div className="h6 heading">{Math.round((tooltipData.total_vaccinations/tooltipData.population)*100).toLocaleString()}</div>
                </div>
              </div>
            </div>
          </Popup>}
      </ReactMapGL>
    </div>
    </>
  );
}

export default App;