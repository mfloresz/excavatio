<script setup lang="ts">
import type { PromptInputMessage } from '@/components/ai-elements/prompt-input'
import type { ChatStatus } from 'ai'
import {
  Conversation,
  ConversationContent,
  ConversationEmptyState,
  ConversationScrollButton,
} from '@/components/ai-elements/conversation'
import MessageList from '@/components/MessageList.vue'
import PromptInputArea from '@/components/PromptInputArea.vue'
import {
  ModelSelector,
  ModelSelectorContent,
  ModelSelectorEmpty,
  ModelSelectorGroup,
  ModelSelectorInput,
  ModelSelectorItem,
  ModelSelectorList,
  ModelSelectorLogo,
  ModelSelectorLogoGroup,
  ModelSelectorName,
  ModelSelectorTrigger,
} from '@/components/ai-elements/model-selector'
import { Suggestion, Suggestions } from '@/components/ai-elements/suggestion'
import { CheckIcon } from 'lucide-vue-next'
import { computed, ref, watch, onMounted } from 'vue'
import { useConversationsStore } from '@/stores/conversations'
import { useMessagesStore } from '@/stores/messages'
import { useSystemPromptsStore } from '@/stores/systemPrompts'

const conversationsStore = useConversationsStore()
const messagesStore = useMessagesStore()
const systemPromptsStore = useSystemPromptsStore()

const models = [
  { id: 'gpt-4o', name: 'GPT-4o', chef: 'OpenAI', chefSlug: 'openai' },
  { id: 'gpt-4o-mini', name: 'GPT-4o Mini', chef: 'OpenAI', chefSlug: 'openai' },
  { id: 'claude-sonnet-4-20250514', name: 'Claude 4 Sonnet', chef: 'Anthropic', chefSlug: 'anthropic' },
  { id: 'gemini-2.0-flash-exp', name: 'Gemini 2.0 Flash', chef: 'Google', chefSlug: 'google' },
]

const suggestions = [
  'Explícame cómo funciona la reactividad en Vue 3',
  '¿Cuál es la diferencia entre ref() y reactive()?',
  'Ayúdame a crear un componente en Vue',
  'Muéstrame ejemplos de código en TypeScript',
]

const modelId = ref<string>(models[0]?.id ?? '')
const modelSelectorOpen = ref(false)
const useWebSearch = ref(false)
const useMicrophone = ref(false)
const status = ref<ChatStatus>('ready')

const selectedModelData = computed(() => models.find(m => m.id === modelId.value) ?? models[0])
const hasMessages = computed(() => messagesStore.sortedMessages.length > 0)
const currentConversation = computed(() => conversationsStore.currentConversation)

onMounted(async () => {
  await Promise.all([
    conversationsStore.loadConversations(),
    systemPromptsStore.loadPrompts()
  ])
})

watch(() => conversationsStore.currentConversationId, async (newId) => {
  if (newId) {
    await messagesStore.loadMessages(newId)
  } else {
    messagesStore.clearMessages()
  }
})

function handleSubmit(message: PromptInputMessage) {
  const text = message.text.trim()
  if (text.length === 0) return

  const conversationId = conversationsStore.currentConversationId
  if (!conversationId) {
    return
  }

  status.value = 'submitted'

  messagesStore.sendMessage({
    conversationId,
    role: 'user',
    content: text,
    attachments: []
  }).then(() => {
    status.value = 'ready'
  }).catch((error) => {
    console.error('Failed to send message:', error)
    status.value = 'ready'
  })
}

async function handleCreateNewChat() {
  const conversation = await conversationsStore.createConversation({
    title: 'Nueva conversación'
  })
  conversationsStore.selectConversation(conversation.id)
}

function handleSuggestionClick(suggestion: string) {
  const conversationId = conversationsStore.currentConversationId
  if (!conversationId) {
    handleCreateNewChat()
  }

  status.value = 'submitted'

  messagesStore.sendMessage({
    conversationId: conversationsStore.currentConversationId!,
    role: 'user',
    content: suggestion,
    attachments: []
  }).then(() => {
    status.value = 'ready'
  }).catch((error) => {
    console.error('Failed to send message:', error)
    status.value = 'ready'
  })
}

