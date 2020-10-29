import {expect, spy, restore} from '../test';
import Events from '../../src/tabris/Events';
import EventObject from '../../src/tabris/EventObject';
import {SinonSpy} from 'sinon';

describe('Events', function() {

  let object;
  let context, context2;
  let listener: SinonSpy, listener2: SinonSpy;

  beforeEach(function() {
    object = Object.assign({}, Events);
    listener = spy();
    listener2 = spy();
    context = {};
    context2 = {};
  });

  afterEach(restore);

  describe('on', function() {

    it('registers listener', function() {
      object.on('foo', listener);

      object.trigger('foo');

      expect(listener).to.have.been.called;
    });

    it('returns context', function() {
      const result = object.on('foo', listener);

      expect(result).to.equal(object);
    });

    it('does not affect currently processed event', function() {
      object.on('foo', function() {
        object.on('foo', listener);
      });

      object.trigger('foo');

      expect(listener).not.to.have.been.called;
    });

    it('accepts objects', function() {
      object.on({foo: listener, bar: listener});

      object.trigger('foo', {type: 'foo'});
      object.trigger('bar', {type: 'bar'});
      object.trigger('baz', {type: 'baz'});

      expect(listener).to.have.been.calledTwice;
      expect(listener).to.have.been.calledWithMatch({type: 'foo'});
      expect(listener).to.have.been.calledWithMatch({type: 'bar'});
    });

  });

  describe('off', function() {

    it('throws error if no event type is specified', function() {
      expect(() => object.off()).to.throw();
    });

    it('throws error if no listener is specified', function() {
      expect(() => object.off('foo')).to.throw();
    });

    it('removes listener', function() {
      object.on('foo', listener);
      object.off('foo', listener);

      object.trigger('foo');

      expect(listener).not.to.have.been.called;
    });

    it('accepts object', function() {
      object.on({foo: listener, bar: listener});
      object.off({foo: listener, bar: listener});

      object.trigger('foo');
      object.trigger('bar');

      expect(listener).not.to.have.been.called;
    });

    it('removes listener registered with once', function() {
      object.once('foo', listener);
      object.off('foo', listener);

      object.trigger('foo');

      expect(listener).not.to.have.been.called;
    });

    it('removes duplicate listeners', function() {
      object.on('foo', listener);
      object.on('foo', listener);
      object.off('foo', listener);

      object.trigger('foo');

      expect(listener).not.to.have.been.called;
    });

    it('does not affect currently processed event', function() {
      object.on('foo', function() {
        object.off('foo', listener);
      });
      object.on('foo', listener);

      object.trigger('foo');

      expect(listener).to.have.been.calledOnce;
    });

    describe('if context is specified', function() {

      beforeEach(function() {
        object.on('foo', listener);
        object.on('foo', listener, context);
        object.on('foo', listener, context2);
        object.off('foo', listener, context);
      });

      it('removes only the versions of the listener with this contexts', function() {
        object.trigger('foo');

        expect(listener.firstCall).to.have.been.calledOn(object);
        expect(listener.secondCall).to.have.been.calledOn(context2);
      });

    });

    describe('if no context is specified', function() {

      beforeEach(function() {
        object.on('foo', listener);
        object.on('foo', listener, context);
        object.on('foo', listener, context2);
        object.off('foo', listener);
      });

      it('removes only the listener without context', function() {
        object.trigger('foo');

        expect(listener).to.have.been.calledTwice;
        expect(listener.firstCall).to.have.been.calledOn(context);
        expect(listener.secondCall).to.have.been.calledOn(context2);
      });

    });

    describe('if listener is specified', function() {

      beforeEach(function() {
        object.on('foo', listener);
        object.on('foo', listener2);
        object.off('foo', listener);
      });

      it('removes only listeners for the given event type', function() {
        object.trigger('foo');

        expect(listener).not.to.have.been.called;
        expect(listener2).to.have.been.called;
      });

    });

    it('returns context', function() {
      const result = object.off('foo', listener);

      expect(result).to.equal(object);
    });

  });

  describe('once', function() {

    it('triggers listener once', function() {
      object.once('foo', listener);

      object.trigger('foo');

      expect(listener).to.have.been.calledOnce;
    });

    it('triggers listener once after multiple calls', function() {
      object.once('foo', listener);
      object.once('foo', listener);
      object.once('foo', listener);

      object.trigger('foo');

      expect(listener).to.have.been.calledOnce;
    });

    it('forwards event object to wrapped listener', function() {
      object.once('foo', listener);
      const event = {fooEvent: 'foo'};

      object.trigger('foo', event);

      expect(listener).to.have.been.calledWithMatch(event);
    });

    it('uses given context', function() {
      object.once('foo', listener, context);

      object.trigger('foo');

      expect(listener.firstCall).to.have.been.calledOn(context);
    });

    it('returns context', function() {
      const result = object.once('foo', listener);

      expect(result).to.equal(object);
    });

    it('removes listener after trigger', function() {
      object.once('foo', listener);
      object.trigger('foo');
      listener.resetHistory();

      object.trigger('foo');

      expect(listener).not.to.have.been.called;
    });

    it('accepts objects', function() {
      object.once({foo: listener, bar: listener});

      object.trigger('foo', {type: 'foo'});
      object.trigger('bar', {type: 'bar'});
      object.trigger('foo', {type: 'foo'});
      object.trigger('bar', {type: 'bar'});

      expect(listener).to.have.been.calledTwice;
      expect(listener).to.have.been.calledWithMatch({type: 'foo'});
      expect(listener).to.have.been.calledWithMatch({type: 'bar'});
    });

  });

  describe('trigger', function() {

    it('triggers listener once', function() {
      object.on('foo', listener);

      object.trigger('foo');

      expect(listener).to.have.been.calledOnce;
    });

    it('triggers listener with default empty event object', function() {
      object.on('foo', listener);

      object.trigger('foo');

      expect(listener).to.have.been.calledWithMatch({target: object, type: 'foo'});
    });

    it('triggers listener with extended event object', function() {
      object.on('foo', listener);
      const event = {bar: 'bar'};

      object.trigger('foo', event);

      expect(listener).to.have.been.calledWithMatch({target: object, type: 'foo', bar: 'bar'});
    });

    it('initializes instances of EventObject', function() {
      object.on('foo', listener);
      const event = new EventObject();

      object.trigger('foo', event);

      expect(event.target).to.equal(object);
      expect(event.type).to.equal('foo');
    });

    it('triggers listener with default context', function() {
      object.on('foo', listener);

      object.trigger('foo');

      expect(listener.firstCall).to.have.been.calledOn(object);
    });

    it('triggers listener with parameters and given context', function() {
      object.on('foo', listener, context);

      object.trigger('foo');

      expect(listener.firstCall).to.have.been.calledOn(context);
    });

    it('returns context', function() {
      const result = object.trigger('foo');

      expect(result).to.equal(object);
    });

  });

  describe('triggerAsync', function() {

    it('triggers listener once', function() {
      object.on('foo', listener);

      object.triggerAsync('foo');

      expect(listener).to.have.been.calledOnce;
    });

    it('triggers multiple listener once', function() {
      object.on('foo', () => listener());
      object.on('foo', () => listener());
      object.on('foo', () => listener());

      object.triggerAsync('foo');

      expect(listener).to.have.been.calledThrice;
    });

    it('triggers listener with default empty event object', function() {
      object.on('foo', listener);

      object.triggerAsync('foo');

      expect(listener).to.have.been.calledWithMatch({target: object, type: 'foo'});
    });

    it('triggers listener with extended event object', function() {
      object.on('foo', listener);
      const event = {bar: 'bar'};

      object.triggerAsync('foo', event);

      expect(listener).to.have.been.calledWithMatch({target: object, type: 'foo', bar: 'bar'});
    });

    it('without listeners returns resolved Promise containing reference', function() {
      const promise = object.triggerAsync('foo');

      expect(promise).to.be.instanceOf(Promise);
      return promise.then(result => {
        expect(result).to.equal(object);
      });
    });

    it('with synchronous listeners returns resolved Promise containing reference', function() {
      object.on('foo', () => listener());
      object.on('foo', () => listener());
      const promise = object.triggerAsync('foo');

      expect(promise).to.be.instanceOf(Promise);
      return promise.then(result => {
        expect(result).to.equal(object);
        expect(listener).to.have.been.calledTwice;
      });
    });

    it('returns Promise waiting for other Promise returned by listener', async function() {
      let resolver = null;
      let resolved = false;
      object.on('foo', () => new Promise(resolve => resolver = resolve));
      object.triggerAsync('foo').then(() => resolved = true);
      return wait().then(() => {
        expect(resolver).to.be.instanceOf(Function);
        expect(resolved).to.be.false;
        resolver();
        return wait();
      }).then(() => expect(resolved).to.be.true);
    });

    it('returns Promise waiting for all Promise returned by listener', async function() {
      let resolver1 = null;
      let resolver2 = null;
      let resolved = false;
      object.on('foo', () => listener(1));
      object.on('foo', () => new Promise(resolve => resolver1 = resolve));
      object.on('foo', () => listener(2));
      object.on('foo', () => new Promise(resolve => resolver2 = resolve));
      object.on('foo', () => listener(3));
      object.triggerAsync('foo').then(() => resolved = true);
      return wait().then(() => {
        expect(resolved).to.be.false;
        expect(resolver1).to.be.instanceOf(Function);
        expect(resolver2).to.be.instanceOf(Function);
        resolver1();
        return wait();
      }).then(() => {
        expect(resolved).to.be.false;
        resolver2();
        return wait();
      }).then(() => {
        expect(resolved).to.be.true;
        expect(listener).to.have.been.calledThrice;
        expect(listener).to.have.been.calledWith(1);
        expect(listener).to.have.been.calledWith(2);
        expect(listener).to.have.been.calledWith(3);
      });
    });

    it('forwards rejected Promise', function() {
      object.on('foo', () => listener());
      object.on('foo', () => Promise.resolve());
      object.on('foo', () => listener());
      object.on('foo', () => Promise.reject(new Error('fooerror')));
      object.on('foo', () => listener());
      return object.triggerAsync('foo')
        .then(() => { throw new Error('did not fail'); })
        .catch(ex => expect(ex.message).to.equal('fooerror'));
    });

  });

  describe('_isListening', function() {

    describe('when no listeners are attached', function() {

      it('returns false without event type', function() {
        expect(object._isListening()).to.equal(false);
      });

      it('returns false for all event types', function() {
        expect(object._isListening('foo')).to.equal(false);
      });

    });

    describe('when a listener is attached', function() {

      beforeEach(function() {
        object.on('foo', listener);
      });

      it('returns true without event type', function() {
        expect(object._isListening()).to.equal(true);
      });

      it('returns true for the particular event type', function() {
        expect(object._isListening('foo')).to.equal(true);
      });

      it('returns false for other event types', function() {
        expect(object._isListening('bar')).to.equal(false);
      });

    });

    describe('when a listener is attached and removed', function() {

      beforeEach(function() {
        object.on('foo', listener);
        object.off('foo', listener);
      });

      it('returns false without event type', function() {
        expect(object._isListening()).to.equal(false);
      });

      it('returns false for this event type', function() {
        expect(object._isListening('foo')).to.equal(false);
      });

    });

  });

  describe('when attaching events', function() {

    ['on', 'once'].forEach(function(method) {

      describe('with ' + method + ',', function() {

        describe('listener is triggered multiple times', function() {

          it('when listeners are not identical', function() {
            object[method]('foo', listener);
            object[method]('foo', listener2);

            object.trigger('foo');

            expect(listener).to.have.been.calledOnce;
            expect(listener2).to.have.been.calledOnce;
          });

          it('when listeners are identical, but contexts are not', function() {
            object[method]('foo', listener, context);
            object[method]('foo', listener, context2);

            object.trigger('foo');

            expect(listener).to.have.been.calledTwice;
          });

          it('when listeners are identical, but one of the contexts is not given', function() {
            object[method]('foo', listener, context);
            object[method]('foo', listener);

            object.trigger('foo');

            expect(listener).to.have.been.calledTwice;
          });

        });

        describe('listener is not triggered multiple times', function() {

          it('when listeners are identical', function() {
            object[method]('foo', listener);
            object[method]('foo', listener);

            object.trigger('foo');

            expect(listener).to.have.been.calledOnce;
          });

          it('when listeners and contexts are identical', function() {
            object[method]('foo', listener, context);
            object[method]('foo', listener, context);

            object.trigger('foo');

            expect(listener).to.have.been.calledOnce;
          });

        });

      });

    });

  });

  describe('*', function() {

    beforeEach(function() {
      object.on('*', listener);
    });

    it('is notified by all events', function() {
      object.trigger('foo');
      object.trigger('bar');
      object.trigger('baz');

      expect(listener).to.have.been.calledThrice;
    });

    it('is notified after other listeners', function() {
      object.on('foo', listener2);

      object.trigger('foo');

      expect(listener).to.have.been.calledAfter(listener2);
    });

    it('is notified with type', function() {
      object.trigger('foo');

      expect(listener.args[0][0].type).to.equal('foo');
    });

    it('is notified with target', function() {
      object.trigger('foo');

      expect(listener.args[0][0].target).to.equal(object);
    });

    it('is notified with eventData', function() {
      object.trigger('foo', {foo: 'bar'});

      expect(listener.args[0][0].eventData.foo).to.equal('bar');
    });

  });

});

async function wait() {
  return new Promise(resolve => setTimeout(resolve, 50));
}
