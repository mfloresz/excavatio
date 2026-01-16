import { registerProviders } from '@aivue/core';
import { getToolsForProvider } from './tools.js';

const CHUTES_BASE_URL = 'https://llm.chutes.ai/v1';

const chutesProvider = {
  name: 'chutes',
  baseURL: CHUTES_BASE_URL,
  models: {
    default: 'deepseek-ai/DeepSeek-V3.2-TEE',
    available: [
      'deepseek-ai/DeepSeek-V3.2-TEE',
      'openai/gpt-oss-120b-TEE'
    ]
  },
  headers: (apiKey) => ({
    'Authorization': `Bearer ${apiKey}`,
    'Content-Type': 'application/json'
  }),
  chatRequest: (messages, options) => {
    const tools = getToolsForProvider('chutes');
    return {
      url: '/chat/completions',
      method: 'POST',
      body: {
        model: options.model,
        messages: messages,
        tools: tools,
        tool_choice: 'auto',
        stream: options.stream ?? true,
        max_tokens: options.maxTokens,
        temperature: options.temperature,
        top_p: options.topP,
        frequency_penalty: options.frequencyPenalty,
        presence_penalty: options.presencePenalty
      }
    };
  },
  chatResponse: (response) => {
    if (response.choices && response.choices[0]) {
      return {
        text: response.choices[0].message?.content || '',
        message: response.choices[0].message,
        usage: response.usage,
        done: true
      };
    }
    return { text: '', usage: null, done: true };
  },
  streamResponse: (chunk) => {
    if (chunk.choices && chunk.choices[0]) {
      const delta = chunk.choices[0].delta;
      if (delta?.content) {
        return delta.content;
      }
      if (delta?.tool_calls) {
        return { type: 'tool_calls', content: delta.tool_calls };
      }
    }
    return null;
  },
  supportsStreaming: true,
  supportsTools: true
};

const openrouterProvider = {
  name: 'openrouter',
  baseURL: 'https://openrouter.ai/api/v1',
  models: {
    default: 'openai/gpt-4o',
    available: [
      'openai/gpt-4o',
      'openai/gpt-4o-mini',
      'anthropic/claude-3.5-sonnet',
      'google/gemini-pro'
    ]
  },
  headers: (apiKey) => ({
    'Authorization': `Bearer ${apiKey}`,
    'Content-Type': 'application/json',
    'HTTP-Referer': window.location.origin,
    'X-Title': 'BibleEx'
  }),
  chatRequest: (messages, options) => {
    const tools = getToolsForProvider('openrouter');
    return {
      url: '/chat/completions',
      method: 'POST',
      body: {
        model: options.model,
        messages: messages,
        tools: tools,
        tool_choice: 'auto',
        stream: options.stream ?? true,
        max_tokens: options.maxTokens,
        temperature: options.temperature,
        top_p: options.topP
      }
    };
  },
  chatResponse: (response) => {
    if (response.choices && response.choices[0]) {
      return {
        text: response.choices[0].message?.content || '',
        message: response.choices[0].message,
        usage: response.usage,
        done: true
      };
    }
    return { text: '', usage: null, done: true };
  },
  supportsStreaming: true,
  supportsTools: true
};

export function registerCustomProviders() {
  registerProviders({
    chutes: chutesProvider,
    openrouter: openrouterProvider
  });
}

export function getProviderModels(provider) {
  const models = {
    openai: ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo', 'gpt-3.5-turbo'],
    anthropic: ['claude-3-5-sonnet-20241022', 'claude-3-opus-20240229', 'claude-3-haiku-20240307'],
    google: ['gemini-1.5-pro', 'gemini-1.5-flash', 'gemini-pro'],
    huggingface: ['mistralai/Mistral-7B-Instruct-v0.2', 'meta-llama/Llama-3-70b-chat-hf'],
    ollama: ['llama3.2', 'mistral', 'codellama', 'neural-chat'],
    deepseek: ['deepseek-chat'],
    chutes: ['deepseek-ai/DeepSeek-V3.2-TEE', 'openai/gpt-oss-120b-TEE'],
    openrouter: ['openai/gpt-4o', 'openai/gpt-4o-mini', 'anthropic/claude-3.5-sonnet', 'google/gemini-pro']
  };
  return models[provider] || [];
}

export function getDefaultModel(provider) {
  const defaults = {
    openai: 'gpt-4o',
    anthropic: 'claude-3-5-sonnet-20241022',
    google: 'gemini-1.5-pro',
    huggingface: 'mistralai/Mistral-7B-Instruct-v0.2',
    ollama: 'llama3.2',
    deepseek: 'deepseek-chat',
    chutes: 'deepseek-ai/DeepSeek-V3.2-TEE',
    openrouter: 'openai/gpt-4o'
  };
  return defaults[provider] || 'gpt-4o';
}

export const ALL_PROVIDERS = [
  { id: 'openai', name: 'OpenAI', requiresApiKey: true },
  { id: 'anthropic', name: 'Anthropic', requiresApiKey: true },
  { id: 'google', name: 'Google Gemini', requiresApiKey: true },
  { id: 'chutes', name: 'Chutes', requiresApiKey: true },
  { id: 'openrouter', name: 'OpenRouter', requiresApiKey: true },
  { id: 'huggingface', name: 'HuggingFace', requiresApiKey: true },
  { id: 'ollama', name: 'Ollama (Local)', requiresApiKey: false },
  { id: 'deepseek', name: 'DeepSeek', requiresApiKey: true }
];
