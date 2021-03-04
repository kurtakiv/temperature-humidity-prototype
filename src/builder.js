Element.prototype.thSetAttribute = function (...args) {
  this.setAttribute(...args);
  return this;
};

class svgBuilder {
  static ns = "http://www.w3.org/2000/svg";
  static left = 40;
  static bottom = 80;
  static right = 40;
  static  top = 10;

  constructor({size, svgId}) {
    this.size = size;

    this.svg = document.getElementById(svgId);
    if (this.svg) {
      this._closed = false;
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
      const closeButton = this.createElement('text');
      closeButton
        .thSetAttribute('class', 'close')
        .thSetAttribute('x', this.size.width - 20)
        .thSetAttribute('y', 20)
        .innerHTML = '&#215;';
      closeButton.onclick = this.onCloseButtonClick.bind(this);

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

      this.svg.append(gx, gy, xLabels, yLabels, closeButton);

    }
  }

  createElement(elem) {
    return document.createElementNS(svgBuilder.ns, elem);
  }

  setYLabel(labels = []) {
    const delta = (this.size.height - svgBuilder.bottom - svgBuilder.top) / labels.length;
    const yLabelsG = this.svg.querySelector('.y-labels');
    const fragment = document.createDocumentFragment();

    let currentY = this.size.height - svgBuilder.bottom;

    labels.forEach(label => {
      const g = this.createElement('g');
      const text = this.createElement('text');
      const tick = this.createElement('line');
      const tickLine = this.createElement('line');
      g.thSetAttribute('transform', `translate(${svgBuilder.left - 30},${currentY})`);
      text.innerHTML = label;
      tick
        .thSetAttribute('x1', 25)
        .thSetAttribute('x2', 20)
        .thSetAttribute('class', 'tick');
      tickLine
        .thSetAttribute('class', 'tick-line')
        .thSetAttribute('x1', 20)
        .thSetAttribute('y1', 0)
        .thSetAttribute('y2', 0)
        .thSetAttribute('x2', this.size.width);
      g.append(text, tick, tickLine);
      fragment.appendChild(g);

      currentY -= delta;
    });

    this.yPointPrice = (this.size.height - svgBuilder.bottom - svgBuilder.top - delta) / Math.abs(Math.max(...labels) - Math.min(...labels));
    yLabelsG.appendChild(fragment);

    return this;
  }

  setXLabel(labels = [], multiplicity = 1) {
    const delta = (this.size.width - svgBuilder.left) / (labels.length * 1.0 / multiplicity);
    const xLabelsG = this.svg.querySelector('.x-labels');
    const fragment = document.createDocumentFragment();
    let currentX = svgBuilder.left;

    for (let i = 0; i < labels.length; i += multiplicity) {
      const g = this.createElement('g');
      const tick = this.createElement('line');
      const tickLine = this.createElement('line')
      const text = this.createElement('text');
      g.thSetAttribute('transform', `translate(${currentX},${this.size.height - svgBuilder.bottom + 20})`);
      text
        .thSetAttribute('transform', `translate(${5},${55}) rotate(-90)`)
        .innerHTML = labels[i];
      tick
        .thSetAttribute('y1', -15)
        .thSetAttribute('y2', -20)
        .thSetAttribute('class', 'tick');
      tickLine
        .thSetAttribute('class', 'tick-line')
        .thSetAttribute('y1', -20)
        .thSetAttribute('x1', 0)
        .thSetAttribute('x2', 0)
        .thSetAttribute('y2', -this.size.height + svgBuilder.top + svgBuilder.bottom);
      g.append(text, tick, tickLine);
      fragment.appendChild(g);

      currentX += delta;
    }
    ;

    this.xPointPrice = (currentX - delta) / labels.length;
    xLabelsG.appendChild(fragment);
    return this;
  }


  setPolyline(data = [], property = 'temperature', minY = 0) {
    const polyline = this.createElement('polyline');
    const circleG = this.createElement('g');
    circleG
      .thSetAttribute('class', 'data');

    circleG.onmousemove = (e) => {
      if (e.target) {
        if (this.onHoverDisplayFunc) {
          this.onHoverDisplayFunc({
            temperature: e.target.dataset['temperature'],
            humidity: e.target.dataset['humidity'],
            date: e.target.dataset['date'],
            show: true
          });
        }

        e.target.setAttribute('r', 5)
      }
    };

    circleG.onmouseout = (e) => {
      if (e.target) {
        e.target.setAttribute('r', 3);
        if (this.onHoverDisplayFunc) {
          this.onHoverDisplayFunc({show: false});
        }
      }
    };

    const mapValue = (t) => {
      return t + Math.abs(minY);
    };

    const points = data.map((d, index) => {
      const x = Math.trunc(index * this.xPointPrice + svgBuilder.left);
      const y = Math.trunc(this.size.height - svgBuilder.bottom - mapValue(d[property]) * this.yPointPrice);
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
      .thSetAttribute('stroke', '#0074d9')
      .thSetAttribute('stroke-width', 2)
      .thSetAttribute('points', points.join(' '))
      .thSetAttribute('data-t', data.map(t => t.temperature));

    this.svg.append(polyline, circleG);
    return this;
  }

  setOnHoverDisplayFunction(func) {
    this.onHoverDisplayFunc = func;
    return this;
  }

  onCloseButtonClick() {
    this.svg.innerHTML = '';
    this._closed = true;
  }

  get closed() {
      return this._closed;
  }
}

export default svgBuilder;