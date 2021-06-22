import { inherits } from 'util'
import Memory from './memory.mjs'

function Literal (options) {
  Memory.call(this, options)

  this.type     = 'literal'
  this.readOnly = true
  this.store    = options
}

// Inherit from Memory store.
inherits(Literal, Memory)

export default Literal
