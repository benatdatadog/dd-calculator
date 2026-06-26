/**
 * Datadog Pricing Data
 * Source: Official Datadog pricing sheet
 * Baseline: Annual / Rep level (billingType='annual', level='rep')
 * Includes M2M and Director level rates where specified.
 */

// ---------------------------------------------------------------------------
// Helper: calcTiered
// Finds the applicable tier for qty and returns total monthly cost.
// Tiers are flat-rate (all-units pricing), not graduated/block pricing.
// ---------------------------------------------------------------------------
export function calcTiered(qty, tiers) {
  if (!qty || qty <= 0) return 0;
  const tier = tiers.find((t) => qty <= t.max);
  if (!tier) return qty * tiers[tiers.length - 1].rate;
  return qty * tier.rate;
}

// ---------------------------------------------------------------------------
// Log Index: 2D tier lookup (annual volume in billions × retention days)
// ---------------------------------------------------------------------------

// Annual volume breakpoints in billions of events
const LOG_INDEX_VOLUME_BREAKS = [1.2, 3, 6, 10, 15, 22.5, 30, 60, 100, 250, 500, Infinity];

// Retention day options supported
const LOG_INDEX_RETENTION_DAYS = [3, 7, 15, 30, 45, 60, 90, 180];

// Rate tables: rows = retention days (3,7,15,30,45,60,90,180), cols = volume tiers (12 tiers, index 0 = <1.2B)
// Rates are per million events per month (Annual Rep)
const LOG_INDEX_RATES = {
  3:   [1.06, 1.06, 1.01, 0.95, 0.90, 0.85, 0.82, 0.80, 0.77, 0.74, 0.69, 0.64],
  7:   [1.27, 1.27, 1.21, 1.14, 1.08, 1.02, 0.98, 0.95, 0.92, 0.89, 0.83, 0.76],
  15:  [1.70, 1.70, 1.62, 1.53, 1.45, 1.36, 1.32, 1.28, 1.23, 1.19, 1.11, 1.02],
  30:  [2.50, 2.50, 2.38, 2.25, 2.13, 2.00, 1.94, 1.88, 1.81, 1.75, 1.63, 1.50],
  45:  [3.30, 3.30, 3.14, 2.97, 2.81, 2.64, 2.56, 2.48, 2.39, 2.31, 2.15, 1.98],
  60:  [4.10, 4.10, 3.90, 3.69, 3.49, 3.28, 3.18, 3.08, 2.97, 2.87, 2.67, 2.46],
  90:  [5.70, 5.70, 5.42, 5.13, 4.85, 4.56, 4.42, 4.28, 4.13, 3.99, 3.71, 3.42],
  180: [10.50, 10.50, 9.98, 9.45, 8.93, 8.40, 8.14, 7.88, 7.61, 7.35, 6.83, 6.30],
};

/**
 * calcLogIndex
 * @param {number} monthlyMillionEvents - monthly volume in millions of log events
 * @param {number} retentionDays - retention period (3|7|15|30|45|60|90|180)
 * @param {string} billingType - 'annual' (only annual supported for tiered log index)
 * @returns {number} monthly cost in USD
 */
export function calcLogIndex(monthlyMillionEvents, retentionDays, billingType = 'annual') {
  if (!monthlyMillionEvents || monthlyMillionEvents <= 0) return 0;
  return calcLogIndexAnnual(monthlyMillionEvents * 12, retentionDays);
}

/**
 * calcLogIndexAnnual
 * @param {number} annualMillionEvents - annual volume in millions of log events
 * @param {number} retentionDays - retention period (3|7|15|30|45|60|90|180)
 * @returns {number} monthly cost in USD
 */
export function calcLogIndexAnnual(annualMillionEvents, retentionDays) {
  if (!annualMillionEvents || annualMillionEvents <= 0) return 0;

  const rates = LOG_INDEX_RATES[retentionDays];
  if (!rates) throw new Error(`Unsupported retentionDays: ${retentionDays}. Valid: ${LOG_INDEX_RETENTION_DAYS.join(', ')}`);

  const annualBillions = annualMillionEvents / 1000;
  const tierIdx = LOG_INDEX_VOLUME_BREAKS.findIndex((b) => annualBillions < b);
  const idx = tierIdx === -1 ? rates.length - 1 : tierIdx;
  const ratePerMillion = rates[idx];

  // monthlyMillionEvents = annualMillionEvents / 12
  const monthlyMillionEvents = annualMillionEvents / 12;
  return monthlyMillionEvents * ratePerMillion;
}

