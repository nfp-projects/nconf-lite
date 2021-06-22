import fs from 'fs'
import path from 'path'
import { spawn } from 'child_process'
import { Eltro as t, assert} from 'eltro'
import * as helpers from './helpers.mjs'
// import nconf from '../lib/nconf-o.mjs'
import Nconf from '../lib/nconf.mjs'

let files = [
  helpers.fixture('merge/file1.json'),
  helpers.fixture('merge/file2.json'),
];
let override = JSON.parse(fs.readFileSync(files[0]), 'utf8');

function assertSystemConf(options) {
  return new Promise(function(res, rej) {
    let env = null;

    if (options.env) {
      env = {}
      Object.keys(process.env).forEach(function (key) {
        env[key] = process.env[key];
      });

      Object.keys(options.env).forEach(function (key) {
        env[key] = options.env[key];
      });
    }

    let child = spawn('node', [options.script].concat(options.argv), {env: env});
    child.stdout.once('data', data => {
      res(data.toString())
    });
  })
}

t.describe('When using nconf', function() {
  t.test("calling add  with the same store type and different options should use the new instance", function() {
    let nconf = new Nconf()
    nconf.file({ file: files[0] })
    let old = nconf.using.get('file');

    assert.ok(old)
    assert.strictEqual(old.file, files[0]);
    nconf.file({ file: files[1] });

    let newOne = nconf.using.get('file');
    assert.notStrictEqual(old, newOne);
    assert.strictEqual(newOne.file, files[1]);
  })

  /*
  t.test("respond with correct arg when 'env' is true", async function() {
    let result = await assertSystemConf({
      script: helpers.fixture('scripts/provider-env.mjs'),
      env: {SOMETHING: 'foobar'}
    })
    
    assert.strictEqual(result.toString(), 'foobar')
  });

  t.test("respond with correct arg when 'env' is true and 'parseValues' option is true", function() {
    let env = {
      SOMETHING: 'foobar',
      SOMEBOOL: 'true',
      SOMENULL: 'null',
      SOMEUNDEF: 'undefined',
      SOMEINT: '3600',
      SOMEFLOAT: '0.5',
      SOMEBAD: '5.1a'
    };
    let oenv = {};
    Object.keys(env).forEach(function (key) {
      if (process.env[key]) oenv[key] = process.env[key];
      process.env[key] = env[key];
    });
    let provider = new nconf.Provider().use('env', {parseValues: true});
    Object.keys(env).forEach(function (key) {
      delete process.env[key];
      if (oenv[key]) process.env[key] = oenv[key];
    });

    assert.strictEqual(provider.get('SOMETHING'), 'foobar');
    assert.strictEqual(provider.get('SOMEBOOL'), true);
    assert.notStrictEqual(provider.get('SOMEBOOL'), 'true');
    assert.strictEqual(provider.get('SOMENULL'), null);
    assert.strictEqual(provider.get('SOMEUNDEF'), undefined);
    assert.strictEqual(provider.get('SOMEINT'), 3600);
    assert.strictEqual(provider.get('SOMEFLOAT'), .5);
    assert.strictEqual(provider.get('SOMEBAD'), '5.1a');
  });

  t.describe("an instance of 'nconf.Provider'", function() {
    t.describe("the merge() method", function() {
      t.test("should have the result merged in", function() {
        let provider = new nconf.Provider().use('file', {file: files[1]});
        provider.load();
        provider.merge(override);
        helpers.assertMerged(null, provider.stores.file.store);
        assert.strictEqual(provider.stores.file.store.candy.something, 'file1');
      });

      t.test("should merge Objects over null", function() {
        let provider = new nconf.Provider().use('file', {file: files[1]});
        provider.load();
        provider.merge(override);
        assert.strictEqual(provider.stores.file.store.unicorn.exists, true);
      });

    })
    t.describe("the load() method", function() {
      t.test("should respect the hierarchy when sources are passed in", function() {
        let provider = new nconf.Provider({
          sources: {
            user: {
              type: 'file',
              file: files[0]
            },
            global: {
              type: 'file',
              file: files[1]
            }
          }
        });
        let merged = provider.load();
        helpers.assertMerged(null, merged);
        assert.strictEqual(merged.candy.something, 'file1');
      })
      t.test("should respect the hierarchy when multiple stores are used", function() {
        let provider = new nconf.Provider().overrides({foo: {bar: 'baz'}})
          .add('file1', {type: 'file', file: files[0]})
          .add('file2', {type: 'file', file: files[1]});

        let merged = provider.load();

        helpers.assertMerged(null, merged);
        assert.strictEqual(merged.foo.bar, 'baz');
        assert.strictEqual(merged.candy.something, 'file1');
      })
    })
  })
  t.describe("the .file() method", function() {
    t.test("should use the correct File store with a single filepath", function() {
      let provider = new nconf.Provider();
      provider.file(helpers.fixture('store.json'));
      assert.strictEqual(typeof(provider.stores.file), 'object');
    });
    t.test("should use the correct File store with a name and a filepath", function() {
      let provider = new nconf.Provider();
      provider.file('custom', helpers.fixture('store.json'));
      assert.strictEqual(typeof(provider.stores.custom), 'object');
    });
    t.test("should use the correct File store with a single object", function() {
      let provider = new nconf.Provider();
      provider.file({
        dir: helpers.fixture(''),
        file: 'store.json',
        search: true
      });

      assert.strictEqual(typeof(provider.stores.file), 'object');
      assert.strictEqual(provider.stores.file.file, helpers.fixture('store.json'));
    });
    t.test("should use the correct File store with a name and an object", function() {
      let provider = new nconf.Provider();
      provider.file('custom', {
        dir: helpers.fixture(''),
        file: 'store.json',
        search: true
      });

      assert.strictEqual(typeof(provider.stores.custom), 'object');
      assert.strictEqual(provider.stores.custom.file, helpers.fixture('store.json'));
    })*/
    /*t.describe("the any() method", function() {
      let provider = new nconf.Provider({
        type: 'literal',
        store: {
          key: "getThisValue"
        }
      })
      t.describe("without a callback", function() {
        t.test("should respond with the correct value given an array of keys with one matching", function() {
          assert.strictEqual(provider.any(["notthis", "orthis", "key"]), 'getThisValue');
        })
        t.test("should respond with null given an array of keys with no match", function() {
          assert.strictEqual(provider.any(["notthis", "orthis"]), null);
        });
        t.test("should respond with the correct value given a variable argument list of keys with one matching", function() {
          assert.strictEqual(provider.any("notthis", "orthis", "key"), 'getThisValue');
        });
        t.test("should respond with null given no arguments", function() {
          assert.strictEqual(provider.any(), null);
        });
      })
      t.describe("with a callback", function() {
        t.test("should respond with the correct value given an array of keys with one matching", function(done) {
          provider.any(["notthis", "orthis", "key"], (err, value) => {
            assert.strictEqual(value, 'getThisValue');
            done();
          });
        });
        t.test("should respond with an undefined value given an array of keys with no match", function(done) {
          provider.any(["notthis", "orthis"], (err, value) => {
            assert.strictEqual(value, undefined)
            done();
          });
        });
        t.test("should respond with the correct value given a variable argument list of keys with one matching", function(done) {
          provider.any("notthis", "orthis", "key", (err, value) => {
            assert.strictEqual(value, 'getThisValue');
            done();
          });
        });

        t.test("should respond with an undefined value given no keys", function(done) {
          provider.any((err, value) => {
            assert.strictEqual(value, undefined)
            done();
          });
        });
      })
    })
  })*/
});
