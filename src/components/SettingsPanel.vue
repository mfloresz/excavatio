<template>
    <Teleport to="body">
        <div v-if="show" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" @click.self="close">
            <div class="bg-background text-foreground rounded-xl max-w-xl w-full max-h-[80vh] flex flex-col border border-border shadow-xl animate-in fade-in zoom-in-95">
                <div class="flex items-center justify-between p-5 border-b border-border">
                    <h2 class="text-xl font-semibold">⚙️ Configuración</h2>
                    <button class="text-muted-foreground hover:text-foreground text-3xl leading-none cursor-pointer p-1" @click="close">×</button>
                </div>

                <div class="flex-1 overflow-y-auto p-5">
                    <div class="flex flex-col gap-6">
                        <div class="bg-secondary/30 p-4 rounded-lg">
                            <h3 class="text-base font-medium text-primary mb-4">Proveedor de IA</h3>

                            <div class="mb-4">
                                <label class="block text-sm text-muted-foreground mb-1.5">Proveedor</label>
                                <select v-model="localSettings.currentProvider" @change="onProviderChange" class="w-full px-3 py-2.5 bg-background border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                                    <option v-for="p in providers" :key="p.id" :value="p.id">{{ p.name }}</option>
                                </select>
                            </div>

                            <div class="mb-4">
                                <label class="block text-sm text-muted-foreground mb-1.5">Modelo</label>
                                <select v-model="localSettings.currentModel" @change="onModelChange" class="w-full px-3 py-2.5 bg-background border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                                    <option v-for="m in availableModels" :key="m" :value="m">{{ m }}</option>
                                </select>
                            </div>

                            <div v-if="!isLocalProvider">
                                <label class="block text-sm text-muted-foreground mb-1.5">API Key</label>
                                <input
                                    type="password"
                                    v-model="localSettings.providers[localSettings.currentProvider].apiKey"
                                    :placeholder="`API Key para ${getProviderName(localSettings.currentProvider)}`"
                                    class="w-full px-3 py-2.5 bg-background border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                                />
                            </div>
                        </div>

                        <div class="bg-secondary/30 p-4 rounded-lg">
                            <h3 class="text-base font-medium text-primary mb-4">Parámetros de {{ currentModelName }}</h3>

                            <div class="mb-4">
                                <label class="block text-sm text-muted-foreground mb-1.5">Temperature: {{ localModelParams.temperature }}</label>
                                <input
                                    type="range"
                                    v-model.number="localModelParams.temperature"
                                    min="0"
                                    max="2"
                                    step="0.1"
                                    class="w-full accent-primary"
                                />
                            </div>

                            <div class="mb-4">
                                <label class="block text-sm text-muted-foreground mb-1.5">Max Tokens: {{ localModelParams.maxTokens }}</label>
                                <input
                                    type="number"
                                    v-model.number="localModelParams.maxTokens"
                                    min="256"
                                    max="200000"
                                    step="256"
                                    class="w-full px-3 py-2.5 bg-background border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring max-w-[150px]"
                                />
                            </div>

                            <div class="flex items-center">
                                <label class="flex items-center gap-2 cursor-pointer">
                                    <input type="checkbox" v-model="localSettings.streaming" class="w-4.5 h-4.5 accent-primary rounded" />
                                    <span class="text-sm">Streaming responses</span>
                                </label>
                            </div>
                        </div>

                        <div class="bg-secondary/30 p-4 rounded-lg">
                            <h3 class="text-base font-medium text-primary mb-4">Preset de Prompt</h3>

                            <div class="mb-3">
                                <label class="block text-sm text-muted-foreground mb-1.5">Preset activo</label>
                                <select v-model="localSettings.activePreset" class="w-full px-3 py-2.5 bg-background border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                                    <option v-for="preset in presets" :key="preset.id" :value="preset.id">{{ preset.name }}</option>
                                </select>
                            </div>

                            <button class="w-full py-2.5 bg-secondary text-secondary-foreground border-none rounded-lg text-sm cursor-pointer transition-colors hover:bg-secondary/80" @click="showPromptEditor = true">
                                Editar Prompt Actual
                            </button>
                        </div>

                        <div class="bg-secondary/30 p-4 rounded-lg">
                            <h3 class="text-base font-medium text-primary mb-2">Biblias Activas</h3>
                            <p class="text-xs text-muted-foreground mb-3">Selecciona las traducciones que quieres usar para análisis</p>
                            <div class="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                <label
                                    v-for="bible in availableBibles"
                                    :key="bible.id"
                                    class="flex items-center gap-2 px-3 py-2 bg-background rounded-lg cursor-pointer transition-colors border border-border"
                                    :class="[
                                        isBibleSelected(bible.id)
                                            ? 'bg-primary/10 border-primary'
                                            : 'hover:bg-accent'
                                    ]"
                                >
                                    <input
                                        type="checkbox"
                                        :checked="isBibleSelected(bible.id)"
                                        @change="toggleBible(bible.id)"
                                        class="accent-primary w-4 h-4 rounded"
                                    />
                                    <span class="text-sm">{{ bible.name }}</span>
                                </label>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="flex justify-end gap-3 p-5 border-t border-border">
                    <button class="px-6 py-2.5 bg-secondary text-secondary-foreground border-none rounded-lg text-sm font-medium cursor-pointer transition-colors hover:bg-secondary/80" @click="resetSettings">Restablecer</button>
                    <button class="px-6 py-2.5 bg-primary text-primary-foreground border-none rounded-lg text-sm font-medium cursor-pointer transition-all hover:shadow-lg hover:-translate-y-0.5" @click="saveSettings">Guardar</button>
                </div>
            </div>
        </div>

        <Teleport to="body">
            <div v-if="showPromptEditor" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" @click.self="closePromptEditor">
                <div class="bg-background text-foreground rounded-xl max-w-2xl w-full flex flex-col border border-border shadow-xl animate-in fade-in zoom-in-95">
                    <div class="flex items-center justify-between p-5 border-b border-border">
                        <h2 class="text-xl font-semibold">✏️ Editor de Prompt</h2>
                        <button class="text-muted-foreground hover:text-foreground text-3xl leading-none cursor-pointer p-1" @click="closePromptEditor">×</button>
                    </div>
                    <div class="flex-1 overflow-y-auto p-5">
                        <div>
                            <label class="block text-sm text-muted-foreground mb-1.5">Prompt del Sistema</label>
                            <textarea
                                v-model="localSettings.systemPrompt"
                                rows="20"
                                class="w-full px-3 py-2.5 bg-background border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring font-mono resize-y"
                            ></textarea>
                        </div>
                    </div>
                    <div class="flex justify-end gap-3 p-5 border-t border-border">
                        <button class="px-6 py-2.5 bg-secondary text-secondary-foreground border-none rounded-lg text-sm font-medium cursor-pointer transition-colors hover:bg-secondary/80" @click="resetPrompt">Restablecer Prompt</button>
                        <button class="px-6 py-2.5 bg-primary text-primary-foreground border-none rounded-lg text-sm font-medium cursor-pointer transition-all hover:shadow-lg hover:-translate-y-0.5" @click="closePromptEditor">Listo</button>
                    </div>
                </div>
            </div>
        </Teleport>
    </Teleport>