// ---------------------------------------------------------------------------
// Cloud SIEM: 2D tier lookup (annual volume in billions, 15-month retention)
// ---------------------------------------------------------------------------
const CLOUD_SIEM_VOLUME_BREAKS = [1.2, 3, 6, 10, 15, Infinity];
const CLOUD_SIEM_RATES = [5.00, 3.75, 3.24, 2.80, 2.42, 2.09]; // per million events/month

// ---------------------------------------------------------------------------
// TIERS: Infrastructure Hosts
// ---------------------------------------------------------------------------
const INFRA_PRO_ANNUAL = [
  { max: 499, rate: 15.00 },
  { max: 999, rate: 14.60 },
  { max: 1999, rate: 14.30 },
  { max: 3999, rate: 13.90 },
  { max: 6999, rate: 13.60 },
  { max: 9999, rate: 13.25 },
  { max: 14999, rate: 12.90 },
  { max: 24999, rate: 12.60 },
  { max: 49999, rate: 12.30 },
  { max: Infinity, rate: 12.00 },
];

const INFRA_PRO_M2M = [
  { max: 99, rate: 18.00 },
  { max: 499, rate: 18.00 },
  { max: 999, rate: 17.60 },
  { max: 1999, rate: 17.10 },
  { max: 3999, rate: 16.70 },
  { max: 6999, rate: 16.30 },
  { max: 9999, rate: 15.90 },
  { max: 14999, rate: 15.50 },
  { max: 24999, rate: 15.10 },
  { max: 49999, rate: 14.80 },
  { max: Infinity, rate: 14.40 },
];

const INFRA_PRO_DIRECTOR = [
  { max: 499, rate: 15.00 },
  { max: 999, rate: 13.20 },
  { max: 1999, rate: 12.40 },
  { max: 3999, rate: 11.70 },
  { max: 6999, rate: 10.95 },
  { max: 9999, rate: 10.30 },
  { max: 14999, rate: 9.70 },
  { max: 24999, rate: 9.10 },
  { max: 49999, rate: 8.50 },
  { max: Infinity, rate: 8.00 },
];

const INFRA_PROPLUS_ANNUAL = [
  { max: 499, rate: 18.00 },
  { max: 999, rate: 17.60 },
  { max: 1999, rate: 17.30 },
  { max: 3999, rate: 16.90 },
  { max: 6999, rate: 16.60 },
  { max: 9999, rate: 16.25 },
  { max: 14999, rate: 15.90 },
  { max: 24999, rate: 15.60 },
  { max: 49999, rate: 15.30 },
  { max: Infinity, rate: 15.00 },
];

const INFRA_PROPLUS_M2M = [
  { max: 99, rate: 21.00 },
  { max: 499, rate: 21.00 },
  { max: 999, rate: 20.60 },
  { max: 1999, rate: 20.10 },
  { max: 3999, rate: 19.70 },
  { max: 6999, rate: 19.30 },
  { max: 9999, rate: 18.90 },
  { max: 14999, rate: 18.50 },
  { max: 24999, rate: 18.10 },
  { max: 49999, rate: 17.80 },
  { max: Infinity, rate: 17.40 },
];

const INFRA_ENTERPRISE_ANNUAL = [
  { max: 499, rate: 23.00 },
  { max: 999, rate: 23.00 },
  { max: 1999, rate: 22.40 },
  { max: 4999, rate: 21.80 },
  { max: 9999, rate: 21.20 },
  { max: 14999, rate: 20.05 },
  { max: 24999, rate: 19.00 },
  { max: 49999, rate: 17.80 },
  { max: Infinity, rate: 17.00 },
];

const INFRA_ENTERPRISE_M2M = [
  { max: 499, rate: 27.00 },
  { max: 999, rate: 27.00 },
  { max: 1999, rate: 26.30 },
  { max: 4999, rate: 25.70 },
  { max: 9999, rate: 25.00 },
  { max: 14999, rate: 23.80 },
  { max: 24999, rate: 22.60 },
  { max: 49999, rate: 21.50 },
  { max: Infinity, rate: 20.40 },
];

const INFRA_BASIC_ANNUAL = [
  { max: 99, rate: 7.75 },
  { max: 499, rate: 7.75 },
  { max: 999, rate: 7.52 },
  { max: 1999, rate: 7.34 },
  { max: 3999, rate: 7.17 },
  { max: 6999, rate: 6.99 },
  { max: 9999, rate: 6.83 },
  { max: 14999, rate: 6.66 },
  { max: 24999, rate: 6.50 },
  { max: 49999, rate: 6.35 },
  { max: Infinity, rate: 6.20 },
];

