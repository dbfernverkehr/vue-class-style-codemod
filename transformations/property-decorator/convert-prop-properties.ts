
import {
  CallExpression,
  ClassDeclaration,
  ClassProperty,
  Collection,
  Core, Decorator, Identifier,
  JSCodeshift, ObjectMethod,
  ObjectProperty, Property, SpreadElement, SpreadProperty,
  VariableDeclaration
} from "jscodeshift";
import {ContextCollections} from "./ContextCollections";

/**
 * Replacement of props with properties decorator
 * @param classComponent
 * @param j
 * @param root
 * @param collections
 * @param propnames
 */
export function transformProps(classComponent: Collection<ClassDeclaration>, j: JSCodeshift, root: Collection, collections: ContextCollections) {
  const propertiesWithPropDecorator: Collection<ClassProperty> = classComponent.find(j.ClassProperty, {
    // @ts-ignore
    decorators: {
      0: {
        expression: {
          callee: {
            name: 'Prop'
          }
        }
      }
    }
  })

  if (propertiesWithPropDecorator.length > 0) {
    collections.collectionsToRemove.push(propertiesWithPropDecorator);
    collections.replacements.push(generateDefinePropsDeclaration(root, j, propertiesWithPropDecorator, collections.propNames));
  }
}

/**
 * Generate define props node
 *
 * From:
 *   @Prop({
 *     default: 0,
 *     type: Number,
 *   })
 *   public counter?: Number;
 *
 * To:
 *   const props = withDefaults(defineProps<{
 *     counter: Number
 *   }>(),
 *   {
 *     counter: 0
 *   })
 *
 * @param root
 * @param j
 * @param propertiesWithPropDecorator
 * @param propnames
 */
function generateDefinePropsDeclaration(root: ReturnType<Core>, j: JSCodeshift, propertiesWithPropDecorator: Collection<ClassProperty>, propnames: string[]): VariableDeclaration {
  const objectProperties: ObjectProperty[] = [];
  const defaluts: (Property | ObjectProperty | SpreadElement | SpreadProperty | ObjectMethod)[] = [];
  let hasDefaults = false;
  propertiesWithPropDecorator.forEach(nodePath => {
    const {comments} = nodePath.node;
    const key: Identifier = nodePath.node.key as Identifier;
    propnames.push(key.name);
    // @ts-ignore
    const typeAnnotation = j(nodePath.node.typeAnnotation).toSource().replace(': ', '').replace(':', '');
    const decorators: Decorator[] = 'decorators' in nodePath.node ? (nodePath.node.decorators as Decorator[]) : [];
    const required: boolean = 'definite' in nodePath.node ? !!nodePath.node.definite : false;
    let property: ObjectProperty|null = null;
    if (decorators.length < 1) return;

    const expression: CallExpression = decorators[0].expression as CallExpression;

    if (expression.arguments.length < 1) return;
    const propArgument = expression.arguments[0];

    if (propArgument.type === 'ObjectExpression') {
      // @Prop({ default: 'default value' }) -> propB: { type: String }

      for (const prop of propArgument.properties) {
        if (prop.type === 'ObjectProperty' && prop.key.type === 'Identifier' && prop.key.name === 'default') {
          hasDefaults = true;
          prop.key.name = key.name;
          defaluts.push(prop);
        }
      }
    }
    property = j.objectProperty(j.identifier(key.name), j.identifier(typeAnnotation))
    if (property) {
      property.comments = comments;
      if(!required){
        property.key = j.identifier(key.name + '?');
      }
      objectProperties.push(property);
    }
  });
  let prop;
  let props = j(j.objectExpression(objectProperties)).toSource()
  prop = j.callExpression(
    j.identifier('defineProps<' + props + '>'),
    []
  );
  if(hasDefaults){
      prop = j.callExpression(
        j.identifier('withDefaults'),
        [prop,
          j.objectExpression(defaluts)
        ]
      );
  }
  return j.variableDeclaration('const', [
    j.variableDeclarator(
      j.identifier('props'),
      prop)]);
}
