import { Eltro as t, assert} from 'eltro'
import * as helpers from './helpers.mjs'
import nconf from '../lib/nconf.js'

var globalConfig = helpers.fixture('hierarchy/global.json');
var userConfig = helpers.fixture('hierarchy/user.json');

t.describe('nconf/hierarchy, When using nconf', function() {
  t.test("configured with two file stores, should have the appropriate keys present", function() {
    nconf.add('user', {type: 'file', file: userConfig});
    nconf.add('global', {type: 'file', file: globalConfig});
    nconf.load();

    assert.strictEqual(nconf.get('title'), 'My specific title');
    assert.strictEqual(nconf.get('color'), 'green');
    assert.strictEqual(nconf.get('movie'), 'Kill Bill');
  });

  t.test("configured with two file stores using `file` should have the appropriate keys present", function() {
    nconf.file('user', userConfig);
    nconf.file('global', globalConfig);
    nconf.load();

    assert.strictEqual(nconf.get('title'), 'My specific title');
    assert.strictEqual(nconf.get('color'), 'green');
    assert.strictEqual(nconf.get('movie'), 'Kill Bill');
  });

  t.test("configured with .file(), .defaults() should deep merge objects should merge nested objects ", async function() {
    var script = helpers.fixture('scripts/nconf-hierarchical-defaults-merge.js');
    let res = await helpers.exec(script)

    assert.deepEqual(JSON.parse(res.stdout), {
      candy: {
        something: 'much better something for you',
        something1: true,
        something2: true,
        something18: 'completely unique',
        something5: {
          first: 1,
          second: 99
        }
      }
    });
  })
})
