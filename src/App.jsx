import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react'
import Header from './components/Header.jsx'
import ProductSection from './components/ProductSection.jsx'
import PricingSummary from './components/PricingSummary.jsx'
import { PRODUCT_GROUPS } from './data/products.js'
import { TIERS, FLAT_RATES, calcTiered, calcLogIndex, calcSKU } from './data/pricing.js'

// ─── Tier tables ──────────────────────────────────────────────────────────────

const CONTAINERS_ANNUAL = [
  { max: 2499,     rate: 1.00 },
  { max: 4999,     rate: 0.95 },
  { max: 9999,     rate: 0.90 },
  { max: 19999,    rate: 0.80 },
  { max: 49999,    rate: 0.75 },
  { max: 99999,    rate: 0.73 },
  { max: Infinity, rate: 0.70 },
]

const NDM_ANNUAL = [
  { max: 99,       rate: 4.00 },
  { max: 499,      rate: 3.52 },
  { max: 999,      rate: 3.09 },
  { max: 1999,     rate: 2.71 },
  { max: 3999,     rate: 2.39 },
  { max: 6999,     rate: 2.10 },
  { max: 14999,    rate: 1.84 },
  { max: 29999,    rate: 1.62 },
  { max: 49999,    rate: 1.42 },
  { max: Infinity, rate: 1.25 },
]

const FLEX_COMPUTE = {
  xs:     { annual: 10000,  m2m: 12000  },
  small:  { annual: 35000,  m2m: 42000  },
  medium: { annual: 75000,  m2m: 90000  },
  large:  { annual: 150000, m2m: 180000 },
}

// ─── Persistence helpers ──────────────────────────────────────────────────────

const LS_KEY = 'dd-calc-v3'

const SKIP_PARAMS = new Set(['customer', 'billing', 'level', 'idx'])

function encodeState(customerName, values, logIndexes, billingType, priceLevel) {
  const p = new URLSearchParams()
  if (customerName) p.set('customer', customerName)
  p.set('billing', billingType)
  p.set('level', priceLevel)
  for (const [k, v] of Object.entries(values)) {
    if (v !== '' && v !== undefined && v !== null) p.set(k, String(v))
  }
  const nonEmpty = logIndexes.filter(i => i.events !== '' && +i.events > 0)
  if (nonEmpty.length > 0 || logIndexes.length > 1) {
    p.set('idx', btoa(JSON.stringify(logIndexes.map(i => [i.name || '', i.events || '', i.retention || 15]))))
  }
  return p
}

function decodeParams(search) {
  const p = new URLSearchParams(search)
  if (!p.toString()) return null
  const values = {}
  for (const [k, v] of p.entries()) {
    if (!SKIP_PARAMS.has(k)) values[k] = v
  }
  let logIndexes = [{ id: 1, name: '', events: '', retention: 15 }]
  if (p.has('idx')) {
    try {
      const arr = JSON.parse(atob(p.get('idx')))
      logIndexes = arr.map((r, i) => ({ id: i + 1, name: r[0], events: r[1], retention: +r[2] }))
    } catch { /* malformed — use default */ }
  }
  return {
    customerName: p.get('customer') || '',
    billingType:  p.get('billing')  || 'annual',
    priceLevel:   p.get('level')    || 'rep',
    values,
    logIndexes,
  }
}

function loadLS() {
  try { return JSON.parse(localStorage.getItem(LS_KEY)) } catch { return null }
}

function saveLS(state) {
  try { localStorage.setItem(LS_KEY, JSON.stringify(state)) } catch { /* quota */ }
}

function getInitial() {
  const fromURL = decodeParams(window.location.search)
  if (fromURL) return fromURL
  const fromLS = loadLS()
  if (fromLS) return fromLS
  return { customerName: '', billingType: 'annual', priceLevel: 'rep', values: {}, logIndexes: [{ id: 1, name: '', events: '', retention: 15 }] }
}

// ─── Cost engine ──────────────────────────────────────────────────────────────

function getTiers(annual, m2m, billingType) {
  return billingType === 'm2m' && m2m ? m2m : annual
}