</template>

<script setup>
import { ref, computed, watch, reactive } from 'vue';
import { useSettings } from '../stores/settings';
import { ALL_PROVIDERS } from '../utils/providers';
import { getAllPresets, DEFAULT_PROMPT } from '../utils/prompts';

const props = defineProps({
    modelValue: {
        type: Boolean,
        default: false
    }
});

const emit = defineEmits(['update:modelValue']);

const {
    settings,
    setProvider,
    setModel,
    setApiKey,
    setModelParams,
    setPreset,
    setSystemPrompt,
    toggleBible,
    isBibleSelected,
    resetSettings: globalReset
} = useSettings();

const show = ref(false);
const showPromptEditor = ref(false);
const localSettings = reactive(JSON.parse(JSON.stringify(settings)));
const localModelParams = reactive({ temperature: 0.7, maxTokens: 4096 });

const providers = ALL_PROVIDERS;
const presets = getAllPresets();
const availableBibles = [
    { id: 'AramaicBible', name: 'Arameo (Peshitta)' },
    { id: 'GreekBYZ18Bible', name: 'Griego BYZ18' },
    { id: 'GreekTCGNTBible', name: 'Griego TCGNT' },
    { id: 'GreekSBLGNTBible', name: 'Griego SBLGNT' },
    { id: 'HebrewAleppoCodexBible', name: 'Hebreo Alepo' },
    { id: 'HebrewLeningradCodexBible', name: 'Hebreo Leningrado' },
    { id: 'SpanishNBLABible', name: 'Español NBLA' },
    { id: 'SpanishRVR1960Bible', name: 'Español RVR1960' },
    { id: 'SpanishTLABible', name: 'Español TLA' }
];

