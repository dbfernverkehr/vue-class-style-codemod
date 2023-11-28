

<script lang="ts">
import { Prop, Component, Vue } from 'vue-property-decorator';

@Component({
  name: 'Component',
})
export class Component extends Vue {
  @Prop(Number) readonly propA: number | undefined
  @Prop({ default: 'default value' }) readonly propB: string
  @Prop({ type: String }) readonly propC!: string
  @Prop([String, Boolean]) readonly propD: string | boolean | undefined
  @Prop(Number) readonly propE!: number | undefined
  @Prop([String, Boolean]) readonly propF!: string | boolean | undefined
}
</script>
