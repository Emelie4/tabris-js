import * as chai from 'chai';
import {expect} from 'chai';
import * as sinon from 'sinon';
import * as sinonChai from 'sinon-chai';
import * as chaiAsPromised from 'chai-as-promised';
import {mockTabris} from './tabris-mock';
import ImageBitmap from '../src/tabris/ImageBitmap';
import Blob from '../src/tabris/Blob';

chai.use(sinonChai);
chai.use(chaiAsPromised);

const sandbox = sinon.sandbox.create();
const restore = sandbox.restore.bind(sandbox);
const match = sinon.match;

/** @type {import('sinon').SinonSpyStatic} */
const spy = sandbox.spy.bind(sandbox);

/** @type {import('sinon').SinonStubStatic} */
const stub = sandbox.stub.bind(sandbox);

/**
 * @param {import('./tabris/ClientMock').default} client
 * @param {number=} width
 * @param {number=} height
 */
function createBitmap(client, width = 100, height = 100) {
  const promise = ImageBitmap.createImageBitmap(new Blob([new Uint8Array([1, 2, 3])]));
  const id = client.calls({type: 'tabris.ImageBitmap', op: 'create'})[0].id;
  client.calls({op: 'call', method: 'loadEncodedImage', id})[0]
    .parameters.onSuccess({width, height});
  return promise.then(bitmap => ({bitmap, id, width, height}));
}

export {expect, spy, stub, restore, match, mockTabris, createBitmap};
