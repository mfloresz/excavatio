<template>
    <div class="flex flex-col h-full bg-card text-card-foreground rounded-2xl border border-border overflow-hidden shadow-lg">
        <div class="flex items-center justify-between p-4 bg-secondary/50 border-b border-border">
            <div class="flex items-center gap-3">
                <h2 class="text-lg font-semibold">{{ title }}</h2>
                <span v-if="currentModel" class="px-2.5 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium">{{ currentModel }}</span>
            </div>
            <div class="flex items-center gap-2">
                <ThemeToggle />
                <button class="p-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-all cursor-pointer" @click="$emit('open-settings')" title="Configuración">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="12" cy="12" r="3"/>
                        <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z"/>
                    </svg>
                </button>
            </div>
        </div>

        <div class="flex-1 overflow-y-auto p-5" ref="messagesContainer">
            <div v-if="messages.length === 0" class="flex flex-col items-center justify-center h-full text-center">
                <div class="text-5xl mb-4">📖</div>
                <h3 class="text-2xl font-semibold text-foreground mb-2">Scripture Excavator</h3>
                <p class="text-muted-foreground max-w-md">Explora las Escrituras con análisis profundo de los idiomas originales.</p>
                <p class="text-sm text-muted-foreground mt-4">Ejemplo: "Analiza Juan 1:1 en los idiomas originales"</p>
            </div>

            <div v-for="msg in messages" :key="msg.id" class="flex gap-3 mb-5 animate-in fade-in slide-in-from-bottom-2" :class="msg.role">
                <div class="w-9 h-9 rounded-full flex items-center justify-center text-xl flex-shrink-0" :class="msg.role === 'user' ? 'bg-secondary' : 'bg-primary'">
                    <span v-if="msg.role === 'user'">👤</span>
                    <span v-else class="text-primary-foreground">🤖</span>
                </div>
                <div class="flex-1 min-w-0">
                    <div v-if="msg.toolCalls && msg.toolCalls.length > 0" class="mb-3 p-3 bg-accent border border-border rounded-lg">
                        <div v-for="(tool, idx) in msg.toolCalls" :key="idx" class="mb-2 last:mb-0">
                            <span class="font-semibold text-primary">{{ tool.name || 'tool' }}</span>
                            <pre class="text-xs mt-1 text-muted-foreground font-mono whitespace-pre-wrap break-all">{{ JSON.stringify(tool.parameters || tool.arguments || {}) }}</pre>
                        </div>
                    </div>
                    <div v-if="msg.content" class="prose prose-sm dark:prose-invert max-w-none" v-html="renderMarkdown(msg.content)"></div>
                </div>
            </div>

            <div v-if="isLoading && toolCalls.length > 0" class="flex gap-3 mb-5">
                <div class="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-xl flex-shrink-0">
                    <span class="text-primary-foreground">🤖</span>
                </div>
                <div class="flex-1 min-w-0">
                    <div class="p-3 bg-accent border border-border rounded-lg">
                        <div v-for="(tool, idx) in toolCalls" :key="idx" class="mb-2 last:mb-0">
                            <span class="font-semibold text-primary">🔧 {{ tool.function?.name || 'tool' }}</span>
                            <pre class="text-xs mt-1 text-muted-foreground font-mono whitespace-pre-wrap break-all">{{ tool.function?.arguments || '{}' }}</pre>
                        </div>
                    </div>
                </div>
            </div>

            <div v-if="isLoading" class="flex gap-3 mb-5">
                <div class="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-xl flex-shrink-0">
                    <span class="text-primary-foreground">🤖</span>
                </div>
                <div class="flex-1 min-w-0">
                    <div class="flex gap-1 py-1">
                        <span class="w-2 h-2 bg-primary rounded-full animate-bounce"></span>
                        <span class="w-2 h-2 bg-primary rounded-full animate-bounce" style="animation-delay: 0.1s"></span>
                        <span class="w-2 h-2 bg-primary rounded-full animate-bounce" style="animation-delay: 0.2s"></span>
                    </div>
                </div>
            </div>
        </div>

        <div class="p-4 bg-secondary/30 border-t border-border">
            <div class="flex gap-3 items-end bg-card border border-input rounded-xl p-2 focus-within:ring-2 focus-within:ring-ring transition-all">
                <textarea
                    v-model="userInput"
                    @keydown.enter.exact.prevent="send"
                    @keydown.meta.enter="send"
                    :disabled="isLoading"
                    placeholder="Escribe un pasaje bíblico para analizar..."
                    rows="1"
                    ref="inputRef"
                    class="flex-1 bg-transparent border-none text-foreground text-base resize-none outline-none max-h-[150px] leading-6"
                ></textarea>
                <button
                    class="p-2.5 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex-shrink-0"
                    @click="send"
                    :disabled="isLoading || !userInput.trim()"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="22" y1="2" x2="11" y2="13"/>
                        <polygon points="22 2 15 22 11 13 2 9 22 2"/>
                    </svg>
                </button>
            </div>
            <p class="text-xs text-muted-foreground mt-2 text-center">Presiona Enter para enviar, Shift+Enter para nueva línea</p>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, watch, nextTick, onMounted } from 'vue';
import { useChatEngine } from '../composables/useChat';
import { useChat } from '../stores/chat';
import { useSettings } from '../stores/settings';
import ThemeToggle from './ThemeToggle.vue';

const props = defineProps({
    title: {
        type: String,
        default: 'Scripture Excavator'
    },
    theme: {
        type: String,
        default: 'dark',
        validator: (value) => ['light', 'dark'].includes(value)
    }
});

const emit = defineEmits(['open-settings']);

const { isLoading, sendMessage, streamingContent, renderMarkdown, toolCalls } = useChatEngine();
const { currentConversation } = useChat();
const { settings } = useSettings();

const theme = computed(() => settings.theme);

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
        const messages = currentConversation.value.messages;
        const lastMsg = messages[messages.length - 1];
        if (lastMsg && lastMsg.role === 'assistant') {
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
