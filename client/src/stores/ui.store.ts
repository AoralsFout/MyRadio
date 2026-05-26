import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useUiStore = defineStore('ui', () => {
  const sidebarOpen = ref(true)
  const viewMode = ref<'grid' | 'list'>('grid')

  function toggleSidebar() {
    sidebarOpen.value = !sidebarOpen.value
  }

  function setViewMode(mode: 'grid' | 'list') {
    viewMode.value = mode
  }

  return { sidebarOpen, viewMode, toggleSidebar, setViewMode }
})
