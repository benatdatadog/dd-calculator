import React, { useState, useCallback, useMemo } from 'react'
import Header from './components/Header.jsx'
import ProductSection from './components/ProductSection.jsx'
import PricingSummary from './components/PricingSummary.jsx'
import { PRODUCT_GROUPS } from './data/products.js'
import { TIERS, FLAT_RATES, calcTiered, calcLogIndex, calcSKU } from './data/pricing.js'

// Containers tiers (per container/month, Annual)
const CONTAINERS_ANNUAL = [
  { max: 2499,   rate: 1.00 },
  { max: 4999,   rate: 0.95 },
  { max: 9999,   rate: 0.90 },
  { max: 19999,  rate: 0.80 },
  { max: 49999,  rate: 0.75 },
  { max: 99999,  rate: 0.73 },
  { max: Infinity, rate: 0.70 },
]

// NDM devices (per device/month, Annual)
const NDM_ANNUAL = [
  { max: 99,   rate: 4.00 },
  { max: 499,  rate: 3.52 },
  { max: 999,  rate: 3.09 },
  { max: 1999, rate: 2.71 },
  { max: 3999, rate: 2.39 },
  { max: 6999, rate: 2.10 },
  { max: 14999, rate: 1.84 },
  { max: 29999, rate: 1.62 },
  { max: 49999, rate: 1.42 },
  { max: Infinity, rate: 1.25 },
]

// Flex Logs compute tier map
const FLEX_COMPUTE = {
  xs:     { annual: 10000, m2m: 12000 },
  small:  { annual: 35000, m2m: 42000 },
  medium: { annual: 75000, m2m: 90000 },
  large:  { annual: 150000, m2m: 180000 },
}

function getTiers(annualTiers, m2mTiers, billingType) {
  return billingType === 'm2m' && m2mTiers ? m2mTiers : annualTiers
}

