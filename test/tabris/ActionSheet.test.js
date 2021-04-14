import {createJsxProcessor} from '../../src/tabris/JsxProcessor';
import {expect, mockTabris, restore, spy} from '../test';
import ClientMock from './ClientMock';
import ActionSheet, {ActionSheetItem} from '../../src/tabris/ActionSheet';
import Image from '../../src/tabris/Image';

describe('ActionSheet', () => {

  let client, actionSheet;

  beforeEach(() => {
    client = new ClientMock();
    mockTabris(client);
    actionSheet = new ActionSheet();
  });

  afterEach(restore);

  describe('open', () => {

    it('returns this', () => {
      expect(actionSheet.open()).to.equal(actionSheet);
    });

    it('calls open', () => {
      actionSheet.open();
      expect(client.calls({op: 'call'})[0].method).to.equal('open');
    });

    it('throws if actionSheet was closed', () => {
      actionSheet.open();
      actionSheet.close();
      expect(() => actionSheet.open()).to.throw('Can not open a popup that was disposed');
    });

    describe('as static method', () => {

      it('returns actionSheet', () => {
        expect(ActionSheet.open(actionSheet)).to.equal(actionSheet);
      });

      it('calls open', () => {
        ActionSheet.open(actionSheet);
        expect(client.calls({op: 'call'})[0].method).to.equal('open');
      });

      it('throws if argument is not an actionSheet', () => {
        expect(() => ActionSheet.open('foo')).to.throw('Not an ActionSheet');
      });

      it('throws if actionSheet was closed', () => {
        actionSheet.open();
        actionSheet.close();
        expect(() => ActionSheet.open(actionSheet)).to.throw('Can not open a popup that was disposed');
      });

    });

  });

  describe('actions', () => {

    it('defaults to empty array', () => {
      expect(actionSheet.actions).to.deep.equal([]);
    });

    it('warns for invalid style', () => {
      spy(console, 'warn');

      actionSheet.actions = [{style: 'foo'}];

      expect(console.warn).to.have.been.calledWithMatch(
        /style must be "default", "cancel" or "destructive"", got "foo"/
      );
      expect(actionSheet.actions).to.deep.equal([]);
    });

    it('throws for invalid image', () => {
      spy(console, 'warn');

      actionSheet.actions = [{image: 23}];

      expect(console.warn).to.have.been.calledWithMatch(/23 is not a valid ImageValue/);
      expect(actionSheet.actions).to.deep.equal([]);
    });

    it('stringifies title', () => {
      client.resetCalls();

      actionSheet.actions = [{title: {toString: () => 'foo'}}];

      expect(client.calls({op: 'set'})[0]).to.deep.equal({
        op: 'set',
        id: actionSheet.cid,
        properties: {actions: [{title: 'foo', image: null, style: 'default'}]}
      });
    });

    it('stringifies title', () => {
      client.resetCalls();

      actionSheet.actions = [{title: {toString: () => 'foo'}}];

      expect(client.calls({op: 'set'})[0]).to.deep.equal({
        op: 'set',
        id: actionSheet.cid,
        properties: {actions: [{title: 'foo', image: null, style: 'default'}]}
      });
    });

    it('returns ActionSheetItem instance', () => {
      actionSheet.actions = [{title: 'foo', image: null, style: 'default'}];

      expect(actionSheet.actions[0]).be.instanceof(ActionSheetItem);
    });

    it('returned ActionSheetItem implements toString', () => {
      actionSheet.actions = [{title: 'foo'}, {}];

      expect(actionSheet.actions[0].toString()).equal('foo');
      expect(actionSheet.actions[1].toString()).equal('[object ActionSheetItem]');
    });

  });

  describe('close', () => {

    it('returns this', () => {
      expect(actionSheet.close()).to.equal(actionSheet);
    });

    it('disposes the actionSheet', () => {
      actionSheet.close();
      expect(actionSheet.isDisposed()).to.equal(true);
    });

    it('fires close event with no selection', () => {
      const close = spy();
      actionSheet.onClose(close);

      actionSheet.close();

      expect(close).to.have.been.calledOnce;
      expect(close).to.have.been.calledWithMatch({target: actionSheet, index: null, action: null});
    });

  });

  describe('close event', () => {

    it('actionSheet LISTENs to close', () => {
      actionSheet.onClose(spy());

      expect(client.calls({op: 'listen'})[1]).to.deep.equal({
        op: 'listen',
        id: actionSheet.cid,
        event: 'close',
        listen: true
      });
    });

    it('fires close event with no selection', () => {
      const close = spy();
      actionSheet.onClose(close);

      tabris._notify(actionSheet.cid, 'close', {});

      expect(close).to.have.been.calledOnce;
      expect(close).to.have.been.calledWithMatch({target: actionSheet, index: null, action: null});
    });

    it('fires close event with selected index and item', () => {
      const action = {title: 'Foo'};
      actionSheet.actions = [action];
      const close = spy();
      actionSheet.onClose(close);

      tabris._notify(actionSheet.cid, 'select', {index: 0});
      tabris._notify(actionSheet.cid, 'close', {});

      expect(close).to.have.been.calledWithMatch({target: actionSheet, index: 0, action});
    });

  });

  describe('select event', () => {

    it('actionSheet always LISTENs to select', () => {
      expect(client.calls({op: 'listen'})[0]).to.deep.equal({
        op: 'listen',
        id: actionSheet.cid,
        event: 'select',
        listen: true
      });
    });

    it('fires select event with action', () => {
      const select = spy();
      actionSheet.actions = [{title: 'foo'}];
      actionSheet.onSelect(select);

      tabris._notify(actionSheet.cid, 'select', {index: 0});

      expect(select).to.have.been.calledOnce;
      expect(select).to.have.been.calledWithMatch({target: actionSheet, action: {title: 'foo'}});
    });

  });

  describe('JSX', () => {

    let jsx;

    beforeEach(function() {
      jsx = createJsxProcessor();
    });

    it('with message property', function() {
      const popup = jsx.createElement(
        ActionSheet,
        {message: 'Hello World!'}
      );

      expect(popup).to.be.instanceOf(ActionSheet);
      expect(popup.message).to.equal('Hello World!');
    });

    it('with text content', function() {
      const popup = jsx.createElement(
        ActionSheet,
        null,
        'Hello  ',
        'World!'
      );

      expect(popup.message).to.equal('Hello  World!');
    });

    it('with text content and message property', function() {
      expect(() => jsx.createElement(
        ActionSheet,
        {message: 'Hello World!'},
        'Hello',
        'World!'
      )).to.throw(/message given twice/);
    });

    it('with actions property', function() {
      const popup = jsx.createElement(
        ActionSheet,
        {actions: [{title: 'Hello World!'}]}
      );

      expect(popup.actions).to.deep.equal([
        {title: 'Hello World!', style: 'default', image: null}
      ]);
    });

    it('with actions as content', function() {
      const popup = jsx.createElement(
        ActionSheet,
        null,
        {title: 'foo'},
        {title: 'bar'}
      );

      expect(popup.actions).to.deep.equal([
        {title: 'foo', style: 'default', image: null},
        {title: 'bar', style: 'default', image: null}
      ]);
    });

    it('with ActionSheetItems as content', function() {
      const popup = jsx.createElement(
        ActionSheet,
        null,
        jsx.createElement(ActionSheetItem, {title: 'foo', image: {src: 'foo.jpg'}, style: 'cancel'}),
        jsx.createElement(ActionSheetItem)
      );

      expect(popup.actions).to.deep.equal([
        {
          title: 'foo',
          image: {src: 'foo.jpg', width: 'auto', height: 'auto', scale: 'auto'},
          style: 'cancel'
        },
        {title: '', image: null, style: 'default'}
      ]);
      expect(popup.actions[0].image).to.be.instanceOf(Image);
    });

    it('with actions property and content', function() {
      expect(() => jsx.createElement(
        ActionSheet,
        {actions: [{title: 'bar'}]},
        {title: 'foo'}
      )).to.throw(/actions given twice/);
    });

    it('with select event listener', () => {
      const select = spy();

      const popup = jsx.createElement(ActionSheet, {onSelect: select});
      tabris._notify(popup.cid, 'select', {});

      expect(select).to.have.been.calledOnce;
      expect(select).to.have.been.calledWithMatch({target: popup});
    });

    it('with close event listener', () => {
      const close = spy();

      const popup = jsx.createElement(ActionSheet, {onClose: close});
      tabris._notify(popup.cid, 'close', {});

      expect(close).to.have.been.calledOnce;
      expect(close).to.have.been.calledWithMatch({target: popup});
    });

    it('ActionSheetItem is immutable', function() {
      const item = jsx.createElement(ActionSheetItem, {title: 'foo', image: {src: 'foo.jpg'}, style: 'default'});

      item.title = null;
      item.image = null;
      item.style = null;

      expect(item).to.be.instanceOf(ActionSheetItem);
      expect(item).to.include({title: 'foo', style: 'default'});
      expect(item.image).to.include({src: 'foo.jpg'});
    });

    it('ActionSheetItem supports text content', function() {
      const item = jsx.createElement(ActionSheetItem, {image: {src: 'foo.jpg'}, style: 'default'}, 'foo');

      expect(item.title).to.deep.equal('foo');
    });

  });

});
