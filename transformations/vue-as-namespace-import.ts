
import wrap from '../src/wrapAstTransformation'
import type { ASTTransformation } from '../src/wrapAstTransformation'
import {getCntFunc} from "../src/report";

// import Vue from 'vue' -> import * as Vue from 'vue'
export const transformAST: ASTTransformation = ({ j, root }) => {
  const cntFunc = getCntFunc('vue-as-namespace-import', global.outputReport)
  const importDecl = root.find(j.ImportDeclaration, {
    source: {
      value: 'vue'
    }
  })

  const importDefaultSpecifiers = importDecl.find(j.ImportDefaultSpecifier)

  if (importDefaultSpecifiers.length < 1) return

  importDefaultSpecifiers.replaceWith(({ node }) => {
    return j.importNamespaceSpecifier(node.local)
  })

  cntFunc()
}

export default wrap(transformAST)
export const parser = 'babylon'