function calculateCosts(values, billingType, logIndexes) {
  const v = values
  const isAnnual = billingType === 'annual'
  const costs = {}

  // INFRASTRUCTURE
  costs.infraPro       = calcTiered(+v.infraPro || 0,       getTiers(TIERS.INFRA_PRO_ANNUAL,        TIERS.INFRA_PRO_M2M,        billingType))
  costs.infraProPlus   = calcTiered(+v.infraProPlus || 0,   getTiers(TIERS.INFRA_PROPLUS_ANNUAL,    TIERS.INFRA_PROPLUS_M2M,    billingType))
  costs.infraEnterprise= calcTiered(+v.infraEnterprise || 0,getTiers(TIERS.INFRA_ENTERPRISE_ANNUAL, TIERS.INFRA_ENTERPRISE_M2M, billingType))
  costs.infraBasic     = calcTiered(+v.infraBasic || 0,     TIERS.INFRA_BASIC_ANNUAL)
  costs.containers     = calcTiered(+v.containers || 0,     CONTAINERS_ANNUAL)
  costs.customMetrics  = calcTiered(+v.customMetrics || 0,  TIERS.CUSTOM_METRICS_ANNUAL)

  // APM
  costs.apmStandard      = calcTiered(+v.apmStandard || 0,      getTiers(TIERS.APM_STANDARD_ANNUAL, TIERS.APM_STANDARD_M2M, billingType))
  costs.apmPro           = calcTiered(+v.apmPro || 0,           TIERS.APM_PRO_ANNUAL)
  costs.apmEnterprise    = calcTiered(+v.apmEnterprise || 0,    TIERS.APM_ENTERPRISE_ANNUAL)
  costs.continuousProfiler = calcTiered(+v.continuousProfiler || 0, TIERS.CONTINUOUS_PROFILER_ANNUAL)
  costs.dataStreams       = calcTiered(+v.dataStreams || 0,      TIERS.DATA_STREAMS_ANNUAL)

  // LOG MANAGEMENT
  costs.logsIngestGB  = (+v.logsIngestGB || 0) * FLAT_RATES.logIngestPerGB
  costs.logIndexes    = (logIndexes || []).reduce(
    (sum, idx) => sum + calcLogIndex(+idx.events || 0, +idx.retention || 15, billingType), 0
  )
  costs.flexLogsGB        = (+v.flexLogsGB || 0) * FLAT_RATES.logIngestPerGB
  costs.flexLogsCompute   = (+v.flexLogsGB || 0) > 0
                              ? (FLEX_COMPUTE[v.flexLogsTier || 'medium']?.[billingType] ?? FLEX_COMPUTE.medium.annual)
                              : 0
  costs.archiveGB         = 0  // Datadog charges $0 for archive storage
  costs.rehydration       = (+v.archiveGB || 0) * ((+v.rehydrationPct || 7.5) / 100) * FLAT_RATES.archiveRehydrationPerGB
  costs.logsForwarding    = (+v.logsForwarding || 0) * FLAT_RATES.logForwardingPerGB

  // CLOUD SIEM (ingest + indexed)
  const siemM = +v.cloudSIEM || 0
  costs.cloudSIEM_ingest  = siemM * FLAT_RATES.logIngestPerGB  // $0.10/GB (1GB=1M events)
  costs.cloudSIEM_index   = siemM > 0 ? calcSKU('cloud_siem', siemM) : 0

  // SYNTHETICS
  costs.synthAPI    = calcTiered(+v.synthAPI || 0,    TIERS.SYNTHETICS_API_ANNUAL)
  costs.synthBrowser= calcTiered(+v.synthBrowser || 0,TIERS.SYNTHETICS_BROWSER_ANNUAL)
  costs.synthMobile = calcTiered(+v.synthMobile || 0, TIERS.SYNTHETICS_MOBILE_ANNUAL)

  // NETWORK MONITORING
  costs.cnmHosts   = calcTiered(+v.cnmHosts || 0,   TIERS.CNM_ANNUAL)
  costs.ndmDevices = calcTiered(+v.ndmDevices || 0,  NDM_ANNUAL)

  // REAL USER MONITORING
  costs.rumSessions = calcTiered(+v.rumSessions || 0, TIERS.RUM_SESSIONS_ANNUAL)
  costs.rumReplay   = calcTiered(+v.rumReplay || 0,   TIERS.RUM_SESSION_REPLAY_ANNUAL)
  costs.rumInvestigate = calcTiered(+v.rumInvestigate || 0, TIERS.RUM_INVESTIGATE_BUNDLE_ANNUAL)

  // SERVERLESS
  costs.serverlessFunctions = calcTiered(+v.serverlessFunctions || 0, TIERS.SERVERLESS_FUNCTIONS_ANNUAL)
  costs.serverlessApps      = calcTiered(+v.serverlessApps || 0,      TIERS.SERVERLESS_APP_INSTANCES_ANNUAL)

  // DATABASE MONITORING
  costs.dbmHosts = calcTiered(+v.dbmHosts || 0, TIERS.DBM_ANNUAL)

  // CI VISIBILITY
  costs.ciPipeline      = calcTiered(+v.ciPipeline || 0,      TIERS.CI_PIPELINE_ANNUAL)
  costs.testOptimization= calcTiered(+v.testOptimization || 0,TIERS.TEST_OPTIMIZATION_ANNUAL)

  // CLOUD SECURITY
  costs.csmPro            = calcTiered(+v.csmPro || 0,            TIERS.CSM_PRO_ANNUAL)
  costs.csmEnterprise     = calcTiered(+v.csmEnterprise || 0,     TIERS.CSM_ENTERPRISE_ANNUAL)
  costs.workloadProtection= calcTiered(+v.workloadProtection || 0,TIERS.WORKLOAD_PROTECTION_ANNUAL)
  costs.appApiProtection  = calcTiered(+v.appApiProtection || 0,  TIERS.APP_API_PROTECTION_ANNUAL)

  // OBSERVABILITY PIPELINES
  costs.obsPipelines = calcTiered(+v.obsPipelines || 0, TIERS.OBS_PIPELINES_ANNUAL)

  // PLATFORM & GOVERNANCE
  costs.sensitiveDataScanner = calcTiered(+v.sensitiveDataScanner || 0, TIERS.SDS_ANNUAL)

  // Error Tracking: $25 base + tiered overage above 50K errors
  const totalErrors = +v.errorTracking || 0
  if (totalErrors > 0) {
    const overageK = Math.max(0, totalErrors - 50)  // in thousands
    costs.errorTracking = FLAT_RATES.errorTrackingBaseFee + (overageK > 0 ? calcTiered(overageK, TIERS.ERROR_TRACKING_OVERAGE_ANNUAL) : 0)
  } else {
    costs.errorTracking = 0
  }

  costs.incidentMgmt    = (+v.incidentMgmt || 0) * (isAnnual ? FLAT_RATES.incidentManagementSeatPerMonth : 36)
  costs.onCall          = (+v.onCall || 0) * (isAnnual ? FLAT_RATES.onCallSeatPerMonth : 24)
  costs.llmObservability= calcTiered(+v.llmObservability || 0, TIERS.LLM_OBS_ANNUAL)
  costs.usm             = calcTiered(+v.usm || 0,              TIERS.USM_ANNUAL)

  // Audit Trail: 2% of total spend, min $250 — only if enabled
  const subtotal = Object.values(costs).reduce((sum, c) => sum + (c || 0), 0)
  costs.auditTrail = (+v.auditTrail || 0) > 0
    ? Math.max(FLAT_RATES.auditTrailMonthlyMin, subtotal * FLAT_RATES.auditTrailPctOfSpend)
    : 0

  return costs
}

