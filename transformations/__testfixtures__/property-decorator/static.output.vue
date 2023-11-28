

<script setup lang="ts">
const noScrollClass: string = 'util__noscroll-xs';

function addNoScrollXs(): void {
  document.documentElement.classList.add(noScrollClass);
}

function removeNoScrollXs(): void {
  document.documentElement.classList.remove(noScrollClass);
}

function setNoScrollXs() {
  if (isOpen && !hasLayout) {
    addNoScrollXs();
  } else {
    removeNoScrollXs();
  }
}
</script>

