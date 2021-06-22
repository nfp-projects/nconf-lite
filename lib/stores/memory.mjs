import * as common from '../common.mjs'

//
// ### function Memory (options)
// #### @options {Object} Options for this instance
// Constructor function for the Memory nconf store which maintains
// a nested json structure based on key delimiters `:`.
//
// e.g. `my:nested:key` ==> `{ my: { nested: { key: } } }`
//
function Memory(orgOpts) {
  let options       = orgOpts || {}
  this.type     = 'memory'
  this.store    = {}
  this.readOnly = options.readOnly || false
  this.logicalSeparator = options.logicalSeparator || ':'
  this.parseValues = options.parseValues || false
}

//
// ### function get (key)
// #### @key {string} Key to retrieve for this instance.
// Retrieves the value for the specified key (if any).
//
Memory.prototype.get = function (key) {
  var target = this.store,
      path   = common.path(key, this.logicalSeparator)

  //
  // Scope into the object to get the appropriate nested context
  //
  while (path.length > 0) {
    key = path.shift()
    if (target && typeof target !== 'string' && target.hasOwnProperty(key)) {
      target = target[key]
      continue
    }
    return undefined
  }

  return target
}

//
// ### function set (key, value)
// #### @key {string} Key to set in this instance
// #### @value {literal|Object} Value for the specified key
// Sets the `value` for the specified `key` in this instance.
//
Memory.prototype.set = function (orgKey, orgValue) {  
  if (this.readOnly) {
    return false
  }

  let key = orgKey
  let value = orgValue

  if (value === undefined && typeof(key) === 'object') {
    key = null
    value = orgKey
  }

  let target = this.store
  let path   = common.path(key, this.logicalSeparator)

  if (path.length === 0) {
    //
    // Root must be an object
    //
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
      return false
    }

    this.store = value
    return true
  }

  key = path.shift()

  //
  // Scope into the object to get the appropriate nested context
  //
  while (path.length) {
    if (!target[key]) {
      target[key] = {}
    }

    target = target[key]
    key = path.shift()
  }

  if (this.parseValues) {
    value = common.parseValues(value)
  }
  if (value) {
    if (Array.isArray(value)) {
      value = common.mergeRecursiveArray(value)
    } else if (typeof(value) === 'object') {
      value = common.merge([value])
    }
  }
  target[key] = value
  return true
}

//
// ### function clear (key)
// #### @key {string} Key to remove from this instance
// Removes the value for the specified `key` from this instance.
//
Memory.prototype.clear = function (key) {
  if (this.readOnly) {
    return false
  }

  let target = this.store
  let value  = target
  let path   = common.path(key, this.logicalSeparator)

  //
  // Scope into the object to get the appropriate nested context
  //
  let i = 0
  for (; i < path.length - 1; i++) {
    key = path[i]
    value = target[key]
    if (typeof value !== 'function' && typeof value !== 'object') {
      return false
    }
    target = value
  }

  // Delete the key from the nested JSON structure
  key = path[i]
  delete target[key]
  return true
}

//
// ### function merge (key, value)
// #### @key {string} Key to merge the value into
// #### @value {literal|Object} Value to merge into the key
// Merges the properties in `value` into the existing object value
// at `key`.
//
Memory.prototype.merge = function (orgFullKey, orgValue) {
  if (this.readOnly) {
    return false
  }

  let fullKey = orgFullKey
  let value = orgValue

  // If fullkey is an object, do basic merge on root
  if (typeof(fullKey) === 'object') {
    this.store = common.merge(this.store, [fullKey])
    return true
  }

  if (typeof(fullKey) === 'number') {
    fullKey = fullKey.toString()
  }

  let target  = this.store
  let path    = common.path(fullKey, this.logicalSeparator)
  let key = path.shift()

  //
  // Scope into the object to get the appropriate nested context
  //
  while (path.length) {
    if (!target[key]) {
      target[key] = {}
    }

    target = target[key]
    key = path.shift()
  }

  // Check if we actually need to do any merging. Sometimes a simple assign or "set"
  // is all that is needed. This might be instances where the value is "null" (which
  // would mean no merging is required) or if we're dealing with arrays on either side.
  if (!value || typeof(value) !== 'object' || Array.isArray(value) || !target[key] || typeof(target[key]) !== 'object' || Array.isArray(target[key])) {
    return this.set(fullKey, value)
  }

  target[key] = common.merge(target[key], [value])
  return true
}

//
// ### function reset (callback)
// Clears all keys associated with this instance.
//
Memory.prototype.reset = function () {
  if (this.readOnly) {
    return false
  }

  this.store  = {}
  return true
}

//
// ### function loadSync
// Returns the store managed by this instance
//
Memory.prototype.loadSync = function () {
  return this.store || {}
}

export default Memory
