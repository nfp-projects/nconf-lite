import { Eltro as t, assert} from 'eltro'
import * as common from '../lib/common.mjs'

t.describe('#validkeyvalue', function() {
  t.test('should return key if valid key', function() {
    assert.strictEqual(common.validkeyvalue('asdf'), null)
    assert.strictEqual(common.validkeyvalue(''), null)
    assert.strictEqual(common.validkeyvalue(), null)
    assert.strictEqual(common.validkeyvalue(null), null)
    assert.strictEqual(common.validkeyvalue(undefined), null)
  })
  t.test('should return invalid valuetype in result', function() {
    assert.strictEqual(common.validkeyvalue([]), '__invalid_valuetype_of_object__')
    assert.strictEqual(common.validkeyvalue({}), '__invalid_valuetype_of_object__')
    assert.strictEqual(common.validkeyvalue([]), '__invalid_valuetype_of_object__')
    assert.strictEqual(common.validkeyvalue({}), '__invalid_valuetype_of_object__')
    assert.strictEqual(common.validkeyvalue(() => {}), '__invalid_valuetype_of_function__')
    assert.strictEqual(common.validkeyvalue(function() {}), '__invalid_valuetype_of_function__')
  })
})

t.describe('#path()', function() {
  t.test('it should support normal operation', function() {
    assert.deepStrictEqual(common.path('a:b:c'), ['a','b','c'])
    assert.deepStrictEqual(common.path('a'), ['a'])
  })
  t.test('it should support different separator', function() {
    assert.deepStrictEqual(common.path('a:b:c', '__'), ['a:b:c'])
    assert.deepStrictEqual(common.path('a__b__c', '__'), ['a','b','c'])
    assert.deepStrictEqual(common.path('a', '__'), ['a'])
  })
  t.test('it should work with non-string keys', function() {
    assert.deepStrictEqual(common.path(1, '__'), ['1'])
    assert.deepStrictEqual(common.path(4.3, '__'), ['4.3'])
  })
  t.test('it should return invalid value on non-supported keys', function() {
    assert.deepStrictEqual(common.path([], '__'), ['__invalid_valuetype_of_object__'])
    assert.strictEqual(common.path([], '__').length, 1)
    assert.deepStrictEqual(common.path({}, '__'), ['__invalid_valuetype_of_object__'])
    assert.strictEqual(common.path({}, '__').length, 1)
    assert.deepStrictEqual(common.path([]), ['__invalid_valuetype_of_object__'])
    assert.strictEqual(common.path([]).length, 1)
    assert.deepStrictEqual(common.path({}), ['__invalid_valuetype_of_object__'])
    assert.strictEqual(common.path({}).length, 1)
    assert.deepStrictEqual(common.path(() => {}), ['__invalid_valuetype_of_function__'])
    assert.strictEqual(common.path(() => {}).length, 1)
    assert.deepStrictEqual(common.path(function() {}), ['__invalid_valuetype_of_function__'])
    assert.strictEqual(common.path(function() {}).length, 1)
  })
  t.test('it should support empty values and return empty path', function() {
    assert.deepStrictEqual(common.path(null, '__'), [])
    assert.strictEqual(common.path(null, '__').length, 0)
    assert.deepStrictEqual(common.path(undefined, '__'), [])
    assert.strictEqual(common.path(undefined, '__').length, 0)
    assert.deepStrictEqual(common.path('', '__'), [])
    assert.strictEqual(common.path('', '__').length, 0)
    assert.deepStrictEqual(common.path(null), [])
    assert.strictEqual(common.path(null).length, 0)
    assert.deepStrictEqual(common.path(undefined), [])
    assert.strictEqual(common.path(undefined).length, 0)
    assert.deepStrictEqual(common.path(''), [])
    assert.strictEqual(common.path('').length, 0)
    assert.deepStrictEqual(common.path(), [])
    assert.strictEqual(common.path().length, 0)
  })
})

