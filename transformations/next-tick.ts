
import wrap from '../src/wrapAstTransformation'
import type { ASTTransformation } from '../src/wrapAstTransformation'
import { getCntFunc } from '../src/report'
import type { Identifier } from 'jscodeshift'

export const transformAST: ASTTransformation = ({ root, j }) => {
  // find the Vue.nextTick(...)
  const nextTickCalls = root.find(j.CallExpression, n => {
    return (
      n.callee.type === 'MemberExpression' &&
      (n.callee.property as Identifier).name === 'nextTick' &&
      (n.callee.object as Identifier).name === 'Vue'
    )
  })

  if (nextTickCalls.length) {
    // add import nextTick
    const addImport = require('./add-import')
    addImport.transformAST(
      { root, j },
      {
        specifier: {
          type: 'named',
          imported: 'nextTick'
        },
        source: 'vue'
      }
    )

    nextTickCalls.replaceWith(({ node }) => {
      const el = node.arguments[0]
      return j.callExpression(j.identifier('nextTick'), [el])
    })

    // stats
    const cntFunc = getCntFunc('next-tick', subRules)
    cntFunc()
  }
}

export default wrap(transformAST)
export const parser = 'babylon'
