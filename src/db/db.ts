import { JSONFilePreset } from 'lowdb/node'
import defaultData from './defaultdb.json'

const db = await JSONFilePreset('db.json', defaultData)

export default db