function handleModelSelect(id: string) {
  modelId.value = id
  modelSelectorOpen.value = false
}

function toggleMicrophone() {
  useMicrophone.value = !useMicrophone.value
}

function toggleWebSearch() {
  useWebSearch.value = !useWebSearch.value
}

function handleTitleChange(newTitle: string) {
  if (conversationsStore.currentConversationId) {
    conversationsStore.updateConversation(conversationsStore.currentConversationId, {
      title: newTitle
    })
  }
}
</script>

<template>
  <div class="flex h-full w-full flex-col divide-y">
    <div class="flex items-center justify-between border-b bg-background px-4 py-3">
      <div class="flex items-center gap-2">
        <input
          v-if="currentConversation"
          :value="currentConversation.title"
          class="bg-transparent text-lg font-semibold outline-none focus:underline"
          @blur="(e) => handleTitleChange((e.target as HTMLInputElement).value)"
        />
        <h1 v-else class="text-lg font-semibold">Yara AI</h1>
      </div>
      <div class="flex items-center gap-2">
        <ModelSelector v-model:open="modelSelectorOpen">
          <ModelSelectorTrigger as-child>
            <button
              class="flex items-center gap-2 rounded-lg border px-3 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground transition-colors"
            >
              <ModelSelectorLogo v-if="selectedModelData?.chefSlug" :provider="selectedModelData.chefSlug" />
              <ModelSelectorName v-if="selectedModelData?.name">{{ selectedModelData.name }}</ModelSelectorName>
            </button>
          </ModelSelectorTrigger>
          <ModelSelectorContent>
            <ModelSelectorInput placeholder="Buscar modelos..." />
            <ModelSelectorList>
              <ModelSelectorEmpty>No se encontraron modelos.</ModelSelectorEmpty>
              <ModelSelectorGroup v-for="chef in ['OpenAI', 'Anthropic', 'Google']" :key="chef" :heading="chef">
                <ModelSelectorItem
                  v-for="m in models.filter(model => model.chef === chef)"
                  :key="m.id"
                  :value="m.id"
                  @select="() => handleModelSelect(m.id)"
                >
                  <ModelSelectorLogo :provider="m.chefSlug" />
                  <ModelSelectorName>{{ m.name }}</ModelSelectorName>
                  <ModelSelectorLogoGroup>
                    <ModelSelectorLogo v-for="provider in [m.chefSlug]" :key="provider" :provider="provider" />
                  </ModelSelectorLogoGroup>
                  <CheckIcon v-if="modelId === m.id" class="ml-auto size-4" />
                  <div v-else class="ml-auto size-4" />
                </ModelSelectorItem>
              </ModelSelectorGroup>
            </ModelSelectorList>
          </ModelSelectorContent>
        </ModelSelector>
      </div>
    </div>

    <div class="flex-1 overflow-hidden">
      <Conversation v-if="hasMessages" class="relative size-full">
        <ConversationContent>
          <MessageList />
        </ConversationContent>
        <ConversationScrollButton />
      </Conversation>

      <div v-else class="flex h-full items-center justify-center">
        <ConversationEmptyState
          title="Yara AI"
          description="Inicia una conversación para comenzar"
        >
          <div class="flex size-12 items-center justify-center rounded-full bg-muted">
            <span class="text-2xl">🤖</span>
          </div>
          <div v-if="!conversationsStore.currentConversationId" class="mt-4">
            <button
              class="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
              @click="handleCreateNewChat"
            >
              Nueva conversación
            </button>
          </div>
        </ConversationEmptyState>
      </div>
    </div>

    <div v-if="hasMessages" class="grid shrink-0 gap-4 p-4">
      <Suggestions class="px-2">
        <Suggestion
          v-for="suggestion in suggestions"
          :key="suggestion"
          :suggestion="suggestion"
          @click="handleSuggestionClick"
        />
      </Suggestions>
    </div>

    <PromptInputArea
      :status="status"
      :use-microphone="useMicrophone"
      :use-web-search="useWebSearch"
      :disabled="!conversationsStore.currentConversationId"
      @submit="handleSubmit"
      @toggle-microphone="toggleMicrophone"
      @toggle-web-search="toggleWebSearch"
    />
  </div>
</template>
