import { Eltro as t, assert} from 'eltro'
import Nconf from '../../lib/nconf.mjs'

t.describe('nconf/stores/literal, An instance of nconf.Literal', function () {
  var envOptions = {foo: 'bar', one: 2}

  t.test("should have the correct methods defined", function () {
    var literal = new Nconf.Literal()
    assert.ok(literal.readOnly)
    assert.strictEqual(literal.type, 'literal')
    assert.strictEqual(typeof(literal.get), 'function')
    assert.strictEqual(typeof(literal.set), 'function')
    assert.strictEqual(typeof(literal.merge), 'function')
    assert.strictEqual(typeof(literal.loadSync), 'function')
  })

  t.test("should have the correct values in the store", function () {
    var literal = new Nconf.Literal(envOptions)
    assert.strictEqual(literal.store.foo, 'bar')
    assert.strictEqual(literal.store.one, 2)
    assert.notOk(literal.set('foo', 'foo'))
    assert.strictEqual(literal.store.foo, 'bar')
  })
})
