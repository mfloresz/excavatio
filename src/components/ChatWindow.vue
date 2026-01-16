<template>
  <div class="chat-container">
    <div class="chat-header">
      <div class="header-left">
        <h2>{{ title }}</h2>
        <span v-if="currentModel" class="model-badge">{{ currentModel }}</span>
      </div>
      <div class="header-actions">
        <button class="icon-btn" @click="$emit('toggle-sidebar')" title="Historial">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
        </button>
        <button class="icon-btn" @click="$emit('open-settings')" title="Configuración">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="3"/>
            <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z"/>
          </svg>
        </button>
      </div>
    </div>

    <div class="messages-container" ref="messagesContainer">
      <div v-if="messages.length === 0" class="empty-state">
        <div class="empty-icon">📖</div>
        <h3>Scripture Excavator</h3>
        <p>Explora las Escrituras con análisis profundo de los idiomas originales.</p>
        <p class="hint">Ejemplo: "Analiza Juan 1:1 en los idiomas originales"</p>
      </div>

      <div v-for="msg in messages" :key="msg.id" class="message-wrapper" :class="msg.role">
        <div class="message-avatar">
          <span v-if="msg.role === 'user'">👤</span>
          <span v-else>🤖</span>
        </div>
        <div class="message-content">
          <div v-if="msg.toolCalls && msg.toolCalls.length > 0" class="tool-calls">
            <div v-for="(tool, idx) in msg.toolCalls" :key="idx" class="tool-call">
              <span class="tool-name">{{ tool.name || 'tool' }}</span>
              <span class="tool-params">{{ JSON.stringify(tool.parameters || tool.arguments || {}) }}</span>
            </div>
          </div>
          <div v-if="msg.content" class="markdown-body" v-html="renderMarkdown(msg.content)"></div>
        </div>
      </div>

      <div v-if="isLoading && toolCalls.length > 0" class="message-wrapper assistant">
        <div class="message-avatar">🤖</div>
        <div class="message-content">
          <div class="tool-calls">
            <div v-for="(tool, idx) in toolCalls" :key="idx" class="tool-call">
              <span class="tool-name">🔧 {{ tool.function?.name || 'tool' }}</span>
              <span class="tool-params">{{ tool.function?.arguments || '{}' }}</span>
            </div>
          </div>
        </div>
      </div>

      <div v-if="isLoading" class="message-wrapper assistant loading">
        <div class="message-avatar">🤖</div>
        <div class="message-content">
          <div class="typing-indicator">
            <span></span><span></span><span></span>
          </div>
        </div>
      </div>
    </div>

    <div class="input-area">
      <div class="input-container">
        <textarea
          v-model="userInput"
          @keydown.enter.exact.prevent="send"
          @keydown.meta.enter="send"
          :disabled="isLoading"
          placeholder="Escribe un pasaje bíblico para analizar..."
          rows="1"
          ref="inputRef"
        ></textarea>
        <button
          class="send-btn"
          @click="send"
          :disabled="isLoading || !userInput.trim()"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="22" y1="2" x2="11" y2="13"/>
            <polygon points="22 2 15 22 11 13 2 9 22 2"/>
          </svg>
        </button>
      </div>
      <p class="input-hint">Presiona Enter para enviar, Shift+Enter para nueva línea</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick, onMounted } from 'vue';
import { useChatEngine } from '../composables/useChat';
import { useChat } from '../stores/chat';
import { useSettings } from '../stores/settings';

const props = defineProps({
  title: {
    type: String,
    default: 'Scripture Excavator'
  }
});

const emit = defineEmits(['toggle-sidebar', 'open-settings']);

const { isLoading, sendMessage, streamingContent, renderMarkdown, toolCalls } = useChatEngine();
const { currentConversation } = useChat();
const { settings } = useSettings();

const userInput = ref('');
const messagesContainer = ref(null);
const inputRef = ref(null);

const messages = computed(() => currentConversation.value?.messages || []);
const currentModel = computed(() => settings.model);

async function send() {
  const content = userInput.value.trim();
  if (!content || isLoading.value) return;

  userInput.value = '';
  await sendMessage(content);
  scrollToBottom();
}

function scrollToBottom() {
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
    }
  });
}

watch(messages, scrollToBottom, { deep: true });

watch(streamingContent, (val) => {
  if (val && currentConversation.value) {
    const lastMsg = currentConversation.value.messages[currentConversation.value.messages.length - 1];
    if (lastMsg && lastMsg.role === 'assistant' && !lastMsg.content) {
      lastMsg.content = val;
    }
    scrollToBottom();
  }
});