t.describe('#key()', function() {
  t.test('it should work with common values', function() {
    assert.strictEqual(common.key('a'), 'a')
    assert.strictEqual(common.key('a', 'b'), 'a:b')
    assert.strictEqual(common.key('a', 'b', 'c'), 'a:b:c')
    assert.strictEqual(common.key(123), '123')
    assert.strictEqual(common.key(5.4), '5.4')
    assert.strictEqual(common.key('a', 123, 'b'), 'a:123:b')
    assert.strictEqual(common.key('a', 5.4, 'b'), 'a:5.4:b')
    assert.strictEqual(common.key('a', 123, 456), 'a:123:456')
    assert.strictEqual(common.key('a', 5.4, 456), 'a:5.4:456')
  })
  t.test('it should text replace invalid keys with the invalid value string', function() {
    assert.strictEqual(common.key([]), '__invalid_valuetype_of_object__')
    assert.strictEqual(common.key({}), '__invalid_valuetype_of_object__')
    assert.strictEqual(common.key([]), '__invalid_valuetype_of_object__')
    assert.strictEqual(common.key({}), '__invalid_valuetype_of_object__')
    assert.strictEqual(common.key(() => {}), '__invalid_valuetype_of_function__')
    assert.strictEqual(common.key(function() {}), '__invalid_valuetype_of_function__')
    assert.strictEqual(common.key('a', [], 'b'), 'a:__invalid_valuetype_of_object__:b')
    assert.strictEqual(common.key('a', {}, 'b'), 'a:__invalid_valuetype_of_object__:b')
    assert.strictEqual(common.key('a', [], 'b'), 'a:__invalid_valuetype_of_object__:b')
    assert.strictEqual(common.key('a', {}, 'b'), 'a:__invalid_valuetype_of_object__:b')
    assert.strictEqual(common.key('a', () => {}, 'b'), 'a:__invalid_valuetype_of_function__:b')
    assert.strictEqual(common.key('a', function() {}, 'b'), 'a:__invalid_valuetype_of_function__:b')
  })
})

t.describe('#keyed()', function() {
  t.test('it should work with common values', function() {
    assert.strictEqual(common.keyed('__', 'a'), 'a')
    assert.strictEqual(common.keyed('__', 'a', 'b'), 'a__b')
    assert.strictEqual(common.keyed('__', 'a', 'b', 'c'), 'a__b__c')
    assert.strictEqual(common.keyed('__', 123), '123')
    assert.strictEqual(common.keyed('__', 5.4), '5.4')
    assert.strictEqual(common.keyed('__', 'a', 123, 'b'), 'a__123__b')
    assert.strictEqual(common.keyed('__', 'a', 5.4, 'b'), 'a__5.4__b')
    assert.strictEqual(common.keyed('__', 'a', 123, 456), 'a__123__456')
    assert.strictEqual(common.keyed('__', 'a', 5.4, 456), 'a__5.4__456')
  })
  t.test('it should text replace invalid keys with the invalid value string', function() {
    assert.strictEqual(common.keyed('__', []), '__invalid_valuetype_of_object__')
    assert.strictEqual(common.keyed('__', {}), '__invalid_valuetype_of_object__')
    assert.strictEqual(common.keyed('__', []), '__invalid_valuetype_of_object__')
    assert.strictEqual(common.keyed('__', {}), '__invalid_valuetype_of_object__')
    assert.strictEqual(common.keyed('__', () => {}), '__invalid_valuetype_of_function__')
    assert.strictEqual(common.keyed('__', function() {}), '__invalid_valuetype_of_function__')
    assert.strictEqual(common.keyed('__', 'a', [], 'b'), 'a____invalid_valuetype_of_object____b')
    assert.strictEqual(common.keyed('__', 'a', {}, 'b'), 'a____invalid_valuetype_of_object____b')
    assert.strictEqual(common.keyed('__', 'a', [], 'b'), 'a____invalid_valuetype_of_object____b')
    assert.strictEqual(common.keyed('__', 'a', {}, 'b'), 'a____invalid_valuetype_of_object____b')
    assert.strictEqual(common.keyed('__', 'a', () => {}, 'b'), 'a____invalid_valuetype_of_function____b')
    assert.strictEqual(common.keyed('__', 'a', function() {}, 'b'), 'a____invalid_valuetype_of_function____b')
  })
})

