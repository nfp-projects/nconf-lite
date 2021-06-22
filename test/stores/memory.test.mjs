import { Eltro as t, assert} from 'eltro'
import Nconf from '../../lib/nconf.mjs'
import { merge } from '../fixtures/data.mjs'

t.describe('Memory Store', function () {
  let store = new Nconf.Memory()

  t.describe('#set()', function() {
    t.test('should return true', function () {
      assert.ok(store.set('foo:bar:bazz', 'buzz'))
      assert.ok(store.set('falsy:number', 0))
      assert.ok(store.set('falsy:string:empty', ''))
      assert.ok(store.set('falsy:string:value', 'value'))
      assert.ok(store.set('falsy:boolean', false))
      assert.ok(store.set('falsy:object', null))
    })

    t.test('should support numbers as key', function() {
      assert.notOk(store.get('523453'))
      assert.ok(store.set(523453, true))
      assert.ok(store.get('523453'))
    })

    t.test('should always make sure not store direct references to objects', function() {
      const assertArray = [ 1, 2 ]
      const assertObject = { a: 1 }

      assert.ok(store.set('reference:test:arraydirect', assertArray))
      assert.notStrictEqual(store.get('reference:test:arraydirect'), assertArray)
      assert.ok(store.set('reference:test:objectdirect', assertObject))
      assert.notStrictEqual(store.get('reference:test:objectdirect'), assertObject)
      assert.ok(store.set('reference:test:objectchild', { x: assertArray, y: assertObject }))
      assert.notStrictEqual(store.get('reference:test:objectchild:x'), assertArray)
      assert.notStrictEqual(store.get('reference:test:objectchild:y'), assertObject)
    })

    t.test('should support numbers as key', function() {
      let inStore = new Nconf.Memory()
      inStore.set({ version: 1 })
      assert.ok(inStore.set('version', 2))
      assert.strictEqual(inStore.get('version'), 2)
      inStore.readOnly = true
      assert.notOk(inStore.set('version', 3))
      assert.strictEqual(inStore.get('version'), 2)
    })

    t.test('should support numbers as key', function() {
      let inStore = new Nconf.Memory({ parseValues: true })
      inStore.set('test', '{"a":1}')
      assert.ok(inStore.get('test'))
      assert.deepStrictEqual(inStore.get('test'), { a: 1 })
      inStore.set('test', 'undefined')
      assert.notOk(inStore.get('test'))
    })

    t.test('should not do anything if given invalid set root', function() {
      let inStore = new Nconf.Memory()
      inStore.set({ version: 1 })
      assert.deepStrictEqual(inStore.get(), { version: 1 })
      assert.notOk(inStore.set(null))
      assert.deepStrictEqual(inStore.get(), { version: 1 })
      assert.notOk(inStore.set())
      assert.deepStrictEqual(inStore.get(), { version: 1 })
      assert.notOk(inStore.set([1, 2]))
      assert.deepStrictEqual(inStore.get(), { version: 1 })
    })
  })

  t.describe('#get()', function() {
    t.test('should respond with the correct value', function () {
      store.set('foo:bar:bazz', 'buzz')
      store.set('falsy:number', 0)
      store.set('falsy:string:empty', '')
      store.set('falsy:string:value', 'value')
      store.set('falsy:boolean', false)
      store.set('falsy:object', null)
      assert.strictEqual(store.get('foo:bar:bazz'), 'buzz')
      assert.strictEqual(store.get('falsy:number'), 0)
      assert.strictEqual(store.get('falsy:string:empty'), '')
      assert.strictEqual(store.get('falsy:string:value'), 'value')
      assert.strictEqual(store.get('falsy:boolean'), false)
      assert.strictEqual(store.get('falsy:object'), null)
    })
  
    t.describe('should not at non-existent keys', function () {
      t.test('at the root level', function () {
        assert.strictEqual(store.get('this:key:does:not:exist'), undefined)
      })
  
      t.test('within numbers', function () {
        assert.strictEqual(store.get('falsy:number:not:exist'), undefined)
      })
  
      t.test('within booleans', function () {
        assert.strictEqual(store.get('falsy:boolean:not:exist'), undefined)
      })
  
      t.test('within objects', function () {
        assert.strictEqual(store.get('falsy:object:not:exist'), undefined)
      })
  
      t.test('within empty strings', function () {
        assert.strictEqual(store.get('falsy:string:empty:not:exist'), undefined)
      })
  
      t.test('within non-empty strings', function () {
        assert.strictEqual(store.get('falsy:string:value:not:exist'), undefined)
      })
    })
  })

  t.describe('#clear()', function() {
    t.test('should return false if readonly', function() {
      let inStore = new Nconf.Memory()
      inStore.set({ version: 1 })
      inStore.readOnly = true
      assert.notOk(inStore.clear('version'))
      assert.strictEqual(inStore.get('version'), 1)
    })

    t.test('the clear() should return true if success', function () {
      store.set('foo:bar:bazz', 'buzz')
      assert.strictEqual(store.get('foo:bar:bazz'), 'buzz')
      assert.ok(store.clear('foo:bar:bazz'))
      assert.strictEqual(typeof store.get('foo:bar:bazz'), 'undefined')
    })

    t.test('should return false if not found', function() {
      store.set('this:exists', 'fornow')
      assert.strictEqual(store.get('this:exists'), 'fornow')
      assert.notOk(store.clear('this:exists:but:not:this'))
      assert.strictEqual(store.get('this:exists'), 'fornow')
    })
  })

  t.describe('#merge()', function () {
    t.test('should return false if readonly', function() {
      let inStore = new Nconf.Memory()
      inStore.set({ version: 1 })
      inStore.readOnly = true
      assert.notOk(inStore.merge({ version: 2 }))
      assert.strictEqual(inStore.get('version'), 1)
    })

    t.test('when overriding an existing literal value', function () {
      store.set('merge:literal', 'string-value')
      store.merge('merge:literal', merge)
      assert.deepStrictEqual(store.get('merge:literal'), merge)
    })

    t.test('when overriding an existing Array value', function () {
      store.set('merge:array', [1, 2, 3, 4])
      store.merge('merge:array', merge)
      assert.deepStrictEqual(store.get('merge:literal'), merge)
    })

    t.test('when merging into an existing Object value', function () {
      store.set('merge:object', {
        prop1: 2,
        prop2: 'prop2',
        prop3: {
          bazz: 'bazz'
        },
        prop4: ['foo', 'bar']
      })
      assert.strictEqual(store.get('merge:object:prop1'), 2)
      assert.strictEqual(store.get('merge:object:prop2'), 'prop2')
      assert.deepStrictEqual(store.get('merge:object:prop3'), {
        bazz: 'bazz'
      })
      assert.strictEqual(store.get('merge:object:prop4').length, 2)

      store.merge('merge:object', merge)

      assert.strictEqual(store.get('merge:object:prop1'), 1)
      assert.strictEqual(store.get('merge:object:prop2').length, 3)
      assert.deepStrictEqual(store.get('merge:object:prop3'), {
        foo: 'bar',
        bar: 'foo',
        bazz: 'bazz'
      })
      assert.strictEqual(store.get('merge:object:prop4').length, 2)
    })

    t.test('when merging at root level with an object', function() {
      const assertFirst = 'herp'
      const assertAfter = 'derp'
      const newItem = { asdf: assertAfter }

      let inStore = new Nconf.Memory()
      inStore.set({
        version: 1,
        asdf: assertFirst,
      })
      assert.strictEqual(inStore.get('asdf'), assertFirst)
      assert.strictEqual(inStore.get('version'), 1)
      assert.ok(inStore.merge(newItem))
      assert.notStrictEqual(inStore.get(), newItem)
      assert.strictEqual(inStore.get('asdf'), assertAfter)
      assert.strictEqual(inStore.get('version'), 1)
    })

    t.test('when merging at root level with an object with null after', function() {
      const assertFirst = 'herp'
      const assertAfter = 'derp'
      const newItem = { asdf: assertAfter }

      let inStore = new Nconf.Memory()
      inStore.set({
        version: 1,
        asdf: assertFirst,
      })
      assert.strictEqual(inStore.get('asdf'), assertFirst)
      assert.strictEqual(inStore.get('version'), 1)
      assert.ok(inStore.merge(newItem), null)
      assert.notStrictEqual(inStore.get(), newItem)
      assert.strictEqual(inStore.get('asdf'), assertAfter)
      assert.strictEqual(inStore.get('version'), 1)
    })

    t.test('when merging at root level with array', function() {
      const newItem = 'herp'

      let inStore = new Nconf.Memory()
      inStore.set({
        version: 1,
      })
      assert.strictEqual(inStore.get('version'), 1)
      assert.notOk(inStore.get('0'))
      assert.ok(inStore.merge([newItem]))
      assert.ok(inStore.get('0'))
      assert.strictEqual(inStore.get('0'), newItem)
      assert.strictEqual(inStore.get('version'), 1)
    })

    t.test('when merging at root level with array and null after', function() {
      const newItem = 'herp'

      let inStore = new Nconf.Memory()
      inStore.set({
        version: 1,
      })
      assert.strictEqual(inStore.get('version'), 1)
      assert.notOk(inStore.get('0'))
      assert.ok(inStore.merge([newItem], null))
      assert.ok(inStore.get('0'))
      assert.strictEqual(inStore.get('0'), newItem)
      assert.strictEqual(inStore.get('version'), 1)
    })

    t.test('it should always merge at root level if key is object regardless of what comes after', function() {
      let inStore = new Nconf.Memory()
      inStore.set({ herp: 1 })
      assert.deepStrictEqual(inStore.get(), { herp: 1 })
      assert.ok(inStore.merge({ version: 2 }, null))
      assert.deepStrictEqual(inStore.get(), { herp: 1, version: 2 })
      assert.ok(inStore.merge({ test: 3 }, 1235))
      assert.deepStrictEqual(inStore.get(), { herp: 1, version: 2, test: 3 })
      assert.ok(inStore.merge({ foo: 4 }, 'sadfsadfs'))
      assert.deepStrictEqual(inStore.get(), { herp: 1, version: 2, test: 3, foo: 4 })
      assert.ok(inStore.merge({ bar: 5 }, { asdf: 1 }))
      assert.deepStrictEqual(inStore.get(), { herp: 1, version: 2, test: 3, foo: 4, bar: 5 })
    })

    t.test('it should be robust about key type and overwriting', function() {
      let inStore = new Nconf.Memory()
      inStore.set({ herp: 1 })
      assert.deepStrictEqual(inStore.get(), { herp: 1 })
      assert.ok(inStore.merge(123, null))
      assert.deepStrictEqual(inStore.get(), { herp: 1, '123': null })
      assert.ok(inStore.merge(123, { a: 1 }))
      assert.deepStrictEqual(inStore.get(), { herp: 1, '123': { a: 1 } })
      assert.ok(inStore.merge(123, ['a', 1]))
      assert.deepStrictEqual(inStore.get(), { herp: 1, '123': ['a', 1] })
    })
    
    t.test('it be able to handle basic value types with basic values', function() {
      let inStore = new Nconf.Memory()
      inStore.set({ herp: 1 })
      assert.deepStrictEqual(inStore.get(), { herp: 1 })
      assert.ok(inStore.merge({ version: 2 }, null))
      assert.deepStrictEqual(inStore.get(), { herp: 1, version: 2 })
      assert.ok(inStore.merge({ test: 3 }, 1235))
      assert.deepStrictEqual(inStore.get(), { herp: 1, version: 2, test: 3 })
      assert.ok(inStore.merge({ foo: 4 }, 'sadfsadfs'))
      assert.deepStrictEqual(inStore.get(), { herp: 1, version: 2, test: 3, foo: 4 })
      assert.ok(inStore.merge({ bar: 5 }, { asdf: 1 }))
      assert.deepStrictEqual(inStore.get(), { herp: 1, version: 2, test: 3, foo: 4, bar: 5 })
    })

    t.test('when sending a single path with null, string or number value should overwrite', function() {
      const assertString = 'Beginning'
      const assertNumber = 358792

      let inStore = new Nconf.Memory()
      inStore.set({
        herp: {
          derp: 123,
        },
      })
      assert.strictEqual(inStore.get('herp:derp'), 123)
      assert.ok(inStore.merge('herp:derp', null))
      assert.strictEqual(inStore.get('herp:derp'), null)
      assert.ok(inStore.merge('herp:derp', assertString))
      assert.strictEqual(inStore.get('herp:derp'), assertString)
      assert.ok(inStore.merge('herp:derp', assertNumber))
      assert.strictEqual(inStore.get('herp:derp'), assertNumber)
    })

    t.test('when merging at nonexisting path', function() {
      const assertNewItem = { a: 1, b: 2 }
      const assertPath = 'new:path:for:item'

      let inStore = new Nconf.Memory()
      inStore.set({
        version: 1,
      })
      assert.strictEqual(inStore.get('version'), 1)
      assert.notOk(inStore.get(assertPath))

      assert.ok(inStore.merge(assertPath, assertNewItem))
      assert.ok(inStore.get(assertPath))
      assert.notStrictEqual(inStore.get(assertPath), assertNewItem)
      assert.deepStrictEqual(inStore.get(assertPath), assertNewItem)
      assert.deepStrictEqual(inStore.get().new.path.for.item, assertNewItem)
    })
  })

  t.describe('#reset()', function() {
    t.test('should remove everything', function() {
      const assertRoot = {
        version: 1,
        asdf: 'test',
      }
      let inStore = new Nconf.Memory()
      inStore.set(assertRoot)
      assert.deepStrictEqual(inStore.get(), assertRoot)
      inStore.reset()
      assert.deepStrictEqual(inStore.get(), {})
    })

    t.test('should do nothing if readonly', function() {
      const assertRoot = {
        version: 1,
        asdf: 'test',
      }
      let inStore = new Nconf.Memory()
      inStore.set(assertRoot)
      assert.deepStrictEqual(inStore.get(), assertRoot)

      inStore.readOnly = true
      assert.notOk(inStore.reset())
      assert.deepStrictEqual(inStore.get(), assertRoot)
    })
  })

  t.describe('options', function () {
    t.describe('logicalSeparator', function () {
      var store = new Nconf.Memory({logicalSeparator: '||'})
  
      t.test('when storing with : (colon), should store the config atomicly', function () {
        store.set('foo:bar:bazz', 'buzz')
        assert.strictEqual(typeof store.get('foo:bar'), 'undefined')
        assert.strictEqual(store.get('foo:bar:bazz'), 'buzz')
      })
  
      t.test('when storing with separator, should be able to read the object', function () {
        store.set('foo||bar||bazz', 'buzz')
        assert.strictEqual(store.get('foo||bar').bazz, 'buzz')
        assert.strictEqual(store.get('foo').bar.bazz, 'buzz')
      })
    })

    t.test('should allow specifying readonly', function () {
      var store = new Nconf.Memory({ readOnly: true })
      assert.strictEqual(store.readOnly, true)
    })
  })
})
