

<script setup lang="ts">
const emits = defineEmits<{
    (e: 'change-value'): void,
    (e: 'change'): void,
    (e: 'input'): void
}>();

const props = defineProps<{
    counter?: boolean
}>();

const title = computed(() =>
  gettextInterpolate(gettext('some text - %{VALUE}'), { VALUE: 'some value' }));

emit('changeValue');

function doIt() {
  console.log(`Hello ${name}`);
}
</script>

