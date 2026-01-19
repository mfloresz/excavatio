export type SyncStatus = 'synced' | 'pending' | 'conflict'

export interface Conversation {
  id: string
  title: string
  systemPromptId: string | null
  createdAt: Date
  updatedAt: Date
  syncStatus: SyncStatus
  pocketbaseId: string | null
}

export interface Message {
  id: string
  conversationId: string
  role: 'user' | 'assistant'
  content: string
  attachments: Attachment[]
  createdAt: Date
  pocketbaseId: string | null
}

export interface Attachment {
  id: string
  name: string
  type: string
  size: number
  url: string
}

export interface SystemPrompt {
  id: string
  name: string
  prompt: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export interface Settings {
  apiKeys: {
    aiGateway: string
    openai: string
    anthropic: string
    google: string
  }
  syncEnabled: boolean
  pocketbaseUrl: string
  pocketbaseEmail: string
  pocketbasePassword?: string
  localMode: boolean
}

export interface File {
  id: string
  conversationId: string
  name: string
  type: string
  size: number
  url: string
  pocketbaseFileId: string | null
  createdAt: Date
}
