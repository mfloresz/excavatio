<template>
    <Teleport to="body">
        <div v-if="show" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" @click.self="closeOnOverlay && !isDownloading && close()">
            <div class="bg-background text-foreground rounded-xl p-6 max-w-lg w-full border border-border shadow-xl animate-in fade-in zoom-in-95">
                <div class="flex items-center justify-between mb-5 pb-4 border-b border-border">
                    <h2 class="text-xl font-semibold">📥 Descargar Biblias</h2>
                    <button v-if="!isDownloading && downloadedCount >= totalFiles" class="text-muted-foreground hover:text-foreground text-3xl leading-none cursor-pointer p-1" @click="close">×</button>
                </div>

                <div class="mb-5">
                    <p v-if="!isDownloading && downloadedCount >= totalFiles" class="text-green-500 text-lg p-4 bg-green-50 dark:bg-green-900/20 rounded-lg text-center">
                        ✓ Todas las biblias están descargadas
                    </p>

                    <p v-else class="text-muted-foreground mb-4 leading-relaxed">
                        Para usar la aplicación, necesitas descargar los archivos bíblicos.
                        Esto se hace solo una vez y los archivos se guardan en tu navegador.
                    </p>

                    <div v-if="isDownloading" class="p-4 bg-secondary/50 rounded-lg">
                        <div class="flex justify-between mb-2 text-sm">
                            <span class="text-foreground">Descargando: {{ currentFile }}</span>
                            <span class="text-muted-foreground">{{ Math.round(currentProgress) }}%</span>
                        </div>
                        <div class="h-2 bg-secondary rounded-full overflow-hidden">
                            <div class="h-full bg-primary transition-all duration-300" :style="{ width: currentProgress + '%' }"></div>
                        </div>
                    </div>

                    <div v-else class="max-h-72 overflow-y-auto space-y-2">
                        <div
                            v-for="file in files"
                            :key="file.name"
                            class="flex justify-between items-center p-3 bg-secondary/50 rounded-lg"
                            :class="{ 'bg-green-50 dark:bg-green-900/20': downloadStatus[file.name] === 'completed' }"
                        >
                            <span class="font-medium">{{ getDisplayName(file.name) }}</span>
                            <span class="text-sm">
                                <span v-if="downloadStatus[file.name] === 'completed'" class="text-green-500">✓</span>
                                <span v-else-if="downloadStatus[file.name] === 'error'" class="text-destructive">✗</span>
                                <span v-else-if="downloadStatus[file.name] === 'downloading'" class="text-amber-500">⏳</span>
                                <span v-else class="text-muted-foreground">⏳</span>
                            </span>
                        </div>
                    </div>

                    <div v-if="error" class="text-destructive p-3 bg-destructive/10 rounded-lg mt-3 text-sm">
                        Error: {{ error }}
                    </div>
                </div>

                <div class="flex justify-end gap-3 pt-4 border-t border-border">
                    <button
                        v-if="!isDownloading && downloadedCount < totalFiles"
                        class="px-6 py-3 bg-primary text-primary-foreground border-none rounded-lg text-base font-medium cursor-pointer transition-all hover:shadow-md hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:transform-none"
                        @click="startDownload"
                        :disabled="isLoading"
                    >
                        {{ isLoading ? 'Iniciando...' : 'Descargar Biblias' }}
                    </button>
                    <button
                        v-if="isDownloading"
                        class="px-6 py-3 bg-secondary text-secondary-foreground border-none rounded-lg text-base font-medium cursor-pointer transition-colors hover:bg-secondary/80"
                        @click="cancelDownload"
                        :disabled="isLoading"
                    >
                        Cancelar
                    </button>
                    <button
                        v-if="!isDownloading && downloadedCount >= totalFiles"
                        class="px-6 py-3 bg-primary text-primary-foreground border-none rounded-lg text-base font-medium cursor-pointer transition-all hover:shadow-md hover:-translate-y-0.5"
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
