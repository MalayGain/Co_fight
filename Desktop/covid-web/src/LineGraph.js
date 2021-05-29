import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import numeral from 'numeral';

const options ={
    legend: {
        display: false,
    },
    elements: {
        point: {
            radius: 0,
        },
    },
    maintainAspectRatio: false,
    tooltips: {
        mode: "index",
        intersect: false,
        callbacks: {
            label: function (tooltipItem, data) {
                return numeral(tooltipItem.value).format("+0,0");
            },
        },
    },
    scales: {
        xAxes: [
            {
                type: "time",
                time: {
                    format: "MM/DD/YY",
                    beginAtZero: true
                },
                offset: false,
                ticks: {
                    beginAtZero: true
                },
            },
        ],
        yAxes: [
            {
                
                position:'left',
                gridLines: {
                    display: false,
                
                },
                ticks: {
                    // Include a dollar sign in the ticks
                    callback: function (value, index, values) {
                        return numeral(value).format("0a");
                    },
                    
                },
                
                
            },
            
        ],
    },
};
const buildChartData = (data, casesType) => {
    let chartData = [];
    let lastDataPoint;
    for (let date in data.cases) {
        if (lastDataPoint) {
            let newDataPoint = {
                x: date,
                y: data[casesType][date] - lastDataPoint,
            };
            chartData.push(newDataPoint);
        }
        lastDataPoint = data[casesType][date];
    }
    return chartData;
}
function LineGraph({ casesType, ...props }) {
    const [data, setData] = useState({});
    
    useEffect(() => {
        const fetchData = async () => {
            await fetch("https://disease.sh/v3/covid-19/historical/all?lastdays=120")
                .then((response) => response.json())
                .then((data) => {
                    let chartData = buildChartData(data, casesType);
                    setData(chartData);
                });
        };
        fetchData();
    }, [casesType]);

    return (
        <div className={props.className}>
            {data?.length > 0 && (
                <Line
                    options={options}
                    data={{
                        datasets: [
                            { 
                
                                backgroundColor: "rgba(204, 16, 52, 0.5)",
                                borderColor: [ 
                                    'rgba(255,99,132,1)', 
                                    'rgba(54, 162, 235, 1)', 
                                    'rgba(255, 206, 86, 1)', 
                                     
                                ], 
                                fill: false,
                                data: data,
                                borderWidth:2,
                            },
                        ],
                    }}
                />
            )}
            
        </div>
    )
}

export default LineGraph;