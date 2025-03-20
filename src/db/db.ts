import { JSONFileSyncPreset } from 'lowdb/node'
import defaultData from './defaultdb.json'

export interface ConversationType {
    key: string;
    name: string;
    messages: string;
    createTime?: string;
    updateTime?: string;
}

const db = await JSONFileSyncPreset<{
    prompts: string,
    conversation: Record<string, ConversationType>,
    memory: string[]
}>('db.json', defaultData)

export default db
