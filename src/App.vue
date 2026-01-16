<template>
  <div class="app-container">
    <div class="main-content">
      <ChatWindow
        title="Scripture Excavator"
        @toggle-sidebar="showConversationList = true"
        @open-settings="showSettings = true"
      />
    </div>

    <ConversationList
      v-model="showConversationList"
      @conversation-selected="onConversationSelected"
    />

    <SettingsPanel
      v-model="showSettings"
    />

    <BibleDownloader
      v-model="showBibleDownloader"
      @complete="onBibleDownloadComplete"
    />
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

const showConversationList = ref(false);
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

<style scoped>
.app-container {
  display: flex;
  height: 100vh;
  background: #121212;
  overflow: hidden;
}

.main-content {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.main-content > * {
  width: 100%;
  max-width: 900px;
  height: 90vh;
}

@media (max-width: 768px) {
  .main-content {
    padding: 10px;
  }

  .main-content > * {
    height: 100vh;
    max-width: 100%;
  }
}
</style>
