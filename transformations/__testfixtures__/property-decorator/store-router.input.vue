

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'

@Component
export default class YourComponent extends Vue {

  methodA() {
    return this.$route.params.id
  }

  methodB() {
    return this.$router.back()
  }

  methodC() {
    return this.$store.commit('increment')
  }
}
</script>
