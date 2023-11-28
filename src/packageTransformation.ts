
import * as globby from 'globby'
import createDebug from 'debug'
import * as fsExtra from 'fs-extra'

const debug = createDebug('vue-class-style-codemod:rule')

type AddOrUpdateConfig = {
  [name: string]: string
}

type Config = {
  [name: string]: AddOrUpdateConfig
}

const globalAddConfig: {
  [name: string]: Config
} = {
  global: {
    add: {},
    update: {
      vue: '^3.1.1',
      vuex: '^4.0.1',
      'vue-router': '^4.0.8',
      'vue-i18n': '^9.1.6'
    },
    delete: { 'vue-template-compiler': '', '@vue/composition-api': '' }
  },
  dependencies: {
    add: {},
    update: {},
    delete: {}
  },
  peerDependencies: {
    add: {},
    update: {},
    delete: {}
  },
  devDependencies: {
    add: {
      '@vue/compiler-sfc': '^3.1.1'
    },
    update: {
      '@vue/cli-plugin-babel': '^4.5.0',
      '@vue/cli-service': '^4.5.0'
    }
  }
}

/**
 * Upgrade the package.json file
 * @returns Whether the conversion was successful
 */
export function transform(): boolean {
  debug('Find package.json.')
  const resolvedPaths = globby.sync('package.json' as string)
  if (resolvedPaths.length <= 0) {
    console.warn('package.json is not exists.')
    return false
  }

  let packageObj: JSON = fsExtra.readJsonSync(resolvedPaths[0])

  if (JSON.stringify(packageObj) == JSON.stringify(process(packageObj))) {
    return false
  }

  packageObj = process(packageObj)

  fsExtra.writeJsonSync(resolvedPaths[0], packageObj, { spaces: 2 })
  return true
}
/**
 * Modify the configuration of dependencies
 * @param packageObj package.json source
 */
export function process(packageObj: any): any {
  Object.keys(globalAddConfig)
    .filter(key => {
      return key != 'global'
    })
    .forEach(key => {
      if (packageObj[key] != undefined) {
        debug(`Process ${key}`)
        packageObj[key] = processCore(packageObj[key], globalAddConfig.global)
        packageObj[key] = processCore(packageObj[key], globalAddConfig[key])
      }
    })

  if (packageObj?.dependencies?.hasOwnProperty('element-ui')) {
    delete packageObj.dependencies['element-ui']
    packageObj.dependencies['element-plus'] = '^1.0.2-beta.55'
  }
  return packageObj
}
/**
 * process package.json
 * @param packageObj dependencies...
 * @param config key of config
 * @returns package.json
 */
function processCore(packageObj: any, config: Config): any {
  config.add &&
    Object.keys(config.add).forEach(key => {
      packageObj[key] = config.add[key]
    })

  config.update &&
    Object.keys(config.update).forEach(key => {
      if (packageObj[key] != undefined) {
        packageObj[key] = config.update[key]
      }
    })

  config.delete &&
    Object.keys(config.delete).forEach(key => {
      delete packageObj[key]
    })
  return packageObj
}
