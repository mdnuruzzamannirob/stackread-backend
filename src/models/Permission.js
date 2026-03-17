const mongoose = require('mongoose')
const { Schema } = mongoose

const permissionSchema = new Schema(
  {
    name: { type: String, required: true, unique: true }, // e.g. 'books.create'
    module: { type: String, required: true }, // e.g. 'books'
    action: { type: String, required: true }, // e.g. 'create'
    description: { type: String, default: '' },
    is_active: { type: Boolean, default: true },
  },
  { timestamps: true },
)

module.exports = mongoose.model('Permission', permissionSchema)
