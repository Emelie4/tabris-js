import Widget from '../Widget';

const CONFIG = {
  _name: 'RadioButton',
  _type: 'tabris.RadioButton',
  _events: {
    select: true
  },
  _properties: {
    text: {type: 'string', default: ''},
    selection: {type: 'boolean', nocache: true}
  }
};

export default class RadioButton extends Widget.extend(CONFIG) {

  _listen(name, listening) {
    if (name === 'change:selection') {
      this._onoff('select', listening, this.$triggerChangeSelection);
    } else {
      super._listen(name, listening);
    }
  }

  $triggerChangeSelection({selection}) {
    this._triggerChangeEvent('selection', selection);
  }

}
