
import wrap from '../src/wrapAstTransformation'
import type { ASTTransformation } from '../src/wrapAstTransformation'
import { getCntFunc } from '../src/report'
import type { Identifier } from 'jscodeshift'
export const transformAST: ASTTransformation = ({ root, j }) => {
  // find the Vue.observable(state)
  const observableCalls = root.find(j.CallExpression, n => {
    return (
      n.callee.type === 'MemberExpression' &&
      (n.callee.property as Identifier).name === 'observable' &&
      (n.callee.object as Identifier).name === 'Vue'
    )
  })

  if (observableCalls.length) {
    // add import reactive
    const addImport = require('./add-import')
    addImport.transformAST(
      { root, j },
      {
        specifier: {
          type: 'named',
          imported: 'reactive'
        },
        source: 'vue'
      }
    )

    observableCalls.replaceWith(({ node }) => {
      const el = node.arguments[0]
      return j.callExpression(j.identifier('reactive'), [el])
    })

    // stats
    const cntFunc = getCntFunc('observable', subRules)
    cntFunc()
  }
}

export default wrap(transformAST)
export const parser = 'babylon'
