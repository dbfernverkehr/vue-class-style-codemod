
import {runTest} from "../../src/testUtils";

jest.autoMockOff()

runTest('vue-router-v4/create-router', 'vue-router-v4', 'create-router', 'js', 'script')
runTest('vue-router-v4/create-history', 'vue-router-v4', 'create-history', 'js', 'script')
runTest('vue-router-v4/rename-create-router', 'vue-router-v4',  'rename-create-router', 'js', 'script')
runTest('vue-router-v4/router-ready', 'router4-onready-to-isready','router-ready', 'js', 'script')
runTest('vue-router-v4/router-addRoute', 'router-update-addRoute','router-addRoute', 'js', 'script')
