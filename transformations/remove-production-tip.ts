
import wrap from '../src/wrapAstTransformation'
import type { ASTTransformation } from '../src/wrapAstTransformation'
import {getCntFunc} from "../src/report";
import type { MemberExpression , Identifier} from 'jscodeshift'

export const transformAST: ASTTransformation = ({ root, j }) => {
  const cntFunc = getCntFunc('remove-production-tip', global.outputReport)
  const productionTipAssignment = root.find(
    j.AssignmentExpression,
    n =>
      j.MemberExpression.check(n.left) &&
      (n.left.property as Identifier).name === 'productionTip' &&
      ((n.left.object as MemberExpression).property as Identifier).name === 'config' &&
      ((n.left.object as MemberExpression).object as Identifier).name === 'Vue'
  )

  if (productionTipAssignment.length < 1) return

  productionTipAssignment.remove()
  cntFunc();
}

export default wrap(transformAST)
export const parser = 'babylon'
