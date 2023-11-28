
import type {ASTTransformation} from '../src/wrapAstTransformation'
import wrap from '../src/wrapAstTransformation'
import {getCntFunc} from '../src/report'
import {convertImports} from "./define-component-to-script-setup/convert-imports";
import {convertMethods} from "./define-component-to-script-setup/convert-methods";
import {convertData} from "./define-component-to-script-setup/convert-data";
import {convertSetupFunction} from "./define-component-to-script-setup/convert-setup-function";
import {removeDefineComponentProperties} from "./define-component-to-script-setup/remove-define-component-properties";
import {convertDefineComponentProps} from "./define-component-to-script-setup/convert-define-component-props";
import {convertDefineComponentEmits} from "./define-component-to-script-setup/convert-define-component-emits";
import {convertPropCalls} from "./define-component-to-script-setup/convert-prop-calls";

export const transformAST: ASTTransformation = ({root, j}) => {
  const cntFunc = getCntFunc('define-component-to-script-setup', global.outputReport);
  const defineComponent = root.find(j.ExportDefaultDeclaration, {
    declaration: {
      callee: {
        name: 'defineComponent'
      }
    }
  });
  /**
   * Array of prop names
   ***/
  const propnames: string[] = [];

  if (defineComponent.length < 1) return;
  convertMethods(root, j, defineComponent);
  removeDefineComponentProperties(root, j, defineComponent);
  convertSetupFunction(root, j, defineComponent);
  convertData(root, j, defineComponent);
  convertDefineComponentProps(root, j, defineComponent,propnames);
  convertPropCalls(root, j, defineComponent,propnames);
  convertDefineComponentEmits(root, j, defineComponent);
  convertImports(root, j);

  if (defineComponent.find(j.ObjectProperty).length === 0 && defineComponent.find(j.ObjectMethod).length === 0) {
    defineComponent.remove();
  }
  cntFunc();
}

export default wrap(transformAST);
export const parser = 'babylon';
