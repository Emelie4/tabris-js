import {expect, match, mockTabris, restore, spy} from '../../test';
import ClientStub from '../ClientStub';
import Composite from '../../../src/tabris/widgets/Composite';
import Button from '../../../src/tabris/widgets/Button';
import CheckBox from '../../../src/tabris/widgets/CheckBox';
import ImageView from '../../../src/tabris/widgets/ImageView';
import ProgressBar from '../../../src/tabris/widgets/ProgressBar';
import RadioButton from '../../../src/tabris/widgets/RadioButton';
import Slider from '../../../src/tabris/widgets/Slider';
import TextView from '../../../src/tabris/widgets/TextView';
import TextInput from '../../../src/tabris/widgets/TextInput';
import Switch from '../../../src/tabris/widgets/Switch';
import ToggleButton from '../../../src/tabris/widgets/ToggleButton';
import WebView from '../../../src/tabris/widgets/WebView';
import ActivityIndicator from '../../../src/tabris/widgets/ActivityIndicator';

describe('Common Widgets', function() {

  let client;
  let widget;
  let listener;

  beforeEach(function() {
    client = new ClientStub();
    mockTabris(client);
    listener = spy();
  });

  afterEach(function() {
    restore();
    delete tabris.TestType;
  });

  function getCreate() {
    return client.calls({op: 'create'})[0];
  }

  function checkListen(event) {
    let listen = client.calls({op: 'listen', id: widget.cid});
    expect(listen.length).to.equal(1);
    expect(listen[0].event).to.equal(event);
    expect(listen[0].listen).to.equal(true);
  }

  it('ActivityIndicator', function() {
    let activityIndicator = new ActivityIndicator();

    expect(getCreate().type).to.equal('tabris.ActivityIndicator');
    expect(activityIndicator.constructor.name).to.equal('ActivityIndicator');
  });

  it('Button', function() {
    let button = new Button({enabled: false});

    expect(getCreate().type).to.equal('tabris.Button');
    expect(button.constructor.name).to.equal('Button');
    expect(button.image).to.equal(null);
    expect(button.alignment).to.equal('center');
    expect(button.text).to.equal('');
  });

  it('Button select', function() {
    widget = new Button().on('select', listener);

    tabris._notify(widget.cid, 'select', {});

    expect(listener).to.have.been.calledOnce;
    expect(listener).to.have.been.calledWithMatch({target: widget});
    checkListen('select');
  });

  it('CheckBox', function() {
    let checkBox = new CheckBox({enabled: false});

    expect(getCreate().type).to.equal('tabris.CheckBox');
    expect(checkBox.constructor.name).to.equal('CheckBox');
    expect(checkBox.text).to.equal('');
  });

  it('CheckBox select', function() {
    widget = new CheckBox().on('select', listener);

    tabris._notify(widget.cid, 'select', {checked: true});

    expect(listener).to.have.been.calledOnce;
    expect(listener).to.have.been.calledWithMatch({target: widget, checked: true});
    checkListen('select');
  });

  it('CheckBox checkedChanged', function() {
    widget = new CheckBox().on('checkedChanged', listener);
    tabris._notify(widget.cid, 'select', {checked: true});
    expect(listener).to.have.been.calledOnce;
    expect(listener).to.have.been.calledWithMatch({target: widget, value: true});
    checkListen('select');
  });

  it('Composite', function() {
    let composite = new Composite();

    expect(getCreate().type).to.equal('tabris.Composite');
    expect(composite.constructor.name).to.equal('Composite');
  });

  it('ImageView', function() {
    let imageView = new ImageView();

    expect(getCreate().type).to.equal('tabris.ImageView');
    expect(imageView.constructor.name).to.equal('ImageView');
    expect(imageView.image).to.equal(null);
    expect(imageView.scaleMode).to.equal('auto');
  });

  it('ProgressBar', function() {
    let progressBar = new ProgressBar();

    expect(getCreate().type).to.equal('tabris.ProgressBar');
    expect(progressBar.constructor.name).to.equal('ProgressBar');
    expect(progressBar.minimum).to.equal(0);
    expect(progressBar.maximum).to.equal(100);
    expect(progressBar.selection).to.equal(0);
    expect(progressBar.state).to.equal('normal');
  });

  it('RadioButton', function() {
    let radioButton = new RadioButton({enabled: false});

    expect(getCreate().type).to.equal('tabris.RadioButton');
    expect(radioButton.constructor.name).to.equal('RadioButton');
    expect(radioButton.text).to.equal('');
  });

  it('RadioButton select', function() {
    widget = new RadioButton().on('select', listener);

    tabris._notify(widget.cid, 'select', {checked: true});

    expect(listener).to.have.been.calledOnce;
    expect(listener).to.have.been.calledWithMatch({target: widget, checked: true});
    checkListen('select');
  });

  it('RadioButton checkedChanged', function() {
    widget = new RadioButton().on('checkedChanged', listener);
    tabris._notify(widget.cid, 'select', {checked: true});

    expect(listener).to.have.been.calledOnce;
    expect(listener).to.have.been.calledWithMatch({target: widget, value: true});
    checkListen('select');
  });

  it('TextView', function() {
    let textView = new TextView({text: 'foo'});

    expect(getCreate().type).to.equal('tabris.TextView');
    expect(getCreate().properties).to.deep.equal({text: 'foo'});
    expect(textView.constructor.name).to.equal('TextView');
    expect(textView.alignment).to.equal('left');
    expect(textView.markupEnabled).to.equal(false);
    expect(textView.maxLines).to.equal(null);
  });

  it('TextView, maxLines: 0 is mapped to null', function() {
    new TextView({text: 'foo', maxLines: 0});

    expect(getCreate().properties.maxLines).to.be.null;
  });

  it('TextView, maxLines: values <= 0 are mapped to null', function() {
    new TextView({text: 'foo', maxLines: -1});

    expect(getCreate().properties.maxLines).to.be.null;
  });

  it('Slider', function() {
    let slider = new Slider({selection: 23});

    expect(getCreate().type).to.equal('tabris.Slider');
    expect(getCreate().properties).to.deep.equal({selection: 23});
    expect(slider.constructor.name).to.equal('Slider');
    expect(slider.minimum).to.equal(0);
    expect(slider.maximum).to.equal(100);
  });

  it('Slider select', function() {
    widget = new Slider().on('select', listener);

    tabris._notify(widget.cid, 'select', {selection: 23});

    expect(listener).to.have.been.calledOnce;
    expect(listener).to.have.been.calledWithMatch({target: widget, selection: 23});
    checkListen('select');
  });

  it('Slider selectionChanged', function() {
    widget = new Slider().on('selectionChanged', listener);
    tabris._notify(widget.cid, 'select', {selection: 23});

    expect(listener).to.have.been.calledOnce;
    expect(listener).to.have.been.calledWithMatch({target: widget, value: 23});
    checkListen('select');
  });

  describe('TextInput', function() {

    it('create', function() {
      new TextInput({text: 'foo'});

      expect(getCreate().type).to.equal('tabris.TextInput');
      expect(getCreate().properties).to.deep.equal({text: 'foo'});
    });

    it('constructor name', function() {
      let textInput = new TextInput({text: 'foo'});

      expect(textInput.constructor.name).to.equal('TextInput');
    });

    it('properties', function() {
      let textInput = new TextInput({text: 'foo'});

      expect(textInput.message).to.equal('');
      expect(textInput.alignment).to.equal('left');
      expect(textInput.keyboard).to.equal('default');
      expect(textInput.enterKeyType).to.equal('default');
      expect(textInput.autoCorrect).to.equal(false);
    });

    describe('autoCapitalize', function() {

      it('should native set value to "none" when false given', function() {
        new TextInput({autoCapitalize: false});

        expect(getCreate().properties.autoCapitalize).to.equal('none');
      });

      it('should native set value to "all" when true given', function() {
        new TextInput({autoCapitalize: true});

        expect(getCreate().properties.autoCapitalize).to.equal('all');
      });

      it('should native set given value', function() {
        new TextInput({autoCapitalize: 'sentence'});

        expect(getCreate().properties.autoCapitalize).to.equal('sentence');
      });

    });

    it('input event', function() {
      widget = new TextInput().on('input', listener);

      tabris._notify(widget.cid, 'input', {text: 'foo'});

      expect(listener).to.have.been.calledOnce;
      expect(listener).to.have.been.calledWithMatch({target: widget, text: 'foo'});
      checkListen('input');
    });

    it('accept event', function() {
      widget = new TextInput().on('accept', listener);

      tabris._notify(widget.cid, 'accept', {text: 'foo'});

      expect(listener).to.have.been.calledOnce;
      expect(listener).to.have.been.calledWithMatch({target: widget, text: 'foo'});
      checkListen('accept');
    });

    it('textChanged event', function() {
      widget = new TextInput().on('textChanged', listener);

      tabris._notify(widget.cid, 'input', {text: 'foo'});

      expect(listener).to.have.been.calledOnce;
      expect(listener).to.have.been.calledWithMatch({target: widget, value: 'foo'});
      checkListen('input');
    });

    it('beforeTextChange event', function() {
      widget = new TextInput().on('beforeTextChange', listener);
      const preventDefault = () => undefined;

      tabris._notify(widget.cid, 'beforeTextChange', {oldValue: 'foo', newValue: 'bar', preventDefault});

      expect(listener).to.have.been.calledOnce;
      expect(listener).to.have.been.calledWithMatch(
        {target: widget, oldValue: 'foo', newValue: 'bar', preventDefault: match.func}
      );
      checkListen('beforeTextChange');
    });
  });

  it('WebView', function() {
    let webView = new WebView({html: 'foo'});

    expect(getCreate().type).to.equal('tabris.WebView');
    expect(getCreate().properties).to.deep.equal({html: 'foo'});
    expect(webView.constructor.name).to.equal('WebView');
  });

  it('Switch', function() {
    let swtch = new Switch({checked: true});

    expect(getCreate().type).to.equal('tabris.Switch');
    expect(getCreate().properties).to.deep.equal({checked: true});
    expect(swtch.constructor.name).to.equal('Switch');
  });

  it('Switch checkedChanged', function() {
    widget = new Switch().on('checkedChanged', listener);

    tabris._notify(widget.cid, 'select', {checked: true});

    expect(listener).to.have.been.calledOnce;
    expect(listener).to.have.been.calledWithMatch({target: widget, value: true});
    checkListen('select');
  });

  it('Switch checkedChanged on property change', function() {
    widget = new Switch().on('checkedChanged', listener);

    widget.checked = true;

    expect(listener).to.have.been.calledOnce;
    expect(listener).to.have.been.calledWithMatch({target: widget, value: true});
  });

  it('Switch select', function() {
    widget = new Switch().on('select', listener);

    tabris._notify(widget.cid, 'select', {checked: true});

    expect(listener).to.have.been.calledOnce;
    expect(listener).to.have.been.calledWithMatch({target: widget, checked: true});
    checkListen('select');
  });

  it('ToggleButton', function() {
    let toggleButton = new ToggleButton({enabled: false});

    expect(getCreate().type).to.equal('tabris.ToggleButton');
    expect(toggleButton.constructor.name).to.equal('ToggleButton');
    expect(toggleButton.text).to.equal('');
    expect(toggleButton.image).to.equal(null);
    expect(toggleButton.alignment).to.equal('center');
  });

  it('ToggleButton checkedChanged', function() {
    widget = new ToggleButton().on('checkedChanged', listener);

    tabris._notify(widget.cid, 'select', {checked: true});

    expect(listener).to.have.been.calledOnce;
    expect(listener).to.have.been.calledWithMatch({target: widget, value: true});
    checkListen('select');
  });

  it('ToggleButton select', function() {
    widget = new ToggleButton().on('select', listener);

    tabris._notify(widget.cid, 'select', {checked: true});

    expect(listener).to.have.been.calledOnce;
    expect(listener).to.have.been.calledWithMatch({target: widget, checked: true});
    checkListen('select');
  });

  it('sets native color properties as RGBA arrays', function() {
    widget = new TextInput({text: 'foo', textColor: 'red'});

    expect(getCreate().properties.textColor).to.deep.equal([255, 0, 0, 255]);
  });

  it('resets native color properties by null', function() {
    widget = new TextInput({text: 'foo', textColor: 'red'});
    widget.textColor = 'initial';

    expect(getCreate().properties.textColor).to.be.null;
  });

});
