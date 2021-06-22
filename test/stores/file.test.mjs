import fs from 'fs'
import { Eltro as t, assert} from 'eltro'
import * as helpers from '../helpers.mjs'
import { data } from '../fixtures/data.mjs'
import Nconf from '../../lib/nconf.mjs'

const fsPromise = fs.promises

// let yamlFormat = require('nconf-yaml')

t.describe('#load()', function() {
  let validFile = helpers.fixture('store.json')
  fs.writeFileSync(validFile, JSON.stringify(data, null, 2))
  let malformedFile = helpers.fixture('malformed.json')
  let bomFile = helpers.fixture('bom.json')
  let noBomPath = helpers.fixture('no-bom.json')

  t.test('with valid json should load correctly', function() {
    let store = new Nconf.File({file: validFile})
    store.load()
    assert.deepStrictEqual(store.store, data)
  })

  t.test('with only file string as option', function() {
    let store = new Nconf.File(validFile)
    store.load()
    assert.deepStrictEqual(store.store, data)
  })

  t.test('malformed JSON should respond with an error and indicate file name', function() {
    let store = new Nconf.File({file: malformedFile})
    assert.throws(() => {
      store.load()
    }, /malformed\.json/)
  })

  t.test('with a valid UTF8 JSON file that contains a BOM', function() {
    let store = new Nconf.File(bomFile)
    store.load()
    assert.strictEqual(store.get('port'), 78304)
    assert.strictEqual(store.get('host'), 'weebls-stuff.com')
  })
  
  t.test('with a valid UTF8 JSON file that contains no BOM', function() {
    let store = new Nconf.File(noBomPath)
    store.load()
    assert.strictEqual(store.get('port'), 78304)
    assert.strictEqual(store.get('host'), 'weebls-stuff.com')
  })
})

t.describe('#loadAsync()', function() {
  let validFile = helpers.fixture('store.json')
  fs.writeFileSync(validFile, JSON.stringify(data, null, 2))
  let malformedFile = helpers.fixture('malformed.json')
  let bomFile = helpers.fixture('bom.json')
  let noBomPath = helpers.fixture('no-bom.json')

  t.test('with valid json should load correctly', function() {
    let store = new Nconf.File({file: validFile})
    return store.loadAsync().then(function(newData) {
      assert.strictEqual(newData, store.store)
      assert.deepStrictEqual(store.store, data)
    })
  })

  t.test('with only file string as option', function() {
    let store = new Nconf.File(validFile)
    return store.loadAsync().then(function() {
      assert.deepStrictEqual(store.store, data)
    })
  })

  t.test('malformed JSON should respond with an error and indicate file name', function() {
    let store = new Nconf.File({file: malformedFile})
    assert.isRejected(store.loadAsync()).then(function(err) {
      assert.match(err.message, /malformed\.json/)
    })
  })

  t.test('with a valid UTF8 JSON file that contains a BOM', function() {
    let store = new Nconf.File(bomFile)
    return store.loadAsync().then(function() {
      assert.strictEqual(store.get('port'), 78304)
      assert.strictEqual(store.get('host'), 'weebls-stuff.com')
    })
  })
  
  t.test('with a valid UTF8 JSON file that contains no BOM', function() {
    let store = new Nconf.File(noBomPath)
    return store.loadAsync().then(function() {
      assert.strictEqual(store.get('port'), 78304)
      assert.strictEqual(store.get('host'), 'weebls-stuff.com')
    })
  })
})

t.describe('#save()', function() {
  let testPath = helpers.fixture('tmp.json')
  let testSecondPath = helpers.fixture('tmp2.json')
  
  t.test('should save the data correctly to original file specified', function() {
    let store = new Nconf.File({file: testPath})
  
    Object.keys(data).forEach(function (key) {
      store.set(key, data[key])
    })

    assert.strictEqual(store.save(), store)

    let readData = JSON.parse(fs.readFileSync(store.file))
    assert.deepStrictEqual(readData, data)
  })

  t.test('should save the data to specified file', function() {
    let store = new Nconf.File({file: testPath})
  
    Object.keys(data).forEach(function (key) {
      store.set(key, data[key])
    })

    store.save(testSecondPath)

    let readData = JSON.parse(fs.readFileSync(testSecondPath))
    assert.deepStrictEqual(readData, data)
  })

  t.after(function() {
    return Promise.all([
      fsPromise.unlink(testPath),
      fsPromise.unlink(testSecondPath),
    ]).catch(function() {})
  })
})

