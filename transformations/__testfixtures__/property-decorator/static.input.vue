

<script lang="ts">
import { Component } from 'vue-property-decorator';

@Component({
  name: 'AnyComponent',
})
export class AnyComponent extends Vue {
  private static readonly noScrollClass: string = 'util__noscroll-xs';

  private static addNoScrollXs(): void {
    document.documentElement.classList.add(AnyComponent.noScrollClass);
  }

  private static removeNoScrollXs(): void {
    document.documentElement.classList.remove(AnyComponent.noScrollClass);
  }

  private setNoScrollXs() {
    if (this.isOpen && !this.hasLayout) {
      AnyComponent.addNoScrollXs();
    } else {
      AnyComponent.removeNoScrollXs();
    }
  }
}
</script>