function autoResize() {
  if (inputRef.value) {
    inputRef.value.style.height = 'auto';
    inputRef.value.style.height = Math.min(inputRef.value.scrollHeight, 150) + 'px';
  }
}

watch(userInput, autoResize);

onMounted(() => {
  scrollToBottom();
});
</script>

<style scoped>
.chat-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #1e1e1e;
  border-radius: 12px;
  overflow: hidden;
}

.chat-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background: #252526;
  border-bottom: 1px solid #333;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.header-left h2 {
  margin: 0;
  font-size: 1.2rem;
  color: #e0e0e0;
}

.model-badge {
  padding: 4px 10px;
  background: rgba(74, 109, 167, 0.2);
  color: #6b8fc7;
  border-radius: 12px;
  font-size: 0.75rem;
}

.header-actions {
  display: flex;
  gap: 8px;
}

.icon-btn {
  background: transparent;
  border: none;
  color: #888;
  padding: 8px;
  cursor: pointer;
  border-radius: 6px;
  transition: all 0.2s;
}

.icon-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #e0e0e0;
}

.messages-container {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  text-align: center;
  color: #888;
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 16px;
}

.empty-state h3 {
  margin: 0 0 8px 0;
  color: #e0e0e0;
  font-size: 1.5rem;
}

.empty-state p {
  margin: 4px 0;
  max-width: 400px;
}

.empty-state .hint {
  margin-top: 16px;
  font-size: 0.9rem;
  color: #666;
}

.message-wrapper {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.message-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  flex-shrink: 0;
}

.message-wrapper.user .message-avatar {
  background: #2d2d30;
}

.message-wrapper.assistant .message-avatar {
  background: linear-gradient(135deg, #4a6da7, #6b8fc7);
}

.message-content {
  flex: 1;
  min-width: 0;
}

.message-wrapper.user .message-content {
  order: -1;
}

.message-content :deep(p) {
  margin: 0 0 12px 0;
  line-height: 1.6;
}

.message-content :deep(p:last-child) {
  margin-bottom: 0;
}

.message-content :deep(h1), .message-content :deep(h2), .message-content :deep(h3) {
  color: #e0e0e0;
  margin: 16px 0 8px 0;
}

.message-content :deep(pre) {
  background: #2d2d30;
  padding: 12px;
  border-radius: 8px;
  overflow-x: auto;
  margin: 12px 0;
}

.message-content :deep(code) {
  font-family: 'Fira Code', monospace;
  font-size: 0.9em;
}

.tool-calls {
  background: rgba(255, 152, 0, 0.1);
  border: 1px solid rgba(255, 152, 0, 0.3);
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 12px;
}

.tool-call {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.tool-name {
  font-weight: 600;
  color: #ff9800;
}

.tool-params {
  font-family: monospace;
  font-size: 0.85rem;
  color: #aaa;
  white-space: pre-wrap;
  word-break: break-all;
}

.typing-indicator {
  display: flex;
  gap: 4px;
  padding: 4px 0;
}

.typing-indicator span {
  width: 8px;
  height: 8px;
  background: #6b8fc7;
  border-radius: 50%;
  animation: typing 1.4s infinite;
}

.typing-indicator span:nth-child(2) {
  animation-delay: 0.2s;
}

.typing-indicator span:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes typing {
  0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
  30% { transform: translateY(-8px); opacity: 1; }
}

.input-area {
  padding: 16px 20px;
  background: #252526;
  border-top: 1px solid #333;
}

.input-container {
  display: flex;
  gap: 12px;
  align-items: flex-end;
  background: #1e1e1e;
  border: 1px solid #333;
  border-radius: 12px;
  padding: 8px 12px;
}

.input-container:focus-within {
  border-color: #4a6da7;
}

.input-container textarea {
  flex: 1;
  background: transparent;
  border: none;
  color: #e0e0e0;
  font-size: 1rem;
  resize: none;
  outline: none;
  max-height: 150px;
  line-height: 1.5;
}

.input-container textarea::placeholder {
  color: #666;
}

.send-btn {
  background: linear-gradient(135deg, #4a6da7, #6b8fc7);
  border: none;
  color: white;
  padding: 10px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  flex-shrink: 0;
}

.send-btn:hover:not(:disabled) {
  transform: scale(1.05);
}

.send-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.input-hint {
  font-size: 0.75rem;
  color: #666;
  margin: 8px 0 0 0;
  text-align: center;
}
</style>
