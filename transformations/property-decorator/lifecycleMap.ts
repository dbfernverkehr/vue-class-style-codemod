
export const lifecycleMap: { [key: string]: string | null } = {
  created: null,
  beforeCreate: null,
  beforeMount: 'onBeforeMount',
  mounted: 'onMounted',
  beforeUpdate: 'onBeforeUpdate',
  updated: 'onUpdated',
  beforeUnmount: 'onBeforeUnmount',
  unmounted: 'onUnmounted',
  errorCaptured: 'onErrorCaptured',
  renderTracked: 'onRenderTracked',
  renderTriggered: 'onRenderTriggered',
  activated: 'onActivated',
  deactivated: 'onDeactivated',
  destroyed: 'onUnmounted',
  beforeDestroy: 'onBeforeUnmount',
}
