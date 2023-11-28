
import {
    ASTPath,
    CallExpression, ClassDeclaration,
    ClassMethod, Collection,
    Core,
    FunctionDeclaration, Identifier,
    JSCodeshift,
    ObjectExpression, ObjectProperty,
    StringLiteral, VariableDeclaration
} from "jscodeshift";
import {convertToKebabCase} from "../../src/operationUtils";
import * as K from "ast-types/gen/kinds";
import {ContextCollections} from "./ContextCollections";


/**
 * Replacement of emit with properties decorator
 * @param classComponent
 * @param j
 * @param root
 * @param collections
 */
export function transformEmitDecorators(classComponent: Collection<ClassDeclaration>, j: JSCodeshift, root: Collection, collections: ContextCollections) {
    const propertiesWithEmitDecorator: Collection<ClassMethod> = classComponent.find(j.ClassMethod, {
        kind: 'method',
        // @ts-ignore
        decorators: {
            0: {
                expression: {
                    callee: {
                        name: 'Emit'
                    }
                }
            }
        }
    })
    let items = generateDefineEmitsDeclaration(root, j, propertiesWithEmitDecorator);
    if (items) collections.replacements.push(items);
    if (propertiesWithEmitDecorator.length > 0) {
        collections.collectionsToRemove.push(propertiesWithEmitDecorator);
        propertiesWithEmitDecorator.forEach(emit => collections.replacements.push(generateEmitFunction(root, j, emit)));
    }
}

/**
 * Generate define emits node
 *
 * From:
 *   @Emit('reset')
 *   resetCount() {
 *     this.count = 0;
 *   }
 *
 * To:
 *   const emit = defineEmits<{
 *     (e: 'reset'): void
 *   }>()
 *
 * @param root
 * @param j
 * @param propertiesWithEmitDecorator
 */
function generateDefineEmitsDeclaration(root: ReturnType<Core>, j: JSCodeshift, propertiesWithEmitDecorator: Collection<ClassMethod>): VariableDeclaration | null {
    const emitSet: ObjectProperty[] = [];
    const emitNames: Set<string> = new Set();
    let emitNamesSize = 0;
    propertiesWithEmitDecorator.forEach(nodePath => {
        const {key, decorators} = nodePath.node;

        if (decorators!.length < 1) return;
        let argValue: undefined | string = undefined;
        let argType;
        const expression: CallExpression = decorators![0].expression as CallExpression;
        if(expression.arguments.length > 0 && expression.arguments[0].type === 'StringLiteral') {
            argValue = (expression.arguments[0] as StringLiteral)?.value;
        } else if(expression.arguments.length > 0 && expression.arguments[0].type === 'ObjectExpression') {
            (expression.arguments[0] as ObjectExpression).properties.forEach((prop: any) => {
                if(prop.key.name === 'name') {
                    argValue = prop.value.value;
                }
                if(prop.key.name === 'type') {
                    argType = prop.value;
                }
            });
        }
        let emit = j(j.objectProperty(j.identifier('e'), j.identifier("'" + convertToKebabCase(argValue || (key as Identifier).name) + "'"))).toSource();
        if (argType) {
            emit = emit + ', ' + j(j.objectProperty(j.identifier('value'), j.identifier(j(argType).toSource().toString().toLowerCase()))).toSource();
        }
        emitNames.add(argValue as string || (key as Identifier).name as string);
        if(emitNamesSize !== emitNames.size) {
            emitSet.push(j.objectProperty(j.identifier('(' + emit + ')'), j.identifier('void')));
            emitNamesSize = emitNames.size;
        }
    });
    root.find(j.CallExpression, {  callee: {    property: {      name: '$emit'    }  }}).forEach(nodePath => {
        const emit = j(j.objectProperty(j.identifier('e'), j.identifier("'" + convertToKebabCase((nodePath.node.arguments[0] as StringLiteral).value + "'")))).toSource();
        emitNames.add((nodePath.node.arguments[0] as StringLiteral).value as string);
        if(emitNamesSize !== emitNames.size) {
            emitSet.push(j.objectProperty(j.identifier('(' + emit + ')'), j.identifier('void')));
            emitNamesSize = emitNames.size;
        }
    });
    if(emitSet.length < 1) return null;
    const emits = j(j.objectExpression(emitSet)).toSource();
    return j.variableDeclaration('const', [
        j.variableDeclarator(
            j.identifier('emits'),
            j.callExpression(
                j.identifier('defineEmits<'+ emits +'>' ),
                []
            )
        )
    ]);
}

/**
 * Generate emit function
 * From:
 *  @Emit('reset')
 *  resetCount() {
 *  this.count = 0;
 *  }
 *  To:
 *  function resetCount() {
 *    count = 0;
 *    emit('reset');
 *  }
 * @param root
 * @param j
 * @param propertiesWithEmitDecorator
 */
function generateEmitFunction(root: ReturnType<Core>, j: JSCodeshift, propertiesWithEmitDecorator: ASTPath<ClassMethod>): FunctionDeclaration {
    const {key, decorators, comments, returnType, body, params, async} = propertiesWithEmitDecorator.node;
    let kebabCaseEventName
    // Extract the name of the event from the emit decorator converted to kebabCase
    if((decorators![0].expression as CallExpression).arguments.length > 0){
        if((decorators![0].expression as CallExpression)?.arguments[0].type === 'StringLiteral'){
            kebabCaseEventName = convertToKebabCase(((decorators![0].expression as CallExpression)?.arguments[0] as StringLiteral).value);
        } else {
            (((decorators![0].expression as CallExpression)?.arguments[0] as ObjectExpression)).properties.forEach((prop: any) => {
                if(prop.key.name === 'name') {
                    kebabCaseEventName = convertToKebabCase(prop.value.value);
                }
            });
            kebabCaseEventName = convertToKebabCase((kebabCaseEventName) ? kebabCaseEventName: (key as Identifier).name);
        }

    } else{
        kebabCaseEventName = convertToKebabCase((key as Identifier).name)
    }
    // create a new array with the event name as first parameter
    const newParams: K.ExpressionKind[] = [j.stringLiteral(kebabCaseEventName)];

    // Filter any ReturnStatements and add their argument to the newParams array
    const filteredBody = body;
    filteredBody.body = body.body.filter((data: any) => {
        if (data.type === "ReturnStatement") {
            newParams.push(data.argument);
        } else {
            params.forEach((param: Identifier) => {
                newParams.push(j.identifier(param.name));
            });
        }
        return data.type !== "ReturnStatement";
    });

    // Add the remaining statements to the filtered body and emit the event
    filteredBody.body.push(j.expressionStatement(j.callExpression(j.identifier('emit'), newParams)));

    // Create the arrow function expression
    const emitFunction = j.functionDeclaration(j.identifier((key as Identifier).name), params, filteredBody);
    emitFunction.returnType = returnType;
    emitFunction.async = async;

    // Create the variable declaration for the emit function

    emitFunction.comments = comments;
    return emitFunction;
}
