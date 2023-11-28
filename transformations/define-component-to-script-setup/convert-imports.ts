
import {Collection, ImportSpecifier, JSCodeshift} from "jscodeshift";

export function convertImports(root: Collection<any>, j: JSCodeshift) {
  root.find(j.ImportDeclaration, {
    source: {
      value: 'vue'
    }
  }).replaceWith(importNode => {
    if (importNode.node.specifiers!.length > 1) {
      importNode.node.specifiers = importNode.node.specifiers!.filter(specifier => (specifier as ImportSpecifier).imported.name !== 'defineComponent');
      return importNode.node;
    }
    return null;
  });
}