// ---------------------------------------------------------------------------
// TIERS: APM Hosts
// ---------------------------------------------------------------------------
const APM_STANDARD_ANNUAL = [
  { max: 99, rate: 31.00 },
  { max: 499, rate: 31.00 },
  { max: 999, rate: 29.35 },
  { max: 1999, rate: 27.80 },
  { max: 4999, rate: 26.30 },
  { max: 9999, rate: 24.90 },
  { max: 14999, rate: 22.30 },
  { max: Infinity, rate: 20.00 },
];

const APM_STANDARD_M2M = [
  { max: 99, rate: 36.00 },
  { max: 499, rate: 36.00 },
  { max: 999, rate: 34.30 },
  { max: 1999, rate: 32.50 },
  { max: 4999, rate: 30.90 },
  { max: 9999, rate: 29.40 },
  { max: 14999, rate: 26.60 },
  { max: Infinity, rate: 24.00 },
];

const APM_PRO_ANNUAL = [
  { max: 99, rate: 35.00 },
  { max: 499, rate: 35.00 },
  { max: 999, rate: 33.32 },
  { max: 1999, rate: 31.72 },
  { max: 4999, rate: 30.20 },
  { max: 9999, rate: 28.76 },
  { max: 14999, rate: 26.06 },
  { max: Infinity, rate: 23.63 },
];

const APM_ENTERPRISE_ANNUAL = [
  { max: 99, rate: 40.00 },
  { max: 499, rate: 40.00 },
  { max: 999, rate: 38.08 },
  { max: 1999, rate: 36.26 },
  { max: 4999, rate: 34.52 },
  { max: 9999, rate: 32.86 },
  { max: 14999, rate: 29.79 },
  { max: Infinity, rate: 27.00 },
];

// ---------------------------------------------------------------------------
// TIERS: Continuous Profiler
// ---------------------------------------------------------------------------
const CONTINUOUS_PROFILER_ANNUAL = [
  { max: 499, rate: 19.00 },
  { max: 999, rate: 17.48 },
  { max: 1999, rate: 16.33 },
  { max: Infinity, rate: 15.00 },
];

// ---------------------------------------------------------------------------
// TIERS: Data Streams Monitoring
// ---------------------------------------------------------------------------
const DATA_STREAMS_ANNUAL = [
  { max: 499, rate: 15.00 },
  { max: 999, rate: 13.90 },
  { max: Infinity, rate: 12.89 },
];

// ---------------------------------------------------------------------------
// TIERS: Synthetics
// ---------------------------------------------------------------------------
const SYNTHETICS_API_ANNUAL = [
  { max: 99000, rate: 5.00 },
  { max: 499000, rate: 5.00 },
  { max: 999000, rate: 4.88 },
  { max: 1999000, rate: 4.76 },
  { max: 3999000, rate: 4.64 },
  { max: 6999000, rate: 4.53 },
  { max: 9999000, rate: 4.42 },
  { max: Infinity, rate: 4.30 },
];

const SYNTHETICS_BROWSER_ANNUAL = [
  { max: 99000, rate: 12.00 },
  { max: 499000, rate: 12.00 },
  { max: 999000, rate: 11.70 },
  { max: 1999000, rate: 11.30 },
  { max: 3999000, rate: 11.00 },
  { max: Infinity, rate: 10.70 },
];

const SYNTHETICS_MOBILE_ANNUAL = [
  { max: 5000, rate: 50.00 },
  { max: 9000, rate: 47.20 },
  { max: 20000, rate: 44.57 },
  { max: 40000, rate: 42.07 },
  { max: 100000, rate: 39.87 },
  { max: Infinity, rate: 36.00 },
];

// ---------------------------------------------------------------------------
// TIERS: Cloud Network Monitoring (CNM)
// ---------------------------------------------------------------------------
const CNM_ANNUAL = [
  { max: 99, rate: 5.00 },
  { max: 499, rate: 5.00 },
  { max: 999, rate: 4.88 },
  { max: 1999, rate: 4.76 },
  { max: 3999, rate: 4.64 },
  { max: 6999, rate: 4.53 },
  { max: 9999, rate: 4.42 },
  { max: 14999, rate: 4.20 },
  { max: Infinity, rate: 4.00 },
];

// ---------------------------------------------------------------------------
// TIERS: RUM
// ---------------------------------------------------------------------------
// RUM Measure: $0.15/1K sessions (Annual Rep), replaces legacy RUM Sessions
const RUM_MEASURE_ANNUAL = [
  { max: 24999,   rate: 0.150 },
  { max: 49999,   rate: 0.120 },
  { max: 99999,   rate: 0.100 },
  { max: 249999,  rate: 0.083 },
  { max: 499999,  rate: 0.072 },
  { max: 999999,  rate: 0.065 },
  { max: Infinity, rate: 0.060 },
];