function calculateCosts(values, billingType, logIndexes) {
  const v = values
  const isAnnual = billingType === 'annual'
  const costs = {}

  costs.infraPro        = calcTiered(+v.infraPro || 0,        getTiers(TIERS.INFRA_PRO_ANNUAL,        TIERS.INFRA_PRO_M2M,        billingType))
  costs.infraProPlus    = calcTiered(+v.infraProPlus || 0,    getTiers(TIERS.INFRA_PROPLUS_ANNUAL,    TIERS.INFRA_PROPLUS_M2M,    billingType))
  costs.infraEnterprise = calcTiered(+v.infraEnterprise || 0, getTiers(TIERS.INFRA_ENTERPRISE_ANNUAL, TIERS.INFRA_ENTERPRISE_M2M, billingType))
  costs.infraBasic      = calcTiered(+v.infraBasic || 0,      TIERS.INFRA_BASIC_ANNUAL)
  costs.containers      = calcTiered(+v.containers || 0,      CONTAINERS_ANNUAL)
  costs.customMetrics   = calcTiered(+v.customMetrics || 0,   TIERS.CUSTOM_METRICS_ANNUAL)

  costs.apmStandard       = calcTiered(+v.apmStandard || 0,       getTiers(TIERS.APM_STANDARD_ANNUAL, TIERS.APM_STANDARD_M2M, billingType))
  costs.apmPro            = calcTiered(+v.apmPro || 0,            TIERS.APM_PRO_ANNUAL)
  costs.apmEnterprise     = calcTiered(+v.apmEnterprise || 0,     TIERS.APM_ENTERPRISE_ANNUAL)
  costs.continuousProfiler= calcTiered(+v.continuousProfiler || 0,TIERS.CONTINUOUS_PROFILER_ANNUAL)
  costs.dataStreams        = calcTiered(+v.dataStreams || 0,       TIERS.DATA_STREAMS_ANNUAL)

  costs.logsIngestGB   = (+v.logsIngestGB || 0) * FLAT_RATES.logIngestPerGB
  costs.logIndexes     = (logIndexes || []).reduce(
    (sum, idx) => sum + calcLogIndex(+idx.events || 0, +idx.retention || 15, billingType), 0
  )
  costs.flexLogsGB     = (+v.flexLogsGB || 0) * FLAT_RATES.logIngestPerGB
  costs.flexLogsCompute= (+v.flexLogsGB || 0) > 0
    ? (FLEX_COMPUTE[v.flexLogsTier || 'medium']?.[billingType] ?? FLEX_COMPUTE.medium.annual)
    : 0
  costs.archiveGB      = 0
  costs.rehydration    = (+v.archiveGB || 0) * ((+v.rehydrationPct || 7.5) / 100) * FLAT_RATES.archiveRehydrationPerGB
  costs.logsForwarding = (+v.logsForwarding || 0) * FLAT_RATES.logForwardingPerGB

  const siemM = +v.cloudSIEM || 0
  costs.cloudSIEM = siemM > 0
    ? siemM * FLAT_RATES.logIngestPerGB + calcSKU('cloud_siem', siemM)
    : 0

  costs.synthAPI    = calcTiered(+v.synthAPI || 0,     TIERS.SYNTHETICS_API_ANNUAL)
  costs.synthBrowser= calcTiered(+v.synthBrowser || 0, TIERS.SYNTHETICS_BROWSER_ANNUAL)
  costs.synthMobile = calcTiered(+v.synthMobile || 0,  TIERS.SYNTHETICS_MOBILE_ANNUAL)

  costs.cnmHosts   = calcTiered(+v.cnmHosts || 0,   TIERS.CNM_ANNUAL)
  costs.ndmDevices = calcTiered(+v.ndmDevices || 0,  NDM_ANNUAL)

  costs.rumMeasure    = calcTiered(+v.rumMeasure || 0,    TIERS.RUM_MEASURE_ANNUAL)
  costs.rumReplay     = calcTiered(+v.rumReplay || 0,     TIERS.RUM_SESSION_REPLAY_ANNUAL)
  costs.rumInvestigate= calcTiered(+v.rumInvestigate || 0,TIERS.RUM_INVESTIGATE_BUNDLE_ANNUAL)

  costs.serverlessFunctions= calcTiered(+v.serverlessFunctions || 0,TIERS.SERVERLESS_FUNCTIONS_ANNUAL)
  costs.serverlessApps     = calcTiered(+v.serverlessApps || 0,     TIERS.SERVERLESS_APP_INSTANCES_ANNUAL)

  costs.dbmHosts = calcTiered(+v.dbmHosts || 0, TIERS.DBM_ANNUAL)

  costs.ciPipeline      = calcTiered(+v.ciPipeline || 0,      TIERS.CI_PIPELINE_ANNUAL)
  costs.testOptimization= calcTiered(+v.testOptimization || 0,TIERS.TEST_OPTIMIZATION_ANNUAL)

  costs.csmPro            = calcTiered(+v.csmPro || 0,            TIERS.CSM_PRO_ANNUAL)
  costs.csmEnterprise     = calcTiered(+v.csmEnterprise || 0,     TIERS.CSM_ENTERPRISE_ANNUAL)
  costs.workloadProtection= calcTiered(+v.workloadProtection || 0,TIERS.WORKLOAD_PROTECTION_ANNUAL)
  costs.appApiProtection  = calcTiered(+v.appApiProtection || 0,  TIERS.APP_API_PROTECTION_ANNUAL)

  costs.obsPipelines         = calcTiered(+v.obsPipelines || 0,         TIERS.OBS_PIPELINES_ANNUAL)
  costs.sensitiveDataScanner = calcTiered(+v.sensitiveDataScanner || 0, TIERS.SDS_ANNUAL)

  const totalErrors = +v.errorTracking || 0
  costs.errorTracking = totalErrors > 0
    ? FLAT_RATES.errorTrackingBaseFee + calcTiered(Math.max(0, totalErrors - 50), TIERS.ERROR_TRACKING_OVERAGE_ANNUAL)
    : 0

  costs.incidentMgmt    = (+v.incidentMgmt || 0)    * (isAnnual ? FLAT_RATES.incidentManagementSeatPerMonth : 36)
  costs.onCall          = (+v.onCall || 0)           * (isAnnual ? FLAT_RATES.onCallSeatPerMonth : 24)
  costs.llmObservability= calcTiered(+v.llmObservability || 0, TIERS.LLM_OBS_ANNUAL)
  costs.usm             = calcTiered(+v.usm || 0,              TIERS.USM_ANNUAL)

  const subtotal = Object.values(costs).reduce((s, c) => s + (c || 0), 0)
  costs.auditTrail = (+v.auditTrail || 0) > 0
    ? Math.max(FLAT_RATES.auditTrailMonthlyMin, subtotal * FLAT_RATES.auditTrailPctOfSpend)
    : 0

  return costs
}

