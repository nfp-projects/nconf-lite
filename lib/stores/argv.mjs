import util from 'util'
import Memory from './memory.mjs'
import * as common from '../common.mjs'

//
// ### function Argv (options)
// #### @options {Object} Options for this instance.
// Constructor function for the Argv nconf store, a simple abstraction
// around the Memory store that can read basic arguments.
//
const Argv = function(orgOpts) {
  let options = orgOpts || {}

  Memory.call(this, options)

  this.readOnly  = true
  this.separator = options.separator || ''
  this.lowerCase = options.lowerCase || false
  this.parseValues = options.parseValues || false
  this.transform = options.transform || false
  this.prefix = options.prefix || '--'
  this.useEqualsign = options.useEqualsign || false

  if (!this.prefix) {
    throw new Error('')
  }
}

// Inherit from the Memory store
util.inherits(Argv, Memory)

//
// ### function load ()
// Loads the data passed in from `process.env` into this instance.
//
Argv.prototype.load = function () {
  this.store = {}
  let args = process.argv.slice(2)
  
  this.readOnly = false

  for (let i = 0; i < args.length; i++) {
    if (args[i].startsWith(this.prefix)) {
      let key = args[i].slice(this.prefix.length)
      if (this.lowerCase) {
        key = key.toLowerCase()
      }
      if (this.separator) {
        key = common.key(...key.split(this.separator))
      }
      if (this.useEqualsign) {
        let equalSignIndex = key.indexOf('=')
        if (equalSignIndex > 0) {
          this.set(key.slice(0, equalSignIndex), key.slice(equalSignIndex + 1))
        }
      } else if (args[i + 1] && !args[i + 1].startsWith(this.prefix)) {
        this.set(key, args[i + 1])
        i++
      } else {
        this.set(key, true)
      }
    }
  }
  
  this.readOnly  = true

  return this.store
}

export default Argv
