# vue-class-style-codemod

This project is based on the fork of https://github.com/originjs/vue-codemod and was modified and further developed by Deutsche Bahn Fernverkehr AG.

> Cloned from https://github.com/originjs/vue-codemod

`vue-class-style-codemod` is a Vue 2 to Vue 3 migration tool based on `vue-codemod` adding support to convert Vue Class-based components defined with [`vue-class-component`](https://github.com/vuejs/vue-class-component) and [`vue-property-decorator`](https://github.com/kaorun343/vue-property-decorator) to the `script setup` component syntax.


## How to use
Install all dependencies and make vue-class-style-codemod available globally
``npm run setup``  (Please use only npm and not yarn)

Transformation of projects and individual files with the help of vue-class-style-codemod.


> vue-class-style-codemod <file-or-project-path> -t/-a [transformation params]

or

> npx vue-class-style-codemod <file-or-project-path> -t/-a [transformation params]


1) **<file-or-project-path>** indicates the relative path of execution, which can be files and folders. If the file to be converted is in the same folder as the converter, you must specify the file starting from the parent folder.
2) **-a** (or --runAllTransformation) means executing all rules.
3) **-t** (or --transformation) means specific rule (ex. property-decorator)

Please note that the transformation completely replaces the old file

##  Rules
Having already the rule `vue-class-component-v8` available in `vue-class-style-codemod`, this projects adds the two rules `property-decorator` and `define-component-to-script-setup`.

### property-decorator
The rule converts most decorators of `vue-property-decorator`. The following table shows some exemplary conversions.

#### Class
<table>
<tr><td> From </td> <td> To </td></tr>
<tr>
<td>

```javascript
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
```

</td>
<td>

```javascript
groupControls.register(id);
groupControls.register(id);
```

</td>
</tr>
</table>

#### Emit
<table>
<tr><td> From </td> <td> To </td></tr>
<tr>
<td>

```javascript
@Emit('reset')
resetCount() {
  this.count = 0;
}
```

</td>
<td>


```javascript
const emit = defineEmits<{
(e: 'reset'): void
}>();

function resetCount() {
    count = 0;
    emit("reset");
}
```

</td>
</tr>
</table>

#### Injection
<table>
<tr><td> From </td> <td> To </td></tr>
<tr>
<td>

```javascript
@Inject() readonly foo!: string
@Inject('bar') readonly bar!: string
@Inject({ from: 'optional', default: 'default' }) readonly optional!: string
@Inject(symbol) readonly baz!: string
@Inject({ from: 'optional', default: () => 'Hello World' }) readonly optional!: string
```

</td>
<td>

```javascript
const foo: string = inject('foo');
const bar: string = inject('bar');
const optional: string = inject('optional', 'default');
const baz: string = inject(symbol);
const optional: string = inject('optional', () => 'Hello World');
```

</td>
</tr>
</table>

#### Next tick
<table>
<tr><td> From </td> <td> To </td></tr>
<tr>
<td>

```javascript
await this.$nextTick();
```

</td>
<td>

```javascript
await nextTick();
```

</td>
</tr>
</table>

#### Gettext
<table>
<tr><td> From </td> <td> To </td></tr>
<tr>
<td>

```javascript
public get cancelButtonText(): string {
  // Cancel button text comment
  return this.$gettext('Cancel');
}
```

</td>
<td>

```javascript
const cancelButtonText = computed<string>(() => {
  // Cancel button translation comment
  return $gettext('Cancel');
});
```

</td>
</tr>
</table>

#### Prop
<table>
<tr><td> From </td> <td> To </td></tr>
<tr>
<td>

```javascript
@Prop(Number) readonly propA: number | undefined
@Prop({ default: 'default value' }) readonly propB: string
@Prop({ type: String }) readonly propC!: string
@Prop([String, Boolean]) readonly propD: string | boolean | undefined
@Prop(Number) readonly propE!: number | undefined
@Prop([String, Boolean]) readonly propF!: string | boolean | undefined
```

