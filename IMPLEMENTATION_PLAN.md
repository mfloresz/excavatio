# Plan de Implementación - Yara AI

## 📋 Resumen del Proyecto

Aplicación de chat de IA cliente-side (browser) con IndexedDB (local) y PocketBase (sync opcional).

---

## ✅ Fase 1: Configuración Inicial

- [x] Inicializar proyecto Vue 3 con Vite
- [x] Configurar TypeScript
- [x] Instalar dependencias base:
  - Vue 3 + Vue Router
  - TailwindCSS + shadcn-vue
  - ai (Vercel AI SDK)
  - @ai-sdk/vue
  - ai-elements (componentes)
  - pocketbase
  - vue-stick-to-bottom
  - nanoid
- [x] Configurar estructura de carpetas:
  - `/src/components` (UI components)
  - `/src/components/ai-elements` (AI Elements components)
  - `/src/views` (Páginas principales)
- [ ] Crear estructura de stores Pinia (vacío)
- [ ] Crear estructura de servicios (IndexedDB, PocketBase, Sync)
- [ ] Crear estructura de composables
- [ ] Crear estructura de tipos TypeScript

---

## ✅ Fase 2: Servicios de Datos

### 2.1 IndexedDB Service
- [ ] Crear `/src/services/indexedDB.ts`:
  - Abrir base de datos `yara-ai-db`
  - Definir stores: `conversations`, `messages`, `systemPrompts`, `settings`, `files`
  - CRUD operations para cada store
  - Métodos de backup/restore
- [ ] Crear tipos TypeScript para:
  - `Conversation`: id, title, systemPromptId, createdAt, updatedAt, syncStatus
  - `Message`: id, conversationId, role, content, attachments, createdAt
  - `SystemPrompt`: id, name, prompt, isActive
  - `Settings`: apiKeys, syncEnabled, pocketbaseUrl, pocketbaseEmail
  - `File`: id, conversationId, name, type, size, url, createdAt

### 2.2 PocketBase Service
- [ ] Crear `/src/services/pocketbase.ts`:
  - Inicializar cliente PocketBase
  - Métodos de autenticación: `authWithPassword`, `logout`
  - CRUD para cada colección (con error handling)
  - Métodos de subida de archivos (FormData)
  - Realtime subscriptions para sync
- [ ] Definir esquema de colecciones PocketBase:
  - `conversations`: id, userId, title, systemPromptId, createdAt, updatedAt, pocketbaseId
  - `messages`: id, conversationId, role, content, attachments, createdAt, pocketbaseId
  - `system_prompts`: id, name, prompt, isActive
  - `files`: id, conversationId, name, type, size, url, pocketbaseFileId

### 2.3 Sync Service
- [ ] Crear `/src/services/sync.ts`:
  - Lógica de sincronización bidireccional
  - Detectar cambios locales vs remotos
  - Resolver conflictos (last-write-wins o merge)
  - Sistema de estados: `synced`, `pending`, `conflict`
  - Métricas de sync (última fecha, número de cambios)

---

## ✅ Fase 3: Estado Global (Pinia)

- [ ] Crear store `/src/stores/conversations.ts`:
  - State: conversaciones actuales, conversación seleccionada
  - Actions: crear, actualizar, eliminar, seleccionar, renombrar
  - Getters: conversaciones ordenadas por fecha

- [ ] Crear store `/src/stores/messages.ts`:
  - State: mensajes por conversación
  - Actions: agregar, actualizar, eliminar, cargar conversación
  - Getters: mensajes de conversación actual

- [ ] Crear store `/src/stores/systemPrompts.ts`:
  - State: lista de system prompts
  - Actions: agregar, editar, eliminar, activar/desactivar
  - Getters: prompts activos

- [ ] Crear store `/src/stores/settings.ts`:
  - State: apiKeys, syncEnabled, pocketbaseUrl, userCredentials
  - Actions: guardar, cargar, exportar/importar

- [ ] Crear store `/src/stores/auth.ts`:
  - State: isAuthenticated, user, pocketbaseClient
  - Actions: login, logout, checkAuth

---

## ✅ Fase 4: Componentes UI - Sidebar

- [ ] Crear `/src/components/Sidebar.vue`:
  - Header con logo "Yara AI"
  - Lista de conversaciones (scrollable)
  - Botón "Nueva conversación"
  - Footer con botón de ajustes/dropdown

- [ ] Crear `/src/components/ConversationItem.vue`:
  - Mostrar título y fecha
  - Indicador de sincronización
  - Click para seleccionar
  - Botón de eliminar (hover)
  - Click derecho → menú contextual (renombrar, duplicar, eliminar)

