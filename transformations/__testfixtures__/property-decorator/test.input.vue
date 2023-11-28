

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';
@Component
export default class CreatedInput extends Vue {
  public created(): void {
    this.groupControls.register(this.id);
  }
  public beforeCreated(): void {
    this.groupControls.register(this.id);
  }
}


</script>
