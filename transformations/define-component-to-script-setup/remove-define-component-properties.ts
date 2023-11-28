
import {Collection, ExportDefaultDeclaration, JSCodeshift} from "jscodeshift";

export function removeDefineComponentProperties(root: Collection<any>, j: JSCodeshift, defineComponent: Collection<ExportDefaultDeclaration>) {
  const defineComponentName = defineComponent.find(j.ObjectProperty, {key: {name: 'name'}});
  const defineAddComponentComponents = defineComponent.find(j.ObjectProperty, {key: {name: 'components'}});
  const defineAddComponentCustomOptions = defineComponent.find(j.ObjectProperty, {key: {name: 'customOptions'}});
  const defineAddComponentInheritAttrs = defineComponent.find(j.ObjectProperty, {key: {name: 'inheritAttrs'}});
  defineComponentName.remove();
  defineAddComponentComponents.remove();
  defineAddComponentCustomOptions.remove();
  defineAddComponentInheritAttrs.remove();
}