// Session Replay: $2.50/1K sessions (Annual Rep)
const RUM_SESSION_REPLAY_ANNUAL = [
  { max: 999,     rate: 2.50 },
  { max: 1999,    rate: 2.35 },
  { max: 3999,    rate: 2.20 },
  { max: 7999,    rate: 2.04 },
  { max: 13999,   rate: 1.88 },
  { max: 19999,   rate: 1.72 },
  { max: 34999,   rate: 1.56 },
  { max: 49999,   rate: 1.40 },
  { max: 74999,   rate: 1.25 },
  { max: 99999,   rate: 1.09 },
  { max: 249999,  rate: 0.94 },
  { max: Infinity, rate: 0.75 },
];

const RUM_INVESTIGATE_BUNDLE_ANNUAL = [
  { max: 999, rate: 3.00 },
  { max: Infinity, rate: 2.82 },
];

// ---------------------------------------------------------------------------
// TIERS: Serverless
// ---------------------------------------------------------------------------
const SERVERLESS_FUNCTIONS_ANNUAL = [
  { max: 1, rate: 5.00 },
  { max: 2.499, rate: 2.63 },
  { max: 4.999, rate: 2.20 },
  { max: 7.499, rate: 1.86 },
  { max: 9.999, rate: 2.64 },
  { max: 24.999, rate: 2.16 },
  { max: 49.999, rate: 1.87 },
  { max: Infinity, rate: 1.55 },
];

const SERVERLESS_APP_INSTANCES_ANNUAL = [
  { max: 249, rate: 3.00 },
  { max: 999, rate: 2.75 },
  { max: Infinity, rate: 2.50 },
];

// ---------------------------------------------------------------------------
// TIERS: Database Monitoring
// ---------------------------------------------------------------------------
const DBM_ANNUAL = [
  { max: 9, rate: 70.00 },
  { max: 49, rate: 70.00 },
  { max: 99, rate: 67.67 },
  { max: 199, rate: 67.67 },
  { max: 399, rate: 65.33 },
  { max: 699, rate: 65.33 },
  { max: 999, rate: 63.00 },
  { max: 1499, rate: 60.67 },
  { max: 3000, rate: 56.00 },
  { max: Infinity, rate: 52.67 },
];

// ---------------------------------------------------------------------------
// TIERS: CI Pipeline Visibility
// ---------------------------------------------------------------------------
const CI_PIPELINE_ANNUAL = [
  { max: 99, rate: 20.00 },
  { max: 199, rate: 19.00 },
  { max: 499, rate: 18.25 },
  { max: 999, rate: 17.50 },
  { max: Infinity, rate: 17.00 },
];

// ---------------------------------------------------------------------------
// TIERS: Test Optimization
// ---------------------------------------------------------------------------
const TEST_OPTIMIZATION_ANNUAL = [
  { max: 99, rate: 20.00 },
  { max: 499, rate: 19.00 },
  { max: Infinity, rate: 18.25 },
];

// ---------------------------------------------------------------------------
// TIERS: CSM (Cloud Security Management)
// ---------------------------------------------------------------------------
const CSM_PRO_ANNUAL = [
  { max: 99, rate: 10.00 },
  { max: 499, rate: 9.83 },
  { max: 999, rate: 9.66 },
  { max: Infinity, rate: 9.50 },
];

const CSM_ENTERPRISE_ANNUAL = [
  { max: 99, rate: 25.00 },
  { max: 499, rate: 24.58 },
  { max: 999, rate: 24.16 },
  { max: Infinity, rate: 23.75 },
];

// ---------------------------------------------------------------------------
// TIERS: Workload Protection Hosts
// ---------------------------------------------------------------------------
const WORKLOAD_PROTECTION_ANNUAL = [
  { max: 99, rate: 15.00 },
  { max: 499, rate: 14.50 },
  { max: 999, rate: 14.00 },
  { max: Infinity, rate: 13.50 },
];

// ---------------------------------------------------------------------------
// TIERS: App & API Protection Hosts
// ---------------------------------------------------------------------------
const APP_API_PROTECTION_ANNUAL = [
  { max: 499, rate: 31.00 },
  { max: 999, rate: 29.00 },
  { max: 1999, rate: 27.00 },
  { max: Infinity, rate: 25.00 },
];