- [ ] Crear `/src/components/UserMenu.vue`:
  - Dropdown con opciones:
    - Perfil (cuando autenticado)
    - Ajustes
    - Login (cuando no autenticado)
    - Logout (cuando autenticado)
    - Modo local/sync

---

## ✅ Fase 5: Componentes UI - Chat Area

- [x] Crear `/src/components/ChatArea.vue`:
  - [x] Barra superior:
    - [x] Título de conversación (editable)
    - [x] Selector de modelos a la derecha
  - [x] Contenedor de mensajes (Conversation de ai-elements)
  - [x] Prompt input (centrado si no iniciado, abajo si iniciado)
  - [x] Estado vacío (ConversationEmptyState de ai-elements)
  - [x] Integración con Pinia stores

- [x] Crear `/src/components/MessageList.vue`:
  - [x] Usar `Conversation` y `ConversationContent` de ai-elements
  - [x] Renderizar mensajes con `Message`, `MessageContent`, `MessageResponse`
  - [x] Soportar branching con `MessageBranch`
  - [x] Integración con messages store

- [x] Crear `/src/components/MessageItem.vue`:
  - [x] Avatar del asistente/usuario
  - [x] `ChainOfThought` (collapsible) para razonamiento
  - [x] `Tool` components para tool calls
  - [x] `Artifact` components para artefactos generados
  - [x] `CodeBlock` para código
  - [x] `Sources` para citaciones
  - [x] `Confirmation` para confirmaciones
  - [x] Acciones: copiar, regenerar, editar

- [x] Crear `/src/components/PromptInputArea.vue`:
  - [x] Usar `PromptInput` de ai-elements
  - [x] Integrar `ModelSelector` en el footer
  - Selector de modelos (OpenAI, Anthropic, local, etc.)
  - Botón de adjuntar archivos
  - Botón de voz (speech-to-text)

---

## ✅ Fase 6: Componentes UI - Settings

- [ ] Crear `/src/views/SettingsView.vue`:
  - Tabs o sidebar para secciones:
    - API Keys
    - System Prompts (Modos)
    - Sincronización
    - Acerca de

- [ ] Crear `/src/components/settings/ApiKeysTab.vue`:
  - Formulario para ingresar API keys:
    - AI Gateway URL
    - OpenAI API Key
    - Anthropic API Key
    - Otras provider keys
  - Toggle para modo local (sin API keys externas)

- [ ] Crear `/src/components/settings/SystemPromptsTab.vue`:
  - Lista de system prompts existentes
  - Formulario para agregar/editar prompts:
    - Nombre
    - Prompt completo
    - Toggle "activo"
  - Botón de eliminar

- [ ] Crear `/src/components/settings/SyncTab.vue`:
  - Formulario de conexión PocketBase:
    - URL del servidor
    - Email
    - Contraseña
  - Botón de "Conectar/Desconectar"
  - Estado de sincronización
  - Botón "Forzar sync"
  - Métricas de sync

---

## ✅ Fase 7: Integración de AI SDK

- [ ] Crear `/src/composables/useChat.ts`:
  - Integrar `useChat` de `@ai-sdk/vue`
  - Configurar `streamText` con el provider seleccionado
  - Manejar streaming de mensajes
  - Manejar tool calls
  - Manejar errores

- [ ] Crear `/src/composables/useChainOfThought.ts`:
  - Detectar bloques de reasoning en respuestas
  - Renderizar con componente `ChainOfThought`

- [ ] Crear `/src/composables/useToolCalls.ts`:
  - Parsear tool calls de respuestas
  - Renderizar con componentes `Tool`
  - Manejar approval requests

- [ ] Crear `/src/composables/useArtifacts.ts`:
  - Detectar artefactos en respuestas
  - Renderizar con componentes `Artifact`
  - Permitir preview/expandir

---

## ✅ Fase 8: Routing y Navegación

- [ ] Configurar `/src/router/index.ts`:
  - Route `/` → Chat principal
  - Route `/settings` → Vista de ajustes
  - Route `/conversation/:id` → Conversación específica

- [ ] Crear `/src/views/ChatView.vue`:
  - Layout con Sidebar + ChatArea
  - Manejar selección de conversación
  - Crear nueva conversación

- [ ] Crear `/src/views/SettingsView.vue`:
  - Ya mencionado en Fase 6

---

## ✅ Fase 9: Funcionalidades Avanzadas

### 9.1 Sincronización
- [ ] Implementar sync automático:
  - Sync cada X minutos (configurable)
  - Sync al cargar la app
  - Sync al guardar cambios
- [ ] Implementar sync manual:
  - Botón "Sincronizar ahora"
  - Indicadores de sync en curso
