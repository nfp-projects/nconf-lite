import fs from 'fs'
import Memory from './stores/memory.mjs'

//
// ### function validkeyvalue(key)
// #### @key {any} key to check
// Return string of key if valid string type key,
// otherwise transform into new key containing
// the error message
export function validkeyvalue(key) {
  let type = typeof(key)
  if (key && type !== 'string' && type !== 'number') {
    return '__invalid_valuetype_of_' + type + '__'
  }
  return null
}

//
// ### function path (key)
// #### @key {string} The ':' delimited key to split
// Returns a fully-qualified path to a nested nconf key.
// If given null or undefined it should return an empty path.
// '' should still be respected as a path.
//
export function path(key, separator) {
  let invalidType = validkeyvalue(key)
  if (invalidType) {
    return [invalidType]
  }
  separator = separator || ':'
  return key == null
      || key === ''
    ? []
    : key.toString().split(separator)
}

//
// ### function key (arguments)
// Returns a `:` joined string from the `arguments`.
//
export function key(...path) {
  return path.map(function(item) {
    return validkeyvalue(item) || ('' + item)
  }).join(':')
}

//
// ### function key (arguments)
// Returns a joined string from the `arguments`,
// first argument is the join delimiter.
//
export function keyed(separator, ...path) {
  return path.map(function(item) {
    return validkeyvalue(item) || ('' + item)
  }).join(separator)
}

// taken from isobject npm library
export function isObject(val) {
  return val != null && typeof val === 'object' && Array.isArray(val) === false
}

// Return a new recursive deep instance of array of objects
// or values to make sure no original object ever get touched
export function mergeRecursiveArray(arr) {
  return arr.map(function(item) {
    if (isObject(item)) return mergeRecursive({}, item)
    if (Array.isArray(item)) return mergeRecursiveArray(item)
    return item
  })
}

// Recursively merges the child into the parent.
export function mergeRecursive(parent, child) {
  Object.keys(child).forEach(key => {
    // Arrays will always overwrite for now
    if (Array.isArray(child[key])) {
      parent[key] = mergeRecursiveArray(child[key])
    } else if (child[key] && typeof child[key] === 'object') {
      // We don't wanna support cross merging between array and objects
      // so we overwrite the old value (at least for now).
      if (parent[key] && Array.isArray(parent[key])) {
        parent[key] = mergeRecursive({}, child[key])
      } else {
        parent[key] = mergeRecursive(parent[key] || {}, child[key])
      }
    } else {
      parent[key] = child[key]
    }
  })

  return parent
}


//
// ### function merge (objs)
// #### @objs {Array} Array of object literals to merge
// Merges the specified `objs` together into a new object.
// This differs from the old logic as it does not affect or chagne
// any of the objects being merged.
//
export function merge(orgOut, orgObjs) {
  let out = orgOut
  let objs = orgObjs
  if (objs === undefined) {
    out = {}
    objs = orgOut
  }
  if (!Array.isArray(objs)) {
    throw new Error('merge called with non-array of objects')
  }
  for (let x = 0; x < objs.length; x++) {
    out = mergeRecursive(out, objs[x])
  }
  return out
}

//
// ### function capitalize (str)
// #### @str {string} String to capitalize
// Capitalizes the specified `str` if string, otherwise
// returns the original object
//
export function capitalize(str) {
  if (typeof(str) !== 'string' && typeof(str) !== 'number') {
    return str
  }
  let out = str.toString()
  return out && (out[0].toString()).toUpperCase() + out.slice(1)
}

//
// ### function parseValues (any)
// #### @any {string} String to parse as json or return as is
// try to parse `any` as a json stringified
//
export function parseValues(value) {
  if (value === 'undefined') {
    return undefined
  }

  try {
    return JSON.parse(value)
  } catch (ignore) {
    return value
  }
}

//
// ### function transform(map, fn)
// #### @map {object} Object of key/value pairs to apply `fn` to
// #### @fn {function} Transformation function that will be applied to every key/value pair
// transform a set of key/value pairs and return the transformed result
export function transform(map, fn) {
  var pairs = Object.keys(map).map(function(key) {
    var result = fn(key, map[key])

    if (!result) {
      return null
    } else if (result.key) {
      return result
    }

    throw new Error('Transform function passed to store returned an invalid format: ' + JSON.stringify(result))
  })


  return pairs
    .filter(function(pair) {
      return pair !== null
    })
    .reduce(function(accumulator, pair) {
      accumulator[pair.key] = pair.value
      return accumulator
    }, {})
}