// ---------------------------------------------------------------------------
// TIERS: Observability Pipelines
// ---------------------------------------------------------------------------
const OBS_PIPELINES_ANNUAL = [
  { max: 83333, rate: 0.095 },
  { max: 166666, rate: 0.090 },
  { max: 249999, rate: 0.085 },
  { max: 333333, rate: 0.080 },
  { max: 416666, rate: 0.075 },
  { max: 499999, rate: 0.070 },
  { max: 583333, rate: 0.065 },
  { max: 666666, rate: 0.060 },
  { max: 749999, rate: 0.055 },
  { max: 833333, rate: 0.050 },
  { max: Infinity, rate: 0.045 },
];

// ---------------------------------------------------------------------------
// TIERS: Sensitive Data Scanner
// ---------------------------------------------------------------------------
const SDS_ANNUAL = [
  { max: 49999, rate: 0.30 },
  { max: 149999, rate: 0.27 },
  { max: 249999, rate: 0.24 },
  { max: 349999, rate: 0.21 },
  { max: 499999, rate: 0.18 },
  { max: 999999, rate: 0.15 },
  { max: 1999999, rate: 0.13 },
  { max: 2999999, rate: 0.11 },
  { max: 3999999, rate: 0.09 },
  { max: Infinity, rate: 0.08 },
];

// ---------------------------------------------------------------------------
// TIERS: Error Tracking (overage per 1K errors above 50K baseline)
// ---------------------------------------------------------------------------
const ERROR_TRACKING_OVERAGE_ANNUAL = [
  { max: 100, rate: 0.25 },
  { max: 500, rate: 0.21 },
  { max: 10000, rate: 0.17 },
  { max: 20000, rate: 0.12 },
  { max: Infinity, rate: 0.10 },
];

// ---------------------------------------------------------------------------
// TIERS: Custom Metrics (per 100 custom metrics/month)
// ---------------------------------------------------------------------------
const CUSTOM_METRICS_ANNUAL = [
  { max: 499.9, rate: 5.00 },
  { max: 999.9, rate: 4.00 },
  { max: 4999.9, rate: 3.50 },
  { max: 9999.9, rate: 2.50 },
  { max: 19999.9, rate: 2.50 },
  { max: Infinity, rate: 1.00 },
];

// ---------------------------------------------------------------------------
// TIERS: LLM Observability (per 10K LLM events)
// ---------------------------------------------------------------------------
const LLM_OBS_ANNUAL = [
  { max: 4999, rate: 8.00 },
  { max: 24999, rate: 7.75 },
  { max: 49999, rate: 7.50 },
  { max: 99999, rate: 7.25 },
  { max: 499999, rate: 7.00 },
  { max: Infinity, rate: 6.20 },
];

// ---------------------------------------------------------------------------
// TIERS: USM (Universal Service Monitoring)
// ---------------------------------------------------------------------------
const USM_ANNUAL = [
  { max: 99, rate: 9.00 },
  { max: 499, rate: 9.00 },
  { max: 999, rate: 8.75 },
  { max: 1999, rate: 8.51 },
  { max: 3999, rate: 8.28 },
  { max: 6999, rate: 8.05 },
  { max: 9999, rate: 7.83 },
  { max: 14999, rate: 7.61 },
  { max: 24999, rate: 7.40 },
  { max: 49999, rate: 7.20 },
  { max: Infinity, rate: 7.00 },
];

// ---------------------------------------------------------------------------
// Flat-rate / special pricing constants
// ---------------------------------------------------------------------------
export const FLAT_RATES = {
  // Log Management
  logIngestPerGB: 0.10,           // per GB ingested
  logIngestedSpansPerGB: 0.10,    // per GB ingested spans
  logForwardingPerGB: 0.25,       // per GB forwarded

  // Flex Logs
  flexLogsStoragePerMillionGBMonth: 0.05, // per million GB stored/month (Annual)
  flexLogsComputeExtraSmall: 10000,       // per month (Annual)
  flexLogsComputeSmall: 35000,
  flexLogsComputeMedium: 75000,
  flexLogsComputeLarge: 150000,

  // Archive Rehydration
  archiveRehydrationPerGB: 0.10,

  // Audit Trail
  auditTrailPctOfSpend: 0.02,     // 2% of total Datadog spend
  auditTrailMonthlyMin: 250,      // $250/month minimum

  // Error Tracking
  errorTrackingBaseFee: 25,       // $25/month covers first 50K errors
  errorTrackingBaselineErrors: 50000,

  // Incident Management Seats
  incidentManagementSeatPerMonth: 30,  // $30/seat/month (Annual)

  // On-Call Seats
  onCallSeatPerMonth: 20,          // $20/seat/month (Annual)

  // Cloud Cost Management
  cloudCostMgmtPctOfMonitoredSpend: 0.02, // 2% of monitored cloud spend
};

