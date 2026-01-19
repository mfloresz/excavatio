import { openDB, type IDBPDatabase } from 'idb'
import type { Conversation, Message, SystemPrompt, Settings, File } from '../types'

const DB_NAME = 'yara-ai-db'
const DB_VERSION = 1

export interface Schema {
    conversations: Conversation
    messages: Message
    systemPrompts: SystemPrompt
    settings: Settings
    files: File
}

let dbPromise: Promise<IDBPDatabase<any>> | null = null

export function getDB() {
    if (dbPromise) return dbPromise

    dbPromise = openDB(DB_NAME, DB_VERSION, {
        upgrade(db) {
            if (!db.objectStoreNames.contains('conversations')) {
                db.createObjectStore('conversations', { keyPath: 'id' })
            }
            if (!db.objectStoreNames.contains('messages')) {
                const messageStore = db.createObjectStore('messages', { keyPath: 'id' })
                messageStore.createIndex('by-conversation', 'conversationId')
            }
            if (!db.objectStoreNames.contains('systemPrompts')) {
                db.createObjectStore('systemPrompts', { keyPath: 'id' })
            }
            if (!db.objectStoreNames.contains('settings')) {
                db.createObjectStore('settings', { keyPath: 'id' })
            }
            if (!db.objectStoreNames.contains('files')) {
                const fileStore = db.createObjectStore('files', { keyPath: 'id' })
                fileStore.createIndex('by-conversation', 'conversationId')
            }
        },
    })

    return dbPromise
}

export const indexedDBService = {
    // Conversations
    async getAllConversations(): Promise<Conversation[]> {
        const db = await getDB()
        return db.getAll('conversations')
    },
    async getConversation(id: string): Promise<Conversation | undefined> {
        const db = await getDB()
        return db.get('conversations', id)
    },
    async saveConversation(conversation: Conversation): Promise<void> {
        const db = await getDB()
        await db.put('conversations', conversation)
    },
    async deleteConversation(id: string): Promise<void> {
        const db = await getDB()
        const tx = db.transaction(['conversations', 'messages', 'files'], 'readwrite')
        await tx.objectStore('conversations').delete(id)

        // Cleanup related messages and files
        const messageIndex = tx.objectStore('messages').index('by-conversation')
        let cursor = await messageIndex.openKeyCursor(IDBKeyRange.only(id))
        while (cursor) {
            await tx.objectStore('messages').delete(cursor.primaryKey)
            cursor = await cursor.continue()
        }

        const fileIndex = tx.objectStore('files').index('by-conversation')
        let fileCursor = await fileIndex.openKeyCursor(IDBKeyRange.only(id))
        while (fileCursor) {
            await tx.objectStore('files').delete(fileCursor.primaryKey)
            fileCursor = await fileCursor.continue()
        }

        await tx.done
    },

    // Messages
    async getMessagesByConversation(conversationId: string): Promise<Message[]> {
        const db = await getDB()
        return db.getAllFromIndex('messages', 'by-conversation', conversationId)
    },
    async saveMessage(message: Message): Promise<void> {
        const db = await getDB()
        await db.put('messages', message)
    },
    async deleteMessage(id: string): Promise<void> {
        const db = await getDB()
        await db.delete('messages', id)
    },

    // System Prompts
    async getAllSystemPrompts(): Promise<SystemPrompt[]> {
        const db = await getDB()
        return db.getAll('systemPrompts')
    },
    async saveSystemPrompt(prompt: SystemPrompt): Promise<void> {
        const db = await getDB()
        await db.put('systemPrompts', prompt)
    },
    async deleteSystemPrompt(id: string): Promise<void> {
        const db = await getDB()
        await db.delete('systemPrompts', id)
    },

    // Settings
    async getSettings(): Promise<Settings | undefined> {
        const db = await getDB()
        return db.get('settings', 'current')
    },
    async saveSettings(settings: Settings): Promise<void> {
        const db = await getDB()
        await db.put('settings', { ...settings, id: 'current' })
    },

    // Files
    async getFilesByConversation(conversationId: string): Promise<File[]> {
        const db = await getDB()
        return db.getAllFromIndex('files', 'by-conversation', conversationId)
    },
    async saveFile(file: File): Promise<void> {
        const db = await getDB()
        await db.put('files', file)
    },
    async deleteFile(id: string): Promise<void> {
        const db = await getDB()
        await db.delete('files', id)
    }
}
