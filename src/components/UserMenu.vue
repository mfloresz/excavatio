<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useSettingsStore } from '@/stores/settings'
import {
  Settings,
  LogIn,
  LogOut,
  Cloud,
  CloudOff,
  UserCircle
} from 'lucide-vue-next'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

const router = useRouter()
const authStore = useAuthStore()
const settingsStore = useSettingsStore()

const emit = defineEmits<{
  settings: []
  login: []
  logout: []
}>()

const userInitials = computed(() => {
  if (authStore.user?.name) {
    return authStore.user.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
  }
  if (authStore.user?.email) {
    return authStore.user.email[0].toUpperCase()
  }
  return 'U'
})

const isSyncEnabled = computed(() => settingsStore.settings.syncEnabled)

async function handleSettings() {
  await router.push('/settings')
}

async function handleLogin() {
  await router.push('/login')
}

async function handleToggleSync() {
  await settingsStore.updateSettings({ syncEnabled: !isSyncEnabled.value })
}
</script>

<template>
  <DropdownMenu>
    <DropdownMenuTrigger as-child>
      <Button
        variant="ghost"
        class="w-full justify-start gap-2 px-2 h-12"
      >
        <Avatar class="size-8">
          <AvatarImage v-if="authStore.user?.avatarUrl" :src="authStore.user.avatarUrl" />
          <AvatarFallback>{{ userInitials }}</AvatarFallback>
        </Avatar>
        <div class="flex flex-col items-start flex-1 min-w-0">
          <span class="text-sm font-medium truncate w-full">
            {{ authStore.user?.name || authStore.user?.email || 'Usuario' }}
          </span>
          <span class="text-xs text-muted-foreground">
            {{ authStore.isAuthenticated ? 'Conectado' : 'Modo local' }}
          </span>
        </div>
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end" class="w-56">
      <DropdownMenuLabel v-if="authStore.isAuthenticated">
        <div class="flex items-center gap-2">
          <UserCircle class="size-4" />
          <span>Mi cuenta</span>
        </div>
      </DropdownMenuLabel>

      <DropdownMenuSeparator />

      <DropdownMenuItem @click="handleSettings">
        <Settings class="size-4 mr-2" />
        Ajustes
      </DropdownMenuItem>

      <DropdownMenuSeparator />

      <DropdownMenuItem @click="handleToggleSync">
        <component
          :is="isSyncEnabled ? Cloud : CloudOff"
          class="size-4 mr-2"
        />
        {{ isSyncEnabled ? 'Desactivar sincronización' : 'Activar sincronización' }}
      </DropdownMenuItem>

      <DropdownMenuSeparator />

      <DropdownMenuItem
        v-if="!authStore.isAuthenticated"
        class="text-primary"
        @click="handleLogin"
      >
        <LogIn class="size-4 mr-2" />
        Iniciar sesión
      </DropdownMenuItem>

      <DropdownMenuItem
        v-else
        class="text-destructive"
        @click="authStore.logout(); emit('logout')"
      >
        <LogOut class="size-4 mr-2" />
        Cerrar sesión
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
</template>
