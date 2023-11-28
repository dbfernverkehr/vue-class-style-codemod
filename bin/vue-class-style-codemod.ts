#!/usr/bin/env node

import * as fs from 'fs'
import * as path from 'path'
import Module from 'module'

import * as globby from 'globby'

import createDebug from 'debug'
import { question } from 'readline-sync'

import builtInTransformations from '../transformations'
import { excludedTransformations } from '../transformations'
import vueTransformations from '../vue-transformations'
import { excludedVueTransformations } from '../vue-transformations'
import runTransformation from '../src/runTransformation'
import { transform as packageTransform } from '../src/packageTransformation'

import type { TransformationModule } from '../src/runTransformation'
import { formatterOutput, cliInstance } from '../src/report'
import { ruleDescription } from '../src/ruleDescription'

const debug = createDebug('vue-class-style-codemod:cli')
let processFilePath: string[] = []
const yargs = require('yargs')
const {
  _: files,
  transformation: transformationName,
  runAllTransformation: runAllTransformation,
  reportFormatter: formatter,
  params
} = yargs
  .usage('Usage: vue-class-style-codemod [file pattern] <option>')
  .option('transformation', {
    alias: 't',
    type: 'string',
    conflicts: 'runAllTransformation',
    describe: 'Name or path of the transformation module'
  })
  .option('params', {
    alias: 'p',
    describe: 'Custom params to the transformation'
  })
  .option('runAllTransformation', {
    alias: 'a',
    type: 'boolean',
    conflicts: 'transformation',
    describe: 'run all transformation module'
  })
  .option('reportFormatter', {
    alias: 'f',
    type: 'string',
    describe: 'Specify an output report formatter',
    default: 'table',
    choices: ['table', 'detail', 'log']
  })
  .example([
    [
      'vue-class-style-codemod ./src -a',
      'Run all rules to convert all relevant files in the ./src folder'
    ],
    [
      'vue-class-style-codemod ./src/components/HelloWorld.vue -t slot-attribute',
      'Run slot-attribute rule to convert HelloWorld.vue'
    ]
  ])
  .help()
  .alias('h', 'help')
  .alias('v', 'version').argv

let logger: Console = console
if (formatter === 'log') {
  let options = {
    flags: 'w',
    BufferEncoding: 'utf8' // utf-8
  }
  let stdout = fs.createWriteStream('./vue_codemod.log', options)
  logger = new console.Console(stdout)
}

// TODO: port the `Runner` interface of jscodeshift
async function main() {
  if (
    (transformationName == undefined || transformationName == '') &&
    runAllTransformation == undefined
  ) {
    console.log(
      'You need at least one option in command, enter vue-class-style-codemod -h to see help. '
    )
    return
  }

  // Remind user to back up files
  const answer = question(
    'Warning!!\n' +
      'This tool may overwrite files. Please use version control tools or back up your code in advance.\n' +
      'Press enter or enter yes or enter Y to continue:'
  )
  if (!['', 'yes', 'Y'].includes(answer.trim())) {
    console.log('Abort!!!')
    return
  }

  // init global params
  global.globalApi = []
  global.manualList = []
  global.scriptLine = 0
  global.outputReport = {}

  const resolvedPaths = globby.sync(
    (files as string[]).concat('!node_modules'),
    { gitignore: true }
  )
  if (transformationName != undefined) {
    debug(`run ${transformationName} transformation`)
    const transformationModule = loadTransformationModule(transformationName)
    processTransformation(
      resolvedPaths,
      transformationName,
      transformationModule
    )

    // do not update package.json in general, uncomment if you want to
    // if (packageTransform()) {
    //   processFilePath.push('package.json')
    //   global.outputReport['package transformation'] = 1
    // }
  }

  if (runAllTransformation) {
    const totalRule: number =
      Object.getOwnPropertyNames(builtInTransformations).length +
      Object.getOwnPropertyNames(vueTransformations).length -
      excludedTransformations.length -
      excludedVueTransformations.length
    cliInstance.start(totalRule, 0, { process: 'Transformation begins' })
    debug(`run all transformation`)
    for (let key in builtInTransformations) {
      if (!excludedTransformations.includes(key)) {
        cliInstance.increment({ process: `Executing: ${key}` })
        processTransformation(resolvedPaths, key, builtInTransformations[key])
      } else {
        debug(
          `skip ${key} transformation, Because it will run in other transformation`
        )
      }
    }

    for (let key in vueTransformations) {
      if (!excludedVueTransformations.includes(key)) {
        cliInstance.increment({ process: `Executing: ${key}` })
        processTransformation(resolvedPaths, key, vueTransformations[key])
      } else {
        debug(
          `skip ${key} transformation, Because it will run in other transformation`
        )
      }
    }
    if (packageTransform()) {
      processFilePath.push('package.json')
      global.outputReport['package transformation'] = 1
    }
  }
  cliInstance.update(cliInstance.getTotal(), {
    process: 'Transformation finished! '
  })
  cliInstance.stop()
  formatterOutput(processFilePath, formatter, logger)
}
/**
 * process files by Transformation
 * @param resolvedPaths resolved file path
 * @param transformationName transformation name
 * @param transformationModule transformation module
 */
