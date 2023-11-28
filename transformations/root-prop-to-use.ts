
import wrap from '../src/wrapAstTransformation'
import type { ASTTransformation } from '../src/wrapAstTransformation'

import * as N from 'jscodeshift'
import createDebug from 'debug'
import {getCntFunc} from "../src/report";

const debug = createDebug('vue-class-style-codemod:rule')
type Params = {
  rootPropName: string
  isGlobalApi?: boolean
}

/**
 * Expected to be run after the `createApp` transformation.
 * Transforms expressions like `createApp({ router })` to `createApp().use(router)`
 */
export const transformAST: ASTTransformation<Params> = (
  { root, j, filename },
  { rootPropName, isGlobalApi }
) => {
  const cntFunc = getCntFunc('root-prop-to-use', global.outputReport)
  const appRoots = root.find(j.CallExpression, (node) => {
    if (
      (node.arguments.length === 1 &&
        j.ObjectExpression.check(node.arguments[0])) ||
      isGlobalApi
    ) {
      if (j.Identifier.check(node.callee) && node.callee.name === 'createApp') {
        return true
      }
        return j.MemberExpression.check(node.callee) &&
        j.Identifier.check(node.callee.object) &&
        node.callee.object.name === 'Vue' &&
        j.Identifier.check(node.callee.property) &&
        node.callee.property.name === 'createApp'
    } else {
      return false
    }
  })

  if (appRoots == undefined || appRoots.length == 0) {
    debug('No target Approots, jump out of this transition. ')
    return
  }

  // add global api to main.js used by component
  if (isGlobalApi) {
    debug(filename)
    if (global.globalApi == undefined || global.globalApi.length == 0) {
      debug('global api is empty')
      return
    }
    debug('add global api in createApp')
    const addImport = require('./add-import')
    for (let i in global.globalApi) {
      let api = global.globalApi[i]

      // add import
      addImport.transformAST(
        { root, j },
        {
          specifier: {
            type: 'default',
            local: api.name
          },
          source: '../' + api.path
        }
      )

      // add use
      appRoots.replaceWith(({ node: createAppCall }) => {
        return j.callExpression(
          j.memberExpression(createAppCall, j.identifier('use')),
          [j.identifier(api.name)]
        )
      })
    }

    if (global.globalApi.length > 0) {
      cntFunc()
    }

    return
  }

  appRoots.replaceWith(({ node: createAppCall }) => {
    const rootProps = createAppCall.arguments[0] as N.ObjectExpression
    const propertyIndex = rootProps.properties.findIndex(
      // @ts-ignore
      p => p.key && p.key.name === rootPropName
    )

    if (propertyIndex === -1) {
      return createAppCall
    }

    // @ts-ignore
    const [{ value: pluginInstance }] = rootProps.properties.splice(
      propertyIndex,
      1
    )

    return j.callExpression(
      j.memberExpression(createAppCall, j.identifier('use')),
      [pluginInstance]
    )
  })
  cntFunc()
}

export default wrap(transformAST)
export const parser = 'babylon'
