
export let ruleDescription = {
  'new-component-api': {
    description:
      'https://v3-migration.vuejs.org/breaking-changes/global-api.html#a-new-global-api-createapp'
  },
  'vue-class-component-v8': {
    description: 'https://github.com/vuejs/vue-class-component/issues/406'
  },
  'new-global-api': {
    description:
      'https://v3-migration.vuejs.org/breaking-changes/global-api.html#a-new-global-api-createapp'
  },
  'vue-router-v4': {
    description: [
      'https://next.router.vuejs.org/guide/migration/index.html#new-router-becomes-createrouter',
      'https://next.router.vuejs.org/guide/migration/index.html#new-history-option-to-replace-mode',
      'https://next.router.vuejs.org/guide/migration/index.html#replaced-onready-with-isready'
    ]
  },
  'vuex-v4': {
    description: 'new Store (...) => createStore (...)'
  },
  'define-component': {
    description: 'Vue.extend (...) => defineComponent (...)'
  },
  'new-vue-to-create-app': {
    description:
      'https://v3-migration.vuejs.org/breaking-changes/global-api.html#a-new-global-api-createapp'
  },
  'scoped-slots-to-slots': {
    description:
      'https://v3-migration.vuejs.org/breaking-changes/slots-unification.html#overview'
  },
  'new-directive-api': {
    description:
      'https://v3-migration.vuejs.org/breaking-changes/custom-directives.html#overview'
  },
  'remove-vue-set-and-delete': {
    description:
      'https://v3-migration.vuejs.org/breaking-changes/#removed-apis'
  },
  'rename-lifecycle': {
    description:
      'https://v3-migration.vuejs.org/breaking-changes/#other-minor-changes'
  },
  'add-emit-declaration': {
    description:
      'https://v3-migration.vuejs.org/breaking-changes/emits-option.html'
  },
  'tree-shaking': {
    description:
      'https://v3-migration.vuejs.org/breaking-changes/global-api-treeshaking.html'
  },
  'v-model': {
    description: 'https://v3-migration.vuejs.org/breaking-changes/v-model.html#overview'
  },
  'render-to-resolveComponent': {
    description:
      'https://v3-migration.vuejs.org/breaking-changes/render-function-api.html#registered-component'
  },
  'remove-contextual-h-from-render': {
    description:
      'https://v3-migration.vuejs.org/breaking-changes/render-function-api.html#render-function-argument'
  },
  'remove-production-tip': {
    description:
      'https://v3-migration.vuejs.org/breaking-changes/global-api.html#a-new-global-api-createapp'
  },
  'remove-trivial-root': {
    description: 'createApp ({ render: () => h (App) }) => createApp (App)'
  },
  'vue-as-namespace-import': {
    description: 'import Vue from "vue" => import * as Vue from "vue"'
  },
  'slot-attribute': {
    description:
      'https://v2.vuejs.org/v2/guide/components-slots.html#Deprecated-Syntax'
  },
  'slot-default': {
    description:
      'If component tag did not contain a <slot> element, any content provided between its opening and closing tag would be discarded.'
  },
  'slot-scope-attribute': {
    description:
      'https://v2.vuejs.org/v2/guide/components-slots.html#Scoped-Slots'
  },
  'v-for-template-key': {
    description:
      'https://v3-migration.vuejs.org/breaking-changes/key-attribute.html#with-template-v-for'
  },
  'v-else-if-key': {
    description:
      'https://v3-migration.vuejs.org/breaking-changes/key-attribute.html#on-conditional-branches'
  },
  'transition-group-root': {
    description:
      'https://v3-migration.vuejs.org/breaking-changes/transition-group.html#overview'
  },
  'v-bind-order-sensitive': {
    description: 'https://v3-migration.vuejs.org/breaking-changes/v-bind.html#overview'
  },
  'v-for-v-if-precedence-changed': {
    description: 'https://v3-migration.vuejs.org/breaking-changes/v-if-v-for.html#overview'
  },
  'remove-listeners': {
    description:
      'https://v3-migration.vuejs.org/breaking-changes/listeners-removed.html#overview'
  },
  'v-bind-sync': {
    description: 'https://v3-migration.vuejs.org/breaking-changes/v-model.html#overview'
  },
  'remove-v-on-native': {
    description:
      'https://v3-migration.vuejs.org/breaking-changes/v-on-native-modifier-removed.html#overview'
  },
  'router-link-event-tag': {
    description:
      'https://next.router.vuejs.org/guide/migration/index.html#removal-of-event-and-tag-props-in-router-link'
  },
  'router-link-exact': {
    description:
      'https://next.router.vuejs.org/guide/migration/index.html#removal-of-the-exact-prop-in-router-link'
  },
  'router-view-keep-alive-transition': {
    description:
      'https://next.router.vuejs.org/guide/migration/index.html#router-view-keep-alive-and-transition'
  }
}