- [ ] Manejar conflictos:
  - UI para resolver conflictos
  - Opciones: usar local, usar remoto, merge

### 9.2 Archivos
- [ ] Subida de archivos:
  - Drag & drop en prompt input
  - Botón adjuntar
  - Preview de imágenes
- [ ] Almacenamiento de archivos:
  - Guardar en IndexedDB (base64 o blob)
  - Subir a PocketBase cuando hay sync
  - Generar URLs temporales para visualización

### 9.3 Export/Import
- [ ] Exportar conversaciones:
  - Formato JSON
  - Formato Markdown
- [ ] Importar conversaciones:
  - Desde JSON
  - Validar formato

### 9.4 Búsqueda
- [ ] Buscar en conversaciones:
  - Por texto de mensajes
  - Por título
  - Filtros por fecha

---

## ✅ Fase 10: Testing y Optimización

- [ ] Testing unitario (Vitest):
  - Servicios (IndexedDB, PocketBase, Sync)
  - Stores (Pinia)
  - Composables

- [ ] Testing E2E (Playwright):
  - Flujo de conversación
  - Sincronización
  - Ajustes

- [ ] Optimizaciones:
  - Lazy loading de componentes
  - Virtual scrolling para conversaciones largas
  - Debounce de búsqueda
  - Caching de respuestas

- [ ] Performance:
  - Métricas de carga
  - Lighthouse audit
  - Optimizar tamaño de bundle

---

## ✅ Fase 11: Documentación y Deployment

- [ ] Documentación:
  - README.md
  - GUÍA_DE_USO.md
  - CONFIGURACIÓN_POCKETBASE.md

- [ ] Deployment:
  - Build para producción
  - Configurar Vercel/Netlify (o hosting estático)
  - Configurar PocketBase server (VPS o cloud)
  - Setup inicial de PocketBase (colecciones, indexes)

- [ ] Checklist final:
  - [ ] Linting (ESLint)
  - [ ] Type checking (TypeScript)
  - [ ] Tests pasando
  - [ ] Build exitoso
  - [ ] Deployment funcional

---

## 📝 Notas Importantes

### Estructura de Componentes AI Elements
- **Conversation**: `Conversation`, `ConversationContent`, `ConversationEmptyState`
- **Message**: `Message`, `MessageContent`, `MessageResponse`, `MessageActions`
- **ChainOfThought**: `ChainOfThought`, `ChainOfThoughtHeader`, `ChainOfThoughtContent`, `ChainOfThoughtStep`
- **Tool**: `Tool`, `ToolHeader`, `ToolInput`, `ToolOutput`
- **Artifact**: `Artifact`, `ArtifactHeader`, `ArtifactContent`
- **PromptInput**: `PromptInput`, `PromptInputTextarea`, `PromptInputButton`, `PromptInputSelect`, `PromptInputAttachments`
- **ModelSelector**: `ModelSelector`, `ModelSelectorContent`, `ModelSelectorGroup`, `ModelSelectorItem`

### PocketBase Schema
```
conversations
  - id (text, primary key)
  - userId (text, required)
  - title (text, required)
  - systemPromptId (text)
  - createdAt (datetime)
  - updatedAt (datetime)

messages
  - id (text, primary key)
  - conversationId (text, required, relation to conversations)
  - role (text: 'user' | 'assistant', required)
  - content (text, required)
  - attachments (json)
  - createdAt (datetime)

system_prompts
  - id (text, primary key)
  - name (text, required)
  - prompt (text, required)
  - isActive (boolean, default: false)

files
  - id (text, primary key)
  - conversationId (text, required, relation to conversations)
  - name (text, required)
  - type (text, required)
  - size (number)
  - url (text)
  - createdAt (datetime)
```

### Stack Técnico
- **Frontend**: Vue 3 + TypeScript + Vite
- **UI**: TailwindCSS + shadcn-vue + ai-elements
- **State**: Pinia
- **AI**: Vercel AI SDK (@ai-sdk/vue, ai)
- **Database**: IndexedDB (local) + PocketBase (sync)
- **Build**: Vite

---

## 🚀 Orden Prioritario de Implementación

1. **Fase 1-3**: Base (configuración + servicios + stores)
2. **Fase 4**: Sidebar básico
3. **Fase 5**: Chat area básico (sin sync)
4. **Fase 6**: Settings (API keys + system prompts)
5. **Fase 7**: Integración AI SDK
6. **Fase 8**: Routing
7. **Fase 9**: Sincronización
8. **Fase 10**: Testing y optimización
9. **Fase 11**: Deployment

---

*Última actualización: 2025-01-18*
