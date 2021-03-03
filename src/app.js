import fakeApi from './api.js';
import {CHART_TYPES} from './constants.js';
Element.prototype.thSetAttribute = function (...args) {
  this.setAttribute(...args);
  return this;
};

class svgBuilder {
  static ns = "http://www.w3.org/2000/svg";
  static left = 40;
  static bottom = 50;
  static right =40;
  static  top = 20;
  constructor({size, svgId}) {
    this.size = size;

    this.svg = document.getElementById(svgId);
    if (this.svg) {
      this.svg.innerHTML = '';
      this.svg
        .thSetAttribute('height', this.size.height)
        .thSetAttribute('width', this.size.width);
      const gx = this.createElement('g');
      const xAxe = this.createElement('line');
      const gy = this.createElement('g');
      const yAxe = this.createElement('line');
      const xLabels = this.createElement('g');
      const yLabels = this.createElement('g');
      gx.thSetAttribute('class', 'axe x-axe');
      gy.thSetAttribute('class', 'axe y-axe');
      xAxe
        .thSetAttribute("x1", svgBuilder.left)
        .thSetAttribute('y1', this.size.height - svgBuilder.bottom)
        .thSetAttribute('x2', this.size.width)
        .thSetAttribute('y2', this.size.height - svgBuilder.bottom);

      gx.append(xAxe);

      yAxe
        .thSetAttribute('x1', svgBuilder.left)
        .thSetAttribute('y1', svgBuilder.top)
        .thSetAttribute('x2', svgBuilder.left)
        .thSetAttribute('y2', this.size.height - svgBuilder.bottom);
      gy.append(yAxe);

      xLabels.setAttribute('class', 'labels x-labels');
      yLabels.setAttribute('class', 'labels y-labels');

      this.svg.append(gx, gy, xLabels, yLabels);

    }
  }

  createElement(elem) {
    return document.createElementNS(svgBuilder.ns,elem);
  }
  clean() {

  }
  setYLabel(labels = []) {
    const delta = (this.size.height - svgBuilder.bottom - svgBuilder.top)/labels.length;
    const yLabelsG = this.svg.querySelector('.y-labels');
    const fragment = document.createDocumentFragment();

    let currentY = this.size.height -  svgBuilder.bottom;

    labels.forEach(label => {
      const g = this.createElement('g');
      const text = this.createElement( 'text');
      const tick = this.createElement('line');
      const tickLine = this.createElement('line');
      g.thSetAttribute('transform', `translate(${svgBuilder.left-30},${currentY})`);
      text.innerHTML = label;
      tick
        .thSetAttribute('x1', 25)
        .thSetAttribute('x2', 20)
        .thSetAttribute('class', 'tick');
      tickLine
        .thSetAttribute('class', 'tick-line')
        .thSetAttribute('x1', 20)
        .thSetAttribute('y1',0)
        .thSetAttribute('y2', 0)
        .thSetAttribute('x2', this.size.width);
      g.append(text,tick, tickLine);
      fragment.appendChild(g);

      currentY-=delta;
    });

    this.yPointPrice = (this.size.height-svgBuilder.bottom - svgBuilder.top - delta)/Math.abs(Math.max(...labels) - Math.min(...labels));
    yLabelsG.appendChild(fragment);

    return this;
  }

  setXLabel(labels = [], multiplicity = 1) {
    const delta = (this.size.width - svgBuilder.left)/(labels.length*1.0/multiplicity);
    const xLabelsG = this.svg.querySelector('.x-labels');
    const fragment = document.createDocumentFragment();
    let currentX = svgBuilder.left;

    for (let i = 0; i < labels.length; i+= multiplicity){
      const g = this.createElement('g');
      const tick = this.createElement('line');
      const tickLine = this.createElement('line')
      const text = this.createElement('text');
      g.thSetAttribute('transform', `translate(${currentX},${this.size.height - svgBuilder.bottom + 20})`);
      text
        .thSetAttribute('transform', `translate(${5},${25}) rotate(-90)`)
        .innerHTML = labels[i];
      tick
        .thSetAttribute('y1', -15)
        .thSetAttribute('y2', -20)
        .thSetAttribute('class', 'tick');
      tickLine
        .thSetAttribute('class', 'tick-line')
        .thSetAttribute('y1', -20)
        .thSetAttribute('x1',0)
        .thSetAttribute('x2', 0)
        .thSetAttribute('y2', - this.size.height + svgBuilder.top+svgBuilder.bottom);
      g.append(text,tick, tickLine);
      fragment.appendChild(g);

      currentX+=delta;
    };

    this.xPointPrice = (currentX-delta)/labels.length;
    xLabelsG.appendChild(fragment);
    return this;
  }