export default function App() {
  const [billingType, setBillingType] = useState('annual')
  const [priceLevel, setPriceLevel]   = useState('rep')
  const [showPricing, setShowPricing] = useState(false)
  const [values, setValues]           = useState({})
  const [logIndexes, setLogIndexes]   = useState([{ id: 1, name: '', events: '', retention: 15 }])

  const handleChange = useCallback((skuId, value) => {
    setValues(prev => ({ ...prev, [skuId]: value }))
  }, [])

  const handleAddLogIndex = useCallback(() => {
    setLogIndexes(prev => [...prev, { id: Date.now(), name: '', events: '', retention: 15 }])
  }, [])

  const handleRemoveLogIndex = useCallback((id) => {
    setLogIndexes(prev => prev.length > 1 ? prev.filter(r => r.id !== id) : prev)
  }, [])

  const handleLogIndexChange = useCallback((id, field, val) => {
    setLogIndexes(prev => prev.map(r => r.id === id ? { ...r, [field]: val } : r))
  }, [])

  const costs = useMemo(
    () => calculateCosts(values, billingType, logIndexes),
    [values, billingType, logIndexes]
  )

  const groupTotals = useMemo(() => {
    const totals = {}
    for (const group of PRODUCT_GROUPS) {
      let sum = 0
      for (const sku of group.skus) {
        sum += costs[sku.id] || 0
      }
      totals[group.id] = sum
    }
    return totals
  }, [costs])

  return (
    <div className="app-layout">
      <Header
        billingType={billingType}
        onBillingTypeChange={setBillingType}
        priceLevel={priceLevel}
        onPriceLevelChange={setPriceLevel}
        showPricing={showPricing}
        onReveal={() => setShowPricing(true)}
        onHide={() => setShowPricing(false)}
      />
      <div className="app-body">
        <main className="main-content" style={showPricing ? { paddingRight: '340px' } : undefined}>
          {PRODUCT_GROUPS.map((group, i) => (
            <ProductSection
              key={group.id}
              group={group}
              values={values}
              onChange={handleChange}
              costs={costs}
              groupTotal={groupTotals[group.id] || 0}
              showPricing={showPricing}
              defaultOpen={i === 0}
              skuExtras={group.id === 'logManagement' ? {
                logIndexes: {
                  rows: logIndexes,
                  billingType,
                  onAdd: handleAddLogIndex,
                  onRemove: handleRemoveLogIndex,
                  onRowChange: handleLogIndexChange,
                }
              } : undefined}
            />
          ))}
        </main>
        <aside className="summary-sidebar">
          <PricingSummary
            groups={PRODUCT_GROUPS}
            costs={costs}
            groupTotals={groupTotals}
            showPricing={showPricing}
            onReveal={() => setShowPricing(true)}
            onHide={() => setShowPricing(false)}
            billingType={billingType}
            priceLevel={priceLevel}
            values={values}
            logIndexes={logIndexes}
          />
        </aside>
      </div>
    </div>
  )
}
