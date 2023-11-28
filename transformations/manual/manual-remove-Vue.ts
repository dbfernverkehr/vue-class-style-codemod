
import wrap from '../../src/wrapAstTransformation'
import type { ASTTransformation } from '../../src/wrapAstTransformation'
import { pushManualList } from '../../src/report'

export const transformAST: ASTTransformation = context => {
  const { root, j, filename } = context

  const rootNodes: any = root
    .find(j.MemberExpression, {
      object: {
        name: 'Vue'
      }
    })
    .filter((node: any) => node?.value.property?.name !== 'createApp')
  if (rootNodes) {
    rootNodes.forEach((node: any) => {
      const path = filename
      const name = 'Global Vue API is changed to use an application instance'
      const suggest =
        "The rule of thumb is any APIs that globally mutate Vue's behavior are now moved to the app instance."
      const website =
        'https://v3-migration.vuejs.org/breaking-changes/global-api.html#a-new-global-api-createapp'
      pushManualList(path, node, name, suggest, website)
    })
  }
}

export default wrap(transformAST)
export const parser = 'babylon'