function processTransformation(
  resolvedPaths: string[],
  transformationName: string,
  transformationModule: TransformationModule
) {
  if (formatter === 'log')
    logger.time(`Processing use ${transformationName} transformation`)
  let ruleProcessFile: string[] = []
  const extensions = ['.js', '.ts', '.vue', '.jsx', '.tsx']
  for (const p of resolvedPaths) {
    debug(`Processing ${p}…`)
    let retainedSource: string = fs
      .readFileSync(p)
      .toString()
      .split('\r\n')
      .join('\n')
    const fileInfo = {
      path: p,
      source: retainedSource
    }
    const extension = (/\.([^.]*)$/.exec(fileInfo.path) || [])[0]

    if (!extension) {
      debug(`skip ${fileInfo.path} file because it has no extension. Allowed extensions are: ${extensions}.`)
      continue
    }
    if (!extensions.includes(extension)) {
      debug(`skip ${fileInfo.path} file because not end with ${extensions}.`)
      continue
    }
    if(fileInfo.path.includes('.spec')){
      debug(`skip ${fileInfo.path} file because it is an test file`);
      continue;
    }
    try {
      debug(`Processing file: ${fileInfo.path}`)
      const result = runTransformation(
        fileInfo,
        transformationModule,
        params as object,
        transformationName
      )

      if (retainedSource != result) {
        fs.writeFileSync(p, result)
        ruleProcessFile.push(p)
        if (processFilePath.indexOf(p) == -1) {
          processFilePath.push(p)
        } else {
          debug(`Skip this file ${p} because of duplicate statistics`)
        }
      }
    } catch (e) {
      console.error(e)
    }
  }
  if (ruleProcessFile.length) {
    if (formatter === 'log')
      logger.timeEnd(`Processing use ${transformationName} transformation`)
    if (
      ruleDescription.hasOwnProperty(transformationName) &&
      (formatter === 'detail' || formatter === 'log')
    ) {
      let ruleOutput: { [key: string]: any } = {}
      ruleOutput.rule_name = transformationName
      // @ts-ignore
      ruleOutput.website = ruleDescription[transformationName].description
      ruleOutput.transformed_files = ruleProcessFile
      if (formatter === 'log') logger.log(ruleOutput)
    }
  }
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
/**
 * load Transformation Module
 * @param nameOrPath
 * @returns
 */
function loadTransformationModule(nameOrPath: string) {
  let jsTransformation = builtInTransformations[nameOrPath]
  let vueTransformation = vueTransformations[nameOrPath]
  if (jsTransformation) {
    return jsTransformation
  }
  if (vueTransformation) {
    return vueTransformation
  }

  const customModulePath = path.resolve(process.cwd(), nameOrPath)
  if (fs.existsSync(customModulePath)) {
    const requireFunc = Module.createRequire(
      path.resolve(process.cwd(), './package.json')
    )
    // TODO: interop with ES module
    // TODO: fix absolute path
    return requireFunc(`./${nameOrPath}`)
  }

  throw new Error(`Cannot find transformation module ${nameOrPath}`)
}
