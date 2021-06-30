import NativeObject from './NativeObject';
import {types} from './property-types';

export const OPCODES = {
  arc: 1,
  arcTo: 2,
  beginPath: 3,
  bezierCurveTo: 4,
  clearRect: 5,
  closePath: 6,
  fill: 7,
  fillRect: 8,
  fillStyle: 9,
  fillText: 10,
  lineCap: 11,
  lineJoin: 12,
  lineTo: 13,
  lineWidth: 14,
  moveTo: 15,
  quadraticCurveTo: 16,
  rect: 17,
  restore: 18,
  rotate: 19,
  save: 20,
  scale: 21,
  setTransform: 22,
  stroke: 23,
  strokeRect: 24,
  strokeStyle: 25,
  strokeText: 26,
  textAlign: 27,
  textBaseline: 28,
  transform: 29,
  translate: 30,
  font: 31,
  drawImage: 32
};

export default class GC extends NativeObject {

  constructor(properties) {
    super(properties);
    Object.defineProperties(this, {
      _operations: {enumerable: false, writable: true, value: []},
      _doubles: {enumerable: false, writable: true, value: []},
      _booleans: {enumerable: false, writable: true, value: []},
      _strings: {enumerable: false, writable: true, value: []},
      _ints: {enumerable: false, writable: true, value: []}
    });
    const listener = () => this.flush();
    tabris.on('_flush', listener);
    this.on('_dispose', () => tabris.off('_flush', listener));
  }

  init(properties) {
    this._nativeCall('init', properties);
  }

  getImageData(x, y, width, height) {
    const array = this._nativeCall('getImageData', {x, y, width, height});
    // TODO: remove when iOS returns a typed array
    return array instanceof Uint8ClampedArray ? array : new Uint8ClampedArray(array);
  }

  putImageData(imageData, x, y) {
    this._nativeCall('putImageData', {
      data: imageData.data,
      width: imageData.width,
      height: imageData.height,
      x,
      y
    });
  }

  addOperation(operation) {
    const opCode = OPCODES[operation];
    if (!opCode) {
      throw new Error('Invalid operation');
    }
    this._operations.push(opCode);
  }

  addBoolean() {
    Array.prototype.push.apply(this._booleans, arguments);
  }

  addDouble() {
    Array.prototype.push.apply(this._doubles, arguments);
  }

  addInt() {
    Array.prototype.push.apply(this._ints, arguments);
  }

  addString() {
    Array.prototype.push.apply(this._strings, arguments);
  }

  flush() {
    if (this._operations.length > 0) {
      this._nativeCall('draw', {packedOperations: [
        this._operations,
        this._doubles,
        this._booleans,
        this._strings,
        this._ints
      ]});
      this._operations = [];
      this._doubles = [];
      this._booleans = [];
      this._strings = [];
      this._ints = [];
    }
  }

  get _nativeType() {
    return 'tabris.GC';
  }

}

NativeObject.defineProperties(GC.prototype,
  {parent: {type: types.Widget, default: null}}
);
