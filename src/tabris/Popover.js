import NativeObject from './NativeObject';
import Popup from './Popup';
import {create as createContentView} from './widgets/ContentView';
import {JSX} from './JsxProcessor';
import Composite from './widgets/Composite';

export default class Popover extends Popup {

  static open(value) {
    let popover;
    if (value instanceof Popover) {
      popover = value;
    } else {
      throw new Error('Not a Popover: ' + typeof value);
    }
    return popover.open();
  }

  /**
   * @param {Partial<Popover>=} properties
   */
  constructor(properties) {
    super(properties);
    Object.defineProperty(this, 'contentView', {value: createContentView()});
    this._nativeListen('close', true);
    this._nativeSet('contentView', this.contentView.cid);
  }

  get _nativeType() {
    return 'tabris.Popover';
  }

  _dispose() {
    if (!this.isDisposed()) {
      Composite.prototype._dispose.call(this.contentView);
    }
    super._dispose();
  }

  /** @this {import("../JsxProcessor").default} */
  [JSX.jsxFactory](Type, attributes) {
    const children = this.getChildren(attributes);
    const normalAttributes = this.withoutChildren(attributes);
    const result = super[JSX.jsxFactory](Type, normalAttributes);
    if (children && children.length) {
      result.contentView.append(children);
    }
    return result;
  }

}

NativeObject.defineProperties(Popover.prototype, {
  anchor: {type: 'Widget', default: null},
  width: {type: 'dimension', nocache: true, nullable: true},
  height: {type: 'dimension', nocache: true, nullable: true}
});

NativeObject.defineEvents(Popover.prototype, {
  close: {}
});
