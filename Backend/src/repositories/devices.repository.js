import { DeviceModel } from '../database/models/device.model.js'

function mapDevice(doc) {
  return {
    id: doc._id.toString(),
    name: doc.name,
    ip: doc.ip,
    group: doc.group
  }
}

export async function findAllDevices() {
  const docs = await DeviceModel.find().sort({ group: 1, name: 1 }).lean()
  return docs.map((doc) => ({ id: doc._id.toString(), name: doc.name, ip: doc.ip, group: doc.group }))
}

export async function findDeviceById(id) {
  const doc = await DeviceModel.findById(id).lean()
  return doc ? mapDevice(doc) : null
}

export async function createDeviceRecord(input) {
  const doc = await DeviceModel.create(input)
  return mapDevice(doc)
}

export async function updateDeviceRecord(id, payload) {
  const doc = await DeviceModel.findByIdAndUpdate(id, payload, { new: true, runValidators: true }).lean()
  return doc ? mapDevice(doc) : null
}

export async function deleteManyDevices(ids) {
  const result = await DeviceModel.deleteMany({ _id: { $in: ids } })
  return result.deletedCount || 0
}

export async function existsDuplicateDevice(input, excludeId = null) {
  const query = {
    name: { $regex: `^${input.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, $options: 'i' },
    ip: { $regex: `^${input.ip.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, $options: 'i' },
    group: { $regex: `^${input.group.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, $options: 'i' }
  }

  if (excludeId) {
    query._id = { $ne: excludeId }
  }

  const count = await DeviceModel.countDocuments(query)
  return count > 0
}
