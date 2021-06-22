import { Eltro as t, assert} from 'eltro'
import Nconf from '../../lib/nconf.mjs'

t.describe('#load()', () => {
  t.test('should support pairs of arguments together as strings', function() {
    process.argv = ['bla', 'bla',
      '--foobar', '123',
      '--testety', 'hello',
    ]
    let store = new Nconf.Argv()
    store.load()
    assert.strictEqual(store.get('foobar'), '123')
    assert.strictEqual(store.get('testety'), 'hello')
    assert.deepStrictEqual(store.get(), {
      foobar: '123',
      testety: 'hello',
    })
  })
  
  t.test('should support custom prefix argument', function() {
    process.argv = ['bla', 'bla',
      '-foobar', '123',
      '-testety', 'hello',
    ]
    let store = new Nconf.Argv({ prefix: '-' })
    store.load()

    assert.strictEqual(store.get('foobar'), '123')
    assert.strictEqual(store.get('testety'), 'hello')
    assert.deepStrictEqual(store.get(), {
      foobar: '123',
      testety: 'hello',
    })
  })
  
  t.test('should support individual options as boolean', function() {
    process.argv = ['bla', 'bla',
      '--booleanone',
      '--foobar', '123',
      '--testety', 'hello',
      '--booleantwo',
    ]
    let store = new Nconf.Argv()
    store.load()

    assert.strictEqual(store.get('foobar'), '123')
    assert.strictEqual(store.get('testety'), 'hello')
    assert.strictEqual(store.get('booleanone'), true)
    assert.strictEqual(store.get('booleantwo'), true)
    assert.deepStrictEqual(store.get(), {
      foobar: '123',
      testety: 'hello',
      booleanone: true,
      booleantwo: true,
    })
  })
  
  t.test('should support forcing everything as lowercase', function() {
    process.argv = ['bla', 'bla',
      '--FOOBAR', '123',
      '--TESTETY', 'hello',
    ]
    let store = new Nconf.Argv({ lowerCase: true })
    store.load()

    assert.strictEqual(store.get('foobar'), '123')
    assert.strictEqual(store.get('testety'), 'hello')
    assert.deepStrictEqual(store.get(), {
      foobar: '123',
      testety: 'hello',
    })
  })

  t.test('should support making objects', function() {
    process.argv = ['bla', 'bla',
      '--foo:bar:baz', '123',
      '--foo:bar:testety', 'hello',
    ]
    let store = new Nconf.Argv()
    store.load()
    assert.strictEqual(store.get('foo:bar:baz'), '123')
    assert.strictEqual(store.get('foo:bar:testety'), 'hello')
    assert.deepStrictEqual(store.get(), {
      foo: {
        bar: {
          baz: '123',
          testety: 'hello',
        }
      }
    })
  })

  t.test('should support custom seperator', function() {
    process.argv = ['bla', 'bla',
      '--foo__bar__baz', '123',
      '--foo__bar__testety', 'hello',
    ]
    let store = new Nconf.Argv({ separator: '__' })
    store.load()
    assert.strictEqual(store.get('foo:bar:baz'), '123')
    assert.strictEqual(store.get('foo:bar:testety'), 'hello')
    assert.deepStrictEqual(store.get(), {
      foo: {
        bar: {
          baz: '123',
          testety: 'hello',
        }
      }
    })
  })

  t.test('should support parse values', function() {
    process.argv = ['bla', 'bla',
      '--foo', '123',
      '--bar', '0.123',
      '--asdf', '{"hello":"world"}',
      '--testety', 'hello',
    ]
    let store = new Nconf.Argv({ parseValues: true })
    store.load()
    assert.deepStrictEqual(store.get(), {
      foo: 123,
      bar: 0.123,
      asdf: {
        hello: 'world',
      },
      testety: 'hello',
    })
  })

  t.test('should support usage of equal sign instead', function() {
    process.argv = ['bla', 'bla',
      '--foo=123',
      '--testety=hello',
    ]
    let store = new Nconf.Argv({ useEqualsign: true })
    store.load()
    assert.deepStrictEqual(store.get(), {
      foo: '123',
      testety: 'hello',
    })
  })

  t.test('should be smart with the usage of equal sign', function() {
    process.argv = ['bla', 'bla',
      '--foo=hello=world',
    ]
    let store = new Nconf.Argv({ useEqualsign: true })
    store.load()
    assert.strictEqual(store.get('foo'), 'hello=world')
  })
})