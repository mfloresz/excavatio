import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { nanoid } from 'nanoid'
import { indexedDBService } from '../services/indexedDB'
import { syncService } from '../services/sync'
import type { Conversation } from '../types'
import { useAuthStore } from './auth'

export const useConversationsStore = defineStore('conversations', () => {
    // State
    const conversations = ref<Conversation[]>([])
    const currentConversationId = ref<string | null>(null)
    const isLoaded = ref(false)

    // Getters
    const currentConversation = computed(() =>
        conversations.value.find(c => c.id === currentConversationId.value)
    )

    const sortedConversations = computed(() =>
        [...conversations.value].sort((a, b) =>
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        )
    )

    // Actions
    async function loadConversations() {
        try {
            const savedConversations = await indexedDBService.getAllConversations()
            conversations.value = savedConversations
            isLoaded.value = true
        } catch (error) {
            console.error('Failed to load conversations:', error)
            conversations.value = []
            isLoaded.value = true
        }
    }

    async function createConversation(data: { title: string; systemPromptId?: string | null }) {
        try {
            const authStore = useAuthStore()

            const newConversation: Conversation = {
                id: nanoid(),
                title: data.title,
                systemPromptId: data.systemPromptId ?? null,
                createdAt: new Date(),
                updatedAt: new Date(),
                syncStatus: authStore.isAuthenticated ? 'pending' : 'synced',
                pocketbaseId: null
            }

            await indexedDBService.saveConversation(newConversation)
            conversations.value.push(newConversation)

            // Trigger sync if authenticated
            if (authStore.isAuthenticated) {
                syncService.syncAll().catch(err =>
                    console.error('Sync failed after creating conversation:', err)
                )
            }

            return newConversation
        } catch (error) {
            console.error('Failed to create conversation:', error)
            throw error
        }
    }

    async function updateConversation(id: string, data: Partial<Conversation>) {
        try {
            const authStore = useAuthStore()
            const index = conversations.value.findIndex(c => c.id === id)
            if (index === -1) throw new Error('Conversation not found')

            const updatedConversation = {
                ...conversations.value[index],
                ...data,
                updatedAt: new Date(),
                syncStatus: authStore.isAuthenticated ? 'pending' as const : 'synced' as const
            } as Conversation

            await indexedDBService.saveConversation(updatedConversation)
            conversations.value[index] = updatedConversation

            // Trigger sync if authenticated
            if (authStore.isAuthenticated) {
                syncService.syncAll().catch(err =>
                    console.error('Sync failed after updating conversation:', err)
                )
            }

            return updatedConversation
        } catch (error) {
            console.error('Failed to update conversation:', error)
            throw error
        }
    }

    function selectConversation(id: string | null) {
        currentConversationId.value = id
    }

    async function deleteConversation(id: string) {
        try {
            await indexedDBService.deleteConversation(id)
            conversations.value = conversations.value.filter(c => c.id !== id)

            // If we deleted the current conversation, clear selection
            if (currentConversationId.value === id) {
                currentConversationId.value = null
            }
        } catch (error) {
            console.error('Failed to delete conversation:', error)
            throw error
        }
    }

    async function syncConversations() {
        const authStore = useAuthStore()
        if (!authStore.isAuthenticated) return

        try {
            await syncService.syncAll()
            // Reload conversations after sync
            await loadConversations()
        } catch (error) {
            console.error('Failed to sync conversations:', error)
            throw error
        }
    }

    return {
        // State
        conversations,
        currentConversationId,
        isLoaded,
        // Getters
        currentConversation,
        sortedConversations,
        // Actions
        loadConversations,
        createConversation,
        updateConversation,
        selectConversation,
        deleteConversation,
        syncConversations
    }
})
