
import { runTest } from '../../src/testUtils'

runTest(
  'replace @Prop decorator',
  'property-decorator',
  'prop',
  'vue',
  'script'
)

runTest(
  'replace @Inject decorator',
  'property-decorator',
  'inject',
  'vue',
  'script'
)

runTest(
  'replace @Provide decorator',
  'property-decorator',
  'provide',
  'vue',
  'script'
)

runTest(
  'replace @Watch decorator',
  'property-decorator',
  'watch',
  'vue',
  'script'
)

runTest(
  'replace @Emit decorator',
  'property-decorator',
  'emit',
  'vue',
  'script'
)

runTest(
  'replace @Ref decorator',
  'property-decorator',
  'ref',
  'vue',
  'script'
)

runTest(
  'replace this.$router, this.$route and this.$store',
  'property-decorator',
  'store-router',
  'vue',
  'script'
)

runTest(
  'replace some sample methods',
  'property-decorator',
  'method',
  'vue',
  'script'
)

runTest(
  'replace static expressions',
  'property-decorator',
  'static',
  'vue',
  'script'
)

