import fs from 'fs'
import { fileURLToPath } from 'url'
import path from 'path'
import * as common from './common.mjs'
import Literal from './stores/literal.mjs'
import Memory from './stores/memory.mjs'
import File from './stores/file.mjs'
import Env from './stores/env.mjs'
import Argv from './stores/argv.mjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const pckg = JSON.parse(fs.readFileSync(path.resolve(path.join(__dirname, '../package.json'))))

const AvailableStores = [
  ['memory', Memory],
  ['file', File],
  ['defaults', Literal],
  ['overrides', Literal],
  ['literal', Literal],
  ['env', Env],
  ['argv', Argv],
]

function Nconf(options) {
  let opts = options || {}
  this.sources = []
  this.using = new Map()
  this.version = pckg.version
  this.init()
}

Nconf.prototype.key = common.key
Nconf.prototype.path = common.path

Nconf.prototype.init = function() {
  AvailableStores.forEach((storeType) => {
    let nameCapital = common.capitalize(storeType[0])
    let nameLower = storeType[0].toLowerCase()

    Object.defineProperty(this, nameCapital, {
      value: storeType[1],
      writable: false,
      enumerable: true,
    })
    Object.defineProperty(this, nameLower, {
      value: function(leName, leOpts) {
        let name = leName
        let options = leOpts || {}
        if (typeof(name) !== 'string') {
          name = nameLower
          options = leName || {}
        }
        this.add(name, new this[nameCapital](options))
        return this
      },
      writable: false,
      enumerable: true,
    })
  })
}

Nconf.prototype.any = function(...items) {
  let check = items
  if (items.length === 1 && Array.isArray(items[0])) {
    check = items[0]
  }
  for (let i = 0; i < check.length; i++) {
    let found = this.get(check[i])
    if (found) return found
  }
  return undefined
}
Nconf.prototype.get = function(key) {
  let out = []
  for (let i = 0; i < this.sources.length; i++) {
    let found = this.sources[i].get(key)
    if (found && !out.length && (Array.isArray(found) || typeof(found) !== 'object')) {
      return found
    }
    if (found) {
      out.push(found)
    }
  }
  if (!out.length) return undefined
  return common.merge(out.reverse())
}
Nconf.prototype.set = function(key, value) {
  for (let i = 0; i < this.sources.length; i++) {
    if (!this.sources[i].readOnly) {
      if (this.sources[i].set(key, value))
        return this
    }
  }
  return false
}

Nconf.prototype.clear = function(key) {
  for (let i = 0; i < this.sources.length; i++) {
    this.sources[i].clear(key)
  }
  if (this.get(key)) {
    return false
  }
  return this
}
Nconf.prototype.load = function() {
  for (let i = 0; i < this.sources.length; i++) {
    if (typeof(this.sources[i].load) === 'function') {
      this.sources[i].load()
    }
  }
}
Nconf.prototype.save = function() {
  for (let i = 0; i < this.sources.length; i++) {
    if (typeof(this.sources[i].save) === 'function') {
      this.sources[i].save()
    }
  }
}
Nconf.prototype.reset = function() {
  throw new Error('Deprecated, create new instance instead')
}

Nconf.prototype.required = function(...items) {
  let check = items
  if (items.length === 1 && Array.isArray(items[0])) {
    check = items[0]
  }
  let missing = []
  for (let i = 0; i < check.length; i++) {
    if (!this.get(check[i])) {
      missing.push(check[i])
    }
  }

  if (missing.length) {
    throw new Error('Missing required keys: ' + missing.join(', '));
  }

  return this
}

Nconf.prototype.add = function(name, store) {
  let oldStore = this.using.get(name)
  
  if (typeof(store.load) === 'function') {
    store.load()
  }

  if (oldStore) {
    this.sources.splice(this.sources.indexOf(oldStore), 1)
    this.using.delete(name)
  }
  this.using.set(name, store)
  this.sources.push(store)
}

Nconf.prototype.use = function(name) {
  return this.using.get(name)
}

Nconf.register = function(name, val) {
  AvailableStores.push([name, val])
  let nameCapital = common.capitalize(name)
  Object.defineProperty(Nconf, nameCapital, {
    value: val,
    writable: false,
    enumerable: true,
  })
}

AvailableStores.forEach((storeType) => {
  let nameCapital = common.capitalize(storeType[0])
  Object.defineProperty(Nconf, nameCapital, {
    value: storeType[1],
    writable: false,
    enumerable: true,
  })
})

export default Nconf
