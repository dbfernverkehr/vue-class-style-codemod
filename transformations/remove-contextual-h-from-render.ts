import type { ArrowFunctionExpression } from 'jscodeshift'

import wrap from '../src/wrapAstTransformation'
import type { ASTTransformation } from '../src/wrapAstTransformation'

import { transformAST as addImport } from './add-import'
import { getCntFunc } from '../src/report'
import type { Identifier } from 'jscodeshift'

export const transformAST: ASTTransformation = context => {
  const { root, j } = context
  // stats
  const cntFunc = getCntFunc('remove-contextual-h-from-render', subRules)
  const renderFns = root.find(j.ObjectProperty, n => {
    return (
      (n.key as Identifier).name === 'render' &&
      (n.value.type === 'ArrowFunctionExpression' ||
        n.value.type === 'FunctionExpression')
    )
  })

  const renderMethods = root.find(j.ObjectMethod, {
    key: {
      name: 'render'
    },
    params: (params: Array<any>) =>
      j.Identifier.check(params[0]) && params[0].name === 'h'
  })

  if (renderFns.length || renderMethods.length) {
    addImport(context, {
      specifier: { type: 'named', imported: 'h' },
      source: 'vue'
    })

    renderFns.forEach(({ node }) => {
      ;(node.value as ArrowFunctionExpression).params.shift()
    })

    renderMethods.forEach(({ node }) => {
      node.params.shift()
    })

    // stats
    cntFunc()
  }
}

export default wrap(transformAST)
export const parser = 'babylon'
