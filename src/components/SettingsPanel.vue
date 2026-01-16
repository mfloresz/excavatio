<template>
  <Teleport to="body">
    <div v-if="show" class="modal-overlay" @click.self="close">
      <div class="modal-content">
        <div class="modal-header">
          <h2>⚙️ Configuración</h2>
          <button class="close-btn" @click="close">×</button>
        </div>

        <div class="modal-body">
          <div class="settings-sections">
            <div class="section">
              <h3>Proveedor de IA</h3>
              <div class="form-group">
                <label>Proveedor</label>
                <select v-model="localSettings.currentProvider" @change="onProviderChange">
                  <option v-for="p in providers" :key="p.id" :value="p.id">
                    {{ p.name }}
                  </option>
                </select>
              </div>

              <div class="form-group">
                <label>Modelo</label>
                <select v-model="localSettings.currentModel" @change="onModelChange">
                  <option v-for="m in availableModels" :key="m" :value="m">{{ m }}</option>
                </select>
              </div>

              <div class="form-group" v-if="!isLocalProvider">
                <label>API Key</label>
                <input
                  type="password"
                  v-model="localSettings.providers[localSettings.currentProvider].apiKey"
                  :placeholder="`API Key para ${getProviderName(localSettings.currentProvider)}`"
                />
              </div>
            </div>

            <div class="section">
              <h3>Parámetros de {{ currentModelName }}</h3>
              <div class="form-group">
                <label>Temperature: {{ localModelParams.temperature }}</label>
                <input
                  type="range"
                  v-model.number="localModelParams.temperature"
                  min="0"
                  max="2"
                  step="0.1"
                />
              </div>

              <div class="form-group">
                <label>Max Tokens: {{ localModelParams.maxTokens }}</label>
                <input
                  type="number"
                  v-model.number="localModelParams.maxTokens"
                  min="256"
                  max="200000"
                  step="256"
                  class="number-input"
                />
                <span class="input-hint">Límites: DeepSeek V3.2: 64K, GPT-OSS: 128K</span>
              </div>

              <div class="form-group checkbox">
                <label>
                  <input type="checkbox" v-model="localSettings.streaming" />
                  Streaming responses
                </label>
              </div>
            </div>

            <div class="section">
              <h3>Preset de Prompt</h3>
              <div class="form-group">
                <label>Preset activo</label>
                <select v-model="localSettings.activePreset">
                  <option v-for="preset in presets" :key="preset.id" :value="preset.id">
                    {{ preset.name }}
                  </option>
                </select>
              </div>

              <button class="edit-prompt-btn" @click="showPromptEditor = true">
                Editar Prompt Actual
              </button>
            </div>

            <div class="section">
              <h3>Biblias Activas</h3>
              <p class="section-hint">Selecciona las traducciones que quieres usar para análisis</p>
              <div class="bibles-grid">
                <label
                  v-for="bible in availableBibles"
                  :key="bible.id"
                  class="bible-checkbox"
                  :class="{ active: isBibleSelected(bible.id) }"
                >
                  <input
                    type="checkbox"
                    :checked="isBibleSelected(bible.id)"
                    @change="toggleBible(bible.id)"
                  />
                  <span>{{ bible.name }}</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button class="secondary-btn" @click="resetSettings">Restablecer</button>
          <button class="primary-btn" @click="saveSettings">Guardar</button>
        </div>
      </div>
    </div>

    <Teleport to="body">
      <div v-if="showPromptEditor" class="modal-overlay" @click.self="closePromptEditor">
        <div class="modal-content prompt-editor">
          <div class="modal-header">
            <h2>✏️ Editor de Prompt</h2>
            <button class="close-btn" @click="closePromptEditor">×</button>
          </div>
          <div class="modal-body">
            <div class="form-group">
              <label>Prompt del Sistema</label>
              <textarea
                v-model="localSettings.systemPrompt"
                rows="20"
                class="prompt-textarea"
              ></textarea>
            </div>
          </div>
          <div class="modal-footer">
            <button class="secondary-btn" @click="resetPrompt">Restablecer Prompt</button>
            <button class="primary-btn" @click="closePromptEditor">Listo</button>
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

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: #1e1e1e;
  border-radius: 12px;
  max-width: 600px;
  width: 90%;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
  color: #e0e0e0;
}

.modal-content.prompt-editor {
  max-width: 800px;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #333;
}

.modal-header h2 {
  margin: 0;
  font-size: 1.3rem;
}

.close-btn {
  background: none;
  border: none;
  color: #888;
  font-size: 1.8rem;
  cursor: pointer;
  padding: 0;
  line-height: 1;
}

.modal-body {
  flex: 1;
  overflow-y: auto;
  padding: 20px 24px;
}

.settings-sections {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.section {
  background: rgba(255, 255, 255, 0.03);
  padding: 16px;
  border-radius: 8px;
}

.section h3 {
  margin: 0 0 16px 0;
  font-size: 1rem;
  color: #6b8fc7;
}

.section-hint {
  font-size: 0.85rem;
  color: #888;
  margin: -8px 0 12px 0;
}

.form-group {
  margin-bottom: 16px;
}

.form-group:last-child {
  margin-bottom: 0;
}

.form-group label {
  display: block;
  margin-bottom: 6px;
  font-size: 0.9rem;
  color: #aaa;
}

.form-group input[type="text"],
.form-group input[type="password"],
.form-group input[type="number"],
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 10px 12px;
  background: #2d2d30;
  border: 1px solid #333;
  border-radius: 6px;
  color: #e0e0e0;
  font-size: 0.95rem;
}

.form-group input[type="number"] {
  max-width: 150px;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #4a6da7;
}

.form-group input[type="range"] {
  width: 100%;
}

.input-hint {
  display: block;
  font-size: 0.75rem;
  color: #666;
  margin-top: 4px;
}

.form-group.checkbox {
  display: flex;
  align-items: center;
}

.form-group.checkbox label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.form-group.checkbox input[type="checkbox"] {
  width: 18px;
  height: 18px;
  accent-color: #4a6da7;
}

.edit-prompt-btn {
  width: 100%;
  padding: 10px;
  background: #333;
  border: none;
  border-radius: 6px;
  color: #e0e0e0;
  cursor: pointer;
  font-size: 0.9rem;
  transition: background 0.2s;
}

.edit-prompt-btn:hover {
  background: #444;
}

.bibles-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 8px;
}

.bible-checkbox {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: #2d2d30;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
}

.bible-checkbox:hover {
  background: #3a3a3d;
}

.bible-checkbox.active {
  background: rgba(74, 109, 167, 0.2);
  border: 1px solid #4a6da7;
}

.bible-checkbox input {
  accent-color: #4a6da7;
}

.prompt-textarea {
  font-family: monospace;
  font-size: 0.85rem;
  resize: vertical;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 16px 24px;
  border-top: 1px solid #333;
}

.primary-btn,
.secondary-btn {
  padding: 10px 24px;
  border: none;
  border-radius: 8px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.primary-btn {
  background: linear-gradient(135deg, #4a6da7, #6b8fc7);
  color: white;
}

.primary-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(74, 109, 167, 0.4);
}

.secondary-btn {
  background: #333;
  color: #e0e0e0;
}

.secondary-btn:hover {
  background: #444;
}
</style>
