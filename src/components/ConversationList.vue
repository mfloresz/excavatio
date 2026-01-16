<template>
    <div class="h-full bg-sidebar text-sidebar-foreground flex flex-col">
        <div class="flex items-center gap-3 p-5 border-b border-border">
            <h2 class="flex-1 text-lg font-semibold">Historial</h2>
            <button class="flex items-center gap-1.5 px-4 py-2 bg-primary text-primary-foreground border-none rounded-lg text-sm font-medium cursor-pointer transition-all hover:shadow-md hover:-translate-y-0.5" @click="createNewChat">
                <span class="text-lg">+</span> Nueva
            </button>
        </div>

        <div class="p-4 border-b border-border">
            <input
                v-model="searchQuery"
                type="text"
                placeholder="Buscar conversaciones..."
                class="w-full px-3 py-2.5 bg-background border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
        </div>

        <div class="flex-1 overflow-y-auto p-3">
            <div
                v-for="conv in filteredConversations"
                :key="conv.id"
                class="flex items-center gap-3 p-3 bg-accent/50 rounded-lg mb-2 cursor-pointer transition-all border border-transparent group"
                :class="[
                    conv.id === currentConversationId
                        ? 'bg-sidebar-accent border-sidebar-accent'
                        : 'hover:bg-accent'
                ]"
                @click="selectConversation(conv.id)"
            >
                <div class="flex-1 min-w-0">
                    <span class="block text-sm font-medium truncate">{{ conv.title }}</span>
                    <span class="block text-xs text-muted-foreground mt-1">{{ formatDate(conv.updatedAt) }}</span>
                </div>
                <button class="text-muted-foreground hover:text-destructive cursor-pointer p-1 opacity-0 group-hover:opacity-100 transition-opacity" @click.stop="deleteConversation(conv.id)">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="3 6 5 6 21 6"/>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                    </svg>
                </button>
            </div>

            <div v-if="filteredConversations.length === 0" class="text-center py-10 text-muted-foreground">
                <p>No hay conversaciones</p>
            </div>
        </div>

        <div class="p-4 border-t border-border">
            <button class="w-full py-2.5 bg-secondary text-secondary-foreground border-none rounded-lg text-sm cursor-pointer transition-colors hover:bg-secondary/80" @click="exportAll">
                Exportar historial
            </button>
        </div>
    </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useChat } from '../stores/chat';

const emit = defineEmits(['conversation-selected']);

const { conversationList, currentConversationId, createConversation, selectConversation, deleteConversation, searchConversations } = useChat();

const searchQuery = ref('');

const filteredConversations = computed(() => {
    if (!searchQuery.value.trim()) {
        return conversationList.value;
    }
    return searchConversations(searchQuery.value);
});

function formatDate(timestamp) {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;

    if (diff < 86400000) {
        return date.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });
    } else if (diff < 604800000) {
        return date.toLocaleDateString('es-MX', { weekday: 'short' });
    } else {
        return date.toLocaleDateString('es-MX', { month: 'short', day: 'numeric' });
    }
}

function createNewChat() {
    createConversation();
    emit('conversation-selected');
}

function exportAll() {
    const data = JSON.stringify(conversationList.value, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `biblex-conversations-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
}
</script>
