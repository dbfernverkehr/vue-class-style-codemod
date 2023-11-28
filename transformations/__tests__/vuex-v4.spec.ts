
import {runTest} from "../../src/testUtils";

jest.autoMockOff()
runTest(
    'vuex-v4/store',
    'vuex-v4',
    'store',
    'js',
    'script'
)
runTest(
    'vuex-v4/vuex-dot-store',
    'vuex-v4',
    'vuex-dot-store',
    'js',
    'script'
)
runTest(
    'vuex-v4/import-alias',
    'vuex-v4',
    'import-alias',
    'js',
    'script'
)
