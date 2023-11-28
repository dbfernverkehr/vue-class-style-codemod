
import { Node } from 'vue-eslint-parser/ast/nodes'
import * as OperationUtils from '../src/operationUtils'
import type { Operation } from '../src/operationUtils'
import {
  default as wrap,
  createTransformAST
} from '../src/wrapVueTransformation'

export const transformAST = createTransformAST(
  nodeFilter,
  fix,
  'remove-v-on-native'
)

export default wrap(transformAST)

/**
 * Filter for v-on nodes
 */
function nodeFilter(node: Node): boolean {
  return (
    node.type === 'VAttribute' && node.directive && node.key.name.name === 'on'
  )
}

/**
 * fix logic
 * @param node
 */
function fix(node: Node): Operation[] {
  let fixOperations: Operation[] = []
  // @ts-ignore
  const keyNode = node.key
  const argument = keyNode.argument
  const modifiers = keyNode.modifiers
  if (argument !== null) {
    modifiers.forEach((mod: any) => {
      if(mod.name === 'native') {
        let range = mod.range
        fixOperations.push(OperationUtils.insertTextBefore(node.parent!, '<!-- native modifier has been removed, please confirm whether the function has been affected  -->\n'))
        fixOperations.push(OperationUtils.removeRange([range[0] -1, range[1]]))
      }
    })
  }
  return fixOperations
}
