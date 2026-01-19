<template>
  <div class="flex h-screen w-full">
    <div class="w-64 bg-muted/20 border-r">
      <Sidebar />
    </div>
    <div class="flex-1">
      <ChatArea />
    </div>
  </div>
</template>

<script setup lang="ts">
import Sidebar from '@/components/Sidebar.vue'
import ChatArea from '@/components/ChatArea.vue'
</script>
