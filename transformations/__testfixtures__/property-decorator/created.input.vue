

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'
@Component
export default class CreatedInput extends Vue {
  public created(): void {
    this.accordionGroupControls.register(this.accordionId);
  }
  public beforeCreated(): void {
    this.accordionGroupControls.register(this.accordionId);
  }
}
</script>
