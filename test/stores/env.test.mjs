import { Eltro as t, assert} from 'eltro'
import Nconf from '../../lib/nconf.mjs'

t.describe('#load()', () => {
  let backupEnv = {}
  let testEnv = {
    SOMETHING: 'foobar',
    SOMEBOOL: 'true',
    SOMENULL: 'null',
    SOMEUNDEF: 'undefined',
    SOMEINT: '3600',
    SOMEFLOAT: '0.5',
    SOMEBAD: '5.1a',
    ANOTHER__TEST__THIS: 'foobar',
  }

  t.before(function() {
    Object.keys(testEnv).forEach(function (key) {
      if (process.env[key]) backupEnv[key] = process.env[key]
      process.env[key] = testEnv[key]
    })
  })

  t.test("should default read everything as string", function() {
    let store = new Nconf.Env()
    store.load()

    assert.strictEqual(store.get('SOMETHING'), 'foobar')
    assert.strictEqual(store.get('SOMEBOOL'), 'true')
    assert.strictEqual(store.get('SOMENULL'), 'null')
    assert.strictEqual(store.get('SOMEUNDEF'), 'undefined')
    assert.strictEqual(store.get('SOMEINT'), '3600')
    assert.strictEqual(store.get('SOMEFLOAT'), '0.5')
    assert.strictEqual(store.get('SOMEBAD'), '5.1a')
    assert.strictEqual(store.get('ANOTHER__TEST__THIS'), 'foobar')
  })

  t.test("should support parseValues correctly", function() {
    let store = new Nconf.Env({parseValues: true})
    store.load()

    assert.strictEqual(store.get('SOMETHING'), 'foobar')
    assert.strictEqual(store.get('SOMEBOOL'), true)
    assert.notStrictEqual(store.get('SOMEBOOL'), 'true')
    assert.strictEqual(store.get('SOMENULL'), null)
    assert.strictEqual(store.get('SOMEUNDEF'), undefined)
    assert.strictEqual(store.get('SOMEINT'), 3600)
    assert.strictEqual(store.get('SOMEFLOAT'), .5)
    assert.strictEqual(store.get('SOMEBAD'), '5.1a')
    assert.strictEqual(store.get('ANOTHER__TEST__THIS'), 'foobar')
  })

  t.test("should support lowercase", function() {
    let store = new Nconf.Env({lowerCase: true})
    store.load()

    assert.notOk(store.get('SOMETHING'))
    assert.notOk(store.get('SOMEBOOL'))
    assert.notOk(store.get('SOMENULL'))
    assert.notOk(store.get('SOMEUNDEF'))
    assert.notOk(store.get('SOMEINT'))
    assert.notOk(store.get('SOMEFLOAT'))
    assert.notOk(store.get('SOMEBAD'))
    assert.notOk(store.get('ANOTHER__TEST__THIS'))
    assert.strictEqual(store.get('something'), 'foobar')
    assert.strictEqual(store.get('somebool'), 'true')
    assert.strictEqual(store.get('somenull'), 'null')
    assert.strictEqual(store.get('someundef'), 'undefined')
    assert.strictEqual(store.get('someint'), '3600')
    assert.strictEqual(store.get('somefloat'), '0.5')
    assert.strictEqual(store.get('somebad'), '5.1a')
    assert.strictEqual(store.get('another__test__this'), 'foobar')
  })

  t.test("should support transform", function() {
    let store = new Nconf.Env({transform: function(key, value) {
      if (!testEnv[key]) return null
      return {
        key: key[0].toUpperCase() + key.slice(1).toLowerCase(),
        value: 1,
      }
    }})
    store.load()

    assert.strictEqual(store.get('Something'), 1)
    assert.strictEqual(store.get('Somebool'), 1)
    assert.strictEqual(store.get('Somenull'), 1)
    assert.strictEqual(store.get('Someundef'), 1)
    assert.strictEqual(store.get('Someint'), 1)
    assert.strictEqual(store.get('Somefloat'), 1)
    assert.strictEqual(store.get('Somebad'), 1)
    assert.strictEqual(store.get('Another__test__this'), 1)
    
    assert.deepStrictEqual(store.get(), {
      Something: 1,
      Somebool: 1,
      Somenull: 1,
      Someundef: 1,
      Someint: 1,
      Somefloat: 1,
      Somebad: 1,
      Another__test__this: 1,
    })
  })

  t.test("should support matches", function() {
    let store = new Nconf.Env({match: /^SOME/})
    store.load()

    assert.strictEqual(store.get('SOMETHING'), 'foobar')
    assert.strictEqual(store.get('SOMEBOOL'), 'true')
    assert.strictEqual(store.get('SOMENULL'), 'null')
    assert.strictEqual(store.get('SOMEUNDEF'), 'undefined')
    assert.strictEqual(store.get('SOMEINT'), '3600')
    assert.strictEqual(store.get('SOMEFLOAT'), '0.5')
    assert.strictEqual(store.get('SOMEBAD'), '5.1a')
    assert.notOk(store.get('Another__test__this'))
    
    assert.deepStrictEqual(store.get(), {
      SOMETHING: 'foobar',
      SOMEBOOL: 'true',
      SOMENULL: 'null',
      SOMEUNDEF: 'undefined',
      SOMEINT: '3600',
      SOMEFLOAT: '0.5',
      SOMEBAD: '5.1a',
    })
  })

  t.test("should support whitelist", function() {
    let store = new Nconf.Env({whitelist: ['ANOTHER__TEST__THIS']})
    store.load()

    assert.notOk(store.get('SOMETHING'), 'foobar')
    assert.notOk(store.get('SOMEBOOL'), 'true')
    assert.notOk(store.get('SOMENULL'), 'null')
    assert.notOk(store.get('SOMEUNDEF'), 'undefined')
    assert.notOk(store.get('SOMEINT'), '3600')
    assert.notOk(store.get('SOMEFLOAT'), '0.5')
    assert.notOk(store.get('SOMEBAD'), '5.1a')
    assert.strictEqual(store.get('ANOTHER__TEST__THIS'), 'foobar')
    
    assert.deepStrictEqual(store.get(), {
      ANOTHER__TEST__THIS: 'foobar',
    })
  })

  t.test("whitelist should be case insensitive", function() {
    let store = new Nconf.Env({whitelist: ['another__test__this']})
    store.load()

    assert.strictEqual(store.get('ANOTHER__TEST__THIS'), 'foobar')
    
    assert.deepStrictEqual(store.get(), {
      ANOTHER__TEST__THIS: 'foobar',
    })
  })

  t.test("should support whitelist with match", function() {
    let store = new Nconf.Env({
      whitelist: ['another__test__this'],
      match: /^SOMEBOOL/,
    })
    store.load()

    assert.strictEqual(store.get('ANOTHER__TEST__THIS'), 'foobar')
    assert.strictEqual(store.get('SOMEBOOL'), 'true')
    
    assert.deepStrictEqual(store.get(), {
      ANOTHER__TEST__THIS: 'foobar',
      SOMEBOOL: 'true',
    })
  })

  t.test("should support custom seperator", function() {
    let store = new Nconf.Env({
      whitelist: ['another__test__this', 'somebool'],
      separator: '__',
    })
    store.load()

    assert.strictEqual(store.get('ANOTHER:TEST:THIS'), 'foobar')
    assert.strictEqual(store.get('SOMEBOOL'), 'true')
    
    assert.deepStrictEqual(store.get(), {
      ANOTHER: {
        TEST: {
          THIS: 'foobar',
        },
      },
      SOMEBOOL: 'true',
    })
  })

  t.test("should stay readOnly always", function() {
    let store = new Nconf.Env({whitelist: ['another__test__this']})
    assert.strictEqual(store.readOnly, true)
    store.load()
    assert.strictEqual(store.readOnly, true)
  })

  t.test("should throw if whitelist is invalid", function() {
    assert.throws(function() {
      new Nconf.Env({whitelist: 'another__test__this'})
    }, /[Ww]hitelist.+[Aa]rray/)

    assert.throws(function() {
      new Nconf.Env({whitelist: ['another__test__this', 123]})
    }, /[Ww]hitelist.+[Aa]rray/)
  })

  t.test("should throw if match is invalid", function() {
    assert.throws(function() {
      new Nconf.Env({match: 1234})
    }, /[Mm]atch.+[Rr]eg[Ee]xp/)

    assert.throws(function() {
      new Nconf.Env({match: {}})
    }, /[Mm]atch.+[Rr]eg[Ee]xp/)
  })

  t.test("should automatically convert string match to RegExp", function() {
    let store = new Nconf.Env({match: 'asdf'})
    assert.ok(store.match)
    assert.ok(store.match.test('asdf'))
    assert.notOk(store.match.test('test'))
  })

  t.test("should support whitelist directly in parameter", function() {
    let store = new Nconf.Env(['another__test__this'])
    store.load()

    assert.strictEqual(store.get('ANOTHER__TEST__THIS'), 'foobar')
    
    assert.deepStrictEqual(store.get(), {
      ANOTHER__TEST__THIS: 'foobar',
    })
  })

  t.after(function() {
    Object.keys(backupEnv).forEach(function (key) {
      process.env[key] = backupEnv[key]
    })
  })
})
