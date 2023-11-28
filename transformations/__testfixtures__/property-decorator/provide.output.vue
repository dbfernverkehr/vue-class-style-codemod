

<script setup lang="ts">
import { reactive, provide } from "vue";
const foo = reactive('foo');
provide('foo', foo);
const baz = reactive('bar');
provide('bar', baz);
</script>

