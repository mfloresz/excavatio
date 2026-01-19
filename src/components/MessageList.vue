<script setup lang="ts">
import { computed } from 'vue'
import {
  Message,
  MessageBranch,
  MessageBranchContent,
} from '@/components/ai-elements/message'
import MessageItem from '@/components/MessageItem.vue'
import { useMessagesStore } from '@/stores/messages'

const messagesStore = useMessagesStore()

const sortedMessages = computed(() => messagesStore.sortedMessages)
const isLoading = computed(() => messagesStore.isLoading)

function getMessageKey(messageId: string, index: number): string {
  return `${messageId}-${index}`
}
</script>

<template>
  <div class="flex flex-col">
    <div v-if="isLoading" class="flex items-center justify-center py-8">
      <span class="text-muted-foreground">Cargando mensajes...</span>
    </div>

    <template v-else>
      <MessageBranch
        v-for="(message, index) in sortedMessages"
        :key="getMessageKey(message.id, index)"
        :default-branch="0"
      >
        <MessageBranchContent>
          <Message :from="message.role">
            <MessageItem
              :from="message.role"
              :content="message.content"
              :attachments="message.attachments"
              :message-id="message.id"
              :created-at="message.createdAt"
            />
          </Message>
        </MessageBranchContent>
      </MessageBranch>
    </template>

    <div v-if="sortedMessages.length === 0 && !isLoading" class="py-8 text-center">
      <span class="text-muted-foreground">No hay mensajes aún. ¡Inicia la conversación!</span>
    </div>
  </div>
</template>
