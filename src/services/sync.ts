import { indexedDBService } from './indexedDB'
import { pocketbaseService } from './pocketbase'
import type { Conversation, Message } from '../types'

export const syncService = {
    async syncAll() {
        if (!pocketbaseService.isAuthenticated()) return

        try {
            await this.syncConversations()
            await this.syncMessages()
            // Files and other entities could follow similar logic
        } catch (error) {
            console.error('Sync failed:', error)
        }
    },

    async syncConversations() {
        const localConvs = await indexedDBService.getAllConversations()
        const remoteConvs = await pocketbaseService.getAllConversations()

        // 1. Local to Remote (Pending or Newer)
        for (const local of localConvs) {
            const remoteMatch = remoteConvs.find(r => r.id === local.pocketbaseId || r.id === local.id)

            if (!remoteMatch) {
                // Create in remote
                const created = await pocketbaseService.createConversation({
                    title: local.title,
                    systemPromptId: local.systemPromptId,
                })
                await indexedDBService.saveConversation({
                    ...local,
                    pocketbaseId: created.id,
                    syncStatus: 'synced'
                })
            } else if (local.syncStatus === 'pending' || new Date(local.updatedAt) > new Date(remoteMatch.updated)) {
                // Update remote
                await pocketbaseService.updateConversation(remoteMatch.id, {
                    title: local.title,
                    systemPromptId: local.systemPromptId
                })
                await indexedDBService.saveConversation({
                    ...local,
                    syncStatus: 'synced'
                })
            }
        }

        // 2. Remote to Local (Newer or missing)
        for (const remote of remoteConvs) {
            const localMatch = localConvs.find(l => l.pocketbaseId === remote.id || l.id === remote.id)
            if (!localMatch || new Date(remote.updated) > new Date(localMatch.updatedAt)) {
                await indexedDBService.saveConversation({
                    id: localMatch?.id || remote.id,
                    title: remote.title,
                    systemPromptId: remote.systemPromptId,
                    createdAt: new Date(remote.created),
                    updatedAt: new Date(remote.updated),
                    syncStatus: 'synced',
                    pocketbaseId: remote.id
                })
            }
        }
    },

    async syncMessages() {
        // Basic implementation: Sync messages for each conversation
        const localConvs = await indexedDBService.getAllConversations()
        for (const conv of localConvs) {
            if (!conv.pocketbaseId) continue

            const localMsgs = await indexedDBService.getMessagesByConversation(conv.id)
            const remoteMsgs = await pocketbaseService.getMessagesByConversation(conv.pocketbaseId)

            // Sync local to remote
            for (const local of localMsgs) {
                const remoteMatch = remoteMsgs.find(r => r.id === local.pocketbaseId || r.id === local.id)
                if (!remoteMatch) {
                    const created = await pocketbaseService.createMessage({
                        conversationId: conv.pocketbaseId,
                        role: local.role,
                        content: local.content,
                        attachments: local.attachments
                    })
                    await indexedDBService.saveMessage({
                        ...local,
                        pocketbaseId: created.id
                    })
                }
            }

            // Sync remote to local
            for (const remote of remoteMsgs) {
                const localMatch = localMsgs.find(l => l.pocketbaseId === remote.id || l.id === remote.id)
                if (!localMatch) {
                    await indexedDBService.saveMessage({
                        id: remote.id,
                        conversationId: conv.id,
                        role: remote.role,
                        content: remote.content,
                        attachments: remote.attachments,
                        createdAt: new Date(remote.created),
                        pocketbaseId: remote.id
                    })
                }
            }
        }
    }
}