// ---------------------------------------------------------------------------
// PRICING: master SKU registry
// ---------------------------------------------------------------------------
export const PRICING = {
  // Infrastructure Hosts
  infra_pro_annual:           { tiers: INFRA_PRO_ANNUAL,        billingType: 'annual', level: 'rep',      unit: 'host/month',   description: 'Infrastructure Pro (Annual)' },
  infra_pro_m2m:              { tiers: INFRA_PRO_M2M,           billingType: 'm2m',    level: 'rep',      unit: 'host/month',   description: 'Infrastructure Pro (M2M)' },
  infra_pro_director:         { tiers: INFRA_PRO_DIRECTOR,      billingType: 'annual', level: 'director', unit: 'host/month',   description: 'Infrastructure Pro (Annual, Director)' },
  infra_proplus_annual:       { tiers: INFRA_PROPLUS_ANNUAL,    billingType: 'annual', level: 'rep',      unit: 'host/month',   description: 'Infrastructure Pro+ (Annual)' },
  infra_proplus_m2m:          { tiers: INFRA_PROPLUS_M2M,       billingType: 'm2m',    level: 'rep',      unit: 'host/month',   description: 'Infrastructure Pro+ (M2M)' },
  infra_enterprise_annual:    { tiers: INFRA_ENTERPRISE_ANNUAL, billingType: 'annual', level: 'rep',      unit: 'host/month',   description: 'Infrastructure Enterprise (Annual)' },
  infra_enterprise_m2m:       { tiers: INFRA_ENTERPRISE_M2M,   billingType: 'm2m',    level: 'rep',      unit: 'host/month',   description: 'Infrastructure Enterprise (M2M)' },
  infra_basic_annual:         { tiers: INFRA_BASIC_ANNUAL,      billingType: 'annual', level: 'rep',      unit: 'host/month',   description: 'Infrastructure Basic (Annual)' },

  // APM Hosts
  apm_standard_annual:        { tiers: APM_STANDARD_ANNUAL,     billingType: 'annual', level: 'rep',      unit: 'host/month',   description: 'APM Standard (Annual)' },
  apm_standard_m2m:           { tiers: APM_STANDARD_M2M,        billingType: 'm2m',    level: 'rep',      unit: 'host/month',   description: 'APM Standard (M2M)' },
  apm_pro_annual:             { tiers: APM_PRO_ANNUAL,           billingType: 'annual', level: 'rep',      unit: 'host/month',   description: 'APM Pro (Annual)' },
  apm_enterprise_annual:      { tiers: APM_ENTERPRISE_ANNUAL,   billingType: 'annual', level: 'rep',      unit: 'host/month',   description: 'APM Enterprise (Annual)' },

  // Continuous Profiler
  continuous_profiler_annual: { tiers: CONTINUOUS_PROFILER_ANNUAL, billingType: 'annual', level: 'rep',  unit: 'host/month',   description: 'Continuous Profiler (Annual)' },

  // Data Streams Monitoring
  data_streams_annual:        { tiers: DATA_STREAMS_ANNUAL,     billingType: 'annual', level: 'rep',      unit: 'host/month',   description: 'Data Streams Monitoring (Annual)' },

  // Synthetics
  synthetics_api_annual:      { tiers: SYNTHETICS_API_ANNUAL,   billingType: 'annual', level: 'rep',      unit: 'per 10K tests', description: 'Synthetics API Tests (Annual)' },
  synthetics_browser_annual:  { tiers: SYNTHETICS_BROWSER_ANNUAL, billingType: 'annual', level: 'rep',    unit: 'per 1K tests', description: 'Synthetics Browser Tests (Annual)' },
  synthetics_mobile_annual:   { tiers: SYNTHETICS_MOBILE_ANNUAL, billingType: 'annual', level: 'rep',     unit: 'per 100 tests', description: 'Synthetics Mobile App Tests (Annual)' },

  // Cloud Network Monitoring
  cnm_annual:                 { tiers: CNM_ANNUAL,              billingType: 'annual', level: 'rep',      unit: 'host/month',   description: 'Cloud Network Monitoring (Annual)' },

  // RUM
  rum_measure_annual:         { tiers: RUM_MEASURE_ANNUAL,      billingType: 'annual', level: 'rep',      unit: 'per 1K sessions', description: 'RUM Measure (Annual)' },
  rum_session_replay_annual:  { tiers: RUM_SESSION_REPLAY_ANNUAL, billingType: 'annual', level: 'rep',    unit: 'per 1K replays', description: 'RUM Session Replay (Annual)' },
  rum_investigate_annual:     { tiers: RUM_INVESTIGATE_BUNDLE_ANNUAL, billingType: 'annual', level: 'rep', unit: 'per 1K',      description: 'RUM Investigate Bundle (Annual)' },

  // Serverless
  serverless_functions_annual:     { tiers: SERVERLESS_FUNCTIONS_ANNUAL,    billingType: 'annual', level: 'rep', unit: 'per million invocations/month', description: 'Serverless Functions (Annual)' },
  serverless_app_instances_annual: { tiers: SERVERLESS_APP_INSTANCES_ANNUAL, billingType: 'annual', level: 'rep', unit: 'active instance/month',        description: 'Serverless App Instances (Annual)' },

  // Database Monitoring
  dbm_annual:                 { tiers: DBM_ANNUAL,              billingType: 'annual', level: 'rep',      unit: 'host/month',   description: 'Database Monitoring (Annual)' },

  // CI Pipeline Visibility
  ci_pipeline_annual:         { tiers: CI_PIPELINE_ANNUAL,      billingType: 'annual', level: 'rep',      unit: 'host/month',   description: 'CI Pipeline Visibility (Annual)' },

  // Test Optimization
  test_optimization_annual:   { tiers: TEST_OPTIMIZATION_ANNUAL, billingType: 'annual', level: 'rep',     unit: 'host/month',   description: 'Test Optimization (Annual)' },

  // CSM
  csm_pro_annual:             { tiers: CSM_PRO_ANNUAL,          billingType: 'annual', level: 'rep',      unit: 'host/month',   description: 'CSM Pro (Annual)' },
  csm_enterprise_annual:      { tiers: CSM_ENTERPRISE_ANNUAL,   billingType: 'annual', level: 'rep',      unit: 'host/month',   description: 'CSM Enterprise (Annual)' },

  // Workload Protection
  workload_protection_annual: { tiers: WORKLOAD_PROTECTION_ANNUAL, billingType: 'annual', level: 'rep',   unit: 'host/month',   description: 'Workload Protection (Annual)' },

  // App & API Protection
  app_api_protection_annual:  { tiers: APP_API_PROTECTION_ANNUAL, billingType: 'annual', level: 'rep',    unit: 'host/month',   description: 'App & API Protection (Annual)' },

  // Observability Pipelines
  obs_pipelines_annual:       { tiers: OBS_PIPELINES_ANNUAL,    billingType: 'annual', level: 'rep',      unit: 'GB ingested/month', description: 'Observability Pipelines (Annual)' },

  // Sensitive Data Scanner
  sds_annual:                 { tiers: SDS_ANNUAL,              billingType: 'annual', level: 'rep',      unit: 'GB scanned/month', description: 'Sensitive Data Scanner (Annual)' },

  // Error Tracking (overage tier; base fee handled separately via FLAT_RATES)
  error_tracking_overage_annual: { tiers: ERROR_TRACKING_OVERAGE_ANNUAL, billingType: 'annual', level: 'rep', unit: 'per 1K errors (overage above 50K baseline)', description: 'Error Tracking Overage (Annual)' },

  // Custom Metrics
  custom_metrics_annual:      { tiers: CUSTOM_METRICS_ANNUAL,   billingType: 'annual', level: 'rep',      unit: 'per 100 custom metrics/month', description: 'Custom Metrics (Annual)' },

  // LLM Observability
  llm_obs_annual:             { tiers: LLM_OBS_ANNUAL,          billingType: 'annual', level: 'rep',      unit: 'per 10K LLM events', description: 'LLM Observability (Annual)' },

  // USM
  usm_annual:                 { tiers: USM_ANNUAL,              billingType: 'annual', level: 'rep',      unit: 'host/month',   description: 'Universal Service Monitoring (Annual)' },
};