t.describe('#saveAsync()', function() {
  let testPath = helpers.fixture('tmp.json')
  let testSecondPath = helpers.fixture('tmp2.json')
  
  t.test('should save the data correctly to original file specified', function() {
    let store = new Nconf.File({file: testPath})
  
    Object.keys(data).forEach(function (key) {
      store.set(key, data[key])
    })

    return store.saveAsync().then(function(checkStore) {
      assert.strictEqual(checkStore, store)
      return fsPromise.readFile(store.file)
    }).then(function(readData) {
      assert.deepStrictEqual(JSON.parse(readData), data)
    })
  })

  t.test('should save the data to specified file', function() {
    let store = new Nconf.File({file: testPath})
  
    Object.keys(data).forEach(function (key) {
      store.set(key, data[key])
    })

    return store.saveAsync(testSecondPath).then(function() {
      return fsPromise.readFile(testSecondPath)
    }).then(function(readData) {
      assert.deepStrictEqual(JSON.parse(readData), data)
    })
  })

  t.after(function() {
    return Promise.all([
      fsPromise.unlink(testPath),
      fsPromise.unlink(testSecondPath),
    ]).catch(function() {})
  })
})

t.describe('#secure', function() {
  t.test('the stringify() method should encrypt properly', function() {
    let secureStore = new Nconf.File({
      file: helpers.fixture('secure-iv.json'),
      secure: 'super-secret-key-32-characterszz'
    })
    secureStore.store = data

    let contents = JSON.parse(secureStore.stringify())
    Object.keys(data).forEach(key => {
      assert.strictEqual(typeof(contents[key]), 'object')
      assert.strictEqual(typeof(contents[key].value), 'string')
      assert.strictEqual(contents[key].alg, 'aes-256-ctr')
      assert.strictEqual(typeof(contents[key].iv), 'string')
    })
  })

  t.test('the parse() method should decrypt properly', function() {
    let secureStore = new Nconf.File({
      file: helpers.fixture('secure-iv.json'),
      secure: 'super-secret-key-32-characterszz'
    })
    secureStore.store = data

    let contents = secureStore.stringify()
    let parsed = secureStore.parse(contents)
    assert.deepStrictEqual(parsed, data)
  })

  t.test('the load() method should decrypt properly', function() {
    let secureStore = new Nconf.File({
      file: helpers.fixture('secure-iv.json'),
      secure: 'super-secret-key-32-characterszz'
    })
    secureStore.load()
    assert.deepStrictEqual(secureStore.store, data)
  })

  t.test('it should throw error on legacy encrypted files', function() {
    let secureStore = new Nconf.File({
      file: helpers.fixture('secure.json'),
      secure: 'super-secretzzz'
    })

    assert.throws(function() {
      secureStore.load()
    }, /[Oo]utdated/)
  })
})

/*

t.test('the search() method when the target file exists higher in the directory tree should update the file appropriately', function() {
  let searchBase = require('os').homedir()
  let filePath = path.join(searchBase, '.nconf')
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2))
  let store = new Nconf.File({
    file: '.nconf'
  })
  store.search(store.searchBase)
  expect(store.file).toEqual(filePath)
  fs.unlinkSync(filePath)
})
t.test('the search() method when the target file doesn't exist higher in the directory tree should update the file appropriately', function() {
  let filePath = helpers.fixture('search-store.json')
  let store = new Nconf.File({
    dir: path.dirname(filePath),
    file: 'search-store.json'
  })
  store.search()
  expect(store.file).toEqual(filePath)
})

*/
