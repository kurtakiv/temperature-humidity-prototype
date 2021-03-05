import fakeApi from './api.js';
import {CHART_TYPES} from './constants.js';
import {formatDate} from './utils.js';
import svgBuilder from './builder.js';
import {UPDATE_TIME_SEC} from './constants.js';

async function buildChart(chartType = CHART_TYPES.TEMP, measurements) {
  const dates = measurements.data.map(m => formatDate(m.date));
  const yLabels = [];
  let minYValue = 0;

  if (chartType === CHART_TYPES.TEMP) {
    for (let i = measurements.minTemperature; i < measurements.maxTemperature + 1; i += 5) {
      yLabels.push(i);
    }
    minYValue = measurements.minTemperature;
  } else {
    for (let i = measurements.minHumidity; i < measurements.maxHumidity + 1; i += 5) {
      yLabels.push(i);
    }
    minYValue = measurements.minHumidity;
  }

  const chart = new svgBuilder({
    svgId: 'th-chart',
    size: {
      height: 360,
      width: window.outerWidth < 450 ? window.outerWidth-20 : 600
    },
    yMin: 0,
    yMax: 100,
    deltaY: 10
  })
    .setOnHoverDisplayFunction(displayOnHover)
    .setYLabel(yLabels)
    .setXLabel(dates, Math.ceil(dates.length / 10))
    .setPolyline(measurements.data, chartType, minYValue);


  function displayOnHover({temperature, humidity, date, show = false}) {
    const section = document.querySelector('#th-container > .selected-values');

    const config = {
      '.t-value': `&#8451;: ${temperature}, `,
      '.h-value': `H: ${humidity} %,`,
      '.d-value': `Date: ${formatDate(date)} `
    };

    for (let key in config) {
      section.querySelector(key).innerHTML = show ? config[key] : "";
    }
  }

  return chart;
}

function dispalyTable(measurements) {
  let currentTemperature = 0,
    currentHumidity = 0;
  const temperatures = [];
  const humidities = [];
  const currentDate = Date.now();

  measurements.data.forEach(d => {
    temperatures.push(d.temperature);
    humidities.push(d.humidity);

    if (currentDate - new Date(d.date).getTime() <= 1000000) {
      currentTemperature = d.temperature;
      currentHumidity = d.humidity;
    }
  });

  displayValues({
    maxTemperature: Math.max(...temperatures),
    minTemperature: Math.min(...temperatures),
    minHumidity: Math.min(...humidities),
    maxHumidity: Math.max(...humidities),
    currentHumidity,
    currentTemperature
  });


  function displayValues({maxTemperature, minTemperature, maxHumidity, minHumidity, currentTemperature, currentHumidity}) {
    const infoTable = document.querySelector('.info > .info-t');
    const config = {
      '.t-value-min': minTemperature,
      '.t-value-max': maxTemperature,
      '.h-value-min': minHumidity,
      '.h-value-max': maxHumidity,
      '.t-value-cur': currentTemperature,
      '.h-value-cur': currentHumidity
    };

    for (let key in config) {
      (infoTable.querySelector(key) || {}).innerHTML = config[key];

    }
  }
}

async function app() {
  let selectedChartType = CHART_TYPES.TEMP;
  document.getElementById('temperatureButton').onclick = async () => {
    try {
      selectedChartType = CHART_TYPES.TEMP;
      await load();
    } catch (e) {
      alert(e);
      console.warn(e);
    }
  };

  document.getElementById('humidityTemperature').onclick = async () => {
    try {
      selectedChartType = CHART_TYPES.HUM;
      await load();
    } catch (e) {
      alert(e);
      console.warn(e);
    }
  };
  let chart;
  async function load(saveState = false) {
    let measurements = await fakeApi.getData(-10, 20);
    dispalyTable(measurements);
    if (chart && chart.closed && saveState) {
      return ;
    }
    chart = await buildChart(selectedChartType, measurements);
  }

  load();

  setInterval(async () => {
    await load(true);
  }, UPDATE_TIME_SEC*1000);
};

app();