const availableModels = computed(() => {
    return Object.keys(localSettings.providers[localSettings.currentProvider]?.models || {});
});

const currentModelName = computed(() => {
    return localSettings.currentModel || 'Modelo';
});

const isLocalProvider = computed(() => {
    return localSettings.currentProvider === 'ollama';
});

function getProviderName(id) {
    const p = providers.find(p => p.id === id);
    return p ? p.name : id;
}

function onProviderChange() {
    const providerModels = Object.keys(localSettings.providers[localSettings.currentProvider]?.models || {});
    if (providerModels.length > 0) {
        localSettings.currentModel = providerModels[0];
        updateLocalModelParams();
    }
}

function onModelChange() {
    updateLocalModelParams();
}

function updateLocalModelParams() {
    const model = localSettings.currentModel;
    const params = localSettings.providers[localSettings.currentProvider]?.models[model];
    if (params) {
        localModelParams.temperature = params.temperature || 0.7;
        localModelParams.maxTokens = params.maxTokens || 4096;
    }
}

function saveSettings() {
    setProvider(localSettings.currentProvider);
    setModel(localSettings.currentModel);
    setApiKey(localSettings.currentProvider, localSettings.providers[localSettings.currentProvider].apiKey);
    setModelParams(localSettings.currentModel, localModelParams);
    setPreset(localSettings.activePreset);
    if (localSettings.systemPrompt) {
        setSystemPrompt(localSettings.systemPrompt);
    }
    updateSettings({
        streaming: localSettings.streaming
    });
    close();
}

function resetSettings() {
    Object.assign(localSettings, JSON.parse(JSON.stringify(settings)));
    updateLocalModelParams();
}

function resetPrompt() {
    localSettings.systemPrompt = null;
}

function close() {
    show.value = false;
    emit('update:modelValue', false);
}

function closePromptEditor() {
    showPromptEditor.value = false;
}

function updateSettings(updates) {
    if (updates.streaming !== undefined) settings.streaming = updates.streaming;
}

watch(() => props.modelValue, (val) => {
    show.value = val;
    if (val) {
        Object.assign(localSettings, JSON.parse(JSON.stringify(settings)));
        updateLocalModelParams();
        if (!localSettings.systemPrompt) {
            const preset = presets.find(p => p.id === localSettings.activePreset);
            localSettings.systemPrompt = preset?.prompt || null;
        }
    }
});

watch(() => localSettings.currentModel, () => {
    updateLocalModelParams();
});

watch(localModelParams, (newParams) => {
    if (localSettings.providers[localSettings.currentProvider]?.models[localSettings.currentModel]) {
        Object.assign(localSettings.providers[localSettings.currentProvider].models[localSettings.currentModel], newParams);
    }
}, { deep: true });

watch(show, (val) => {
    emit('update:modelValue', val);
});
</script>
