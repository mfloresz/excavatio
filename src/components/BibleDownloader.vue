<template>
  <Teleport to="body">
    <div v-if="show" class="modal-overlay" @click.self="closeOnOverlay && !isDownloading && close()">
      <div class="modal-content">
        <div class="modal-header">
          <h2>📥 Descargar Biblias</h2>
          <button v-if="!isDownloading && downloadedCount >= totalFiles" class="close-btn" @click="close">×</button>
        </div>

        <div class="modal-body">
          <p v-if="!isDownloading && downloadedCount >= totalFiles" class="success-message">
            ✓ Todas las biblias están descargadas
          </p>

          <p v-else class="description">
            Para usar la aplicación, necesitas descargar los archivos bíblicos.
            Esto se hace solo una vez y los archivos se guardan en tu navegador.
          </p>

          <div v-if="isDownloading" class="download-progress">
            <div class="progress-header">
              <span>Descargando: {{ currentFile }}</span>
              <span>{{ Math.round(currentProgress) }}%</span>
            </div>
            <div class="progress-bar">
              <div class="progress-fill" :style="{ width: currentProgress + '%' }"></div>
            </div>
          </div>

          <div v-else class="file-list">
            <div
              v-for="file in files"
              :key="file.name"
              class="file-item"
              :class="{ completed: downloadStatus[file.name] === 'completed' }"
            >
              <span class="file-name">{{ getDisplayName(file.name) }}</span>
              <span class="file-status">
                <span v-if="downloadStatus[file.name] === 'completed'" class="status-done">✓ Descargado</span>
                <span v-else-if="downloadStatus[file.name] === 'error'" class="status-error">✗ Error</span>
                <span v-else-if="downloadStatus[file.name] === 'downloading'" class="status-downloading">⏳ Descargando...</span>
                <span v-else class="status-pending">⏳ Pendiente</span>
              </span>
            </div>
          </div>

          <div v-if="error" class="error-message">
            Error: {{ error }}
          </div>
        </div>

        <div class="modal-footer">
          <button
            v-if="!isDownloading && downloadedCount < totalFiles"
            class="download-btn primary"
            @click="startDownload"
            :disabled="isLoading"
          >
            {{ isLoading ? 'Iniciando...' : 'Descargar Biblias' }}
          </button>
          <button
            v-if="isDownloading"
            class="download-btn secondary"
            @click="cancelDownload"
            :disabled="isLoading"
          >
            Cancelar
          </button>
          <button
            v-if="!isDownloading && downloadedCount >= totalFiles"
            class="download-btn primary"
            @click="close"
          >
            Continuar
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { useBible } from '../composables/useBible';
import { BIBLE_FILES } from '../utils/bibleDb';

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  closeOnOverlay: {
    type: Boolean,
    default: true
  }
});

const emit = defineEmits(['update:modelValue', 'complete']);

const { downloadAll, isLoading, downloadStatus, downloadProgress, initialize, isInitialized } = useBible();

const show = ref(false);
const isDownloading = ref(false);
const currentFile = ref('');
const currentProgress = ref(0);
const error = ref(null);

const files = BIBLE_FILES;
const totalFiles = computed(() => files.length);

const downloadedCount = computed(() => {
  return Object.values(downloadStatus.value).filter(s => s === 'completed').length;
});

function getDisplayName(filename) {
  const name = filename.replace('Bible.xml', '').replace('Bible.xml', '');
  const displayNames = {
    'Aramaic': 'Arameo (Peshitta)',
    'GreekBYZ18': 'Griego BYZ18',
    'GreekTCGNT': 'Griego TCGNT',
    'GreekSBLGNT': 'Griego SBLGNT',
    'HebrewAleppoCodex': 'Hebreo Códice de Alepo',
    'HebrewLeningradCodex': 'Hebreo Códice de Leningrado',
    'SpanishNBLABible': 'Español NBLA',
    'SpanishRVR1960': 'Español RVR1960',
    'SpanishTLABible': 'Español TLA'
  };
  return displayNames[name] || filename;
}

async function startDownload() {
  error.value = null;
  isDownloading.value = true;

  try {
    await downloadAll((filename, progress) => {
      currentFile.value = getDisplayName(filename);
      currentProgress.value = progress;
    });

    emit('complete');
    close();
  } catch (err) {
    error.value = err.message;
    isDownloading.value = false;
  }
}

function cancelDownload() {
  isDownloading.value = false;
  error.value = null;
}

function close() {
  show.value = false;
  emit('update:modelValue', false);
}

watch(() => props.modelValue, (val) => {
  show.value = val;
  if (val && !isInitialized.value) {
    initialize();
  }
});

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
  padding: 24px;
  max-width: 500px;
  width: 90%;
  color: #e0e0e0;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid #333;
}

.modal-header h2 {
  margin: 0;
  font-size: 1.4rem;
  color: #fff;
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

.close-btn:hover {
  color: #fff;
}

.modal-body {
  margin-bottom: 20px;
}

.description {
  color: #aaa;
  margin-bottom: 16px;
  line-height: 1.5;
}

.success-message {
  color: #4caf50;
  font-size: 1.1rem;
  padding: 16px;
  background: rgba(76, 175, 80, 0.1);
  border-radius: 8px;
  text-align: center;
}

.download-progress {
  padding: 16px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
}

.progress-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  font-size: 0.9rem;
}

.progress-bar {
  height: 8px;
  background: #333;
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #4a6da7, #6b8fc7);
  transition: width 0.3s ease;
}

.file-list {
  max-height: 300px;
  overflow-y: auto;
}

.file-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 6px;
  margin-bottom: 8px;
}

.file-item.completed {
  background: rgba(76, 175, 80, 0.1);
}

.file-name {
  font-weight: 500;
}

.file-status {
  font-size: 0.85rem;
}

.status-done {
  color: #4caf50;
}

.status-error {
  color: #f44336;
}

.status-downloading {
  color: #ff9800;
}

.status-pending {
  color: #888;
}

.error-message {
  color: #f44336;
  padding: 12px;
  background: rgba(244, 67, 54, 0.1);
  border-radius: 6px;
  margin-top: 12px;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding-top: 16px;
  border-top: 1px solid #333;
}

.download-btn {
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.download-btn.primary {
  background: linear-gradient(135deg, #4a6da7, #6b8fc7);
  color: white;
}

.download-btn.primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(74, 109, 167, 0.4);
}

.download-btn.secondary {
  background: #333;
  color: #e0e0e0;
}

.download-btn.secondary:hover:not(:disabled) {
  background: #444;
}

.download-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
