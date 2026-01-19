import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { nanoid } from 'nanoid'
import { indexedDBService } from '../services/indexedDB'
import type { SystemPrompt } from '../types'

export const useSystemPromptsStore = defineStore('systemPrompts', () => {
    // State
    const prompts = ref<SystemPrompt[]>([])
    const isLoaded = ref(false)

    // Getters
    const activePrompt = computed(() => prompts.value.find(p => p.isActive))

    // Actions
    async function loadPrompts() {
        try {
            const savedPrompts = await indexedDBService.getAllSystemPrompts()
            prompts.value = savedPrompts
            isLoaded.value = true
        } catch (error) {
            console.error('Failed to load system prompts:', error)
            prompts.value = []
            isLoaded.value = true
        }
    }

    async function addPrompt(data: { name: string; prompt: string; isActive?: boolean }) {
        try {
            const newPrompt: SystemPrompt = {
                id: nanoid(),
                name: data.name,
                prompt: data.prompt,
                isActive: data.isActive ?? false,
                createdAt: new Date(),
                updatedAt: new Date()
            }

            // If this prompt is active, deactivate others
            if (newPrompt.isActive) {
                for (const p of prompts.value) {
                    if (p.isActive) {
                        await updatePrompt(p.id, { isActive: false })
                    }
                }
            }

            await indexedDBService.saveSystemPrompt(newPrompt)
            prompts.value.push(newPrompt)
            return newPrompt
        } catch (error) {
            console.error('Failed to add system prompt:', error)
            throw error
        }
    }

    async function updatePrompt(id: string, data: Partial<SystemPrompt>) {
        try {
            const index = prompts.value.findIndex(p => p.id === id)
            if (index === -1) throw new Error('Prompt not found')

            // If setting this prompt as active, deactivate others
            if (data.isActive) {
                for (const p of prompts.value) {
                    if (p.id !== id && p.isActive) {
                        const updated = { ...p, isActive: false, updatedAt: new Date() }
                        await indexedDBService.saveSystemPrompt(updated)
                        prompts.value[prompts.value.findIndex(pr => pr.id === p.id)] = updated
                    }
                }
            }

            const updatedPrompt = {
                ...prompts.value[index],
                ...data,
                updatedAt: new Date()
            } as SystemPrompt

            await indexedDBService.saveSystemPrompt(updatedPrompt)
            prompts.value[index] = updatedPrompt
            return updatedPrompt
        } catch (error) {
            console.error('Failed to update system prompt:', error)
            throw error
        }
    }

    async function deletePrompt(id: string) {
        try {
            await indexedDBService.deleteSystemPrompt(id)
            prompts.value = prompts.value.filter(p => p.id !== id)
        } catch (error) {
            console.error('Failed to delete system prompt:', error)
            throw error
        }
    }

    return {
        // State
        prompts,
        isLoaded,
        // Getters
        activePrompt,
        // Actions
        loadPrompts,
        addPrompt,
        updatePrompt,
        deletePrompt
    }
})
