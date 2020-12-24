import React, { useEffect } from 'react';
import $ from '../js/jq';
import './index.less';

export default () => {
  const RENDERER = {
    SNOW_COUNT: {
      INIT: 100,
      DELTA: 1,
    },
    BACKGROUND_COLOR: 'hsl(%h, 50%, %l%)',
    INIT_HUE: 180,
    DELTA_HUE: 0.1,

    init: function() {
      this.setParameters();
      this.reconstructMethod();
      this.createSnow(this.SNOW_COUNT.INIT * this.countRate, true);
      this.render();
    },
    setParameters: function() {
      this.$window = window;

      this.$container = document.getElementById('jsi-snow-container');
      this.width = this.$container.offsetWidth;
      this.height = this.$container.offsetHeight;
      this.center = {
        x: this.width / 2,
        y: this.height / 2,
      };
      this.countRate = this.width * this.height / 500 / 500;
      this.canvas = document.createElement('canvas');
      this.canvas.setAttribute('width', this.width);
      this.canvas.setAttribute('height', this.height);
      this.$container.appendChild(this.canvas);
      this.context = this.canvas.getContext('2d');

      this.radius = Math.sqrt(this.center.x * this.center.x + this.center.y * this.center.y);
      this.hue = this.INIT_HUE;
      this.snows = [];
    },
    reconstructMethod: function() {
      this.render = this.render.bind(this);
    },
    createSnow: function(count, toRandomize) {
      for (let i = 0; i < count; i++) {
        this.snows.push(new SNOW(this.width, this.height, this.center, toRandomize));
      }
    },
    render: function() {
      requestAnimationFrame(this.render);

      const gradient = this.context.createRadialGradient(this.center.x, this.center.y, 0, this.center.x, this.center.y, this.radius),
        backgroundColor = this.BACKGROUND_COLOR.replace('%h', this.hue);

      gradient.addColorStop(0, backgroundColor.replace('%l', 30));
      gradient.addColorStop(0.2, backgroundColor.replace('%l', 20));
      gradient.addColorStop(1, backgroundColor.replace('%l', 5));

      this.context.fillStyle = gradient;
      this.context.fillRect(0, 0, this.width, this.height);

      for (let i = this.snows.length - 1; i >= 0; i--) {
        if (!this.snows[i].render(this.context)) {
          this.snows.splice(i, 1);
        }
      }
      this.hue += this.DELTA_HUE;
      this.hue %= 360;

      this.createSnow(this.SNOW_COUNT.DELTA, false);
    },
  };
  const SNOW = function(width, height, center, toRandomize) {
    this.width = width;
    this.height = height;
    this.center = center;
    this.init(toRandomize);
  };
  SNOW.prototype = {
    RADIUS: 20,
    OFFSET: 4,
    INIT_POSITION_MARGIN: 20,
    COLOR: 'rgba(255, 255, 255, 0.8)',
    TOP_RADIUS: {
      MIN: 1,
      MAX: 3,
    },
    SCALE: {
      INIT: 0.04,
      DELTA: 0.01,
    },
    DELTA_ROTATE: {
      MIN: -Math.PI / 180 / 2,
      MAX: Math.PI / 180 / 2,
    },
    THRESHOLD_TRANSPARENCY: 0.7,
    VELOCITY: {
      MIN: -1,
      MAX: 1,
    },
    LINE_WIDTH: 2,
    BLUR: 10,

    init: function(toRandomize) {
      this.setParameters(toRandomize);
      this.createSnow();
      if (
        navigator.userAgent.match(
          /(phone|pod|iPhone|iPod|ios|Android|Mobile|BlackBerry|IEMobile|MQQBrowser|JUC|Fennec|wOSBrowser|BrowserNG|WebOS|Symbian|Windows Phone)/i,
        )
      ) {
        const box = document.querySelectorAll('.box')[0];
        box.style.left = '42%';
      }
    },
    setParameters: function(toRandomize) {
      if (!this.canvas) {
        this.radius = this.RADIUS + this.TOP_RADIUS.MAX * 2 + this.LINE_WIDTH;
        this.length = this.radius * 2;
        this.canvas = $('<canvas />').attr({
          width: this.length,
          height: this.length,
        })[0];
        // this.canvas = document.getElementsByTagName('canvas')[0]
        // this.canvas.setAttribute('width', this.length)
        // this.canvas.setAttribute('height', this.length)
        this.context = this.canvas.getContext('2d');
      }
      this.topRadius = this.getRandomValue(this.TOP_RADIUS);

      const theta = Math.PI * 2 * Math.random();

      this.x = this.center.x + this.INIT_POSITION_MARGIN * Math.cos(theta);
      this.y = this.center.y + this.INIT_POSITION_MARGIN * Math.sin(theta);
      this.vx = this.getRandomValue(this.VELOCITY);
      this.vy = this.getRandomValue(this.VELOCITY);

      this.deltaRotate = this.getRandomValue(this.DELTA_ROTATE);
      this.scale = this.SCALE.INIT;
      this.deltaScale = 1 + this.SCALE.DELTA * 500 / Math.max(this.width, this.height);
      this.rotate = 0;

      if (toRandomize) {
        for (let i = 0, count = Math.random() * 1000; i < count; i++) {
          this.x += this.vx;
          this.y += this.vy;
          this.scale *= this.deltaScale;
          this.rotate += this.deltaRotate;
        }
      }
    },
    getRandomValue: function(range) {
      return range.MIN + (range.MAX - range.MIN) * Math.random();
    },
    createSnow: function() {
      this.context.clearRect(0, 0, this.length, this.length);

      this.context.save();
      this.context.beginPath();
      this.context.translate(this.radius, this.radius);
      this.context.strokeStyle = this.COLOR;
      this.context.lineWidth = this.LINE_WIDTH;
      this.context.shadowColor = this.COLOR;
      this.context.shadowBlur = this.BLUR;

      const angle60 = Math.PI / 180 * 60,
        sin60 = Math.sin(angle60),
        cos60 = Math.cos(angle60),
        threshold = Math.random() * this.RADIUS / this.OFFSET | 0,
        rate = 0.5 + Math.random() * 0.5,
        offsetY = this.OFFSET * Math.random() * 2,
        offsetCount = this.RADIUS / this.OFFSET;

      for (let i = 0; i < 6; i++) {
        this.context.save();
        this.context.rotate(angle60 * i);

        for (let j = 0; j <= threshold; j++) {
          const y = -this.OFFSET * j;

          this.context.moveTo(0, y);
          this.context.lineTo(y * sin60, y * cos60);
        }
        for (let j = threshold; j < offsetCount; j++) {
          let y = -this.OFFSET * j,
            x = j * (offsetCount - j + 1) * rate;

          this.context.moveTo(x, y - offsetY);
          this.context.lineTo(0, y);
          this.context.lineTo(-x, y - offsetY);
        }
        this.context.moveTo(0, 0);
        this.context.lineTo(0, -this.RADIUS);
        this.context.arc(0, -this.RADIUS - this.topRadius, this.topRadius, Math.PI / 2, Math.PI * 2.5, false);
        this.context.restore();
      }
      this.context.stroke();
      this.context.restore();
    },
    render: function(context) {
      context.save();

      if (this.scale > this.THRESHOLD_TRANSPARENCY) {
        context.globalAlpha = Math.max(0, (1 - this.scale) / (1 - this.THRESHOLD_TRANSPARENCY));

        if (this.scale > 1 || this.x < -this.radius || this.x > this.width + this.radius || this.y < -this.radius || this.y > this.height + this.radius) {
          context.restore();
          return false;
        }
      }
      context.translate(this.x, this.y);
      context.rotate(this.rotate);
      context.scale(this.scale, this.scale);
      context.drawImage(this.canvas, -this.radius, -this.radius);
      context.restore();

      this.x += this.vx;
      this.y += this.vy;
      this.scale *= this.deltaScale;
      this.rotate += this.deltaRotate;
      return true;
    },
  };
  useEffect(() => {
    RENDERER.init();
  }, []);
  return <div className="shengdan">
    <audio autoPlay="autopaly">
      <source src="sjzmd.mp3" type="audio/mp3"/>
    </audio>
    <div id="jsi-snow-container" className="container"></div>
    <div className="box">
      <ul className="minbox">
        <li></li>
        <li></li>
        <li></li>
        <li></li>
        <li></li>
        <li></li>
      </ul>
      <ol className="maxbox">
        <li></li>
        <li></li>
        <li></li>
        <li></li>
        <li></li>
        <li></li>
      </ol>
    </div>
  </div>;
}