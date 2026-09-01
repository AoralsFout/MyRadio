<script setup lang="ts">
import SearchBar from '@/components/library/SearchBar.vue'
</script>

<template>
  <header class="app-header">
    <div class="header-brand">
      <span class="logo" aria-hidden="true"><i /></span>
      <div>
        <span class="header-title">MYRADIO</span>
        <span class="header-subtitle">私藏音乐电台</span>
      </div>
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
  padding: 0 clamp(20px, 4vw, 64px);
  height: var(--header-height);
  background: rgba(8, 11, 19, 0.78);
  border-bottom: 1px solid var(--color-border-soft);
  backdrop-filter: blur(18px);
  z-index: 100;
  gap: 24px;
}

.header-brand {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;
}

.logo {
  position: relative;
  width: 34px;
  height: 34px;
  display: grid;
  place-items: center;
  border: 1px solid var(--color-accent);
  border-radius: 50%;
}

.logo::before,
.logo::after { content: ''; position: absolute; border-radius: 50%; }
.logo::before { width: 16px; height: 16px; border: 1px solid rgba(242, 166, 90, 0.55); }
.logo::after { width: 5px; height: 5px; background: var(--color-accent); }
.logo i { display: none; }

.header-title {
  display: block;
  font: 800 14px/1 var(--font-display);
  letter-spacing: 0.14em;
  color: var(--color-text);
}

.header-subtitle {
  display: block;
  margin-top: 5px;
  font: 500 9px/1 var(--font-mono);
  letter-spacing: 0.14em;
  color: var(--color-text-muted);
}

.header-search {
  flex: 1;
  max-width: 390px;
}

@media (max-width: 640px) {
  .app-header {
    padding: 0 16px;
    gap: 14px;
  }
  .header-search {
    max-width: none;
  }
}

@media (max-width: 460px) {
  .header-brand > div { display: none; }
}
</style>
