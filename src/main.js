import { createApp, watchEffect } from 'vue'
import './assets/main.css'
import App from './App.vue'
import { registerProviders } from '@aivue/core'
import { useSettings } from './stores/settings'

const { settings } = useSettings()

function initTheme() {
  const stored = localStorage.getItem('biblex_settings')
  let theme = 'dark'
  if (stored) {
    try {
      const parsed = JSON.parse(stored)
      theme = parsed.theme || 'dark'
    } catch (e) {}
  }
  settings.theme = theme
  if (typeof document !== 'undefined') {
    document.documentElement.classList.remove('dark')
    if (theme === 'dark') {
      document.documentElement.classList.add('dark')
    }
  }
}

initTheme()

watchEffect(() => {
  if (typeof document !== 'undefined') {
    document.documentElement.classList.remove('dark')
    if (settings.theme === 'dark') {
      document.documentElement.classList.add('dark')
    }
  }
})

registerProviders({
  chutes: {
    baseURL: 'https://llm.chutes.ai/v1',
    models: {
      default: 'deepseek-ai/DeepSeek-V3.2-TEE',
      available: ['deepseek-ai/DeepSeek-V3.2-TEE', 'openai/gpt-oss-120b-TEE']
    },
    headers: (apiKey) => ({
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    }),
    chatRequest: (messages, options) => ({
      url: '/chat/completions',
      method: 'POST',
      body: {
        model: options.model,
        messages,
        stream: options.stream ?? true,
        max_tokens: options.maxTokens,
        temperature: options.temperature
      }
    }),
    chatResponse: (response) => {
      if (response.choices?.[0]?.message) {
        return {
          text: response.choices[0].message.content || '',
          message: response.choices[0].message,
          usage: response.usage,
          done: true
        };
      }
      return { text: '', usage: null, done: true };
    },
    streamResponse: (chunk) => {
      if (chunk.choices?.[0]?.delta?.content) {
        return chunk.choices[0].delta.content;
      }
      return null;
    },
    supportsStreaming: true,
    supportsTools: true
  },
  openrouter: {
    baseURL: 'https://openrouter.ai/api/v1',
    models: {
      default: 'openai/gpt-4o',
      available: ['openai/gpt-4o', 'openai/gpt-4o-mini', 'anthropic/claude-3.5-sonnet', 'google/gemini-pro']
    },
    headers: (apiKey) => ({
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': window.location.origin,
      'X-Title': 'BibleEx'
    }),
    chatRequest: (messages, options) => ({
      url: '/chat/completions',
      method: 'POST',
      body: {
        model: options.model,
        messages,
        stream: options.stream ?? true,
        max_tokens: options.maxTokens,
        temperature: options.temperature
      }
    }),
    chatResponse: (response) => {
      if (response.choices?.[0]?.message) {
        return {
          text: response.choices[0].message.content || '',
          message: response.choices[0].message,
          usage: response.usage,
          done: true
        };
      }
      return { text: '', usage: null, done: true };
    },
    streamResponse: (chunk) => {
      if (chunk.choices?.[0]?.delta?.content) {
        return chunk.choices[0].delta.content;
      }
      return null;
    },
    supportsStreaming: true,
    supportsTools: true
  }
})

createApp(App).mount('#app')