</td>
<td>

```javascript
const props = withDefaults(defineProps<{
    propA?: number | undefined,
    propB?: string,
    propC: string,
    propD?: string | boolean | undefined,
    propE: number | undefined,
    propF: string | boolean | undefined
}>(), {
    propB: 'default value'
});
```

</td>
</tr>
</table>

#### Provide
<table>
<tr><td> From </td> <td> To </td></tr>
<tr>
<td>

```javascript
@Provide() foo = 'foo';
@Provide('bar') baz = 'bar';
```

</td>
<td>

```javascript
const foo = reactive('foo');
provide('foo', foo);
const baz = reactive('bar');
provide('bar', baz);
```

</td>
</tr>
</table>

#### Ref
<table>
<tr><td> From </td> <td> To </td></tr>
<tr>
<td>

```javascript
@Ref() readonly anotherComponent!: AnotherComponent
@Ref('aButton') readonly button!: HTMLButtonElement
```

</td>
<td>

```javascript
const anotherComponent = ref<AnotherComponent>();
const aButton = ref<HTMLButtonElement>();
```

</td>
</tr>
</table>

#### Static class fields
<table>
<tr><td> From </td> <td> To </td></tr>
<tr>
<td>

```javascript
export class AnyComponent extends Vue {
  private static readonly noScrollClass: string = 'util__noscroll-xs';

  public static addNoScrollXs(): void {
      document.documentElement.classList.add(AnyComponent.noScrollClass);
  }
}
```

</td>
<td>

```javascript
const noScrollClass: string = 'util__noscroll-xs';

function addNoScrollXs(): void {
    document.documentElement.classList.add(noScrollClass);
}
```

</td>
</tr>
</table>

#### Router
<table>
<tr><td> From </td> <td> To </td></tr>
<tr>
<td>

```javascript
methodA() {
  return this.$route.params.id
}

methodB() {
  return this.$router.back()
}
```

</td>
<td>

```javascript
const router = useRouter();
const route = useRoute();

function methodA() {
    return route.params.id;
}

function methodB() {
    return router.back();
}
```

</td>
</tr>
</table>

#### Vuex
<table>
<tr><td> From </td> <td> To </td></tr>
<tr>
<td>

```javascript
methodC() {
  return this.$store.commit('increment')
}
```

</td>
<td>

```javascript
function methodC() {
    return store.commit('increment');
}
```

</td>
</tr>
</table>

#### Watch
<table>
<tr><td> From </td> <td> To </td></tr>
<tr>
<td>

```javascript
@Watch('person', { immediate: true, deep: true })
onPersonChanged(val: Person, oldVal: Person) {}
```

</td>
<td>

```javascript
function onPersonChanged(val: Person, oldVal: Person) {}
watch(person, onPersonChanged);
```

</td>
</tr>
</table>

### define-component-to-script-setup
This rule converts the `defineComponent` syntax to the `script setup` syntax.
<table>
<tr><td> From </td> <td> To </td></tr>
<tr>
<td>

```javascript
<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'test',
  components: {
    testComponent
  },
  emit: ['change','input'],
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
      title: computed(() => 'Hello World'),
    }
  },

  methods: {
    doIt() {
      console.log(`Hello ${this.name}`);
    },
  },

});
</script>
```

</td>
<td>

```javascript
<script setup lang="ts">
  const emit = defineEmits<{
    (e: 'change'): void,
    (e: 'input'): void
  }>();

  const props = defineProps<{
    counter?: Boolean
  }>();

  const title = computed(() => 'Hello World');
  emit('changeValue');

  function doIt() {
    console.log(`Hello ${name}`);
  }
</script>
```

</td>
</tr>
</table>

License Information:

The copyright of the original repo licensed under the copyright of vuejs and the changes under the copyright of DB Fernverkehr. All code and modifications are licensed under the **MIT license**.
