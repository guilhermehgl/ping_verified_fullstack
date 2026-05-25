import mongoose from 'mongoose'

const eventSchema = new mongoose.Schema(
  {
    deviceId: { type: String, required: true },
    name: { type: String, required: true },
    ip: { type: String, required: true },
    from: { type: String, enum: ['online', 'offline'], required: true },
    to: { type: String, enum: ['online', 'offline'], required: true },
    at: { type: Date, required: true }
  },
  {
    timestamps: true,
    versionKey: false
  }
)

eventSchema.index({ at: -1 })

export const EventModel = mongoose.model('Event', eventSchema)
