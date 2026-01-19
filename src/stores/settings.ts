import { defineStore } from 'pinia'
import { ref } from 'vue'
import { indexedDBService } from '../services/indexedDB'
import type { Settings } from '../types'

const defaultSettings: Settings = {
    apiKeys: {
        aiGateway: '',
        openai: '',
        anthropic: '',
        google: ''
    },
    syncEnabled: false,
    pocketbaseUrl: 'http://127.0.0.1:8090',
    pocketbaseEmail: '',
    localMode: true
}

export const useSettingsStore = defineStore('settings', () => {
    // State
    const settings = ref<Settings>({ ...defaultSettings })
    const isLoaded = ref(false)

    // Actions
    async function loadSettings() {
        try {
            const savedSettings = await indexedDBService.getSettings()
            if (savedSettings) {
                settings.value = savedSettings
            }
            isLoaded.value = true
        } catch (error) {
            console.error('Failed to load settings:', error)
            settings.value = { ...defaultSettings }
            isLoaded.value = true
        }
    }

    async function updateSettings(newSettings: Partial<Settings>) {
        try {
            settings.value = { ...settings.value, ...newSettings }
            await indexedDBService.saveSettings(settings.value)
        } catch (error) {
            console.error('Failed to update settings:', error)
            throw error
        }
    }

    async function resetSettings() {
        settings.value = { ...defaultSettings }
        await indexedDBService.saveSettings(settings.value)
    }

    return {
        // State
        settings,
        isLoaded,
        // Actions
        loadSettings,
        updateSettings,
        resetSettings
    }
})
