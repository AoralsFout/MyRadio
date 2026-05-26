<script setup lang="ts">
import { ref, watch } from 'vue'
import { useLibraryStore } from '@/stores/library.store'

const library = useLibraryStore()
const input = ref('')
let timer: ReturnType<typeof setTimeout> | null = null

function onInput(val: string) {
  if (timer) clearTimeout(timer)
  timer = setTimeout(() => {
    library.setSearch(val)
  }, 200)
}

watch(
  () => library.searchQuery,
  () => {
    // keep input in sync if search is cleared externally
  },
)
</script>

<template>
  <div class="search-bar">
    <svg class="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
      <circle cx="11" cy="11" r="8"/>
      <line x1="21" y1="21" x2="16.65" y2="16.65"/>
    </svg>
    <input
      v-model="input"
      type="text"
      placeholder="搜索歌曲、歌手或专辑..."
      class="search-input"
      @input="onInput(($event.target as HTMLInputElement).value)"
    />
    <button v-if="input" class="clear-btn" @click="input = ''; library.setSearch('')">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14">
        <line x1="18" y1="6" x2="6" y2="18"/>
        <line x1="6" y1="6" x2="18" y2="18"/>
      </svg>
    </button>
  </div>
</template>

<style scoped>
.search-bar {
  display: flex;
  align-items: center;
  background: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: 0 12px;
  gap: 8px;
  transition: border-color 0.2s;
}

.search-bar:focus-within {
  border-color: var(--color-accent);
}

.search-icon {
  color: var(--color-text-muted);
  flex-shrink: 0;
}

.search-input {
  flex: 1;
  background: none;
  border: none;
  outline: none;
  padding: 8px 0;
  font-size: 14px;
  color: var(--color-text);
}

.search-input::placeholder {
  color: var(--color-text-muted);
}

.clear-btn {
  flex-shrink: 0;
  color: var(--color-text-muted);
  padding: 4px;
  border-radius: 50%;
}

.clear-btn:hover {
  color: var(--color-text);
}
</style>
