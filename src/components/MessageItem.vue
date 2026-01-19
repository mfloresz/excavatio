<script setup lang="ts">
import {
  ChainOfThought,
  ChainOfThoughtContent,
  ChainOfThoughtStep,
} from '@/components/ai-elements/chain-of-thought'
import {
  Confirmation,
  ConfirmationAction,
  ConfirmationActions,
  ConfirmationAccepted,
  ConfirmationRejected,
  ConfirmationRequest,
  ConfirmationTitle,
} from '@/components/ai-elements/confirmation'
import { Artifact, ArtifactAction, ArtifactActions, ArtifactContent, ArtifactDescription, ArtifactHeader, ArtifactTitle } from '@/components/ai-elements/artifact'
import { CodeBlock, CodeBlockCopyButton } from '@/components/ai-elements/code-block'
import { MessageContent, MessageResponse } from '@/components/ai-elements/message'
import { Source, Sources, SourcesContent, SourcesTrigger } from '@/components/ai-elements/sources'
import { Tool, ToolContent, ToolHeader, ToolInput, ToolOutput } from '@/components/ai-elements/tool'
import type { ExtendedToolState } from '@/components/ai-elements/tool'
import { CheckIcon, Copy, Play, RefreshCw, XIcon } from 'lucide-vue-next'
import { computed, ref } from 'vue'
import type { Attachment } from '@/types'

interface MessageItemProps {
  from: 'user' | 'assistant'
  content: string
  messageId?: string
  createdAt?: Date
  reasoning?: string
  toolCalls?: Array<{
    type: string
    state: ExtendedToolState
    input: any
    output?: any
    errorText?: string
  }>
  sources?: Array<{ href: string; title: string }>
  artifacts?: Array<{
    title: string
    description: string
    code: string
    language: string
  }>
  attachments?: Attachment[]
}

const props = defineProps<MessageItemProps>()

const copied = ref(false)

const hasChainOfThought = computed(() => !!props.reasoning)
const hasToolCalls = computed(() => props.toolCalls && props.toolCalls.length > 0)
const hasSources = computed(() => props.sources && props.sources.length > 0)
const hasArtifacts = computed(() => props.artifacts && props.artifacts.length > 0)

async function handleCopy(text: string) {
  try {
    await navigator.clipboard.writeText(text)
    copied.value = true
    setTimeout(() => {
      copied.value = false
    }, 2000)
  } catch (err) {
    console.error('Failed to copy:', err)
  }
}

function handleCopyContent() {
  handleCopy(props.content)
}

function handleRunArtifact() {
  console.log('Run artifact')
}

function handleRegenerateArtifact() {
  console.log('Regenerate artifact')
}

function handleAcceptTool() {
  console.log('Accept tool')
}

function handleRejectTool() {
  console.log('Reject tool')
}
</script>

<template>
  <div class="flex flex-col gap-4">
    <Sources v-if="hasSources">
      <SourcesTrigger :count="sources?.length || 0" />
      <SourcesContent>
        <Source v-for="source in sources" :key="source.href" :href="source.href" :title="source.title" />
      </SourcesContent>
    </Sources>

    <ChainOfThought v-if="hasChainOfThought" :is-streaming="false">
      <ChainOfThoughtContent>
        <ChainOfThoughtStep
          label="Analizando la consulta"
          description="Desglosando el problema en componentes clave"
          status="complete"
        >
          <template #icon>
            <div class="size-2 rounded-full bg-green-500" />
          </template>
        </ChainOfThoughtStep>
        <ChainOfThoughtStep
          label="Buscando información"
          description="Consultando fuentes de datos disponibles"
          status="complete"
        >
          <template #icon>
            <div class="size-2 rounded-full bg-green-500" />
          </template>
        </ChainOfThoughtStep>
        <ChainOfThoughtStep
          label="Generando respuesta"
          description="Sintetizando la información encontrada"
          status="complete"
        >
          <template #icon>
            <div class="size-2 rounded-full bg-green-500" />
          </template>
        </ChainOfThoughtStep>
      </ChainOfThoughtContent>
    </ChainOfThought>

    <div v-if="hasToolCalls" class="space-y-2">
      <Tool v-for="tool in toolCalls" :key="tool.type" :default-open="true">
        <ToolHeader :state="tool.state" :type="`tool-database_query` as const" />
        <ToolContent>
          <ToolInput :input="tool.input" />
          <Confirmation v-if="tool.state === 'approval-requested'" :approval="{ id: '1' }" state="approval-requested">
            <ConfirmationTitle>
              <ConfirmationRequest>
                Esta herramienta ejecutará una acción en el sistema.
              </ConfirmationRequest>
              <ConfirmationAccepted>
                <CheckIcon class="size-4 text-green-600 dark:text-green-400" />
                <span>Aceptado</span>
              </ConfirmationAccepted>
              <ConfirmationRejected>
                <XIcon class="size-4 text-destructive" />
                <span>Rechazado</span>
              </ConfirmationRejected>
            </ConfirmationTitle>
            <ConfirmationActions>
              <ConfirmationAction variant="outline" @click="handleRejectTool">
                Rechazar
              </ConfirmationAction>
              <ConfirmationAction variant="default" @click="handleAcceptTool">
                Aceptar
              </ConfirmationAction>
            </ConfirmationActions>
          </Confirmation>
          <ToolOutput
            v-if="tool.state === 'output-available'"
            :error-text="tool.errorText"
            :output="tool.output"
          />
        </ToolContent>
      </Tool>
    </div>

    <MessageContent>
      <MessageResponse :content="content" :shiki-options="{ langs: ['ts', 'vue', 'js'] }" />
    </MessageContent>

    <div v-if="hasArtifacts" class="space-y-4">
      <Artifact v-for="(artifact, index) in artifacts" :key="index">
        <ArtifactHeader>
          <div>
            <ArtifactTitle>{{ artifact.title }}</ArtifactTitle>
            <ArtifactDescription>{{ artifact.description }}</ArtifactDescription>
          </div>
          <div class="flex items-center gap-2">
            <ArtifactActions>
              <ArtifactAction :icon="Play" label="Ejecutar" tooltip="Ejecutar código" @click="handleRunArtifact" />
              <ArtifactAction :icon="Copy" label="Copiar" tooltip="Copiar al portapapeles" @click="handleCopyContent" />
              <ArtifactAction :icon="RefreshCw" label="Regenerar" tooltip="Regenerar contenido" @click="handleRegenerateArtifact" />
            </ArtifactActions>
          </div>
        </ArtifactHeader>
        <ArtifactContent class="p-0">
          <CodeBlock class="border-none" :code="artifact.code" language="typescript" show-line-numbers>
            <CodeBlockCopyButton @copy="handleCopyContent" @error="(e) => console.error(e)" />
          </CodeBlock>
        </ArtifactContent>
      </Artifact>
    </div>
  </div>
</template>
