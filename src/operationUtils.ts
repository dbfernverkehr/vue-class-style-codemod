

import type { Node } from 'vue-eslint-parser/ast/nodes'
import type { Token } from 'vue-eslint-parser/ast/tokens'
import { Core } from "jscodeshift";
/**
 * The following function is adapted from https://github.com/eslint/eslint/blob/master/lib/linter/rule-fixer.js
 * MIT License https://github.com/eslint/eslint/blob/master/LICENSE
 */

export type Operation = {
  range: number[]
  text: string
}

/**
 * Creates a fix command that inserts text at the specified index in the source text.
 * @param {int} index The 0-based index at which to insert the new text.
 * @param {string} text The text to insert.
 * @returns {Operation} The fix command.
 * @private
 */
export function insertTextAt(index: number, text: string): Operation {
  return {
    range: [index, index],
    text
  }
}

/**
 * Converts CamelCase to kebab-case
 * @param text
 */
export function convertToKebabCase(text:string): string {
  return text.replace(/[A-Z]+(?![a-z])|[A-Z]/g, ($, ofs) => (ofs ? "-" : "") + $.toLowerCase());
}

/**
 * Creates a fix command that inserts text after the given node or token.
 * The fix is not applied until applyFixes() is called.
 * @param {Node|Token} nodeOrToken The node or token to insert after.
 * @param {string} text The text to insert.
 * @returns {Operation} The fix command.
 */
export function insertTextAfter(
  nodeOrToken: Node | Token,
  text: string
): Operation {
  return insertTextAfterRange(nodeOrToken.range, text)
}

/**
 * Creates a fix command that inserts text after the specified range in the source text.
 * The fix is not applied until applyFixes() is called.
 * @param {int[]} range The range to replace, first item is start of range, second
 *      is end of range.
 * @param {string} text The text to insert.
 * @returns {Operation} The fix command.
 */
export function insertTextAfterRange(range: number[], text: string): Operation {
  return insertTextAt(range[1], text)
}

/**
 * Creates a fix command that inserts text before the given node or token.
 * The fix is not applied until applyFixes() is called.
 * @param {Node|Token} nodeOrToken The node or token to insert before.
 * @param {string} text The text to insert.
 * @returns {Operation} The fix command.
 */
export function insertTextBefore(
  nodeOrToken: Node | Token,
  text: string
): Operation {
  return insertTextBeforeRange(nodeOrToken.range, text)
}

/**
 * Creates a fix command that inserts text before the specified range in the source text.
 * The fix is not applied until applyFixes() is called.
 * @param {int[]} range The range to replace, first item is start of range, second
 *      is end of range.
 * @param {string} text The text to insert.
 * @returns {Operation} The fix command.
 */
export function insertTextBeforeRange(
  range: number[],
  text: string
): Operation {
  return insertTextAt(range[0], text)
}

/**
 * Creates a fix command that replaces text at the node or token.
 * The fix is not applied until applyFixes() is called.
 * @param {Node|Token} nodeOrToken The node or token to remove.
 * @param {string} text The text to insert.
 * @returns {Operation} The fix command.
 */
export function replaceText(
  nodeOrToken: Node | Token,
  text: string
): Operation {
  return replaceTextRange(nodeOrToken.range, text)
}

/**
 * Creates a fix command that replaces text at the specified range in the source text.
 * The fix is not applied until applyFixes() is called.
 * @param {int[]} range The range to replace, first item is start of range, second
 *      is end of range.
 * @param {string} text The text to insert.
 * @returns {Operation} The fix command.
 */
export function replaceTextRange(range: number[], text: string): Operation {
  return {
    range,
    text
  }
}

/**
 * Creates a fix command that removes the node or token from the source.
 * The fix is not applied until applyFixes() is called.
 * @param {Node|Token} nodeOrToken The node or token to remove.
 * @returns {Operation} The fix command.
 */
export function remove(nodeOrToken: Node | Token): Operation {
  return removeRange(nodeOrToken.range)
}

/**
 * Creates a fix command that removes the specified range of text from the source.
 * The fix is not applied until applyFixes() is called.
 * @param {int[]} range The range to remove, first item is start of range, second
 *      is end of range.
 * @returns {Operation} The fix command.
 */
export function removeRange(range: number[]): Operation {
  return {
    range,
    text: ''
  }
}

/**
 * Get text of Node
 * @param {Node} node The node to get text
 * @param {string} source The full text of the source code
 * @returns {Operation} The text of the node
 */
export function getText(node: Node, source: string): string {
  const start = node?.range[0]
  const end = node?.range[1]
  return source.slice(start, end)
}

/**
 * Get source code from root node
 * @param root node
 * @param start start index
 * @param end end index
 */
export function getCodeFromRoot(root: ReturnType<Core>, start: number, end: number): string {
  return root.toSource().slice(start, end);
}

/**
 * Trims the given text and removes all carriage returns
 * @param string
 */
export function simplifyFileString(string: string): string {
    return string.trim().replace(/\r\n/g, "\n")
}
