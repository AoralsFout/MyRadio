<script setup lang="ts">
import SearchBar from '@/components/library/SearchBar.vue'
</script>

<template>
  <header class="app-header">
    <div class="header-brand">
      <svg class="logo" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M9 18V5l12-2v13"/>
        <circle cx="6" cy="18" r="3"/>
        <circle cx="18" cy="16" r="3"/>
      </svg>
      <span class="header-title">MyRadio</span>
      <span class="header-subtitle">学长音乐精选</span>
    </div>
    <div class="header-search">
      <SearchBar />
    </div>
  </header>
</template>

<style scoped>
.app-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  height: var(--header-height);
  background: var(--color-surface);
  border-bottom: 1px solid var(--color-border);
  z-index: 100;
  gap: 24px;
}

.header-brand {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
}

.logo {
  width: 28px;
  height: 28px;
  color: var(--color-accent);
}

.header-title {
  font-weight: 700;
  font-size: 18px;
  color: var(--color-text);
}

.header-subtitle {
  font-size: 13px;
  color: var(--color-text-muted);
  margin-left: 4px;
  padding-left: 8px;
  border-left: 1px solid var(--color-border);
}

.header-search {
  flex: 1;
  max-width: 420px;
}

@media (max-width: 640px) {
  .app-header {
    padding: 0 16px;
  }
  .header-subtitle {
    display: none;
  }
  .header-search {
    max-width: none;
  }
}
</style>
