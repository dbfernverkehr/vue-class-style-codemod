
import {ClassDeclaration, ClassProperty, Collection, JSCodeshift} from "jscodeshift";
import {ContextCollections} from "./ContextCollections";
import {generateDataPropertiesDeclaration} from "./convert-data-properties";

/**
 * Replacement of data properties with ref decorator
 * @param classComponent
 * @param j
 * @param root
 * @param collections
 */
export function transformRefDecorators(classComponent: Collection<ClassDeclaration>, j: JSCodeshift, root: Collection, collections: ContextCollections) {
    const propertiesWithRefDecorator: Collection<ClassProperty> = classComponent.find(j.ClassProperty, {
        // @ts-ignore
        decorators: {
            0: {
                expression: {
                    callee: {
                        name: 'Ref'
                    }
                }
            }
        }
    });

    collections.collectionsToRemove.push(propertiesWithRefDecorator);

    propertiesWithRefDecorator.forEach(path => collections.replacements.push(generateDataPropertiesDeclaration(root, j, path, collections)));
}
