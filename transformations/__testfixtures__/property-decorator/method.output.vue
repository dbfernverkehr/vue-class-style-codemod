

<script setup lang="ts">
import { ref, computed, onUpdated, nextTick } from "vue";
import {
  type Controls
} from '../Controls';

const { $gettext } = useGettext();

const emits = defineEmits<{
    (e: 'toggle-open-state'): void
}>();

const controls: Controls;

// Key assignments
const keyAssign = ref<{ [key: string]: (() => unknown) | undefined }>({
  ArrowDown: () => console.log('ArrowDown'),
  ArrowUp: () => console.log('ArrowUp'),
  Home: () => console.log('Home'),
  End: () => console.log('End:'),
});

const isOpen = computed<boolean>(() => {
  return componentInfo.isOpen;
});

const cancelButtonText = computed<string>(() => {
  // Cancel button text comment
  return $gettext('Cancel');
});

async function close(): Promise<void> {
  controls.close('id-123');
  await nextTick();
  emit('toggleOpenState', false);
}

async function open(): Promise<void> {
  controls.open('id-123');
  await nextTick();
  emit('toggleOpenState', true);
}

async function toggle(): Promise<void> {
  if (isOpen) {
    await close();
  } else {
    await open();
  }
}

controls.register('id-123');

onUpdated(() => {
  contentwrapper.style.height = '50px';
});
</script>

