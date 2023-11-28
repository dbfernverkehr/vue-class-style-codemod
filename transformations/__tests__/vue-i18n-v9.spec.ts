
import {runTest} from "../../src/testUtils";

jest.autoMockOff()

runTest('vue-i18n-v9/create-i18n', 'vue-i18n-v9', 'create-i18n', 'js', 'script')
runTest('vue-i18n-v9/create-i18n-alias', 'vue-i18n-v9', 'create-i18n-alias', 'js', 'script')
