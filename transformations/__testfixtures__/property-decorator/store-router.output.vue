

<script setup lang="ts">
import { useStore } from "vuex";
const store = useStore();
import { useRoute, useRouter } from "vue-router";
const router = useRouter();
const route = useRoute();

function methodA() {
  return route.params.id;
}

function methodB() {
  return router.back();
}

function methodC() {
  return store.commit('increment');
}
</script>

