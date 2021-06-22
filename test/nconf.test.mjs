import fs from 'fs'
import path from 'path'
import { Eltro as t, assert} from 'eltro'
import Nconf from '../lib/nconf.mjs'
import * as helpers from './helpers.mjs'

t.describe('nconf', function() {
  t.test('should have the correct methods set', function() {
    let nconf = new Nconf()
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

  t.test('memory() should instaniate the correct store', function() {
    let nconf = new Nconf()
    nconf.memory()
    assert.ok(nconf.use('memory') instanceof Nconf.Memory)
  })

  t.test('should have the correct version set', function () {
    let nconf = new Nconf()
    let pckg = JSON.parse(fs.readFileSync(helpers.fixture('../../package.json')))
    assert.ok(pckg.version)
    assert.strictEqual(nconf.version, pckg.version)
  })
})

t.describe('#required()', function() {
  let nconf = new Nconf()
  nconf.memory()
  nconf.set('foo:bar:bazz', 'buzz')

  t.test('should throw error with missing keys', function() {
    assert.throws(function() {
      nconf.required(['missingtest', 'foo:bar:bazz'])
    }, /missingtest/)
  })
  
  t.test('should throw error with missing keys with non-array parameter', function() {
    assert.throws(function() {
      nconf.required(['missingtest', 'foo:bar:bazz'])
    }, /missingtest/)
  })

  t.test('should return the provider if all keys exist', function() {
    assert.strictEqual(nconf.required(['foo:bar:bazz']), nconf)
  })
})
t.describe('#any()', function() {
  let nconf = new Nconf()
  nconf.memory()
  nconf.set('foo:bar:bazz', 'buzz')

  t.test('should return if found', function() {
    assert.strictEqual(nconf.any(['missingtest', 'nope', 'foo:bar:bazz']), 'buzz')
  })
  t.test('should return first item found', function() {
    assert.deepStrictEqual(nconf.any(['missingtest', 'foo', 'nope', 'foo:bar:bazz']), {
      bar: {
        bazz: 'buzz',
      },
    })
  })
  t.test('should return if found as paramaters', function() {
    assert.strictEqual(nconf.any('missingtest', 'nope', 'foo:bar:bazz'), 'buzz')
  })
  t.test('should return undefined otherwise', function() {
    assert.strictEqual(nconf.any(['missingtest', 'nope']), undefined)
  })
})
t.describe('#set()', function() {
  t.test('should respond with self if success', function() {
    let nconf = new Nconf()
    nconf.memory()
    assert.strictEqual(nconf.set('foo:bar:bazz', 'buzz'), nconf)
  })

  t.test('should respond with false if not successful', function() {
    let nconf = new Nconf()
    nconf.memory({ readOnly: true })
    assert.strictEqual(nconf.set('foo:bar:bazz', 'buzz'), false)
  })
  
  t.test('should always set the first writeable store', function() {
    let nconf = new Nconf()
    nconf.memory('first')
    nconf.memory('second')
    nconf.use('second').set('foo:bar:bazz', 'buzz')
    assert.strictEqual(nconf.get('foo:bar:bazz'), 'buzz')
    nconf.set('foo:bar:bazz', 'overwritten')
    assert.strictEqual(nconf.get('foo:bar:bazz'), 'overwritten')
    assert.strictEqual(nconf.use('second').get('foo:bar:bazz'), 'buzz')
  })

  t.test('should respond allow access to the root and complain about non-objects', function() {
    let nconf = new Nconf()
    nconf.memory()
    assert.notOk(nconf.set(null, null))
    assert.notOk(nconf.set(null, undefined))
    assert.notOk(nconf.set(null))
    assert.notOk(nconf.set(null, ''))
    assert.notOk(nconf.set(null, 1))
    var original = nconf.get()
    assert.ok(nconf.set(null, nconf.get()))
    assert.notStrictEqual(nconf.get(), original)
    assert.deepStrictEqual(nconf.get(), original)
  })
})
t.describe('#get()', function() {
  let nconf = new Nconf()
  nconf.memory()
  nconf.set('foo:bar:bazz', 'buzz')

  t.test('should respond with the correct value', function() {
    assert.strictEqual(nconf.get('foo:bar:bazz'), 'buzz')
  })
  
  t.test('unknown keys should return undefined', function() {
    assert.strictEqual(nconf.get('foo:bar:bazz:toString'), undefined)
  })

  t.test('should not step inside strings', function() {
    assert.strictEqual(nconf.get('foo:bar:bazz:0'), undefined)
  })

  t.test('should respond allow access to the root', function() {
    assert.ok(nconf.get(null))
    assert.ok(nconf.get(undefined))
    assert.ok(nconf.get())
    assert.deepStrictEqual(nconf.get(), { foo: { bar: { bazz: 'buzz' } } })
  })

  t.test('should merge stores correctly', function() {
    let testMerge = new Nconf()
    testMerge.memory('higherpriority')
    testMerge.set('foo:bar', {
      bazz: 'overwritten',
      test: 1
    })
    testMerge.memory('lowerdefaults')
    testMerge.use('lowerdefaults').set('foo:bar:bazz', 'buzz')
    testMerge.use('lowerdefaults').set('foo:bar:buzz', 'buzz')

    assert.strictEqual(testMerge.get('foo:bar:bazz'), 'overwritten')
    assert.strictEqual(testMerge.get('foo:bar:buzz'), 'buzz')

    assert.deepStrictEqual(testMerge.get('foo:bar'), {
      bazz: 'overwritten',
      buzz: 'buzz',
      test: 1,
    })
  })
})
t.describe('#clear()', function() {
  t.test('should respond with self if success', function() {
    let nconf = new Nconf()
    nconf.memory().set('foo:bar:bazz', 'buzz')
    assert.strictEqual(nconf.get('foo:bar:bazz'), 'buzz')
    assert.strictEqual(nconf.clear('foo:bar:bazz'), nconf)
    assert.strictEqual(nconf.get('foo:bar:bazz'), undefined)
  })

  t.test('should respond with self if success even with readOnly store', function() {
    let nconf = new Nconf()
    nconf
      .literal({ testetytest: 'buzz' })
      .memory()
      .set('foo:bar:bazz', 'buzz')

    assert.strictEqual(nconf.get('foo:bar:bazz'), 'buzz')
    assert.strictEqual(nconf.get('testetytest'), 'buzz')
    assert.strictEqual(nconf.clear('foo:bar:bazz'), nconf)
    assert.strictEqual(nconf.get('foo:bar:bazz'), undefined)
    assert.strictEqual(nconf.use('literal').get('foo:bar:bazz'), undefined)
  })

  t.test('should respond with false if clearing readonly value', function() {
    let nconf = new Nconf()
    nconf.literal({ testetytest: 'buzz' })

    assert.strictEqual(nconf.get('testetytest'), 'buzz')
    assert.notOk(nconf.clear('testetytest'))
    assert.strictEqual(nconf.get('testetytest'), 'buzz')
  })
})
