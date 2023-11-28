

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'test',
  components: {
    testComponent
  },
  emits: ['change','input'],
  props: {
    counter: {
      required: false,
      type: Boolean
    },
  },
  setup(props, ctx) {
    ctx.emit('changeValue');
   	return {
    	test,
      title: computed(() =>
        gettextInterpolate(gettext('some text - %{VALUE}'), { VALUE: 'some value' }),
      ),
    }
  },

  methods: {
    doIt() {
      console.log(`Hello ${this.name}`);
    },
  },

});
</script>
