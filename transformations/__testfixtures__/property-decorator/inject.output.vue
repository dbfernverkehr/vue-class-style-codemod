

<script setup lang="ts">
import { inject } from "vue";
const foo: string = inject('foo');
const bar: string = inject('bar');
const optional: string = inject('optional', 'default');
const baz: string = inject(symbol);
const optional: string = inject('optional', () => 'Hello World');
</script>

