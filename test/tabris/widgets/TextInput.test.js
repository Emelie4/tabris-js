import {expect, mockTabris, restore, spy, stub, match} from '../../test';
import ClientMock from '../ClientMock';
import TextInput from '../../../src/tabris/widgets/TextInput';
import {createJsxProcessor} from '../../../src/tabris/JsxProcessor';
import {toXML} from '../../../src/tabris/Console';

describe('TextInput', function() {

  let client;
  let widget;
  let listener;

  function getCreate() {
    return client.calls({op: 'create'})[0];
  }

  function checkListen(event) {
    const listen = client.calls({op: 'listen', id: widget.cid});
    expect(listen.length).to.equal(1);
    expect(listen[0].event).to.equal(event);
    expect(listen[0].listen).to.equal(true);
  }

  beforeEach(function() {
    client = new ClientMock();
    client.get = (id, prop) => client.properties(id)[prop];
    mockTabris(client);
    listener = spy();
  });

  afterEach(function() {
    restore();
    delete tabris.TestType;
  });

  it('create', function() {
    new TextInput({text: 'foo'});

    expect(getCreate().type).to.equal('tabris.TextInput');
    expect(getCreate().properties).to.deep.equal({text: 'foo'});
  });

  it('constructor name', function() {
    const textInput = new TextInput({text: 'foo'});

    expect(textInput.constructor.name).to.equal('TextInput');
  });

  it('properties', function() {
    const textInput = new TextInput({text: 'foo'});

    expect(textInput.message).to.equal('');
    expect(textInput.alignment).to.equal('left');
    expect(textInput.keyboard).to.equal('default');
    expect(textInput.enterKeyType).to.equal('default');
    expect(textInput.autoCorrect).to.equal(false);
    expect(textInput.onTypeChanged).to.be.undefined;
    expect(textInput.maxChars).to.equal(null);
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

  describe('maxChars', function() {

    it('sends null when maxChars is set to `null`', function() {
      new TextInput({maxChars: null});

      expect(getCreate().properties.maxChars).to.equal(null);
    });

    it('throws when maxChars is set to negative number', function() {
      expect(() => new TextInput({maxChars: -1})).to.throw;
    });

    it('throws when maxChars is set to non-number', function() {
      expect(() => new TextInput({maxChars: 'string'})).to.throw;
    });

  });

  it('input event', function() {
    widget = new TextInput().onInput(listener);

    tabris._notify(widget.cid, 'input', {text: 'foo'});

    expect(listener).to.have.been.calledOnce;
    expect(listener).to.have.been.calledWithMatch({target: widget, text: 'foo'});
    checkListen('input');
  });

  it('beforeTextChange event', function() {
    widget = new TextInput().onBeforeTextChange(listener);
    const preventDefault = () => undefined;

    tabris._notify(widget.cid, 'beforeTextChange', {oldValue: 'foo', newValue: 'bar', preventDefault});

    expect(listener).to.have.been.calledOnce;
    expect(listener).to.have.been.calledWithMatch(
      {target: widget, oldValue: 'foo', newValue: 'bar', preventDefault: match.func}
    );
    checkListen('beforeTextChange');
  });

  it('accept event', function() {
    widget = new TextInput().onAccept(listener);

    tabris._notify(widget.cid, 'accept', {text: 'foo'});

    expect(listener).to.have.been.calledOnce;
    expect(listener).to.have.been.calledWithMatch({target: widget, text: 'foo'});
    checkListen('accept');
  });

  it('focus event triggers focusedChanged', function() {
    widget = new TextInput().onFocusedChanged(listener);

    tabris._notify(widget.cid, 'focus');

    expect(listener).to.have.been.calledWithMatch({value: true});
  });

  it('blur event triggers focusedChanged', function() {
    widget = new TextInput().onFocusedChanged(listener);

    tabris._notify(widget.cid, 'blur');

    expect(listener).to.have.been.calledWithMatch({value: false});
  });

  describe('selection', function() {

    it('sets valid selection', function() {
      widget = new TextInput({text: 'foobar'});
      widget.selection = [1, 3];
      expect(widget.selection).to.deep.equal([1, 3]);
    });

    it('rejects invalid selection', function() {
      widget = new TextInput({text: 'foobar', selection: [1, 3]});
      [[-1, 3], [1, 10], [10, 3], [1, -1]].forEach(sel => {
        widget.selection = sel;
        expect(widget.selection).to.deep.equal([1, 3]);
      });
    });

    it('fires change event', function() {
      widget = new TextInput({text: 'foobar'}).onSelectionChanged(listener);

      widget.selection = [1, 3];

      expect(listener).to.have.been.calledOnce;
      expect(listener).to.have.been.calledWithMatch({target: widget, value: [1, 3]});
      checkListen('select');
    });
  });

  it('textChanged event', function() {
    widget = new TextInput().onTextChanged(listener);

    tabris._notify(widget.cid, 'input', {text: 'foo'});

    expect(listener).to.have.been.calledOnce;
    expect(listener).to.have.been.calledWithMatch({target: widget, value: 'foo'});
    checkListen('input');
  });

  describe('JSX', function() {

    let jsx;

    beforeEach(function() {
      jsx = createJsxProcessor();
    });

    it('with text property', function() {
      const textInput = jsx.createElement(
        TextInput,
        {text: 'Hello World!'}
      );

      expect(textInput.text).to.equal('Hello World!');
    });

    it('with text content', function() {
      const textInput = jsx.createElement(
        TextInput,
        null,
        'Hello  ',
        'World!'
      );

      expect(textInput.text).to.equal('Hello  World!');
    });

    it('with text content and text property', function() {
      expect(() => jsx.createElement(
        TextInput,
        {text: 'Hello World!'},
        'Hello',
        'World!'
      )).to.throw(/text given twice/);
    });

  });

  describe('toXML', function() {

    it('prints xml element with text only', function() {
      const textInput = new TextInput();
      stub(client, 'get')
        .withArgs(textInput.cid, 'text').returns('foo')
        .withArgs(textInput.cid, 'bounds').returns({});

      expect(textInput[toXML]()).to.match(/<TextInput .* text='foo'\/>/);
    });

    it('prints xml element with text with line breaks', function() {
      const textInput = new TextInput();
      stub(client, 'get')
        .withArgs(textInput.cid, 'text').returns('foo\nbar')
        .withArgs(textInput.cid, 'bounds').returns([0, 1, 2, 3]);

      expect(widget[toXML]()).to.equal(
        `<TextInput cid='${widget.cid}' bounds='{left: 0, top: 1, width: 2, height: 3}'>\n` +
        '  foo\n' +
        '  bar\n' +
        '</TextInput>'
      );
    });

    it('prints xml element with essential non-default values', function() {
      const textInput = new TextInput({
        type: 'search',
        message: 'bar',
        editable: false,
        keepFocus: true
      });
      stub(client, 'get')
        .withArgs(textInput.cid, 'text').returns('')
        .withArgs(textInput.cid, 'focused').returns(true)
        .withArgs(textInput.cid, 'bounds').returns({});

      expect(textInput[toXML]()).to.match(
        /<TextInput .* type='search' text='' message='bar' editable='false' focused='true' keepFocus='true'\/>/
      );
    });

  });

});