// ─── App ──────────────────────────────────────────────────────────────────────

const init = getInitial()

export default function App() {
  const [customerName, setCustomerName] = useState(init.customerName)
  const [billingType, setBillingType]   = useState(init.billingType)
  const [priceLevel, setPriceLevel]     = useState(init.priceLevel)
  const [showPricing, setShowPricing]   = useState(false)
  const [values, setValues]             = useState(init.values)
  const [logIndexes, setLogIndexes]     = useState(init.logIndexes)
  const [copied, setCopied]             = useState(false)
  const copyTimer = useRef(null)

  // Persist to localStorage on every change
  useEffect(() => {
    saveLS({ customerName, billingType, priceLevel, values, logIndexes })
  }, [customerName, billingType, priceLevel, values, logIndexes])

  // Sync page title with customer name
  useEffect(() => {
    document.title = customerName
      ? `${customerName} — Datadog Pricing`
      : 'Datadog Pricing Calculator'
  }, [customerName])

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

  const handleCopyLink = useCallback(() => {
    const params = encodeState(customerName, values, logIndexes, billingType, priceLevel)
    const url = `${window.location.origin}${window.location.pathname}?${params}`
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true)
      clearTimeout(copyTimer.current)
      copyTimer.current = setTimeout(() => setCopied(false), 2500)
    })
  }, [customerName, values, logIndexes, billingType, priceLevel])

  const costs = useMemo(
    () => calculateCosts(values, billingType, logIndexes),
    [values, billingType, logIndexes]
  )

  const groupTotals = useMemo(() => {
    const totals = {}
    for (const group of PRODUCT_GROUPS) {
      totals[group.id] = group.skus.reduce((sum, sku) => sum + (costs[sku.id] || 0), 0)
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
        onCopyLink={handleCopyLink}
        copied={copied}
      />
      <div className="app-body">
        <main className="main-content" style={showPricing ? { paddingRight: '340px' } : undefined}>

          {/* Customer name */}
          <div style={{ marginBottom: 28 }}>
            <input
              type="text"
              placeholder="Customer name…"
              value={customerName}
              onChange={e => setCustomerName(e.target.value)}
              style={{
                width: '100%',
                fontSize: 26,
                fontWeight: 700,
                color: '#1d1d1b',
                background: 'transparent',
                border: 'none',
                borderBottom: '2px solid #e2e2e2',
                borderRadius: 0,
                padding: '4px 0 8px',
                outline: 'none',
                transition: 'border-color 0.15s',
              }}
              onFocus={e => { e.target.style.borderBottomColor = '#632ca6' }}
              onBlur={e => { e.target.style.borderBottomColor = '#e2e2e2' }}
            />
          </div>

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
            customerName={customerName}
          />
        </aside>
      </div>
    </div>
  )
}
