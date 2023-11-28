<script setup lang="ts">
import { ref } from "vue";

const emits = defineEmits<{
    (e: 'add-to-count'): void,
    (e: 'reset'): void,
    (e: 'return-value'): void,
    (e: 'on-input-change'): void,
    (e: 'promise'): void
}>();

function addToCount(n: number) {
  count += n;
  emit("add-to-count", n);
}

function resetCount() {
  count = 0;
  emit("reset");
}

function returnValue() {
  emit("return-value", 10);
}

function onInputChange(e) {
  emit("on-input-change", e.target.value);
}

function promise() {
  emit("promise", new Promise((resolve) => {
    setTimeout(() => {
      resolve(20);
    }, 0);
  }));
}

const count = ref(0);
</script>

