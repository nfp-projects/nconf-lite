import fs from 'fs'
import path from 'path'
import { Eltro as t, assert} from 'eltro'
import nconf from '../lib/nconf.js'
import * as helpers from './helpers.mjs'

t.describe('nconf, When using the nconf', function() {
  t.test("should have the correct methods set", function() {
    assert.strictEqual(typeof(nconf.key), 'function')
    assert.strictEqual(typeof(nconf.path), 'function')
    assert.strictEqual(typeof(nconf.use), 'function')
    assert.strictEqual(typeof(nconf.any), 'function')
    assert.strictEqual(typeof(nconf.get), 'function')
    assert.strictEqual(typeof(nconf.set), 'function')
    assert.strictEqual(typeof(nconf.clear), 'function')
    assert.strictEqual(typeof(nconf.load), 'function')
    assert.strictEqual(typeof(nconf.save), 'function')
    assert.strictEqual(typeof(nconf.reset), 'function')
    assert.strictEqual(typeof(nconf.required), 'function')
  })

  t.test("the use() method should instaniate the correct store", function() {
    nconf.use('memory')
    nconf.load()
    assert.ok(nconf.stores['memory'] instanceof nconf.Memory)
  })

  t.test("nconf should have the correct version set", function () {
    let pckg = JSON.parse(fs.readFileSync(helpers.fixture('../../package.json')))
    assert.ok(pckg.version)
    assert.strictEqual(nconf.version, pckg.version)
  })

  t.describe("the required() method", function() {
    t.test("should throw error with missing keys", function() {
      nconf.set('foo:bar:bazz', 'buzz')
      assert.throws(function() {
        nconf.required(['missing', 'foo:bar:bazz'])
      })
    })
    t.test("should return the provider if all required keys exist", function() {
      var Provider = nconf.Provider
      nconf.set('foo:bar:bazz', 'buzz')
      assert.ok(nconf.required(['foo:bar:bazz']) instanceof Provider)
    })
  })
  t.describe("with the memory store", function() {
    t.describe("the set() method", function() {
      t.test("should respond with true", function() {
        assert.ok(nconf.set('foo:bar:bazz', 'buzz'))
      })
      t.test("should respond allow access to the root and complain about non-objects", function() {
        assert.notOk(nconf.set(null, null))
        assert.notOk(nconf.set(null, undefined))
        assert.notOk(nconf.set(null))
        assert.notOk(nconf.set(null, ''))
        assert.notOk(nconf.set(null, 1))
        var original = nconf.get()
        assert.ok(nconf.set(null, nconf.get()))
        assert.notStrictEqual(nconf.get(), original)
        assert.deepEqual(nconf.get(), original)
      })
    })
    t.describe("the get() method", function() {
      t.test("should respond with the correct value without a callback", function() {
        assert.strictEqual(nconf.get('foo:bar:bazz'), 'buzz')
      })
      t.test("should not step inside strings without a callback", function() {
        assert.strictEqual(nconf.get('foo:bar:bazz:0'), undefined)
      })
      t.test("should respond with the correct value with a callback", function (done) {
        nconf.get('foo:bar:bazz', (err, value) => {
          try {
            assert.strictEqual(value, 'buzz')
            done()
          } catch (leErr) {
            done(leErr)
          }
        })
      })
      t.test("should respond allow access to the root", function() {
        assert.ok(nconf.get(null))
        assert.ok(nconf.get(undefined))
        assert.ok(nconf.get())
      })
    })
    t.describe("the clear() method", function() {
      t.test("should respond with the true", function() {
        assert.strictEqual(nconf.get('foo:bar:bazz'), 'buzz')
        assert.ok(nconf.clear('foo:bar:bazz'))
        assert.ok(typeof(nconf.get('foo:bar:bazz')) === 'undefined')
      })
    })
    t.describe("the load() method", function() {
      t.test("should respond with the merged store without a callback", function() {
        assert.deepEqual(nconf.load(), {"foo": {"bar": {}}})
      })
      t.test("should respond with the merged store", function (done) {
        nconf.load((err, store) => {
          try {
            assert.strictEqual(err, null)
            assert.deepEqual(store, {"foo": {"bar": {}}})
            done()
          } catch (leErr) {
            done(leErr)
          }
        })
      })
    })
  })
})
