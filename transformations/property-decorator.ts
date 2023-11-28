
import type {ASTTransformation} from '../src/wrapAstTransformation'
import wrap from '../src/wrapAstTransformation'
import {getCntFunc} from '../src/report'
import {
  ASTPath,
  ClassDeclaration,
  Collection,
  Decorator,
  EmptyStatement,
  ExportDefaultDeclaration,
  ExportNamedDeclaration,
  Identifier,
  JSCodeshift,
} from "jscodeshift";
import {ContextCollections} from "./property-decorator/ContextCollections";

import {transformReactiveProps} from "./property-decorator/convert-reactive-props";
import {transformImports} from "./property-decorator/convert-imports";
import {transformDataProperties} from "./property-decorator/convert-data-properties";
import {transformProps} from "./property-decorator/convert-prop-properties";
import {transformPropsCalls} from "./property-decorator/convert-prop-calls";
import {transformEmitDecorators} from "./property-decorator/convert-emit-properties";
import {transformGlobalProperties} from "./property-decorator/convert-global-properties";
import {transformInjectDecorators} from "./property-decorator/convert-inject-decorator";
import {transformProvideDecorators} from "./property-decorator/convert-provide-decorator";
import {transformRefDecorators} from "./property-decorator/convert-ref-decorator";
import {transformGetters} from "./property-decorator/convert-getters";
import {transformMethods} from "./property-decorator/convert-methods";
import {transformWatchDecorators} from "./property-decorator/convert-watcher-decorator";
import {transformEmitCalls} from "./property-decorator/convert-emit-calls";
import {transformNextTickCalls} from "./property-decorator/convert-nextTick";
import {transformGettextCalls} from "./property-decorator/convert-gettext-calls";
import {transformRouterCalls} from "./property-decorator/convert-router-calls";
import {transformStoreCalls} from "./property-decorator/convert-store-calls";
import {transformStaticCalls} from "./property-decorator/convert-static-calls";
import {transformThisCalls} from "./property-decorator/convert-this-calls";
// import {transformAddDefineExpose} from "./property-decorator/convert-add-defineExpose";

function findClassDeclarationWithComponentDecorator(root: Collection, j: JSCodeshift): Collection<ClassDeclaration> {
  return root.find(j.ClassDeclaration, {
    // @ts-ignore
    decorators: {
      0: {
        type: 'Decorator'
      }
    }
  })
    .filter((declaration: ASTPath<ClassDeclaration>) => {
      if (!("decorators" in declaration.node)) {
        return false
      }

      const decorators: Decorator[] = (declaration.node.decorators as Decorator[]);
      let identifier: Identifier;

      switch (decorators[0].expression.type) {
        case 'CallExpression':
          identifier = (decorators[0].expression.callee as Identifier)
          break;
        case 'Identifier':
          identifier = decorators[0].expression
          break;
        default:
          return false
      }

      return identifier.name === 'Component'
    });
}

/**
 * Remove class export/class declaration if empty else add comment
 */
function removeClassDeclaration(exportDeclaration: Collection<ExportNamedDeclaration | ExportDefaultDeclaration>, j: JSCodeshift) {
  exportDeclaration.replaceWith(path => {
    const declaration: ClassDeclaration = <ClassDeclaration>path.node.declaration;
    // Class declaration has not an empty body
    declaration.body.body = declaration.body.body.filter(item => item !== null)
    if (declaration?.body.body.length > 0) {
      const newNode = path.node;

      // Add remove comment to class declaration
      const todoComment = j.commentLine(' CODEMOD-TODO: Remove');
      if (newNode.comments) {
        newNode.comments.push(todoComment);
      } else {
        newNode.comments = [todoComment];
      }

      return newNode;
    }

    // Remove class declaration, but keep comments / description
    const emptyStatement: EmptyStatement = j.emptyStatement();
    emptyStatement.comments = path.node.comments;
    return emptyStatement;
  });
}

export const transformAST: ASTTransformation = ({root, j}) => {
  const cntFunc = getCntFunc('property-decorator', global.outputReport)

  let exportDeclaration: Collection<ExportNamedDeclaration | ExportDefaultDeclaration> = root.find(j.ExportNamedDeclaration);

  if (exportDeclaration.length < 1) {
    exportDeclaration = root.find(j.ExportDefaultDeclaration);
  }

  const classComponent: Collection<ClassDeclaration> = findClassDeclarationWithComponentDecorator(root, j);

  if (classComponent.length < 1) return;

  const collections: ContextCollections = {
    importFromVue: new Set(),
    collectionsToRemove: [],
    replacements: [],
    reactiveProperties: [],
    propNames: [],
    publicMethods: [],
  }

  transformProps(classComponent, j, root, collections);
  transformPropsCalls(classComponent, j, root, collections)
  transformEmitDecorators(classComponent, j, root, collections);
  transformGlobalProperties(classComponent, j, root, collections);
  transformInjectDecorators(classComponent, j, root, collections);
  transformProvideDecorators(classComponent, j, root, collections);
  transformDataProperties(classComponent, j, root, collections);
  transformRefDecorators(classComponent, j, root, collections);
  transformGetters(classComponent, j, root, collections);
  transformMethods(classComponent, j, root, collections);
  transformWatchDecorators(classComponent, j, root, collections);
  transformEmitCalls(j, root);
  transformNextTickCalls(j, root, collections);
  transformGettextCalls(j, root);
  transformRouterCalls(j, root);
  transformStoreCalls(root, j);
  transformStaticCalls(classComponent, root, j);
  transformThisCalls(root, j);
  transformReactiveProps(root, j, collections);
  transformImports(root, j, collections);
  // transformAddDefineExpose(classComponent, j, root, collections);

  // Insert new code and remove old nodes
  exportDeclaration.insertAfter(collections.replacements);
  collections.collectionsToRemove.forEach((collection: Collection) => {
    collection.replaceWith(() => null)
  });

  removeClassDeclaration(exportDeclaration, j);
  cntFunc();
}

export default wrap(transformAST);
export const parser = 'babylon';
