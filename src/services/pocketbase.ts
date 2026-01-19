import PocketBase from 'pocketbase'
import type { Conversation, Message, SystemPrompt, Settings, File } from '../types'

let pb: PocketBase | null = null

export function getPB(url?: string) {
    if (pb && !url) return pb
    if (url) {
        pb = new PocketBase(url)
    } else if (!pb) {
        // Default URL or handled via settings later
        pb = new PocketBase('http://127.0.0.1:8090')
    }
    return pb
}

export const pocketbaseService = {
    // Auth
    async login(email: string, password: string): Promise<any> {
        const client = getPB()
        return client.collection('users').authWithPassword(email, password)
    },
    logout() {
        getPB().authStore.clear()
    },
    isAuthenticated(): boolean {
        return getPB().authStore.isValid
    },

    // Conversations
    async getAllConversations(): Promise<any[]> {
        return getPB().collection('conversations').getFullList({
            sort: '-updated'
        })
    },
    async createConversation(data: Partial<Conversation>): Promise<any> {
        return getPB().collection('conversations').create(data)
    },
    async updateConversation(id: string, data: Partial<Conversation>): Promise<any> {
        return getPB().collection('conversations').update(id, data)
    },
    async deleteConversation(id: string): Promise<boolean> {
        return getPB().collection('conversations').delete(id)
    },

    // Messages
    async getMessagesByConversation(conversationId: string): Promise<any[]> {
        return getPB().collection('messages').getFullList({
            filter: `conversationId = "${conversationId}"`,
            sort: 'created'
        })
    },
    async createMessage(data: Partial<Message>): Promise<any> {
        return getPB().collection('messages').create(data)
    },
    async updateMessage(id: string, data: Partial<Message>): Promise<any> {
        return getPB().collection('messages').update(id, data)
    },
    async deleteMessage(id: string): Promise<boolean> {
        return getPB().collection('messages').delete(id)
    },

    // Files
    async uploadFile(conversationId: string, file: globalThis.File): Promise<any> {
        const formData = new FormData()
        formData.append('conversationId', conversationId)
        formData.append('file', file)
        formData.append('name', file.name)
        formData.append('type', file.type)
        formData.append('size', file.size.toString())

        return getPB().collection('files').create(formData)
    },
    async deleteFile(id: string): Promise<boolean> {
        return getPB().collection('files').delete(id)
    },

    // Realtime
    subscribeToCollection(collection: string, callback: (data: any) => void) {
        return getPB().collection(collection).subscribe('*', callback)
    },
    unsubscribe(collection: string) {
        return getPB().collection(collection).unsubscribe()
    }
}
