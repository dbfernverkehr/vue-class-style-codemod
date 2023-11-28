

<script lang="ts">
import { Prop, Component, Vue } from 'vue-property-decorator';
import {
  type Controls
} from '../Controls';

@Component({
  name: 'Component',
})
export class Component extends Vue {
  public readonly controls!: Controls;
  public get isOpen(): boolean {
    return this.componentInfo.isOpen;
  }

  // Key assignments
  public keyAssign: { [key: string]: (() => unknown) | undefined } = {
    ArrowDown: () => console.log('ArrowDown'),
    ArrowUp: () => console.log('ArrowUp'),
    Home: () => console.log('Home'),
    End: () => console.log('End:'),
  };

  public get cancelButtonText(): string {
    // Cancel button text comment
    return this.$gettext('Cancel');
  }

  public async close(): Promise<void> {
    this.controls.close('id-123');
    await this.$nextTick();
    this.$emit('toggleOpenState', false);
  }

  public async open(): Promise<void> {
    this.controls.open('id-123');
    await this.$nextTick();
    this.$emit('toggleOpenState', true);
  }

  public async toggle(): Promise<void> {
    if (this.isOpen) {
      await this.close();
    } else {
      await this.open();
    }
  }

  public created(): void {
    this.controls.register('id-123');
  }

  public updated(): void {
    this.contentwrapper.style.height = '50px';
  }
}
</script>
