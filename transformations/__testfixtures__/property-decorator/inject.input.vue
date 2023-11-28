

<script lang="ts">
import { Inject, Vue } from 'vue-property-decorator';

@Component({
  name: 'Component',
})
export class Component extends Vue {
  @Inject() readonly foo!: string
  @Inject('bar') readonly bar!: string
  @Inject({ from: 'optional', default: 'default' }) readonly optional!: string
  @Inject(symbol) readonly baz!: string
  @Inject({ from: 'optional', default: () => 'Hello World' }) readonly optional!: string
}
</script>
