import mongoose from 'mongoose'

const deviceSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    ip: { type: String, required: true, trim: true },
    group: { type: String, required: true, trim: true, default: 'Sem grupo' }
  },
  {
    timestamps: true,
    versionKey: false
  }
)

deviceSchema.index({ name: 1, ip: 1, group: 1 }, { unique: true })

export const DeviceModel = mongoose.model('Device', deviceSchema)
