import util from 'util'
import Memory from './memory.mjs'
import * as common from '../common.mjs'

//
// ### function Env (options)
// #### @options {Object} Options for this instance.
// Constructor function for the Env nconf store, a simple abstraction
// around the Memory store that can read process environment variables.
//
const Env = function(orgOpts) {
  let options = orgOpts || {}

  if (Array.isArray(options)) {
    options = { whitelist: options }
  }

  Memory.call(this, options)

  this.readOnly  = true
  this.whitelist = options.whitelist || []
  this.separator = options.separator || ''
  this.lowerCase = options.lowerCase || false
  this.parseValues = options.parseValues || false
  this.transform = options.transform || false

  if (!Array.isArray(this.whitelist)) {
    throw new Error('Env parameter whitelist was not an array or contained non-string elements')
  }

  for (let i = 0; i < this.whitelist.length; i++) {
    if (typeof(this.whitelist[i]) !== 'string') {
      throw new Error('Env parameter whitelist was not an array or contained non-string elements')
    }
    this.whitelist[i] = this.whitelist[i].toLowerCase()
  }

  if (options.match) {
    if (typeof(options.match) === 'string') {
      options.match = new RegExp(options.match)
    }
    if (typeof(options.match.test) !== 'function') {
      throw new Error('Env parameter match was not a valid RegExp')
    }
    this.match = options.match
  }
}

// Inherit from the Memory store
util.inherits(Env, Memory)

//
// ### function load ()
// Loads the data passed in from `process.env` into this instance.
//
Env.prototype.load = function () {
  let env = {}
  if (this.lowerCase) {
    Object.keys(process.env).forEach(function (key) {
      env[key.toLowerCase()] = process.env[key]
    })
  } else {
    env = process.env
  }

  if (this.transform) {
    env = common.transform(env, this.transform)
  }

  this.readOnly = false

  Object.keys(env).filter((key) => {
    if (this.match && this.whitelist.length) {
      return key.match(this.match) || this.whitelist.indexOf(key.toLowerCase()) !== -1
    }
    else if (this.match) {
      return key.match(this.match)
    }
    else {
      return !this.whitelist.length || this.whitelist.indexOf(key.toLowerCase()) !== -1
    }
  }).forEach((key) => {
    var val = env[key]

    if (this.parseValues) {
      val = common.parseValues(val)
    }

    if (this.separator) {
      this.set(common.key(...key.split(this.separator)), val)
    }
    else {
      this.set(key, val)
    }
  })

  this.readOnly = true

  return this.store
}

export default Env
