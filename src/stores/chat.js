import { reactive, ref, computed } from 'vue';

const CHAT_STORAGE_KEY = 'biblex_chats';

let conversations = reactive({});
let currentConversationId = ref(null);

function loadConversations() {
  try {
    const stored = localStorage.getItem(CHAT_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      Object.assign(conversations, parsed);
    }
  } catch (e) {
    console.error('Failed to load conversations:', e);
  }
}

function saveConversations() {
  try {
    localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(conversations));
  } catch (e) {
    console.error('Failed to save conversations:', e);
  }
}

loadConversations();

export function useChat() {
  const currentConversation = computed(() => {
    if (!currentConversationId.value) return null;
    return conversations[currentConversationId.value] || null;
  });

  const conversationList = computed(() => {
    return Object.values(conversations).sort((a, b) => b.updatedAt - a.updatedAt);
  });

  function createConversation(title = 'Nueva conversación') {
    const id = 'conv_' + Date.now();
    conversations[id] = {
      id,
      title,
      messages: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
      settings: null
    };
    currentConversationId.value = id;
    saveConversations();
    return id;
  }

  function selectConversation(id) {
    currentConversationId.value = id;
  }

  function deleteConversation(id) {
    delete conversations[id];
    if (currentConversationId.value === id) {
      currentConversationId.value = null;
    }
    saveConversations();
  }

  function renameConversation(id, title) {
    if (conversations[id]) {
      conversations[id].title = title;
      saveConversations();
    }
  }

  function addMessage(role, content, toolCalls = null) {
    if (!currentConversationId.value) {
      createConversation();
    }

    const conv = conversations[currentConversationId.value];
    if (!conv) return;

    const message = {
      id: 'msg_' + Date.now(),
      role,
      content,
      toolCalls: toolCalls || null,
      timestamp: Date.now()
    };

    conv.messages.push(message);
    conv.updatedAt = Date.now();

    if (role === 'user' && conv.messages.length <= 2) {
      const preview = content.substring(0, 50);
      conv.title = preview + (content.length > 50 ? '...' : '');
    }

    saveConversations();
    return message;
  }

  function updateMessage(messageId, updates) {
    if (!currentConversationId.value) return;

    const conv = conversations[currentConversationId.value];
    if (!conv) return;

    const message = conv.messages.find(m => m.id === messageId);
    if (message) {
      Object.assign(message, updates);
      saveConversations();
    }
  }

  function clearCurrentConversation() {
    if (!currentConversationId.value) return;

    const conv = conversations[currentConversationId.value];
    if (conv) {
      conv.messages = [];
      conv.updatedAt = Date.now();
      saveConversations();
    }
  }

  function getMessages() {
    if (!currentConversationId.value) return [];
    const conv = conversations[currentConversationId.value];
    return conv ? conv.messages : [];
  }

  function searchConversations(query) {
    const q = query.toLowerCase();
    return Object.values(conversations).filter(conv =>
      conv.title.toLowerCase().includes(q) ||
      conv.messages.some(m => m.content.toLowerCase().includes(q))
    );
  }

  function exportConversation(id) {
    const conv = conversations[id];
    if (!conv) return null;

    return {
      title: conv.title,
      createdAt: new Date(conv.createdAt).toISOString(),
      messages: conv.messages
    };
  }

  function importConversation(data) {
    const id = 'conv_' + Date.now();
    conversations[id] = {
      id,
      title: data.title || 'Conversación importada',
      messages: data.messages || [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
      settings: null
    };
    saveConversations();
    return id;
  }

  return {
    conversations,
    currentConversationId,
    currentConversation,
    conversationList,
    createConversation,
    selectConversation,
    deleteConversation,
    renameConversation,
    addMessage,
    updateMessage,
    clearCurrentConversation,
    getMessages,
    searchConversations,
    exportConversation,
    importConversation
  };
}
