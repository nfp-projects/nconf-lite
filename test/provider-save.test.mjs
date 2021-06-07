import { Eltro as t, assert} from 'eltro'
import nconf from '../lib/nconf.js'
import './mocks/mock-store.js'

t.describe('nconf/provider/save', () => {
  t.describe("When using nconf an instance of 'nconf.Provider' with a Mock store", () => {
    var nconfMock = nconf.use('mock');

    t.test("the save() method should actually save before responding", function(done) {
      var mock = nconf.stores.mock;

      mock.on('save', function () {
        nconfMock.saved = true;
      });

      nconf.save(() => {
        try {
          assert.strictEqual(nconfMock.saved, true)
          done();
        } catch (err) {
          done(err)
        }
      });
    })
  })
});