// ---------------------------------------------------------------------------
// calcSKU: convenience function
// opts:
//   retentionDays {number}  - required for log_index SKUs
//   annualMillionEvents {number} - alternative to qty for log_index (annual total)
//   totalDDSpend {number}   - required for audit_trail (2% of spend)
//   monitoredCloudSpend {number} - required for cloud_cost_mgmt
//   seats {number}          - for per-seat SKUs (incident_mgmt, on_call)
// ---------------------------------------------------------------------------
export function calcSKU(skuKey, qty, opts = {}) {
  // Special SKUs handled outside the tiered model
  switch (skuKey) {
    case 'log_index': {
      const { retentionDays = 15, annualMillionEvents } = opts;
      if (annualMillionEvents != null) {
        return calcLogIndexAnnual(annualMillionEvents, retentionDays);
      }
      return calcLogIndex(qty, retentionDays, 'annual');
    }
    case 'cloud_siem': {
      // qty = monthlyMillionEvents
      const annualBillions = (qty * 12) / 1000;
      const idx = CLOUD_SIEM_VOLUME_BREAKS.findIndex((b) => annualBillions < b);
      const tierIdx = idx === -1 ? CLOUD_SIEM_RATES.length - 1 : idx;
      return qty * CLOUD_SIEM_RATES[tierIdx];
    }
    case 'log_ingest':
      return qty * FLAT_RATES.logIngestPerGB;
    case 'log_ingested_spans':
      return qty * FLAT_RATES.logIngestedSpansPerGB;
    case 'log_forwarding':
      return qty * FLAT_RATES.logForwardingPerGB;
    case 'flex_logs_storage':
      return qty * FLAT_RATES.flexLogsStoragePerMillionGBMonth;
    case 'flex_logs_compute_xs':
      return FLAT_RATES.flexLogsComputeExtraSmall;
    case 'flex_logs_compute_s':
      return FLAT_RATES.flexLogsComputeSmall;
    case 'flex_logs_compute_m':
      return FLAT_RATES.flexLogsComputeMedium;
    case 'flex_logs_compute_l':
      return FLAT_RATES.flexLogsComputeLarge;
    case 'archive_rehydration':
      return qty * FLAT_RATES.archiveRehydrationPerGB;
    case 'audit_trail': {
      const spend = opts.totalDDSpend || 0;
      return Math.max(spend * FLAT_RATES.auditTrailPctOfSpend, FLAT_RATES.auditTrailMonthlyMin);
    }
    case 'error_tracking': {
      // qty = total errors/month
      const base = FLAT_RATES.errorTrackingBaseFee;
      const overageErrors = Math.max(0, qty - FLAT_RATES.errorTrackingBaselineErrors);
      const overageThousands = overageErrors / 1000;
      if (overageThousands <= 0) return base;
      return base + calcTiered(overageThousands, ERROR_TRACKING_OVERAGE_ANNUAL);
    }
    case 'incident_mgmt_seats':
      return qty * FLAT_RATES.incidentManagementSeatPerMonth;
    case 'on_call_seats':
      return qty * FLAT_RATES.onCallSeatPerMonth;
    case 'cloud_cost_mgmt': {
      const monitoredSpend = opts.monitoredCloudSpend || 0;
      return monitoredSpend * FLAT_RATES.cloudCostMgmtPctOfMonitoredSpend;
    }
    default: {
      const sku = PRICING[skuKey];
      if (!sku) throw new Error(`Unknown SKU: ${skuKey}`);
      return calcTiered(qty, sku.tiers);
    }
  }
}

