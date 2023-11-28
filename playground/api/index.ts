

import { server } from './app'
import './watcher'
import { API_PORT } from './constants'

console.log(`Vue-Class-Style-Codemod Playground API Started at http://localhost:${API_PORT}`)
server.listen(API_PORT)
