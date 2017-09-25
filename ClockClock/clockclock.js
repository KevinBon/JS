const ClockClock = (function(_window) {
  _window.requestAnimFrame = (function (callback) {
    return _window.requestAnimationFrame || _window.webkitRequestAnimationFrame || _window.mozRequestAnimationFrame || _window.oRequestAnimationFrame || _window.msRequestAnimationFrame ||
      function (callback) {
        _window.setTimeout(callback, 1000 / 60);
      };
  })();
  class ClockClock {
    constructor({ targetEl = null, cols = 8, rows = 3, size = 50, hour = 0, minute = 0, format = 24 } = {}) {
      this.targetEl = targetEl;
      this.canvas = this.targetEl.getContext('2d');
      this.size = size;
      this.cols = cols;
      this.rows = rows;
      this.run = false;
      this.compileItems();
      this.compilePatterns();
      const now = new Date();
      this.hour = hour || now.getHours();
      this.minute = minute || now.getMinutes();
      this.format = format; // 12, 24
      this.timeInterval = null;
    }
    getCanvas() { return this.canvas; }
    compileItems() {
      this.clockItems2D = [];
      this.clockItems = [];
      let width = this.targetEl.width / this.cols;
      let height = this.targetEl.height / this.rows;
      let total = this.cols * this.rows;
      for (let x = 0, rows = []; x < this.cols; x++) {
        rows = [];
        for (let y = 0, item = null; y < this.rows; y++) {
          item = new ClockClockItem(this, { x, y }, { top: y * height, left: x * width }, { width, height }, {
            stroke: `hsl(${(360 / total) * (y + x)}, 50%, 50%)` // Rainbow
          });
          this.clockItems.push(item);
          rows.push(item);
        }
        this.clockItems2D.push(rows);
      }
      return this;
    }

    compilePatterns() {
      const humanPattern = {
        0: [
          [[3, 30], [9, 30]],
          [[0, 30], [0, 30]],
          [[0, 15], [0, 45]],
        ],
        1: [
          [[7, 37], [6, 30]],
          [[7, 37], [0, 30]],
          [[7, 37], [0, 0]],
        ],
        2: [
          [[3, 15], [6, 30]],
          [[3, 30], [0, 45]],
          [[0, 15], [9, 45]],
        ],
        3: [
          [[3, 15], [9, 45]],
          [[3, 15], [0, 45]],
          [[3, 15], [0, 45]],
        ],
        4: [
          [[0, 30], [6, 30]],
          [[0, 15], [0, 15]],
          [[7, 37], [0, 0]],
        ],
        5: [
          [[3, 30], [9, 45]],
          [[0, 15], [9, 30]],
          [[3, 15], [0, 45]],
        ],
        6: [
          [[3, 30], [9, 45]],
          [[0, 30], [6, 45]],
          [[0, 15], [0, 45]],
        ],
        7: [
          [[3, 15], [6, 45]],
          [[7, 37], [0, 30]],
          [[7, 37], [0, 0]],
        ],
        8: [
          [[7, 15], [1, 45]],
          [[7, 15], [1, 45]],
          [[7, 15], [1, 45]],
        ],
        9: [
          [[3, 30], [6, 45]],
          [[0, 15], [0, 30]],
          [[3, 15], [0, 45]],
        ],
      };
      this.patterns = {};
      for (let number in humanPattern) {
        if (!humanPattern.hasOwnProperty(number)) continue;

        this.patterns[number] = this.humanNumberToPattern(humanPattern[number]);

      }
    }

    humanNumberToPattern(data) {
      let cols = data[0].length;
      let rows = data.length;
      let y = 0;
      let x = 0;
      let result = [];
      while (x in data && y in data[x]) {
        result.push(data[x][y]);
        if ((x + 1) > cols) {
          y++;
          x = 0;
        } else {
          x++;
        }
      }
      return result;
    }
    renderNumber(number, clockI) {
      if (number < 10) {
        number = '0' + number;
      }
      number = String(number);
      for (let h = 0; h < number.length; h++) {
        let pattern = this.patterns[number[h]];
        for (let clock of pattern) {
          if (clockI + 1 > this.clockItems.length) {
            return clockI;
          }
          this.clockItems[clockI++].renderTo(clock[0], clock[1]);
        }
      }
      return clockI;
    }
    clear() {
      this.canvas.clearRect(0, 0, this.targetEl.width, this.targetEl.height);
    }
    requestNewFrame(callback) {
      return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame || function (callback) {
        window.setTimeout(callback, 1000 / 60);
      }();
    }
    start(hour = null, minute = null) {
      this.run = true;
      if (hour) this.hour = hour;
      if (minute) this.minute = minute;
      this.render();
      this.timeInterval = setInterval(() => this.render(), 8000);
      return this;
    }
    stop(hour, minute) {
      clearInterval(this.timeInterval);
      for (let clock of this.clockItems) {
        clock.stop();
      }
      this.run = false;
      return this;
    }
    updateTime() {
      if (this.minute === 59) {
        this.minute = 0;
        this.hour++;
        if (this.format === 12 && this.hour === 13 || this.hour === 24) {
          this.hour = 0;
        }
      } else {
        this.minute++;
      }
      return this;
    }
    next() {
      for (let clock of this.clockItems) {
        clock.next();
      }
      return this;
    }
    render() {
      if (!this.run) return this;
      this.clear();
      var clockI = 0;
      clockI = this.renderNumber(this.hour, clockI);
      this.renderNumber(this.minute, clockI);
      this.updateTime();
      // _window.requestAnimFrame(() => {
      //   this.updateTime();
      //   this.render();
      // });
      return this;
    }
  }

  class ClockClockItem {
    constructor(clockclock, coords, position, size, opts) {
      opts = Object.assign({ 
        stroke: 'black', 
        debug: true, 
        tickDelay: 10 
      }, opts);
      this.clockclock = clockclock;
      this.coords = coords;
      this.position = position;
      this.size = size;
      this.to = {
        hour: 0,
        minute: 0
      };
      this.current ={
        hour: 0,
        minute: 0
      };
      this.debug = opts.debug;
      this.tickDelay = opts.tickDelay;

      this.centerX = (this.position.left + this.size.width) - (this.size.width / 2);
      this.centerY = (this.position.top + this.size.height) - (this.size.height / 2);
      this.radius = (this.size.height / 2) - 2;
      this.stroke = opts.stroke || 'black';
      this.fullCircle = 2 * Math.PI;
      this.handNeutralPosition = {
        hour: {
          x: this.centerX,
          y: this.position.top + 10 // Length of the handle
        },
        minute: {
          x: this.centerX,
          y: this.position.top + 5 // Length of the handle
        }
      };
      this.timeout = null;
      this.lineWidth = 2;
    }

    rotate(x, y, angle) {
      var radians = (Math.PI / 180) * angle,
        cos = Math.cos(radians),
        sin = Math.sin(radians),
        nx = (cos * (x - this.centerX)) + (sin * (y - this.centerY)) + this.centerX,
        ny = (cos * (y - this.centerY)) - (sin * (x - this.centerX)) + this.centerY;
      return [nx, ny];
    }

    getAngleFromTime(value, scale) {
      return (360 / (scale / value)) * -1;
    }

    drawHandFromTime(canvas, hour, minute) {
      //        (1:x, y)
      //          _____ (2:x, y)
      //         /
      //        /
      //      (0:x, y)
      // Hours
      // We use the original clock physic until we reach the same hour goal
      const overridedHour = this.to.hour === hour ? hour : hour + (1 * (minute / 60));
      canvas.moveTo.apply(canvas, this.rotate(this.handNeutralPosition.hour.x, this.handNeutralPosition.hour.y, this.getAngleFromTime(overridedHour, 12)));
      // Middle point
      canvas.lineTo(this.centerX, this.centerY);
      // Minutes
      canvas.lineTo.apply(canvas, this.rotate(this.handNeutralPosition.minute.x, this.handNeutralPosition.minute.y, this.getAngleFromTime(minute, 60)));
      return this;
    }

    drawCircle(canvas) {
      canvas.beginPath();
      canvas.arc(this.centerX, this.centerY, this.radius, 0, this.fullCircle, false);
      canvas.lineWidth = this.lineWidth;
      canvas.strokeStyle = this.stroke;
      canvas.stroke();
      return this;
    }

    drawHands(canvas, hour, min) {
      canvas.beginPath();
      canvas.lineWidth = 3;
      this.drawHandFromTime(canvas, hour, min);
      canvas.strokeStyle = this.stroke;
      canvas.lineJoin = 'round';
      canvas.stroke();
      // canvas.fillStyle = 'white';
      // canvas.fill();
    }
    updateTime() {
      if (this.current.minute === 59) {
        this.current.minute = 0;
        if (this.current.hour !== this.to.hour) {
          this.current.hour++;
          if (this.current.hour === 13) {
            this.current.hour = 0;
          }
        }
      } else {
        this.current.minute++;
      }
      return this;
    }
    stop() {
      if (!this.timeout) return this;
      clearTimeout(this.timeout);
      this.timeout = null;
      return this;
    }
    renderTo(hour, minute) {
      this.to = { hour, minute };
      this.updateTime();
      this.render();
      return this;
    }
    // clear(canvas) {
    //   canvas.clearRect(0, 0, this.targetEl.width, this.targetEl.height);
    //   return this;
    // }
    clear() {
      const canvas = this.clockclock.getCanvas();
      canvas.clearRect(this.position.left, this.position.top, this.size.width, this.size.height);
      // this.position.left + this.size.width
      // this.position.top + this.size.height
      return this;
    }
    next() {
      this.updateTime();
      if (this.to.hour === this.current.hour && this.to.minute === this.current.minute) return this;
      this.render();
      return this;
    }
    render(hour = null, min = null, autoLoop = true) {
      if (this.to.hour === this.current.hour && this.to.minute === this.current.minute) return this;
      // this.current = { hour, min };
      const canvas = this.clockclock.getCanvas();
      this.clear();
      // Circle
      this.drawCircle(canvas);
      // this.rotate(x, y, angle);

      this.drawHands(canvas, this.current.hour, this.current.minute);
      this.updateTime();
      if (autoLoop) {
        this.timeout = setTimeout(() => this.render(), this.tickDelay);
      }
      // Arrows
    }
  }
  return ClockClock;
})(window)




