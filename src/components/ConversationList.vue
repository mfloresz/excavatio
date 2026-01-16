<template>
  <Teleport to="body">
    <div v-if="show" class="sidebar-overlay" @click.self="close">
      <div class="sidebar">
        <div class="sidebar-header">
          <h2>Historial</h2>
          <button class="new-chat-btn" @click="createNewChat">
            <span>+</span> Nueva conversación
          </button>
          <button class="close-btn" @click="close">×</button>
        </div>

        <div class="search-container">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Buscar conversaciones..."
            class="search-input"
          />
        </div>

        <div class="conversations-list">
          <div
            v-for="conv in filteredConversations"
            :key="conv.id"
            class="conversation-item"
            :class="{ active: conv.id === currentConversationId }"
            @click="selectConversation(conv.id)"
          >
            <div class="conv-info">
              <span class="conv-title">{{ conv.title }}</span>
              <span class="conv-date">{{ formatDate(conv.updatedAt) }}</span>
            </div>
            <button class="delete-btn" @click.stop="deleteConversation(conv.id)">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="3 6 5 6 21 6"/>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
              </svg>
            </button>
          </div>

          <div v-if="filteredConversations.length === 0" class="empty-state">
            <p>No hay conversaciones</p>
          </div>
        </div>

        <div class="sidebar-footer">
          <button class="export-btn" @click="exportAll">
            Exportar historial
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { useChat } from '../stores/chat';

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['update:modelValue', 'conversation-selected']);

const { conversationList, createConversation, selectConversation, deleteConversation, searchConversations } = useChat();

const show = ref(false);
const searchQuery = ref('');

const filteredConversations = computed(() => {
  if (!searchQuery.value.trim()) {
    return conversationList.value;
  }
  return searchConversations(searchQuery.value);
});

const currentConversationId = computed(() => {
  return null;
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
  close();
}

function close() {
  show.value = false;
  emit('update:modelValue', false);
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

watch(() => props.modelValue, (val) => {
  show.value = val;
});

watch(show, (val) => {
  emit('update:modelValue', val);
});
</script>

<style scoped>
.sidebar-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.3);
  z-index: 900;
  display: flex;
}

.sidebar {
  width: 320px;
  height: 100%;
  background: #1e1e1e;
  display: flex;
  flex-direction: column;
  animation: slideIn 0.3s ease;
}

@keyframes slideIn {
  from { transform: translateX(-100%); }
  to { transform: translateX(0); }
}

.sidebar-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 20px;
  border-bottom: 1px solid #333;
}

.sidebar-header h2 {
  margin: 0;
  flex: 1;
  font-size: 1.2rem;
  color: #e0e0e0;
}

.new-chat-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  background: linear-gradient(135deg, #4a6da7, #6b8fc7);
  border: none;
  border-radius: 8px;
  color: white;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 600;
  transition: transform 0.2s;
}

.new-chat-btn:hover {
  transform: translateY(-2px);
}

.new-chat-btn span {
  font-size: 1.2rem;
}

.close-btn {
  background: none;
  border: none;
  color: #888;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 8px;
}

.search-container {
  padding: 12px 20px;
  border-bottom: 1px solid #333;
}

.search-input {
  width: 100%;
  padding: 10px 12px;
  background: #2d2d30;
  border: 1px solid #333;
  border-radius: 8px;
  color: #e0e0e0;
  font-size: 0.9rem;
}

.search-input:focus {
  outline: none;
  border-color: #4a6da7;
}

.conversations-list {
  flex: 1;
  overflow-y: auto;
  padding: 12px;
}

.conversation-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 8px;
  margin-bottom: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.conversation-item:hover {
  background: rgba(255, 255, 255, 0.06);
}

.conversation-item.active {
  background: rgba(74, 109, 167, 0.2);
  border: 1px solid #4a6da7;
}

.conv-info {
  flex: 1;
  min-width: 0;
}

.conv-title {
  display: block;
  color: #e0e0e0;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.conv-date {
  display: block;
  font-size: 0.75rem;
  color: #888;
  margin-top: 4px;
}

.delete-btn {
  background: none;
  border: none;
  color: #666;
  cursor: pointer;
  padding: 4px;
  opacity: 0;
  transition: all 0.2s;
}

.conversation-item:hover .delete-btn {
  opacity: 1;
}

.delete-btn:hover {
  color: #f44336;
}

.empty-state {
  text-align: center;
  padding: 40px 20px;
  color: #666;
}

.sidebar-footer {
  padding: 16px 20px;
  border-top: 1px solid #333;
}

.export-btn {
  width: 100%;
  padding: 10px;
  background: #333;
  border: none;
  border-radius: 8px;
  color: #e0e0e0;
  cursor: pointer;
  font-size: 0.9rem;
  transition: background 0.2s;
}

.export-btn:hover {
  background: #444;
}
</style>
