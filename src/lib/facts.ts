import facts from '../data/facts.json'
import connectors from '../data/connectors.json'

import connector from '../data/connector.json'

const n = (x: number) => x.toLocaleString('en')
const longDate = (iso: string) => new Date(iso + 'T00:00:00Z').toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' })

/**
 * Every count the site states, formatted, keyed by the {token} a data file
 * writes. GoCommerce's come from src/data/facts.json (scripts/read-facts.mjs);
 * the backends are Svelte Commerce's measured connectors (src/data/connectors.json).
 */
export const counts = {
  modules: n(facts.modules),
  binaryModules: n(facts.binaryModules),
  paymentModules: n(facts.paymentModules),
  fulfilmentModules: n(facts.fulfilmentModules),
  apiOperations: n(facts.apiOperations),
  coreOperations: n(facts.coreOperations),
  moduleOperations: n(facts.moduleOperations),
  adminScreens: n(facts.adminScreens),
  tests: n(facts.tests),
  /** "1,900": the test count rounded down to the hundred, for "over 1,900 tests" and "1,900+". */
  testsFloor: n(Math.floor(facts.tests / 100) * 100),
  mcpTools: n(facts.mcpTools),
  mcpReadTools: n(facts.mcpTools - facts.mcpWriteTools),
  mcpWriteTools: n(facts.mcpWriteTools),
  coreRights: n(facts.coreRights),
  migrations: n(facts.migrations),
  events: n(facts.events),
  agentRules: n(facts.agentRules),
  agentNotes: n(facts.agentNotes),
  skillGuides: n(facts.skillGuides),
  backends: n(connectors.connectors.length),
  otherBackends: n(connectors.connectors.length - 1),
  /** Which GoCommerce commit the figures were read from, for text that says so. */
  factsCommit: facts.commit,
  factsDate: longDate(facts.committed),
  connectorVersion: connector.version,
  connectorTested: connector.tested,
  connectorNeedsIdentity: connector.needsIdentity,
  // The end-to-end test is of one version; a later release names it until it is tested again.
  connectorTestedOn: longDate(connector.testedOn) + (connector.testedVersion === connector.version ? '' : ` with version ${connector.testedVersion}`),
}

export { connector }

export const perModule = facts.perModule as Record<string, { tests: number; operations: number }>
