<script setup lang="ts">
</script>

<template>
  <div class="spinner">
    <div class="spinner-icon" />
    <span class="spinner-text"><slot>Loading...</slot></span>
  </div>
</template>

<style scoped>
.spinner {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 60px 0;
}

.spinner-icon {
  width: 36px;
  height: 36px;
  border: 3px solid var(--color-border);
  border-top-color: var(--color-accent);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

.spinner-text {
  color: var(--color-text-muted);
  font-size: 14px;
}
</style>