t.describe('#merge()', function() {
  t.test('should throw if not sent an array', function() {
    assert.throws(function() { common.merge({}) })
    assert.throws(function() { common.merge('asdf') })
    assert.throws(function() { common.merge(12412) })
    assert.throws(function() { common.merge(null) })
    assert.throws(function() { common.merge(undefined) })
    assert.throws(function() { common.merge() })
  })

  t.test('it should be able to merge properly', function() {
    // Test individual check and then re-check that the original are untouched
    let fn = function() { return true }
    let a = null
    let b = null
    let c = null

    
    a = { a: 1 }
    b = { b: 2 }
    assert.deepStrictEqual(common.merge([a, b]), { a: 1, b: 2 })
    assert.deepStrictEqual(a, { a: 1 })
    assert.deepStrictEqual(b, { b: 2 })

    a = { a: 1 }
    b = { b: 2 }
    c = { a: 3 }
    assert.deepStrictEqual(common.merge([a, b, c]), { a: 3, b: 2 })
    assert.deepStrictEqual(a, { a: 1 })
    assert.deepStrictEqual(b, { b: 2 })
    assert.deepStrictEqual(c, { a: 3 })

    a = { a: [1, 2] }
    b = { a: [2, 3] }
    assert.deepStrictEqual(common.merge([a, b]), { a: [2, 3] })
    assert.deepStrictEqual(b, { a: [2, 3] })
    assert.deepStrictEqual(a, { a: [1, 2] })

    a = { a: [1, 2] }
    b = { a: [2, [3, 4]] }
    assert.deepStrictEqual(common.merge([a, b]), { a: [2, [3, 4]] })
    assert.deepStrictEqual(a, { a: [1, 2] })
    assert.deepStrictEqual(b, { a: [2, [3, 4]] })

    a = { a: fn }
    b = { b: 2 }
    assert.deepStrictEqual(common.merge([a, b]), { a: fn, b: 2 })
    assert.deepStrictEqual(a, { a: fn })
    assert.deepStrictEqual(b, { b: 2 })

    a = { a: fn }
    b = { b: 2 }
    c = { a: 3 }
    assert.deepStrictEqual(common.merge([a, b, c]), { a: 3, b: 2 })
    assert.deepStrictEqual(a, { a: fn })
    assert.deepStrictEqual(b, { b: 2 })
    assert.deepStrictEqual(c, { a: 3 })

    a = { apples: true, bananas: true, foo: { bar: "boo" }, candy: { something: "file1", something1: true, something2: true, something5: { first: 1, second: 2 } }, unicorn: { exists: true }}
    b = { candy: { something: "file2", something3: true, something4: true }, dates: true, elderberries: true, unicorn: null }
    assert.deepStrictEqual(common.merge([a, b]), { apples: true, bananas: true, foo: { bar: "boo" }, candy: { something: "file2", something1: true, something2: true, something3: true, something4: true, something5: { first: 1, second: 2 } }, dates: true, elderberries: true, unicorn: null })
    assert.deepStrictEqual(a, { apples: true, bananas: true, foo: { bar: "boo" }, candy: { something: "file1", something1: true, something2: true, something5: { first: 1, second: 2 } }, unicorn: { exists: true }})
    assert.deepStrictEqual(b, { candy: { something: "file2", something3: true, something4: true }, dates: true, elderberries: true, unicorn: null })

    // weird behavior from old merge but I have no better idea to turn arrays
    // into object so this is "good enough" for now
    a = { a: 1 }
    b = { a: 2 }
    c = ['test']
    assert.deepStrictEqual(common.merge([a, b, c]), { '0': 'test', a: 2 })
    assert.deepStrictEqual(a, { a: 1 })
    assert.deepStrictEqual(b, { a: 2 })
    assert.deepStrictEqual(c, ['test'])
  })

  t.test('it should support edge cases properly', function() {
    let a = { a: { b: 1 } }
    let b = { a: ['test'] }
    let out = common.merge([a, b])
    assert.deepStrictEqual(out, { a: ['test'] })
    b = { a: { b: 1 } }
    out = common.merge(out, [b])
    assert.deepStrictEqual(out, { a: { b: 1 } })
  })
})


t.describe('#capitalize()', function() {
  t.test('should return original if not string', function() {
    const assertObject = {}
    const assertArray = []
    assert.strictEqual(common.capitalize(assertObject), assertObject)
    assert.strictEqual(common.capitalize(assertArray), assertArray)
    assert.strictEqual(common.capitalize(null), null)
    assert.strictEqual(common.capitalize(undefined), undefined)
    assert.strictEqual(common.capitalize(), undefined)
  })

  t.test('should adapt value to string if value type', function() {
    assert.strictEqual(common.capitalize(12412), '12412')
    assert.strictEqual(common.capitalize(123.4), '123.4')
  })

  
  t.test('should otherwise capitalize', function() {
    assert.strictEqual(common.capitalize('asdf'), 'Asdf')
    assert.strictEqual(common.capitalize('test test'), 'Test test')
    assert.strictEqual(common.capitalize('FOO'), 'FOO')
    assert.strictEqual(common.capitalize('f'), 'F')
    assert.strictEqual(common.capitalize('F'), 'F')
    assert.strictEqual(common.capitalize(''), '')
  })
})

t.describe('#parseValues()', function() {
  t.test('should special handle undefined', function() {
    assert.strictEqual(common.parseValues('undefined'), undefined)
  })
  
  t.test('should normally json parse string', function() {
    assert.strictEqual(common.parseValues('null'), null)
    assert.deepStrictEqual(common.parseValues('{"a": 1}'), { a: 1 })
    assert.deepStrictEqual(common.parseValues('["a", 1]'), [ 'a', 1 ])
    assert.strictEqual(common.parseValues('123'), 123)
    assert.strictEqual(common.parseValues('"{\\"a\\": 1}"'), '{"a": 1}')
  })

  t.test('should otherwise return original string if errors are found', function() {
    assert.strictEqual(common.parseValues('anull'), 'anull')
    assert.deepStrictEqual(common.parseValues('a{"a": 1}'), 'a{"a": 1}')
    assert.deepStrictEqual(common.parseValues('a["a", 1]'), 'a["a", 1]')
    assert.strictEqual(common.parseValues('a123'), 'a123')
    assert.strictEqual(common.parseValues('a"{\\"a\\": 1}"'), 'a"{\\"a\\": 1}"')
  })
})
