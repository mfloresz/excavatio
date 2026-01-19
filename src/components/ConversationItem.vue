<script setup lang="ts">
import { computed } from 'vue'
import type { Conversation } from '@/types'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import {
  Trash2,
  Cloud,
  CloudOff,
  AlertCircle
} from 'lucide-vue-next'
import { Button } from '@/components/ui/button'

const props = defineProps<{
  conversation: Conversation
  isSelected: boolean
}>()

const emit = defineEmits<{
  select: [id: string]
  delete: [id: string]
}>()

const syncIcon = computed(() => {
  switch (props.conversation.syncStatus) {
    case 'synced': return Cloud
    case 'pending': return CloudOff
    case 'conflict': return AlertCircle
    default: return Cloud
  }
})

const syncIconColor = computed(() => {
  switch (props.conversation.syncStatus) {
    case 'synced': return 'text-green-500'
    case 'pending': return 'text-yellow-500'
    case 'conflict': return 'text-red-500'
    default: return 'text-muted-foreground'
  }
})

const syncTooltip = computed(() => {
  switch (props.conversation.syncStatus) {
    case 'synced': return 'Sincronizado'
    case 'pending': return 'Pendiente de sincronizar'
    case 'conflict': return 'Conflicto de sincronización'
    default: return ''
  }
})

const formattedDate = computed(() => {
  const date = new Date(props.conversation.updatedAt)
  const diffMs = Date.now() - date.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return 'Hoy'
  if (diffDays === 1) return 'Ayer'
  if (diffDays < 7) return `Hace ${diffDays} días`
  return format(date, 'd MMM', { locale: es })
})

function handleSelect() {
  emit('select', props.conversation.id)
}

function handleDelete(e: Event) {
  e.stopPropagation()
  emit('delete', props.conversation.id)
}
</script>

<template>
  <div
    class="group relative flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors cursor-pointer"
    :class="[
      isSelected
        ? 'bg-accent text-accent-foreground'
        : 'text-muted-foreground hover:bg-accent/50 hover:text-accent-foreground'
    ]"
    @click="handleSelect"
  >
    <div class="flex-1 truncate">
      {{ conversation.title }}
    </div>

    <div class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
      <div
        class="flex items-center gap-1"
        :class="syncIconColor"
        :title="syncTooltip"
      >
        <component
          :is="syncIcon"
          class="size-3.5"
        />
      </div>

      <Button
        variant="ghost"
        size="icon"
        class="size-6 hover:text-destructive"
        title="Eliminar"
        @click="handleDelete"
      >
        <Trash2 class="size-3.5" />
      </Button>
    </div>

    <div class="text-xs text-muted-foreground/70 ml-1">
      {{ formattedDate }}
    </div>
  </div>
</template>
