/**
 * @class Visualizer
 */
WX.Visualizer = function(json) {
  WX.Unit.Analyzer.call(this);
  this.label += "Visualizer";
  Object.defineProperties(this, {
    _drawCallback: {
      enumerable: false,
      writable: true,
      value: function() {}
    },
    _context: {
      writable: true,
      value: undefined
    },
    _buffer: {
      writable: true,
      value: new Uint8Array(this._analyzer.frequencyBinCount)
    },
    _width: {
      writable: true,
      value: 600
    },
    _height: {
      writable: true,
      value: 300
    },
    _pause: {
      writable: true,
      value: false
    },
    _defaults: {
      value: {
        context: undefined
      }
    }
  });
  // stuffs
  this.params = this._defaults;
  if (typeof json === "object") {
    this.params = json;
  }
};

WX.Visualizer.prototype = Object.create(WX.Unit.Analyzer.prototype, {
  context: {
    enumerable: true,
    get: function() {
      return this._context;
    },
    set: function(ctx) {
      if (ctx === null) {
        WX.error(this, "invalid drawing context.");
      } else {
        this._context = ctx;
        // flip vertically
        // this._context.scale(1,-1);
        this.updateSize();
      }
    }
  },
  pause: {
    enumerable: true,
    get: function() {
      return this._pause;
    },
    set: function(bool) {
      this._pause = bool;
    }
  },
  onRender: {
    set: function(userFunction) {
      this._drawCallback = userFunction;
    },
    get: function() {
      return this._drawCallback;
    }
  },
  updateSize: {
    value: function() {
      this._width = this._context.canvas.width;
      this._height = this._context.canvas.height;
    }
  },
  draw: {
    value: function(event) {
      if (this._pause) {
        return;
      } else {
        this._analyzer.getByteTimeDomainData(this._buffer);
        this._drawCallback.call(this, this._buffer, this._context, this._width, this._height);
      }
    }
  }
});