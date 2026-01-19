import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import { nanoid } from 'nanoid'
import { indexedDBService } from '../services/indexedDB'
import { syncService } from '../services/sync'
import type { Message, Attachment } from '../types'
import { useConversationsStore } from './conversations'
import { useAuthStore } from './auth'

export const useMessagesStore = defineStore('messages', () => {
    // State
    const messages = ref<Message[]>([])
    const isLoaded = ref(false)
    const isLoading = ref(false)

    // Getters
    const sortedMessages = computed(() =>
        [...messages.value].sort((a, b) =>
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        )
    )

    // Actions
    async function loadMessages(conversationId: string) {
        if (!conversationId) {
            messages.value = []
            isLoaded.value = true
            return
        }

        try {
            isLoading.value = true
            const savedMessages = await indexedDBService.getMessagesByConversation(conversationId)
            messages.value = savedMessages
            isLoaded.value = true
        } catch (error) {
            console.error('Failed to load messages:', error)
            messages.value = []
            isLoaded.value = true
        } finally {
            isLoading.value = false
        }
    }

    async function sendMessage(data: {
        conversationId: string
        role: 'user' | 'assistant'
        content: string
        attachments?: Attachment[]
    }) {
        try {
            const authStore = useAuthStore()
            const conversationsStore = useConversationsStore()

            const newMessage: Message = {
                id: nanoid(),
                conversationId: data.conversationId,
                role: data.role,
                content: data.content,
                attachments: data.attachments ?? [],
                createdAt: new Date(),
                pocketbaseId: null
            }

            await indexedDBService.saveMessage(newMessage)
            messages.value.push(newMessage)

            // Update conversation's updatedAt timestamp
            await conversationsStore.updateConversation(data.conversationId, {
                updatedAt: new Date()
            })

            // Trigger sync if authenticated
            if (authStore.isAuthenticated) {
                syncService.syncAll().catch(err =>
                    console.error('Sync failed after sending message:', err)
                )
            }

            return newMessage
        } catch (error) {
            console.error('Failed to send message:', error)
            throw error
        }
    }

    async function updateMessage(id: string, data: Partial<Message>) {
        try {
            const index = messages.value.findIndex(m => m.id === id)
            if (index === -1) throw new Error('Message not found')

            const updatedMessage = {
                ...messages.value[index],
                ...data
            } as Message

            await indexedDBService.saveMessage(updatedMessage)
            messages.value[index] = updatedMessage

            return updatedMessage
        } catch (error) {
            console.error('Failed to update message:', error)
            throw error
        }
    }

    async function deleteMessage(id: string) {
        try {
            await indexedDBService.deleteMessage(id)
            messages.value = messages.value.filter(m => m.id !== id)
        } catch (error) {
            console.error('Failed to delete message:', error)
            throw error
        }
    }

    function clearMessages() {
        messages.value = []
        isLoaded.value = false
    }

    // Watch for conversation changes and auto-load messages
    const conversationsStore = useConversationsStore()
    watch(
        () => conversationsStore.currentConversationId,
        (newConversationId) => {
            if (newConversationId) {
                loadMessages(newConversationId)
            } else {
                clearMessages()
            }
        }
    )

    return {
        // State
        messages,
        isLoaded,
        isLoading,
        // Getters
        sortedMessages,
        // Actions
        loadMessages,
        sendMessage,
        updateMessage,
        deleteMessage,
        clearMessages
    }
})
