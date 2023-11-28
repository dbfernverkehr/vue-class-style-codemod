
import {Collection, ExpressionStatement, FunctionDeclaration, VariableDeclaration} from "jscodeshift";
import * as K from "ast-types/gen/kinds";

export type ContextCollections = {
  /**
   * Set to collect vue imports @see {@link getVueImportDeclaration}
   */
  importFromVue: Set<string>;
  /**
   * Array to collect statements to remove
   */
  collectionsToRemove: Collection[];
  /**
   * Array to collect new statements
   */
  replacements: (ExpressionStatement | VariableDeclaration | FunctionDeclaration | K.StatementKind )[];
  /**
   * Array to collect reactive props to convert
   */
  reactiveProperties: string[];
  /**
   * Array to collect propNames
   */
  propNames: string[];
  /**
   * Array to collect public methodNames
   */
  publicMethods: string[];
}
