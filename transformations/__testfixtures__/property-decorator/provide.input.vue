

<script lang="ts">
import { Prop, Component, Vue } from 'vue-property-decorator';

@Component({
  name: 'Component',
})
export class Component extends Vue {
  @Provide() foo = 'foo';
  @Provide('bar') baz = 'bar';
}
</script>
