
import {
    Collection,
    ExportDefaultDeclaration,
    Identifier,
    JSCodeshift,
    ObjectExpression, ObjectMethod,
    ObjectProperty, Property, PropertyPattern, RestProperty, SpreadElement, SpreadProperty, SpreadPropertyPattern
} from "jscodeshift";
/**
 * Generate define props node
 *
 * From:
 *   props: {
 *     counter1: {
 *       required: false,
 *       type: Boolean
 *     },
 *     counter2: {
 *       required: true,
 *       type: Boolean
 *     },
 *   }
 *
 * To:
 *   const props = defineProps({
 *     counter1?: boolean,
 *     counter2: boolean
 *   })
 *
 * @param root
 * @param j
 * @param propertiesWithPropDecorator
 */
export function convertDefineComponentProps(root: Collection<any>, j: JSCodeshift, defineComponent: Collection<ExportDefaultDeclaration>, propnames: string[]) {
  const propsProperties = defineComponent.find(j.ObjectProperty, node => (node.key as Identifier).name === 'props');
  propsProperties.forEach(propNodePath => {
    let hasDefault = false;
    const props : ObjectProperty[] = [];
    const defaults : ObjectProperty[] = [];
    if(!('properties' in propNodePath.node.value)) return;
        const properties : (Property | ObjectProperty| SpreadElement | SpreadProperty | ObjectMethod)[] | (ObjectProperty | Property | SpreadProperty | PropertyPattern | SpreadPropertyPattern | RestProperty)[] = propNodePath.node.value.properties;
    if (!properties) return;
    properties.forEach(property => {
        if(!('key' in property)) return;
      const key = property.key as Identifier;
      propnames.push(key.name);
      let required: string | boolean | number | RegExp | null = false;
      let typepar: any = null;
      let defaultval = null;
      let typename: string = '';
      if(property.type === 'ObjectProperty' && (property as ObjectProperty).value.type === 'ObjectExpression') {
        const value = property.value as ObjectExpression;
        // @ts-ignore
        const requiredProperty = value.properties.find(prop => prop.key.name === 'required');
        // @ts-ignore
          const defaultProperty = value.properties.find(prop => prop.key.name === 'default');
        // @ts-ignore
        const typeProperty = value.properties.find(prop => prop.key.name === 'type');
        if(requiredProperty && 'value' in requiredProperty && 'value' in requiredProperty.value) {
          required = requiredProperty.value.value!;
        }
        if(typeProperty && 'value' in typeProperty) {
            typepar = typeProperty.value;
        }
        if (defaultProperty && 'value' in defaultProperty) {
          hasDefault = true;
          defaultval = defaultProperty.value;
          defaults.push(j.objectProperty(key, defaultval));
        }
      } else if(property.type === 'ObjectProperty' && (property as ObjectProperty).value.type === 'Identifier') {
        typepar = property.value as Identifier;
      }
      if(typepar!.type === 'TSAsExpression'){
          typename = j(typepar.typeAnnotation.typeParameters).toSource().toString();
          typename = typename.substring(1, typename.length - 1);
      } else {
          typename = j(typepar!).toSource().toString().toLowerCase();
      }
      if(required) {
          props.push(j.objectProperty(key,j.identifier(typename)));
      }
      else {
          props.push(j.objectProperty(j.identifier(key.name + '?'),j.identifier(typename)));
      }
    });
    const {comments} = propNodePath.node;
    let newNode;
    if(!hasDefault) {
      newNode = j.variableDeclaration('const', [
        j.variableDeclarator(
          j.identifier('props'),
          j.callExpression(
            j.identifier('defineProps<'+ j(j.objectExpression(props)).toSource() +'>'),
            []
          ),
        )
      ]);
    } else {
      newNode = j.variableDeclaration('const', [
        j.variableDeclarator(
          j.identifier('props'),
          j.callExpression(
            j.identifier('withDefaults'),
            [j.callExpression(
              j.identifier('defineProps<' + j(j.objectExpression(props)).toSource() + '>'),
              [//j.objectExpression(objectProperties)
              ]
            ), j.objectExpression(defaults)
            ]
          )
        )
      ]);
    }
    newNode.comments = comments;
    defineComponent.insertAfter(newNode);
  });
  propsProperties.remove();
}
