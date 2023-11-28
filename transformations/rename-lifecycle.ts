
import wrap from '../src/wrapAstTransformation'
import type { ASTTransformation } from '../src/wrapAstTransformation'
import { getCntFunc } from '../src/report'

const lifecycleMap: { [key: string]: string } = {
  destroyed: 'unmounted',
  beforeDestroy: 'beforeUnmount',
}

export const transformAST: ASTTransformation = ({ root, j }) => {
  const cntFunc = getCntFunc('rename-lifecycle', global.outputReport)
  const methodArray: any[] = [j.ObjectProperty, j.ObjectMethod, j.ClassProperty]
  methodArray.forEach(method => {
    const methods = root.find(method)
    if (methods.length) {
      methods.forEach(path => {
        // @ts-ignore
        const beforeReplaceName = path.node.key.name
        const afterReplaceName = lifecycleMap[beforeReplaceName]
        if (
          afterReplaceName &&
          path.parent?.parent?.value?.type === 'ExportDefaultDeclaration'
        ) {
          // @ts-ignore
          path.value.key.name = afterReplaceName
          cntFunc()
        }
      })
    }
  })
}

export default wrap(transformAST)
export const parser = 'babylon'
