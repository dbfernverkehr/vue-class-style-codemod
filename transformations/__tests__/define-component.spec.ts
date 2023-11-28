import {defineInlineTest} from "jscodeshift/src/testUtils";

jest.autoMockOff()
import { runTest } from '../../src/testUtils'
const transform = require('../define-component')

defineInlineTest(
  transform,
  {},
  `import Vue from "vue";
var Profile = Vue.extend({
  template: '<p>{{firstName}} {{lastName}} aka {{alias}}</p>',
  data: function () {
    return {
      firstName: 'Walter',
      lastName: 'White',
      alias: 'Heisenberg'
    }
  }
})`,
  `import { defineComponent } from "vue";
var Profile = defineComponent({
  template: '<p>{{firstName}} {{lastName}} aka {{alias}}</p>',
  data: function () {
    return {
      firstName: 'Walter',
      lastName: 'White',
      alias: 'Heisenberg'
    }
  }
})`,
  'transforms Vue.extend to defineComponent'
)

defineInlineTest(
  transform,
  {
    useCompositionApi: true,
  },
  `import Vue from "vue";
var Profile = Vue.extend({
  template: '<p>{{firstName}} {{lastName}} aka {{alias}}</p>',
  data: function () {
    return {
      firstName: 'Walter',
      lastName: 'White',
      alias: 'Heisenberg'
    }
  }
})`,
  `import { defineComponent } from "@vue/composition-api";
var Profile = defineComponent({
  template: '<p>{{firstName}} {{lastName}} aka {{alias}}</p>',
  data: function () {
    return {
      firstName: 'Walter',
      lastName: 'White',
      alias: 'Heisenberg'
    }
  }
})`,
  'imports from @vue/composition-api'
)


runTest(
  'do not touch .vue files which already use defineComponent',
  'define-component',
  'export-define-component',
    'vue',
    'script'
)

runTest(
  'default exported objects in .vue files should be wrapped with a defineComponent call',
  'define-component',
  'export-object',
    'vue',
    'script'
)

runTest(
  'Vue.extend in .vue files should be transformed',
  'define-component',
  'export-vue-extend',
    'vue',
    'script'
)


