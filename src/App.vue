<template>
    <div class="min-h-screen bg-background text-foreground">
        <div class="flex h-screen">
            <ConversationList
                class="w-80 h-full flex-shrink-0 border-r border-border"
                @conversation-selected="onConversationSelected"
            />

            <div class="flex-1 flex items-center justify-center p-5">
                <ChatWindow
                    class="w-full h-[90vh]"
                    title="Scripture Excavator"
                    @open-settings="showSettings = true"
                />
            </div>

            <SettingsPanel
                v-model="showSettings"
            />

            <BibleDownloader
                v-model="showBibleDownloader"
                @complete="onBibleDownloadComplete"
            />
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import ChatWindow from './components/ChatWindow.vue';
import ConversationList from './components/ConversationList.vue';
import SettingsPanel from './components/SettingsPanel.vue';
import BibleDownloader from './components/BibleDownloader.vue';
import { useBible } from './composables/useBible';
import { useChat } from './stores/chat';
import { useSettings } from './stores/settings';
import { isAllDownloaded } from './utils/bibleDb';

const { initialize, isInitialized } = useBible();
const { createConversation } = useChat();
const { settings } = useSettings();

const showSettings = ref(false);
const showBibleDownloader = ref(false);

async function checkBibles() {
    if (!isInitialized.value) {
        await initialize();
    }

    const downloaded = await isAllDownloaded();
    if (!downloaded) {
        showBibleDownloader.value = true;
    }
}

function onConversationSelected() {
}

function onBibleDownloadComplete() {
    console.log('Bibles downloaded successfully');
}

onMounted(async () => {
    await checkBibles();

    if (settings.apiKey && !settings.apiKey.startsWith('placeholder')) {
        createConversation();
    }
});
</script>
