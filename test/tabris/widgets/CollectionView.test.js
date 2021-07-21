import {expect, match, mockTabris, restore, spy, stub} from '../../test';
import ClientMock from '../ClientMock';
import CollectionView from '../../../src/tabris/widgets/CollectionView';
import Composite from '../../../src/tabris/widgets/Composite';
import {toXML} from '../../../src/tabris/Console';
import WidgetCollection from '../../../src/tabris/WidgetCollection';

describe('CollectionView', function() {

  let client;
  let parent;

  beforeEach(function() {
    client = new ClientMock();
    mockTabris(client);
    parent = new Composite();
    client.resetCalls();
  });

  afterEach(restore);

  describe('constructor', function() {

    beforeEach(function() {
      new CollectionView({background: 'yellow'}).appendTo(parent);
    });

    it('creates a native view', function() {
      const createCalls = client.calls({op: 'create'});
      expect(createCalls.length).to.equal(1);
      expect(createCalls[0].type).to.equal('tabris.CollectionView');
    });

    it('includes standard properties in native create', function() {
      const createCalls = client.calls({op: 'create'});
      expect(createCalls[0].properties.background).to.deep.equal({type: 'color', color: ([255, 255, 0, 255])});
    });

    it('listens on native events `requestInfo`, `createCell`, and `updateCell`', function() {
      expect(client.calls({op: 'listen', event: 'requestInfo'})[0].listen).to.equal(true);
      expect(client.calls({op: 'listen', event: 'createCell'})[0].listen).to.equal(true);
      expect(client.calls({op: 'listen', event: 'updateCell'})[0].listen).to.equal(true);
    });

    it('sets itemCount, updateCell, createCell, cellHeight and cellType', function() {
      const itemCount = 3;
      const cellHeight = 20;
      const updateCell = () => {};
      const createCell = () => {};
      const cellType = () => {};

      const cv = new CollectionView({itemCount, cellHeight, updateCell, createCell, cellType});

      expect(cv.itemCount).to.equal(itemCount);
      expect(cv.cellHeight).to.equal(cellHeight);
      expect(cv.updateCell).to.equal(updateCell);
      expect(cv.createCell).to.equal(createCell);
      expect(cv.cellType).to.equal(cellType);
    });

  });

  describe('instance', function() {

    /** @type {CollectionView} */
    let view;

    beforeEach(function() {
      view = new CollectionView({background: 'yellow'}).appendTo(parent);
      client.resetCalls();
    });

    it('returns default property values', function() {
      expect(view.itemCount).to.equal(0);
      expect(view.cellType).to.equal(null);
      expect(view.cellHeight).to.equal('auto');
      expect(view.createCell).to.be.a('function');
      expect(view.updateCell).to.be.a('function');
      expect(view.fastScroll).to.be.false;
      expect(view.refreshEnabled).to.be.false;
      expect(view.refreshMessage).to.equal('');
      expect(view.scrollbarVisible).to.be.true;
    });

    describe('refreshIndicator', function() {

      it('calls native GET', function() {
        stub(client, 'get').returns(false);

        expect(view.refreshIndicator).to.equal(false);
      });

    });

    describe('createCell', function() {

      it('defaults to function that creates a cell', function() {
        expect(view.createCell).to.be.a('function');
        expect(view.createCell()).to.be.instanceOf(Composite);
      });

      it('accepts function', function() {
        const fn = spy();
        view.createCell = fn;
        expect(view.createCell).to.equal(fn);
      });

      it('does not SET property on client', function() {
        view.createCell = spy();
        expect(client.calls({op: 'set', id: view.cid}).length).to.equal(0);
      });

      it('calls native load with item count', function() {
        view.load(10);
        client.resetCalls();

        view.createCell = spy();

        tabris.flush();
        const calls = client.calls({op: 'call', id: view.cid, method: 'load'});
        expect(calls[0].parameters).to.deep.equal({itemCount: 10});
      });

      it('does not call native load when unchanged', function() {
        const fn = spy();
        view.createCell = fn;
        tabris.flush();
        client.resetCalls();

        view.createCell = fn;
        tabris.flush();

        const calls = client.calls({op: 'call', id: view.cid, method: 'load'});
        expect(calls).to.be.empty;
      });

      it('fires change events', function() {
        const listener = spy();
        const createCell = spy();

        view.onCreateCellChanged(listener);

        view.createCell = createCell;

        expect(listener).to.have.been.calledOnce;
        expect(listener.firstCall.args[0].value).to.equal(createCell);
      });

    });

    describe('updateCell', function() {

      it('defaults to function', function() {
        expect(view.updateCell).to.be.a('function');
      });

      it('accepts function', function() {
        const fn = spy();
        view.updateCell = fn;
        expect(view.updateCell).to.equal(fn);
      });

      it('does not SET property on client', function() {
        view.updateCell = spy();
        expect(client.calls({op: 'set', id: view.cid}).length).to.equal(0);
      });

      it('calls native load with item count', function() {
        view.load(10);
        client.resetCalls();

        view.updateCell = spy();

        tabris.flush();
        const calls = client.calls({op: 'call', id: view.cid, method: 'load'});
        expect(calls[0].parameters).to.deep.equal({itemCount: 10});
      });

      it('does not call native load when unchanged', function() {
        const fn = spy();
        view.updateCell = fn;
        tabris.flush();
        client.resetCalls();

        view.updateCell = fn;
        tabris.flush();

        const calls = client.calls({op: 'call', id: view.cid, method: 'load'});
        expect(calls).to.be.empty;
      });

      it('fires change events', function() {
        const listener = spy();
        const updateCell = spy();
        view.onUpdateCellChanged(listener);

        view.updateCell = updateCell;

        expect(listener).to.have.been.calledOnce;
        expect(listener.firstCall.args[0].value).to.equal(updateCell);
      });

    });

    describe('creating cells on demand', function() {

      it('calls createCell', function() {
        view.createCell = spy(() => new Composite());
        view._trigger('createCell', {type: 0});
        expect(view.createCell).to.have.been.calledOnce;
      });

      it('throws when createCell returns wrong type', function() {
        view.createCell = spy(() => 23);
        expect(() => view._trigger('createCell', {type: 0})).to.throw(Error, 'Created cell 23 is not a widget');
      });

      it('throws when createCell returns widget with a parent', function() {
        const cell = new Composite().appendTo(new Composite());
        view.createCell = spy(() => cell);
        expect(() => view._trigger('createCell', {type: 0})).to.throw(Error,
          /Created cell Composite\[cid=".*"\] already has a parent/
        );
      });

    });

    ['firstVisibleIndex', 'lastVisibleIndex'].forEach((prop) => {

      describe(prop, function() {

        it('GETs property from client', function() {
          stub(client, 'get').returns(23);

          const result = view[prop];

          expect(result).to.equal(23);
          expect(client.get).to.have.been.called;
        });

        it('prevents setting the property', function() {
          stub(console, 'warn');
          spy(client, 'set');

          view[prop] = 23;

          expect(client.set).to.have.not.been.called;
          expect(console.warn).to.have.been.called;
          expect(console.warn).to.have.been.calledWith(match(`Can not set read-only property "${prop}"`));
        });

      });

      const changeEvent = prop + 'Changed';

      describe(changeEvent, function() {

        it('issues native listen once', function() {
          const listener = spy();

          view.on(changeEvent, listener);
          view.on(changeEvent, listener);

          expect(client.calls({op: 'listen', id: view.cid, event: 'scroll'}).length).to.equal(1);
        });

        it('listener is notified once for every new index', function() {
          const listener = spy();
          let index = 23;
          view.on(changeEvent, listener);
          stub(client, 'get').callsFake(() => index);

          view._trigger('scroll', {});
          view._trigger('scroll', {});
          view._trigger('scroll', {});
          index = 24;
          tabris.flush();
          view._trigger('scroll', {});
          view._trigger('scroll', {});

          expect(listener).to.have.been.calledTwice;
          expect(listener.firstCall).to.have.been.calledWithMatch({target: view, value: 23});
          expect(listener.secondCall).to.have.been.calledWithMatch({target: view, value: 24});
        });

        it('listener is notified once even if other listeners are attached', function() {
          const listener = spy();
          view.on(changeEvent, listener);
          view.on(changeEvent, function() {});
          stub(client, 'get').returns(23);

          view._trigger('scroll', {});

          expect(listener).to.have.been.calledOnce;
        });

        it('listener is notified once after on-off-on', function() {
          const listener = spy();
          view.on(changeEvent, listener);
          view.off(changeEvent, listener);
          view.on(changeEvent, listener);
          stub(client, 'get').returns(23);

          view._trigger('scroll', {});

          expect(listener).to.have.been.calledOnce;
        });

      });

    });

    describe('cellType', function() {

      beforeEach(function() {
        tabris.flush();
        spy(client, 'set');
      });

      it('accepts and returns function', function() {
        const fn = spy();
        view.cellType = fn;
        expect(view.cellType).to.equal(fn);
      });

      it('accepts and returns string', function() {
        view.cellType = 'foo';
        expect(view.cellType).to.equal('foo');
      });

      it('does not SET native property', function() {
        view.cellType = 'foo';
        tabris.flush();
        expect(client.set).to.have.not.been.called;
      });

      it('calls native load with item count', function() {
        view.load(10);
        client.resetCalls();

        view.cellType = 'cellType';

        tabris.flush();
        const calls = client.calls({op: 'call', id: view.cid, method: 'load'});
        expect(calls[0].parameters).to.deep.equal({itemCount: 10});
      });

      it('does not call native load when unchanged', function() {
        view.cellType = 'cellType';
        tabris.flush();
        client.resetCalls();

        view.cellType = 'cellType';
        tabris.flush();

        const calls = client.calls({op: 'call', id: view.cid, method: 'load'});
        expect(calls).to.be.empty;
      });

      it('fires change events', function() {
        const listener = spy();
        const updateCell = spy();
        view.onUpdateCellChanged(listener);

        view.updateCell = updateCell;

        expect(listener).to.have.been.calledOnce;
        expect(listener.firstCall.args[0].value).to.equal(updateCell);
      });

    });

    describe('cellHeight', function() {

      beforeEach(function() {
        tabris.flush();
        spy(client, 'set');
      });

      it('accepts and returns function', function() {
        const fn = spy();
        view.cellHeight = fn;
        expect(view.cellHeight).to.equal(fn);
      });

      it('accepts and returns number', function() {
        view.cellHeight = 23;
        expect(view.cellHeight).to.equal(23);
      });

      it('accepts and returns "auto"', function() {
        view.cellHeight = 'auto';
        expect(view.cellHeight).to.equal('auto');
      });

      it('does not SET native property', function() {
        view.cellHeight = 23;
        expect(client.set).to.have.not.been.called;
      });

      it('calls native load with item count', function() {
        view.load(10);
        client.resetCalls();

        view.cellHeight = 48;

        tabris.flush();
        const calls = client.calls({op: 'call', id: view.cid, method: 'load'});
        expect(calls[0].parameters).to.deep.equal({itemCount: 10});
      });

      it('does not call native load when unchanged', function() {
        view.cellHeight = 48;
        tabris.flush();
        client.resetCalls();

        view.cellHeight = 48;
        tabris.flush();

        const calls = client.calls({op: 'call', id: view.cid, method: 'load'});
        expect(calls).to.be.empty;
      });

      it('fires change events', function() {
        const listener = spy();
        const cellHeight = spy();
        view.onCellHeightChanged(listener);

        view.cellHeight = cellHeight;

        expect(listener).to.have.been.calledOnce;
        expect(listener.firstCall.args[0].value).to.equal(cellHeight);
      });

    });

    describe('scrollbarVisible', function() {

      it('changes to false', function() {
        view.scrollbarVisible = false;

        expect(client.calls({id: view.cid})[0].properties).to.deep.equal({scrollbarVisible: false});
      });

    });

    describe('itemCount', function() {

      it('accepts numbers', function() {
        view.itemCount = 23;
        expect(view.itemCount).to.equal(23);
      });

      it('calls native load with item count', function() {
        view.itemCount = 23;
        tabris.flush();
        const calls = client.calls({op: 'call', id: view.cid, method: 'load'});
        expect(calls[0].parameters).to.deep.equal({itemCount: 23});
      });

      it('also calls native load when unchanged', function() {
        view.itemCount = 23;
        tabris.flush();
        client.resetCalls();

        view.itemCount = 23;
        tabris.flush();

        const calls = client.calls({op: 'call', id: view.cid, method: 'load'});
        expect(calls[0].parameters).to.deep.equal({itemCount: 23});
      });

      it('does not set native property', function() {
        view.itemCount = 23;

        const calls = client.calls({op: 'set', id: view.cid});
        expect(calls).to.be.empty;
      });

      it('fires change events', function() {
        const listener = spy();
        view.onItemCountChanged(listener);

        view.itemCount = 11;

        expect(listener).to.have.been.calledOnce;
        expect(listener.firstCall.args[0].value).to.equal(11);
      });

    });

    describe('when `requestInfo` event is received', function() {

      let results;

      describe('when cellType and cellHeight are functions', function() {

        beforeEach(function() {
          view.cellType = spy(index => index % 2 === 0 ? 'bar' : 'foo');
          view.cellHeight = spy(index => index % 2 === 0 ? 50 : 80);
          results = [
            view._trigger('requestInfo', {index: 0}),
            view._trigger('requestInfo', {index: 1}),
            view._trigger('requestInfo', {index: 2})
          ];
        });

        it('executes `cellType` function', function() {
          expect(view.cellType).to.have.been.calledWith(0);
          expect(view.cellType).to.have.been.calledWith(1);
          expect(view.cellType).to.have.been.calledWith(2);
        });

        it('executes `cellHeight` function', function() {
          expect(view.cellHeight).to.have.been.calledWith(0);
          expect(view.cellHeight).to.have.been.calledWith(1);
          expect(view.cellHeight).to.have.been.calledWith(2);
        });

        it('returns type and height', function() {
          expect(results).to.deep.equal([
            {type: 0, height: 50},
            {type: 1, height: 80},
            {type: 0, height: 50}
          ]);
        });

      });

      describe('when cellType and cellHeight are values', function() {

        beforeEach(function() {
          view.cellType = 'foo';
          view.cellHeight = 50;
          results = [
            view._trigger('requestInfo', {index: 0}),
            view._trigger('requestInfo', {index: 1}),
            view._trigger('requestInfo', {index: 2})
          ];
        });

        it('returns type and height', function() {
          expect(results).to.deep.equal([
            {type: 0, height: 50},
            {type: 0, height: 50},
            {type: 0, height: 50}
          ]);
        });

      });

    });

    describe('when `scroll` event is received', function() {

      it('triggers `scroll` on collection view', function() {
        const listener = spy();
        view.onScroll(listener);

        view._trigger('scroll', {deltaX: 23, deltaY: 42});

        expect(listener).to.have.been.calledOnce;
        expect(listener).to.have.been.calledWithMatch({target: view, deltaX: 23, deltaY: 42});
      });

    });

    describe('when `createCell` event is received', function() {

      let result, cell;

      beforeEach(function() {
        view.createCell = spy(() => {
          cell = new Composite();
          return cell;
        });
        result = view._trigger('createCell', {type: 0});
      });

      it('calls createCell with itemType null', function() {
        expect(view.createCell).to.have.been.calledWith(null);
      });

      it('returns the created cell`s id', function() {
        expect(result).to.equal(cell.cid);
      });

      it('sets the cell parent to the collection view', function() {
        expect(cell.parent()).to.equal(view);
      });

      it('returns cells as children', function() {
        expect(view.children().length).to.equal(1);
        expect(view.children()[0]).to.equal(cell);
      });

      describe('when calling cell.dispose()', function() {

        beforeEach(function() {
          stub(console, 'warn');
          cell.dispose();
        });

        it('cell is not disposed', function() {
          expect(cell.isDisposed()).to.equal(false);
        });

        it('a warning is logged', function() {
          const warning = 'Cannot dispose of collection view cell';
          expect(console.warn).to.have.been.calledWithMatch(warning);
        });

      });

      describe('when calling cell.appendTo()', function() {

        beforeEach(function() {
          stub(console, 'warn');
          cell.appendTo(new Composite());
        });

        it('cell parent is unchanged', function() {
          expect(cell.parent()).to.equal(view);
        });

        it('a warning is logged', function() {
          const warning = 'Cannot re-parent collection view cell';
          expect(console.warn).to.have.been.calledWithMatch(warning);
        });

      });

      describe('when view is disposed', function() {

        beforeEach(function() {
          view.dispose();
        });

        it('cells are disposed', function() {
          expect(cell.isDisposed()).to.equal(true);
        });

      });

    });

    describe('when `updateCell` event is received', function() {

      let cell;

      beforeEach(function() {
        cell = new Composite();
        view.updateCell = spy();
      });

      it('calls `updateCell`', function() {
        view._trigger('updateCell', {widget: cell.cid, index: 3});

        expect(view.updateCell).to.have.been.calledOnce;
        expect(view.updateCell).to.have.been.calledWith(cell, 3);
      });

    });

    describe('itemIndex', function() {

      let cellA, cellB;

      beforeEach(function() {
        view.createCell = () => new Composite();
        const registry = tabris._nativeObjectRegistry;
        cellA = registry.find(view._trigger('createCell', {type: 0}));
        cellB = registry.find(view._trigger('createCell', {type: 0}));
        view.itemCount = 5;
      });

      it('throws for invalid values`', function() {
        expect(() => view.itemIndex()).to.throw();
        expect(() => view.itemIndex(null)).to.throw();
        expect(() => view.itemIndex(true)).to.throw();
        expect(() => view.itemIndex(new Composite())).to.throw();
      });

      it('returns -1 for unbound cell', function() {
        expect(view.itemIndex(cellA)).to.equal(-1);
        expect(view.itemIndex(cellB)).to.equal(-1);
      });

      it('returns index for bound cells', function() {
        view._trigger('updateCell', {widget: cellA.cid, index: 3});
        view._trigger('updateCell', {widget: cellB.cid, index: 4});

        expect(view.itemIndex(cellA)).to.equal(3);
        expect(view.itemIndex(cellB)).to.equal(4);
      });

      it('returns index for cell child', function() {
        view._trigger('updateCell', {widget: cellA.cid, index: 3});
        const child = new Composite().appendTo(cellA);

        expect(view.itemIndex(cellA)).to.equal(3);
        expect(view.itemIndex(child)).to.equal(3);
      });

      it('always returns latest association', function() {
        view._trigger('updateCell', {widget: cellA.cid, index: 3});
        view._trigger('updateCell', {widget: cellA.cid, index: 4});

        expect(view.itemIndex(cellA)).to.equal(4);
      });

      it('returns shifted association', function() {
        view._trigger('updateCell', {widget: cellA.cid, index: 2});
        view._trigger('updateCell', {widget: cellB.cid, index: 3});

        view.insert(1, 2);

        expect(view.itemIndex(cellA)).to.equal(4);
        expect(view.itemIndex(cellB)).to.equal(5);
      });

      it('keeps non-shifted association', function() {
        view._trigger('updateCell', {widget: cellA.cid, index: 1});
        view._trigger('updateCell', {widget: cellB.cid, index: 2});

        view.insert(3, 2);

        expect(view.itemIndex(cellA)).to.equal(1);
        expect(view.itemIndex(cellB)).to.equal(2);
      });

      it('returns unshifted association', function() {
        view._trigger('updateCell', {widget: cellA.cid, index: 3});
        view._trigger('updateCell', {widget: cellB.cid, index: 4});

        view.remove(1, 2);

        expect(view.itemIndex(cellA)).to.equal(1);
        expect(view.itemIndex(cellB)).to.equal(2);
      });

      it('keeps non-unshifted association', function() {
        view._trigger('updateCell', {widget: cellA.cid, index: 1});
        view._trigger('updateCell', {widget: cellB.cid, index: 2});

        view.remove(3, 2);

        expect(view.itemIndex(cellA)).to.equal(1);
        expect(view.itemIndex(cellB)).to.equal(2);
      });

      it('clears removed association', function() {
        view._trigger('updateCell', {widget: cellA.cid, index: 1});
        view._trigger('updateCell', {widget: cellB.cid, index: 2});

        view.remove(0, 2);

        expect(view.itemIndex(cellA)).to.equal(-1);
        expect(view.itemIndex(cellB)).to.equal(0);
      });

    });

    describe('cellByItemIndex', function() {

      let cellA, cellB;

      beforeEach(function() {
        view.createCell = () => new Composite();
        const registry = tabris._nativeObjectRegistry;
        cellA = registry.find(view._trigger('createCell', {type: 0}));
        cellB = registry.find(view._trigger('createCell', {type: 0}));
        view.itemCount = 5;
      });

      it('throws for invalid values`', function() {
        expect(() => view.cellByItemIndex()).to.throw();
        expect(() => view.cellByItemIndex(null)).to.throw();
        expect(() => view.cellByItemIndex(true)).to.throw();
        expect(() => view.cellByItemIndex(-1)).to.throw();
      });

      it('returns null for unbound index', function() {
        view._trigger('updateCell', {widget: cellA.cid, index: 3});
        view._trigger('updateCell', {widget: cellB.cid, index: 4});

        expect(view.cellByItemIndex(0)).to.be.null;
        expect(view.cellByItemIndex(1)).to.be.null;
      });

      it('returns index for bound index', function() {
        view._trigger('updateCell', {widget: cellA.cid, index: 3});
        view._trigger('updateCell', {widget: cellB.cid, index: 4});

        expect(view.cellByItemIndex(3)).to.equal(cellA);
        expect(view.cellByItemIndex(4)).to.equal(cellB);
      });

      it('returns latest association', function() {
        view._trigger('updateCell', {widget: cellA.cid, index: 3});
        view._trigger('updateCell', {widget: cellA.cid, index: 4});

        expect(view.cellByItemIndex(4)).to.equal(cellA);
        expect(view.cellByItemIndex(3)).to.be.null;
      });

      it('returns shifted association', function() {
        view._trigger('updateCell', {widget: cellA.cid, index: 1});
        view._trigger('updateCell', {widget: cellB.cid, index: 2});

        view.insert(1, 2);

        expect(view.cellByItemIndex(1)).to.be.null;
        expect(view.cellByItemIndex(2)).to.be.null;
        expect(view.cellByItemIndex(3)).to.equal(cellA);
        expect(view.cellByItemIndex(4)).to.equal(cellB);
      });

      it('returns unshifted association', function() {
        view._trigger('updateCell', {widget: cellA.cid, index: 3});
        view._trigger('updateCell', {widget: cellB.cid, index: 4});

        view.remove(1, 2);

        expect(view.cellByItemIndex(1)).to.equal(cellA);
        expect(view.cellByItemIndex(2)).to.equal(cellB);
        expect(view.cellByItemIndex(3)).to.be.null;
      });

      it('returns shifted association with overwritten children()', function() {
        view.children = () => new WidgetCollection([]);
        view._trigger('updateCell', {widget: cellA.cid, index: 1});
        view._trigger('updateCell', {widget: cellB.cid, index: 2});

        view.insert(1, 2);

        expect(view.cellByItemIndex(1)).to.be.null;
        expect(view.cellByItemIndex(2)).to.be.null;
        expect(view.cellByItemIndex(3)).to.equal(cellA);
        expect(view.cellByItemIndex(4)).to.equal(cellB);
      });

      it('returns unshifted association overwritten children()', function() {
        view.children = () => new WidgetCollection([]);
        view._trigger('updateCell', {widget: cellA.cid, index: 3});
        view._trigger('updateCell', {widget: cellB.cid, index: 4});

        view.remove(1, 2);

        expect(view.cellByItemIndex(1)).to.equal(cellA);
        expect(view.cellByItemIndex(2)).to.equal(cellB);
        expect(view.cellByItemIndex(3)).to.be.null;
      });

    });

    describe('load', function() {

      beforeEach(function() {
        view.load(23);
        client.resetCalls();
      });

      it('fails when index is not a number', function() {
        expect(() => view.load(NaN)).to.throw(Error, 'Invalid itemCount');
        expect(() => view.load({})).to.throw(Error, 'Invalid itemCount');
      });

      it('fails when count is negative', function() {
        expect(() => view.load(-1)).to.throw(Error, 'Invalid itemCount');
      });

      it('accepts zero', function() {
        view.load(0);
        expect(view.itemCount).to.equal(0);
      });

      it('sets itemCount property', function() {
        view.load(42);
        expect(view.itemCount).to.equal(42);
      });

      it('does not call native load before flash', function() {
        view.load(42);

        const calls = client.calls({op: 'call', id: view.cid, method: 'load'});
        expect(calls).to.be.empty;
      });

      it('calls native load after flush', function() {
        view.load(42);
        tabris.flush();

        const loadCall = client.calls({op: 'call', method: 'load', id: view.cid})[0];
        expect(loadCall.parameters).to.deep.equal({itemCount: 42});
      });

    });

    describe('insert', function() {

      beforeEach(function() {
        view.load(3);
        client.resetCalls();
      });

      it('fails when index is not a number', function() {
        expect(() => view.insert(NaN)).to.throw(Error, 'NaN is not a valid index');
      });

      it('fails when count is not a number', function() {
        expect(() => view.insert(0, NaN)).to.throw(Error, 'Invalid insert count');
      });

      it('fails when count is zero or negative', function() {
        expect(() => view.insert(0, 0)).to.throw(Error, 'Invalid insert count');
        expect(() => view.insert(0, -1)).to.throw(Error, 'Invalid insert count');
      });

      it('calls native update', function() {
        view.insert(0, 3);

        const updateCall = client.calls({op: 'call', method: 'insert', id: view.cid})[0];
        expect(updateCall.parameters).to.deep.equal({index: 0, count: 3});
      });

      it('calls load first if needed', function() {
        view.itemCount = 42;
        view.insert(1);

        const calls = client.calls({op: 'call', id: view.cid});
        expect(calls.map(call => call.method)).to.deep.equal(['load', 'insert']);
      });

      it('updates itemCount', function() {
        view.insert(0, 3);

        expect(view.itemCount).to.equal(6);
      });

      it('handles single parameter', function() {
        view.insert(2);

        const updateCall = client.calls({op: 'call', method: 'insert', id: view.cid})[0];
        expect(updateCall.parameters).to.deep.equal({index: 2, count: 1});
        expect(view.itemCount).to.equal(4);
      });

      it('handles negative index', function() {
        view.insert(-1);

        const updateCall = client.calls({op: 'call', method: 'insert', id: view.cid})[0];
        expect(updateCall.parameters).to.deep.equal({index: 2, count: 1});
        expect(view.itemCount).to.equal(4);
      });

      it('adjusts index to bounds', function() {
        view.insert(5);

        const call = client.calls({op: 'call', method: 'insert', id: view.cid})[0];
        expect(call.parameters).to.deep.equal({index: 3, count: 1});
        expect(view.itemCount).to.equal(4);
      });

      it('adjusts negative index to bounds', function() {
        view.insert(-5);

        const call = client.calls({op: 'call', method: 'insert', id: view.cid})[0];
        expect(call.parameters).to.deep.equal({index: 0, count: 1});
        expect(view.itemCount).to.equal(4);
      });

    });

    describe('remove', function() {

      beforeEach(function() {
        view.itemCount = 3;
        client.resetCalls();
      });

      it('fails when index is not a number', function() {
        expect(() => view.remove(NaN)).to.throw(Error, 'NaN is not a valid index');
      });

      it('fails when count is not a number', function() {
        expect(() => view.remove(0, NaN)).to.throw(Error, 'Invalid remove count NaN');
      });

      it('calls native update', function() {
        view.remove(1, 2);

        const updateCall = client.calls({op: 'call', method: 'remove', id: view.cid})[0];
        expect(updateCall.parameters).to.deep.equal({index: 1, count: 2});
      });

      it('calls native load first if needed', function() {
        view.itemCount = 42;
        view.remove(1);

        const calls = client.calls({op: 'call', id: view.cid});
        expect(calls.map(call => call.method)).to.deep.equal(['load', 'remove']);
      });

      it('updates itemCount', function() {
        view.remove(1, 2);

        expect(view.itemCount).to.equal(1);
      });

      it('handles single parameter', function() {
        view.remove(1);

        const updateCall = client.calls({op: 'call', method: 'remove', id: view.cid})[0];
        expect(updateCall.parameters).to.deep.equal({index: 1, count: 1});
        expect(view.itemCount).to.equal(2);
      });

      it('handles negative index', function() {
        view.remove(-1);

        const updateCall = client.calls({op: 'call', method: 'remove', id: view.cid})[0];
        expect(updateCall.parameters).to.deep.equal({index: 2, count: 1});
        expect(view.itemCount).to.equal(2);
      });

      it('ignores index out of bounds', function() {
        view.remove(5, 2);

        const updateCalls = client.calls({op: 'call', method: 'update', id: view.cid});
        expect(updateCalls).to.be.empty;
        expect(view.itemCount).to.equal(3);
      });

      it('ignores negative index out of bounds', function() {
        view.remove(-5, 2);

        const updateCalls = client.calls({op: 'call', method: 'update', id: view.cid});
        expect(updateCalls).to.be.empty;
      });

      it('repairs count if exceeding', function() {
        view.remove(2, 5);

        const updateCall = client.calls({op: 'call', method: 'remove', id: view.cid})[0];
        expect(updateCall.parameters).to.deep.equal({index: 2, count: 1});
        expect(view.itemCount).to.equal(2);
      });

      it('ignores zero count', function() {
        view.remove(2, 0);

        const updateCalls = client.calls({op: 'call', method: 'update', id: view.cid});
        expect(updateCalls).to.be.empty;
        expect(view.itemCount).to.equal(3);
      });

    });

    describe('refresh', function() {

      beforeEach(function() {
        view.load(3);
        client.resetCalls();
      });

      it('without parameters calls native update', function() {
        view.refresh();

        const updateCall = client.calls({op: 'call', method: 'refresh', id: view.cid})[0];
        expect(updateCall.parameters).to.deep.equal({index: 0, count: 3});
      });

      it('calls native update', function() {
        view.refresh(1);

        const updateCall = client.calls({op: 'call', method: 'refresh', id: view.cid})[0];
        expect(updateCall.parameters).to.deep.equal({index: 1, count: 1});
      });

      it('calls native load first if needed', function() {
        view.itemCount = 42;
        view.refresh(1);

        const calls = client.calls({op: 'call', id: view.cid});
        expect(calls.map(call => call.method)).to.deep.equal(['load', 'refresh']);
      });

      it('accepts negative index', function() {
        view.refresh(-1);

        const updateCall = client.calls({op: 'call', method: 'refresh', id: view.cid})[0];
        expect(updateCall.parameters).to.deep.equal({index: 2, count: 1});
      });

      it('ignores out-of-bounds index', function() {
        view.refresh(5);

        const calls = client.calls({op: 'call', method: 'update', id: view.cid});
        expect(calls).to.be.empty;
      });

      it('fails with invalid parameter', function() {
        expect(() => {
          view.refresh(NaN);
        }).to.throw(Error, 'NaN is not a valid index');
      });

    });

    describe('reveal', function() {

      beforeEach(function() {
        view.load(3);
        client.resetCalls();
      });

      it('CALLs \'reveal\' with default options', function() {
        view.reveal(1);

        const call = client.calls({op: 'call', method: 'reveal', id: view.cid})[0];
        expect(call.parameters).to.deep.equal({index: 1, animate: true, offset: null});
      });

      it('CALLs \'reveal\' with options', function() {
        view.reveal(1, {animate: false, offset: 100});

        const call = client.calls({op: 'call', method: 'reveal', id: view.cid})[0];
        expect(call.parameters).to.deep.equal({index: 1, animate: false, offset: 100});
      });

      it('CALLs \'reveal\' with normalized options', function() {
        view.reveal(1, {animate: 1});

        const call = client.calls({op: 'call', method: 'reveal', id: view.cid})[0];
        expect(call.parameters).to.deep.equal({index: 1, animate: true, offset: null});
      });

      it('CALLs \'reveal\' with filtered options', function() {
        view.reveal(1, {foo: 'bar', animate: true});

        const call = client.calls({op: 'call', method: 'reveal', id: view.cid})[0];
        expect(call.parameters).to.deep.equal({index: 1, animate: true, offset: null});
      });

      it('CALLs \'reveal\' with autocompleted options', function() {
        view.reveal(1, {});

        const call = client.calls({op: 'call', method: 'reveal', id: view.cid})[0];
        expect(call.parameters).to.deep.equal({index: 1, animate: true, offset: null});
      });

      it('accepts negative index', function() {
        view.reveal(-1);

        const call = client.calls({op: 'call', method: 'reveal', id: view.cid})[0];
        expect(call.parameters).to.deep.equal({index: 2, animate: true, offset: null});
      });

      it('ignores out-of-bounds index', function() {
        view.reveal(5);

        const calls = client.calls({op: 'call', method: 'reveal', id: view.cid});
        expect(calls).to.be.empty;
      });

      it('fails with invalid parameter', function() {
        expect(() => {
          view.refresh(NaN);
        }).to.throw();
      });

    });

    describe('toXML', function() {

      it('prints xml element with itemCount and firstVisibleIndex', function() {
        stub(client, 'get')
          .withArgs(view.cid, 'bounds').returns({})
          .withArgs(view.cid, 'firstVisibleIndex').returns(23);
        view.load(45);
        expect(view[toXML]()).to.match(/<CollectionView .* itemCount='45' firstVisibleIndex='23'\/>/);
      });

    });

    it('does not crash when disposed right after setting itemCount (bugfix)', function() {
      view = new CollectionView();
      view.itemCount = 23;
      view.dispose();
      tabris.flush();
      expect(view.isDisposed()).to.equal(true);
    });

  });

});
