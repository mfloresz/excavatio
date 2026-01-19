<script setup lang="ts">
import type { PromptInputMessage } from '@/components/ai-elements/prompt-input'
import type { ChatStatus } from 'ai'
import {
  PromptInput,
  PromptInputActionAddAttachments,
  PromptInputActionMenu,
  PromptInputActionMenuContent,
  PromptInputActionMenuTrigger,
  PromptInputAttachment,
  PromptInputAttachments,
  PromptInputBody,
  PromptInputButton,
  PromptInputFooter,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputTools,
} from '@/components/ai-elements/prompt-input'
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
import { CheckIcon, GlobeIcon, MicIcon, MoreVertical } from 'lucide-vue-next'
import { ref, computed } from 'vue'

interface PromptInputAreaProps {
  status: ChatStatus
  useMicrophone: boolean
  useWebSearch: boolean
  disabled?: boolean
}

const props = defineProps<PromptInputAreaProps>()

const emit = defineEmits<{
  submit: [message: PromptInputMessage]
  'toggle-microphone': []
  'toggle-web-search': []
}>()

const modelId = ref<string>('gpt-4o')
const modelSelectorOpen = ref(false)

const models = [
  { id: 'gpt-4o', name: 'GPT-4o', chef: 'OpenAI', chefSlug: 'openai' },
  { id: 'gpt-4o-mini', name: 'GPT-4o Mini', chef: 'OpenAI', chefSlug: 'openai' },
  { id: 'claude-sonnet-4-20250514', name: 'Claude 4 Sonnet', chef: 'Anthropic', chefSlug: 'anthropic' },
  { id: 'gemini-2.0-flash-exp', name: 'Gemini 2.0 Flash', chef: 'Google', chefSlug: 'google' },
]

const selectedModelData = computed(() => models.find(m => m.id === modelId.value) ?? models[0])

function handleSubmit(message: PromptInputMessage) {
  if (props.disabled) return
  emit('submit', message)
}

function handleModelSelect(id: string) {
  modelId.value = id
  modelSelectorOpen.value = false
}

function toggleMicrophone() {
  if (!props.disabled) {
    emit('toggle-microphone')
  }
}

function toggleWebSearch() {
  if (!props.disabled) {
    emit('toggle-web-search')
  }
}
</script>

<template>
  <div class="shrink-0 px-4 pb-4">
    <PromptInput
      class="w-full"
      multiple
      global-drop
      :disabled="disabled"
      @submit="handleSubmit"
    >
      <PromptInputHeader>
        <PromptInputAttachments>
          <template #default="{ file }">
            <PromptInputAttachment :file="file" />
          </template>
        </PromptInputAttachments>
      </PromptInputHeader>

      <PromptInputBody>
        <PromptInputTextarea placeholder="¿Qué te gustaría saber?" />
      </PromptInputBody>

      <PromptInputFooter>
        <div class="flex items-center gap-2">
          <ModelSelector v-model:open="modelSelectorOpen">
            <ModelSelectorTrigger as-child>
              <button
                class="flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs hover:bg-accent hover:text-accent-foreground transition-colors"
              >
                <ModelSelectorLogo v-if="selectedModelData?.chefSlug" :provider="selectedModelData.chefSlug" />
                <ModelSelectorName v-if="selectedModelData?.name">{{ selectedModelData.name }}</ModelSelectorName>
              </button>
            </ModelSelectorTrigger>
            <ModelSelectorContent class="max-h-[300px]">
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

        <PromptInputTools>
          <PromptInputActionMenu>
            <PromptInputActionMenuTrigger>
              <PromptInputButton>
                <MoreVertical :size="16" />
              </PromptInputButton>
            </PromptInputActionMenuTrigger>
            <PromptInputActionMenuContent>
              <PromptInputActionAddAttachments />
            </PromptInputActionMenuContent>
          </PromptInputActionMenu>

          <PromptInputButton :variant="useMicrophone ? 'default' : 'ghost'" @click="toggleMicrophone">
            <MicIcon :size="16" />
            <span class="sr-only">Micrófono</span>
          </PromptInputButton>

          <PromptInputButton :variant="useWebSearch ? 'default' : 'ghost'" @click="toggleWebSearch">
            <GlobeIcon :size="16" />
            <span>Buscar</span>
          </PromptInputButton>
        </PromptInputTools>

        <PromptInputSubmit :disabled="disabled || status === 'streaming'" :status="status" />
      </PromptInputFooter>
    </PromptInput>
  </div>
</template>
