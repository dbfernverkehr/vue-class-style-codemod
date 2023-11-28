

<script setup lang="ts">
const props = withDefaults(defineProps<{
    propA?: number | undefined,
    propB?: string,
    propC: string,
    propD?: string | boolean | undefined,
    propE: number | undefined,
    propF: string | boolean | undefined
}>(), {
  propB: 'default value'
});
</script>