// Re-export tier arrays for direct access if needed
export const TIERS = {
  INFRA_PRO_ANNUAL,
  INFRA_PRO_M2M,
  INFRA_PRO_DIRECTOR,
  INFRA_PROPLUS_ANNUAL,
  INFRA_PROPLUS_M2M,
  INFRA_ENTERPRISE_ANNUAL,
  INFRA_ENTERPRISE_M2M,
  INFRA_BASIC_ANNUAL,
  APM_STANDARD_ANNUAL,
  APM_STANDARD_M2M,
  APM_PRO_ANNUAL,
  APM_ENTERPRISE_ANNUAL,
  CONTINUOUS_PROFILER_ANNUAL,
  DATA_STREAMS_ANNUAL,
  SYNTHETICS_API_ANNUAL,
  SYNTHETICS_BROWSER_ANNUAL,
  SYNTHETICS_MOBILE_ANNUAL,
  CNM_ANNUAL,
  RUM_MEASURE_ANNUAL,
  RUM_SESSION_REPLAY_ANNUAL,
  RUM_INVESTIGATE_BUNDLE_ANNUAL,
  SERVERLESS_FUNCTIONS_ANNUAL,
  SERVERLESS_APP_INSTANCES_ANNUAL,
  DBM_ANNUAL,
  CI_PIPELINE_ANNUAL,
  TEST_OPTIMIZATION_ANNUAL,
  CSM_PRO_ANNUAL,
  CSM_ENTERPRISE_ANNUAL,
  WORKLOAD_PROTECTION_ANNUAL,
  APP_API_PROTECTION_ANNUAL,
  OBS_PIPELINES_ANNUAL,
  SDS_ANNUAL,
  ERROR_TRACKING_OVERAGE_ANNUAL,
  CUSTOM_METRICS_ANNUAL,
  LLM_OBS_ANNUAL,
  USM_ANNUAL,
  // Log Index rate tables (exported for direct inspection)
  LOG_INDEX_RATES,
  LOG_INDEX_VOLUME_BREAKS,
  // Cloud SIEM
  CLOUD_SIEM_VOLUME_BREAKS,
  CLOUD_SIEM_RATES,
};
