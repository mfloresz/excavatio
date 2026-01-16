import { reactive, watch } from 'vue';

const STORAGE_KEY = 'biblex_settings';

const defaultSettings = {
  currentProvider: 'chutes',
  currentModel: 'deepseek-ai/DeepSeek-V3.2-TEE',
  streaming: true,
  activePreset: 'scripture_excavator',
  systemPrompt: null,
  selectedBibles: ['SpanishNBLABible', 'SpanishRVR1960Bible', 'SpanishTLABible'],
  providers: {
    chutes: {
      apiKey: '',
      models: {
        'deepseek-ai/DeepSeek-V3.2-TEE': { temperature: 0.7, maxTokens: 64000 },
        'openai/gpt-oss-120b-TEE': { temperature: 0.7, maxTokens: 128000 }
      }
    },
    openai: {
      apiKey: '',
      models: {
        'gpt-4o': { temperature: 0.7, maxTokens: 4096 },
        'gpt-4o-mini': { temperature: 0.7, maxTokens: 4096 },
        'gpt-4-turbo': { temperature: 0.7, maxTokens: 8192 },
        'gpt-3.5-turbo': { temperature: 0.7, maxTokens: 4096 }
      }
    },
    anthropic: {
      apiKey: '',
      models: {
        'claude-3-5-sonnet-20241022': { temperature: 0.7, maxTokens: 8192 },
        'claude-3-opus-20240229': { temperature: 0.7, maxTokens: 8192 },
        'claude-3-haiku-20240307': { temperature: 0.7, maxTokens: 4096 }
      }
    },
    google: {
      apiKey: '',
      models: {
        'gemini-1.5-pro': { temperature: 0.7, maxTokens: 8192 },
        'gemini-1.5-flash': { temperature: 0.7, maxTokens: 8192 },
        'gemini-pro': { temperature: 0.7, maxTokens: 4096 }
      }
    },
    deepseek: {
      apiKey: '',
      models: {
        'deepseek-chat': { temperature: 0.7, maxTokens: 4096 }
      }
    },
    openrouter: {
      apiKey: '',
      models: {
        'openai/gpt-4o': { temperature: 0.7, maxTokens: 4096 },
        'openai/gpt-4o-mini': { temperature: 0.7, maxTokens: 4096 },
        'anthropic/claude-3.5-sonnet': { temperature: 0.7, maxTokens: 8192 },
        'google/gemini-pro': { temperature: 0.7, maxTokens: 4096 }
      }
    },
    huggingface: {
      apiKey: '',
      models: {
        'mistralai/Mistral-7B-Instruct-v0.2': { temperature: 0.7, maxTokens: 4096 },
        'meta-llama/Llama-3-70b-chat-hf': { temperature: 0.7, maxTokens: 4096 }
      }
    },
    ollama: {
      apiKey: '',
      baseUrl: 'http://localhost:11434',
      models: {
        'llama3.2': { temperature: 0.7, maxTokens: 4096 },
        'mistral': { temperature: 0.7, maxTokens: 4096 },
        'codellama': { temperature: 0.7, maxTokens: 4096 }
      }
    }
  }
};

let settings = reactive(JSON.parse(JSON.stringify(defaultSettings)));

function loadSettings() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      settings.currentProvider = parsed.currentProvider || defaultSettings.currentProvider;
      settings.currentModel = parsed.currentModel || defaultSettings.currentModel;
      settings.streaming = parsed.streaming ?? defaultSettings.streaming;
      settings.activePreset = parsed.activePreset || defaultSettings.activePreset;
      settings.systemPrompt = parsed.systemPrompt;
      settings.selectedBibles = parsed.selectedBibles || defaultSettings.selectedBibles;

      if (parsed.providers) {
        for (const provider in parsed.providers) {
          if (settings.providers[provider]) {
            settings.providers[provider].apiKey = parsed.providers[provider].apiKey || '';
            if (parsed.providers[provider].models) {
              for (const model in parsed.providers[provider].models) {
                if (settings.providers[provider].models[model]) {
                  Object.assign(settings.providers[provider].models[model], parsed.providers[provider].models[model]);
                }
              }
            }
          } else {
            settings.providers[provider] = parsed.providers[provider];
          }
        }
      }
    }
  } catch (e) {
    console.error('Failed to load settings:', e);
  }
}

function saveSettings() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch (e) {
    console.error('Failed to save settings:', e);
  }
}

watch(settings, saveSettings, { deep: true });

loadSettings();

export function useSettings() {
  function getApiKey(provider = settings.currentProvider) {
    return settings.providers[provider]?.apiKey || '';
  }

  function setApiKey(provider, key) {
    if (settings.providers[provider]) {
      settings.providers[provider].apiKey = key;
    }
  }

  function getModelParams(model = settings.currentModel) {
    const provider = settings.currentProvider;
    return settings.providers[provider]?.models[model] || { temperature: 0.7, maxTokens: 4096 };
  }

  function setModelParams(model, params) {
    const provider = settings.currentProvider;
    if (settings.providers[provider]?.models[model]) {
      Object.assign(settings.providers[provider].models[model], params);
    }
  }

  function getCurrentApiKey() {
    return getApiKey();
  }

  function getCurrentParams() {
    return getModelParams();
  }

  function getCurrentProvider() {
    return settings.currentProvider;
  }

  function getCurrentModel() {
    return settings.currentModel;
  }

  function setProvider(provider) {
    settings.currentProvider = provider;
    const providerModels = Object.keys(settings.providers[provider]?.models || {});
    if (providerModels.length > 0) {
      settings.currentModel = providerModels[0];
    }
  }

  function setModel(model) {
    settings.currentModel = model;
  }

  function setPreset(presetId) {
    settings.activePreset = presetId;
  }

  function setSystemPrompt(prompt) {
    settings.systemPrompt = prompt;
  }

  function toggleBible(translation) {
    const index = settings.selectedBibles.indexOf(translation);
    if (index > -1) {
      settings.selectedBibles.splice(index, 1);
    } else {
      settings.selectedBibles.push(translation);
    }
  }

  function isBibleSelected(translation) {
    return settings.selectedBibles.includes(translation);
  }

  function updateSettings(updates) {
    if (updates.streaming !== undefined) settings.streaming = updates.streaming;
    if (updates.activePreset) settings.activePreset = updates.activePreset;
    if (updates.systemPrompt !== undefined) settings.systemPrompt = updates.systemPrompt;
  }

  function resetSettings() {
    Object.assign(settings, JSON.parse(JSON.stringify(defaultSettings)));
  }

  return {
    settings,
    getApiKey,
    setApiKey,
    getModelParams,
    setModelParams,
    getCurrentApiKey,
    getCurrentParams,
    getCurrentProvider,
    getCurrentModel,
    setProvider,
    setModel,
    setPreset,
    setSystemPrompt,
    toggleBible,
    isBibleSelected,
    updateSettings,
    resetSettings
  };
}