  setPolyline(data = [], property='temperature', minY = 0) {
    const polyline = this.createElement( 'polyline');
    const circleG = this.createElement('g');
    circleG
      .thSetAttribute('class', 'data');

      circleG.onmousemove = (e) =>{
        if (e.target) {
          console.warn(e.target.dataset['temperature']);
          e.target.setAttribute('r', 5)
        }
      };

      circleG.onmouseout = (e) => {
        e.target.setAttribute('r', 3);
      };

    const mapValue = (t) => {
      console.warn( t + Math.abs(minY));
      return t + Math.abs(minY);
    };
    const points = data.map((d, index) => {
      const x = Math.trunc(index*this.xPointPrice + svgBuilder.left);
      const y = Math.trunc(this.size.height - svgBuilder.bottom - mapValue(d[property])*this.yPointPrice);
      const c = this.createElement('circle');

      c.thSetAttribute('cx', x)
      c.thSetAttribute('cy', y)
      c.thSetAttribute('r', 3)
      c.thSetAttribute('data-temperature', d.temperature)
      c.thSetAttribute('data-date', d.date)
      c.thSetAttribute('data-humidity', d.humidity);
      circleG.append(c);
      return `${x},${y}`
    });

    polyline
      .thSetAttribute('fill', 'none')
      .thSetAttribute('stroke','#0074d9')
      .thSetAttribute('stroke-width', 2)
      .thSetAttribute('points', points.join(' '))
      .thSetAttribute('data-t', data.map(t=>t.temperature));

    this.svg.append(polyline, circleG);
  }

}

const app = async function () {
  document.getElementById('temperatureButton').onclick = async () =>{
    await buildChart(CHART_TYPES.TEMP);
  };

  document.getElementById('humidityTemperature').onclick =async () =>{
    await buildChart(CHART_TYPES.HUM);
  };

  const dateOptions = {
   // year: 'numeric', month: 'numeric', day: 'numeric',
    hour: 'numeric', minute: 'numeric',
    hour12: false,
    timeZone: 'America/Los_Angeles'
  };

  let measurements = await fakeApi.getData(-10, 20);


  displayValues({
       maxTemperature: 5,
       minTemperature: 10,
       minHumidity: 20,
        maxHumidity: 30
  });

  async function buildChart(chartType = CHART_TYPES.TEMP) {
    if (!measurements) {
      measurements = await fakeApi.getData(-10, 20);
    }

    const dates = measurements.data.map(m => new Intl.DateTimeFormat('default', dateOptions).format(new Date(m.date)));
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

    new svgBuilder({
      svgId: 'th-chart',
      size: {
        height: 300,
        width: 600
      },
      yMin: 0,
      yMax: 100,
      deltaY: 10,
    })
      .setYLabel(yLabels)
      .setXLabel(dates.reverse(), Math.ceil(dates.length / 10))
      .setPolyline(measurements.data, chartType, minYValue )
  }

  function displayValues({maxTemperature, minTemperature, maxHumidity, minHumidity}) {
    const infoTable = document.querySelector('.info > .info-t');

    infoTable.querySelector('.t-value-min').innerHTML = minTemperature;
    infoTable.querySelector('.t-value-max').innerHTML = maxTemperature;
    infoTable.querySelector('.h-value-min').innerHTML = maxHumidity;
     infoTable.querySelector('.h-value-max').innerHTML = minHumidity;
  }

};

app();



