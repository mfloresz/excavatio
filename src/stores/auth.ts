import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { pocketbaseService, getPB } from '../services/pocketbase'

export const useAuthStore = defineStore('auth', () => {
    // State
    const user = ref<any>(null)

    // Getters
    const isAuthenticated = computed(() => pocketbaseService.isAuthenticated())

    // Actions
    async function login(email: string, password: string) {
        try {
            const authData = await pocketbaseService.login(email, password)
            user.value = authData.record
            return authData
        } catch (error) {
            console.error('Login failed:', error)
            throw error
        }
    }

    function logout() {
        pocketbaseService.logout()
        user.value = null
    }

    function init() {
        const pb = getPB()
        if (pb.authStore.isValid) {
            user.value = pb.authStore.model
        }
    }

    return {
        // State
        user,
        // Getters
        isAuthenticated,
        // Actions
        login,
        logout,
        init
    }
})
