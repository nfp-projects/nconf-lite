import { Eltro as t, assert} from 'eltro'
import * as helpers from './helpers.mjs'
import Nconf from '../lib/nconf.mjs'

var globalConfig = helpers.fixture('hierarchy/global.json')
var userConfig = helpers.fixture('hierarchy/user.json')
var file3 = helpers.fixture('merge/file3.json')

t.test('configured with two file stores should work', function() {
  let nconf = new Nconf()
  nconf.file('user', {type: 'file', file: userConfig})
  nconf.file('global', {type: 'file', file: globalConfig})
  nconf.load()

  assert.strictEqual(nconf.get('title'), 'My specific title')
  assert.strictEqual(nconf.get('color'), 'green')
  assert.strictEqual(nconf.get('movie'), 'Kill Bill')
})

t.test('configured with two file stores with just filenames should work', function() {
  let nconf = new Nconf()
  nconf.file('user', userConfig)
  nconf.file('global', globalConfig)
  nconf.load()

  assert.strictEqual(nconf.get('title'), 'My specific title')
  assert.strictEqual(nconf.get('color'), 'green')
  assert.strictEqual(nconf.get('movie'), 'Kill Bill')
})

t.test('configured with .file(), .defaults() should deep merge objects correctly', async function() {
  let nconf = new Nconf()
    .file('localOverrides', file3)
    .defaults({
      "candy": {
        "something": "a nice default",
        "something1": true,
        "something2": true,
        "something5": {
          "first": 1,
          "second": 2
        }
      }
    })

  assert.deepStrictEqual(nconf.get('candy'), {
    something: 'much better something for you',
    something1: true,
    something2: true,
    something18: 'completely unique',
    something5: {
      first: 1,
      second: 99
    }
  })
})
