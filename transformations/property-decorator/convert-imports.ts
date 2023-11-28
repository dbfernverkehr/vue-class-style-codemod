
import {Collection, ImportDeclaration, ImportSpecifier, JSCodeshift} from "jscodeshift";
import {ContextCollections} from "./ContextCollections";

/**
 * Replace vue property decorator import with named vue import
 * @param root
 * @param j
 * @param collections
 */
export function transformImports(root: Collection, j: JSCodeshift, collections: ContextCollections) {
    const propertyDecoratorImports: Collection<ImportDeclaration> = root.find(j.ImportDeclaration, {
        source: {
            value: 'vue-property-decorator'
        }
    });

    const vueImports: Collection<ImportDeclaration> = root.find(j.ImportDeclaration, {
        source: {
            value: 'vue'
        }
    });

    // Replace property decorator and vue import with vue named import
    if (vueImports.length > 0) {
        vueImports.replaceWith(() => getVueImportDeclaration(j, collections));
        propertyDecoratorImports.remove();
    } else {
        propertyDecoratorImports.replaceWith(() => getVueImportDeclaration(j, collections));
    }
}

/**
 * Create vue named import
 * example:
 *  import { ref } from 'vue'
 *
 * @param j
 * @param collections
 */
function getVueImportDeclaration(j: JSCodeshift, collections: ContextCollections) {
    const specifiers: ImportSpecifier[] = [];

    if (collections.importFromVue.size < 1) {
        return null
    }

    collections.importFromVue.forEach(item => {
        const specifier = j.importSpecifier(j.identifier(item));
        specifiers.push(specifier);
    })

    return j.importDeclaration(
        specifiers,
        j.stringLiteral('vue'));
}
