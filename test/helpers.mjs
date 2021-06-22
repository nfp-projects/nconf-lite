import { assert } from 'eltro'

import fs from 'fs'
import path from 'path'
import { exec as ex } from 'child_process'
import { fileURLToPath } from 'url'
import Nconf from '../lib/nconf.mjs'


let __dirname = path.dirname(fileURLToPath(import.meta.url))

export function assertMerged(err, merged) {
  merged = merged instanceof Nconf
    ? merged.store.store
    : merged;

  assert.strictEqual(err, null)
  assert.strictEqual(typeof(merged), 'object')
  assert.ok(merged.apples)
  assert.ok(merged.bananas)
  assert.strictEqual(typeof(merged.candy), 'object')
  assert.ok(merged.candy.something1)
  assert.ok(merged.candy.something2)
  assert.ok(merged.candy.something3)
  assert.ok(merged.candy.something4)
  assert.ok(merged.dates)
  assert.ok(merged.elderberries)
};

// copy a file
export function cp(from, to) {
  return new Promise(function(res, rej) {
    fs.readFile(from, function (err, data) {
      if (err) return rej(err);
      fs.writeFile(to, data, function(err, data) {
        if (err) return rej(err)
        res(data)
      });
    });
  })
};

/*export function exec(script, prefix = 'node') {
  let command = `${prefix} ${script}`
  return new Promise(function(res, rej) {
    ex(command,
      function (err, stdout, stderr) {
        if (err) {
          err.stdout = stdout
          err.stderr = stderr
          return rej(err)
        }
        res({
          stdout,
          stderr,
        })
      }
    )
  })
}*/

export function fixture(file) {
  return path.resolve(path.join(__dirname, 'fixtures', file));
};
