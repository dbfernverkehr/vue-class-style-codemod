

<script setup lang="ts">
import { watch } from "vue";
function onChildChanged(val: string, oldVal: string) {}
watch(child, onChildChanged);
function onPersonChanged1(val: Person, oldVal: Person) {}
watch(person, onPersonChanged1);
function onPersonChanged2(val: Person, oldVal: Person) {}
watch(person, onPersonChanged2);
function onPersonAndChildChanged() {}
watch(person, onPersonAndChildChanged);
watch(child, onPersonAndChildChanged);
</script>

