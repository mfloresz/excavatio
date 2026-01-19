<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { MessageSquarePlus } from 'lucide-vue-next'
import { useConversationsStore } from '@/stores/conversations'
import { useAuthStore } from '@/stores/auth'
import { useSettingsStore } from '@/stores/settings'
import ConversationItem from './ConversationItem.vue'
import UserMenu from './UserMenu.vue'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'

const router = useRouter()
const conversationsStore = useConversationsStore()
const authStore = useAuthStore()
const settingsStore = useSettingsStore()

const isCreatingConversation = ref(false)

const sortedConversations = computed(() => {
  const convs = conversationsStore.conversations
  console.log('Computing sortedConversations, count:', convs.length)
  return [...convs].sort((a, b) =>
    new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  )
})
const isLoaded = computed(() => conversationsStore.isLoaded)

onMounted(async () => {
  console.log('Sidebar mounted')
  try {
    await conversationsStore.loadConversations()
    console.log('Loaded conversations:', conversationsStore.conversations.length)
  } catch (e) {
    console.error('Error loading conversations:', e)
  }
  try {
    await authStore.init()
  } catch (e) {
    console.error('Error init auth:', e)
  }
  try {
    await settingsStore.loadSettings()
  } catch (e) {
    console.error('Error loading settings:', e)
  }
  console.log('isLoaded:', conversationsStore.isLoaded)
})

async function handleNewConversation() {
  if (isCreatingConversation.value) return

  isCreatingConversation.value = true
  try {
    console.log('Creating new conversation...')
    const conversation = await conversationsStore.createConversation({
      title: 'Nueva conversación',
      systemPromptId: null
    })
    console.log('Conversation created:', conversation)
    console.log('Conversations in store:', conversationsStore.conversations.length)
    conversationsStore.selectConversation(conversation.id)
    router.push(`/conversation/${conversation.id}`)
  } catch (error) {
    console.error('Failed to create conversation:', error)
  } finally {
    isCreatingConversation.value = false
  }
}

function handleSelectConversation(id: string) {
  conversationsStore.selectConversation(id)
  router.push(`/conversation/${id}`)
}

async function handleDeleteConversation(id: string) {
  await conversationsStore.deleteConversation(id)
  if (conversationsStore.currentConversationId === id) {
    router.push('/')
  }
}

function handleRenameConversation(id: string) {
  const conversation = conversationsStore.conversations.find(c => c.id === id)
  if (conversation) {
    const newTitle = prompt('Renombrar conversación:', conversation.title)
    if (newTitle && newTitle.trim()) {
      conversationsStore.updateConversation(id, { title: newTitle.trim() })
    }
  }
}

async function handleDuplicateConversation(id: string) {
  const conversation = conversationsStore.conversations.find(c => c.id === id)
  if (conversation) {
    await conversationsStore.createConversation({
      title: `${conversation.title} (copia)`,
      systemPromptId: conversation.systemPromptId
    })
  }
}
</script>

<template>
  <div class="flex h-full flex-col bg-background border-r">
    <div class="p-4 border-b">
      <h1 class="text-xl font-bold text-foreground">Yara AI</h1>
    </div>

    <div class="p-2">
      <Button
        class="w-full justify-start gap-2"
        :disabled="isCreatingConversation"
        @click="handleNewConversation"
      >
        <MessageSquarePlus class="size-4" />
        <span>{{ isCreatingConversation ? 'Creando...' : 'Nueva conversación' }}</span>
      </Button>
    </div>

    <div class="flex-1 overflow-y-auto px-2 py-1">
      <div v-if="!isLoaded" class="space-y-2 p-2">
        <Skeleton v-for="i in 5" :key="i" class="h-10 w-full rounded-lg" />
      </div>

      <div v-else-if="sortedConversations.length > 0" class="space-y-1">
        <h2 class="mb-2 px-1 text-xs font-medium text-muted-foreground uppercase tracking-wide">
          Historial
        </h2>
        <ConversationItem
          v-for="conversation in sortedConversations"
          :key="conversation.id"
          :conversation="conversation"
          :is-selected="conversation.id === conversationsStore.currentConversationId"
          @select="handleSelectConversation"
          @delete="handleDeleteConversation"
          @rename="handleRenameConversation"
          @duplicate="handleDuplicateConversation"
        />
      </div>

      <div v-else class="p-4 text-center text-sm text-muted-foreground">
        No hay conversaciones aún
      </div>
    </div>

    <div class="border-t p-2">
      <UserMenu />
    </div>
  </div>
</template>
