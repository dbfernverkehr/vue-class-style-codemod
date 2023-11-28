
import {ClassDeclaration, Collection, JSCodeshift, Property} from "jscodeshift";
import {ContextCollections} from "./ContextCollections";

export function transformAddDefineExpose(classComponent: Collection<ClassDeclaration>, j: JSCodeshift, root: Collection, collections: ContextCollections) {
  if(collections.publicMethods.length > 0){
    const imports = root.find(j.ImportDeclaration);
    const n = imports.length;
    const properties : Property[] = [];
    collections.publicMethods.forEach((method) => {
      const property = j.property('init', j.identifier(method), j.identifier(method))
      property.shorthand = true;
      property.computed = false;
      property.method = false;
      properties.push(property);
    });
    const callExpression = j(j.callExpression(j.identifier('defineExpose'), [j.objectExpression(properties)])).toSource();
    if(n){
      j(imports.at(n-1).get()).insertAfter(callExpression); // after the imports
    }else{
      root.get().node.program.body.unshift(callExpression); // beginning of file
    }
  }
}
