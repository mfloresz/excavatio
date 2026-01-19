<script setup lang="ts">
import { ref } from 'vue'

const activeTab = ref('api-keys')

const tabs = [
  { id: 'api-keys', label: 'API Keys' },
  { id: 'system-prompts', label: 'Modos' },
  { id: 'sync', label: 'Sincronización' },
  { id: 'about', label: 'Acerca de' },
]

function setActiveTab(tabId: string) {
  activeTab.value = tabId
}
</script>

<template>
  <div class="flex h-full w-full flex-col">
    <div class="border-b bg-background px-6 py-4">
      <h1 class="text-2xl font-bold">Ajustes</h1>
    </div>

    <div class="flex flex-1 overflow-hidden">
      <div class="w-64 border-r bg-muted/20 p-4">
        <nav class="space-y-1">
          <button
            v-for="tab in tabs"
            :key="tab.id"
            :class="[
              'w-full flex items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-medium transition-colors',
              activeTab === tab.id
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
            ]"
            @click="setActiveTab(tab.id)"
          >
            <span>{{ tab.label }}</span>
          </button>
        </nav>
      </div>

      <div class="flex-1 overflow-auto p-6">
        <div v-if="activeTab === 'api-keys'" class="space-y-6">
          <div>
            <h2 class="text-lg font-semibold mb-4">API Keys</h2>
            <div class="space-y-4">
              <div class="rounded-lg border p-4">
                <div class="mb-2 flex items-center justify-between">
                  <label class="text-sm font-medium">AI Gateway URL</label>
                </div>
                <input
                  type="text"
                  placeholder="https://api.openai.com/v1"
                  class="w-full rounded-md border px-3 py-2 text-sm"
                >
              </div>

              <div class="rounded-lg border p-4">
                <div class="mb-2 flex items-center justify-between">
                  <label class="text-sm font-medium">OpenAI API Key</label>
                  <span class="text-xs text-muted-foreground">Opcional</span>
                </div>
                <input
                  type="password"
                  placeholder="sk-..."
                  class="w-full rounded-md border px-3 py-2 text-sm"
                >
              </div>

              <div class="rounded-lg border p-4">
                <div class="mb-2 flex items-center justify-between">
                  <label class="text-sm font-medium">Anthropic API Key</label>
                  <span class="text-xs text-muted-foreground">Opcional</span>
                </div>
                <input
                  type="password"
                  placeholder="sk-ant-..."
                  class="w-full rounded-md border px-3 py-2 text-sm"
                >
              </div>

              <div class="rounded-lg border p-4">
                <div class="mb-2 flex items-center justify-between">
                  <label class="text-sm font-medium">Google API Key</label>
                  <span class="text-xs text-muted-foreground">Opcional</span>
                </div>
                <input
                  type="password"
                  placeholder="AI..."
                  class="w-full rounded-md border px-3 py-2 text-sm"
                >
              </div>
            </div>
          </div>

          <div class="rounded-lg border p-4">
            <div class="flex items-center justify-between">
              <div>
                <h3 class="text-sm font-medium">Modo Local</h3>
                <p class="text-xs text-muted-foreground mt-1">
                  Usar modelos locales sin API keys externas
                </p>
              </div>
              <button
                class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors"
              >
                <span class="sr-only">Toggle modo local</span>
                <span class="inline-block size-4 rounded-full bg-white shadow transition-transform" />
              </button>
            </div>
          </div>
        </div>

        <div v-else-if="activeTab === 'system-prompts'" class="space-y-6">
          <div>
            <div class="mb-4 flex items-center justify-between">
              <h2 class="text-lg font-semibold">System Prompts (Modos)</h2>
              <button class="rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground">
                + Agregar
              </button>
            </div>

            <div class="space-y-3">
              <div class="rounded-lg border p-4">
                <div class="mb-2 flex items-center justify-between">
                  <h3 class="font-medium">Asistente General</h3>
                  <div class="flex items-center gap-2">
                    <span class="text-xs rounded-full bg-green-100 px-2 py-0.5 text-green-700 dark:bg-green-900 dark:text-green-300">
                      Activo
                    </span>
                  </div>
                </div>
                <p class="text-sm text-muted-foreground">
                  Eres un asistente de IA útil y amigable. Ayuda a los usuarios con sus preguntas de manera clara y concisa.
                </p>
                <div class="mt-3 flex gap-2">
                  <button class="text-sm text-muted-foreground hover:text-foreground">Editar</button>
                  <button class="text-sm text-muted-foreground hover:text-destructive">Eliminar</button>
                </div>
              </div>

              <div class="rounded-lg border p-4">
                <div class="mb-2 flex items-center justify-between">
                  <h3 class="font-medium">Experto en Código</h3>
                  <span class="text-xs rounded-full bg-muted px-2 py-0.5 text-muted-foreground">
                    Inactivo
                  </span>
                </div>
                <p class="text-sm text-muted-foreground">
                  Eres un experto en programación. Ayuda con código, debugging y mejores prácticas.
                </p>
                <div class="mt-3 flex gap-2">
                  <button class="text-sm text-muted-foreground hover:text-foreground">Editar</button>
                  <button class="text-sm text-muted-foreground hover:text-destructive">Eliminar</button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div v-else-if="activeTab === 'sync'" class="space-y-6">
          <div>
            <h2 class="text-lg font-semibold mb-4">Sincronización con PocketBase</h2>

            <div class="space-y-4">
              <div class="rounded-lg border p-4">
                <h3 class="text-sm font-medium mb-3">Conexión</h3>
                <div class="space-y-3">
                  <div>
                    <label class="mb-1 block text-xs text-muted-foreground">URL del Servidor</label>
                    <input
                      type="text"
                      placeholder="https://tu-pocketbase.com"
                      class="w-full rounded-md border px-3 py-2 text-sm"
                    >
                  </div>
                  <div>
                    <label class="mb-1 block text-xs text-muted-foreground">Email</label>
                    <input
                      type="email"
                      placeholder="usuario@ejemplo.com"
                      class="w-full rounded-md border px-3 py-2 text-sm"
                    >
                  </div>
                  <div>
                    <label class="mb-1 block text-xs text-muted-foreground">Contraseña</label>
                    <input
                      type="password"
                      placeholder="••••••••"
                      class="w-full rounded-md border px-3 py-2 text-sm"
                    >
                  </div>
                  <button class="w-full rounded-md bg-primary py-2 text-sm font-medium text-primary-foreground">
                    Conectar
                  </button>
                </div>
              </div>

              <div class="rounded-lg border p-4">
                <div class="mb-3 flex items-center justify-between">
                  <h3 class="text-sm font-medium">Estado</h3>
                  <span class="text-xs rounded-full bg-yellow-100 px-2 py-0.5 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300">
                    No conectado
                  </span>
                </div>
                <div class="space-y-2 text-sm text-muted-foreground">
                  <div class="flex items-center gap-2">
                    <div class="h-2 w-2 rounded-full bg-gray-300" />
                    <span>Última sincronización: Nunca</span>
                  </div>
                  <div class="flex items-center gap-2">
                    <div class="h-2 w-2 rounded-full bg-gray-300" />
                    <span>Conversaciones pendientes: 0</span>
                  </div>
                </div>
              </div>

              <button class="w-full rounded-md border px-4 py-2 text-sm font-medium hover:bg-accent">
                Forzar sincronización
              </button>
            </div>
          </div>
        </div>

        <div v-else-if="activeTab === 'about'" class="space-y-6">
          <div class="rounded-lg border p-6">
            <div class="mb-4">
              <h2 class="text-2xl font-bold">Yara AI</h2>
              <p class="text-sm text-muted-foreground mt-1">Versión 1.0.0</p>
            </div>
            <p class="text-sm leading-relaxed">
              Yara AI es una aplicación de chat de inteligencia artificial construida con Vue 3,
              TailwindCSS y AI Elements. Permite conversaciones con soporte para chain-of-thought,
              tool calls, artifacts y más.
            </p>
            <div class="mt-4 space-y-2 text-sm">
              <div class="flex items-center gap-2 text-muted-foreground">
                <span class="font-medium">Stack:</span>
                <span>Vue 3, TypeScript, Vite, TailwindCSS</span>
              </div>
              <div class="flex items-center gap-2 text-muted-foreground">
                <span class="font-medium">AI SDK:</span>
                <span>Vercel AI SDK</span>
              </div>
              <div class="flex items-center gap-2 text-muted-foreground">
                <span class="font-medium">Database:</span>
                <span>IndexedDB + PocketBase (opcional)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
