export const PRODUCT_GROUPS = [
  {
    id: 'infrastructure',
    label: 'Infrastructure',
    icon: '🖥️',
    color: '#6C35DE',
    skus: [
      {
        id: 'infraPro',
        label: 'Pro Hosts',
        unit: 'hosts',
        inputType: 'number',
        placeholder: '0',
        tooltip:
          'A host is any physical or virtual machine monitored by the Datadog Agent. VMs on AWS, GCP, Azure, or on-prem each count as 1 host. Containers do NOT count as hosts — they are billed separately. The 99th percentile of distinct hosts over the trailing hour during the month is used for billing.',
      },
      {
        id: 'infraProPlus',
        label: 'Pro+ Hosts',
        unit: 'hosts',
        inputType: 'number',
        placeholder: '0',
        tooltip:
          'A host is any physical or virtual machine monitored by the Datadog Agent. VMs on AWS, GCP, Azure, or on-prem each count as 1 host. Containers do NOT count as hosts — they are billed separately. The 99th percentile of distinct hosts over the trailing hour during the month is used for billing. Pro+ adds Network Performance Monitoring (NPM) and Universal Service Monitoring (USM).',
      },
      {
        id: 'infraEnterprise',
        label: 'Enterprise Hosts',
        unit: 'hosts',
        inputType: 'number',
        placeholder: '0',
        tooltip:
          'A host is any physical or virtual machine monitored by the Datadog Agent. VMs on AWS, GCP, Azure, or on-prem each count as 1 host. Containers do NOT count as hosts — they are billed separately. The 99th percentile of distinct hosts over the trailing hour during the month is used for billing. Enterprise includes CSM Pro.',
      },
      {
        id: 'infraBasic',
        label: 'Basic Hosts',
        unit: 'hosts',
        inputType: 'number',
        placeholder: '0',
        tooltip:
          'Basic provides metrics-only monitoring, no APM, no logs. Same host counting rules apply.',
      },
      {
        id: 'containers',
        label: 'Containers',
        unit: 'containers',
        inputType: 'number',
        placeholder: '0',
        tooltip:
          'Each running container (Docker, K8s pod, ECS task) counts as 1. The 99th percentile of peak hourly container count during the month. Containers included: first 5 per Pro/Pro+ host, first 10 per Enterprise host.',
      },
      {
        id: 'customMetrics',
        label: 'Custom Metrics',
        unit: 'per 100 metrics',
        inputType: 'number',
        placeholder: '0',
        tooltip:
          'A custom metric is any metric not collected by a Datadog integration. Each unique metric name + tag combination = 1 custom metric. Billing uses 99th percentile of hourly distinct custom metrics over the month.',
      },
    ],
  },
  {
    id: 'apm',
    label: 'APM & Profiling',
    icon: '📈',
    color: '#FF6B6B',
    skus: [
      {
        id: 'apmStandard',
        label: 'APM Standard Hosts',
        unit: 'hosts',
        inputType: 'number',
        placeholder: '0',
        tooltip:
          'Any host running the APM Agent (ddtrace). Same 99th-percentile counting as infrastructure hosts. If a host runs both infra and APM, you are billed for both.',
      },
      {
        id: 'apmPro',
        label: 'APM Pro Hosts',
        unit: 'hosts',
        inputType: 'number',
        placeholder: '0',
        tooltip:
          'APM Pro includes APM + Data Streams Monitoring. Same host counting.',
      },
      {
        id: 'apmEnterprise',
        label: 'APM Enterprise Hosts',
        unit: 'hosts',
        inputType: 'number',
        placeholder: '0',
        tooltip:
          'APM Enterprise includes APM + Data Streams + Continuous Profiler.',
      },
      {
        id: 'continuousProfiler',
        label: 'Continuous Profiler',
        unit: 'hosts',
        inputType: 'number',
        placeholder: '0',
        tooltip:
          'Each host running the profiler counts as 1. Billed per host per month at 99th percentile.',
      },
      {
        id: 'dataStreams',
        label: 'Data Streams Monitoring',
        unit: 'hosts',
        inputType: 'number',
        placeholder: '0',
        tooltip:
          'Monitors streaming pipelines (Kafka, RabbitMQ, SQS). Billed per host running the DSM agent.',
      },
    ],
  },
  {
    id: 'logManagement',
    label: 'Log Management',
    icon: '📋',
    color: '#00A4BD',
    skus: [
      {
        id: 'logsIngestGB',
        label: 'Log Ingest',
        unit: 'GB/month',
        inputType: 'number',
        placeholder: '0',
        tooltip:
          'All log bytes received by Datadog regardless of what happens next. 1 GB = approximately 1–5 million log events depending on event size. Compressed bytes on the wire are measured.',
      },
      {
        id: 'logIndexes',
        label: 'Log Indexes (Standard)',
        inputType: 'log-index-table',
        unit: '',
        tooltip: '',
      },
      {
        id: 'flexLogsGB',
        label: 'Flex Logs (Ingest)',
        unit: 'GB/month',
        inputType: 'number',
        placeholder: '0',
        tooltip:
          "Flex Logs is Datadog's warm tier: cheaper than standard indexes, still interactively queryable without rehydration. A fixed compute tier must be provisioned separately. All Flex data also incurs the standard $0.10/GB ingest charge.",
      },
      {
        id: 'flexLogsTier',
        label: 'Flex Logs Compute Tier',
        unit: 'tier',
        inputType: 'select',
        options: [
          { value: 'xs', label: 'Extra Small' },
          { value: 'small', label: 'Small' },
          { value: 'medium', label: 'Medium' },
          { value: 'large', label: 'Large' },
        ],
        placeholder: 'Extra Small',
        tooltip:
          'Flex Logs requires a reserved compute tier that determines query throughput. Extra Small ~$10K/mo, Small ~$35K/mo, Medium ~$75K/mo, Large ~$150K/mo (Annual rates).',
      },
      {
        id: 'archiveGB',
        label: 'Log Archive (Cold Storage)',
        unit: 'GB/month',
        inputType: 'number',
        placeholder: '0',
        tooltip:
          'Logs sent to your own S3, GCS, or Azure Blob bucket. Datadog does NOT charge for archive storage — you pay your cloud provider. Datadog only charges when you rehydrate archived logs for querying.',
      },
      {
        id: 'rehydrationPct',
        label: 'Rehydration Rate (%)',
        unit: '%',
        inputType: 'number',
        placeholder: '0',
        tooltip:
          'Estimated % of archived logs you expect to rehydrate (re-query) per month. Rehydration is charged at the standard $0.10/GB ingest rate when logs are retrieved from your archive.',
      },
      {
        id: 'logsForwarding',
        label: 'Logs Forwarding',
        unit: 'GB/month',
        inputType: 'number',
        placeholder: '0',
        tooltip:
          'Logs forwarded from Datadog to a third-party SIEM or storage. Charged at $0.25/GB in addition to ingest. Does not apply to logs sent to Datadog Archives.',
      },
    ],
  },
  {
    id: 'cloudSIEM',
    label: 'Cloud SIEM',
    icon: '🔒',
    color: '#E83E8C',
    skus: [
      {
        id: 'cloudSIEM',
        label: 'Cloud SIEM',
        unit: 'M events/month',
        inputType: 'number',
        placeholder: '0',
        tooltip:
          'Security logs ingested into Datadog Cloud SIEM. Priced per million events with 15-month retention included. Cloud SIEM events are also subject to the standard $0.10/GB log ingest charge. Count: 1 log event = 1 SIEM event, regardless of size.',
      },
    ],
  },
  {
    id: 'synthetics',
    label: 'Synthetics',
    icon: '🔬',
    color: '#FD7E14',
    skus: [
      {
        id: 'synthAPI',
        label: 'API Tests',
        unit: 'per 10K runs/month',
        inputType: 'number',
        placeholder: '0',
        tooltip:
          'HTTP, SSL, DNS, TCP, WebSocket tests. Each test execution = 1 run. Runs are counted across all locations. A test running every 5 minutes from 3 locations = 864 runs/day = 25,920 runs/month.',
      },
      {
        id: 'synthBrowser',
        label: 'Browser Tests',
        unit: 'per 1K runs/month',
        inputType: 'number',
        placeholder: '0',
        tooltip:
          'Full browser (Chrome/Firefox) tests using recorded user journeys. Priced per 1K runs — significantly more expensive than API tests due to browser compute. Parallel steps within a run do not increase the count.',
      },
      {
        id: 'synthMobile',
        label: 'Mobile App Tests',
        unit: 'per 100 runs/month',
        inputType: 'number',
        placeholder: '0',
        tooltip:
          'iOS and Android automated UI tests. Each device + test execution = 1 run.',
      },
    ],
  },
  {
    id: 'networkMonitoring',
    label: 'Network Monitoring',
    icon: '🌐',
    color: '#20C997',
    skus: [
      {
        id: 'cnmHosts',
        label: 'Cloud Network Monitoring',
        unit: 'hosts',
        inputType: 'number',
        placeholder: '0',
        tooltip:
          'Previously called NPM. Monitors network traffic between hosts, containers, and services. Requires eBPF-based network probe. Billed per host at 99th percentile, same counting as infrastructure hosts.',
      },
      {
        id: 'ndmDevices',
        label: 'Network Device Monitoring',
        unit: 'devices',
        inputType: 'number',
        placeholder: '0',
        tooltip:
          'Monitors routers, switches, firewalls via SNMP or other protocols. Each physical network device = 1 unit.',
      },
    ],
  },
  {
    id: 'rum',
    label: 'Real User Monitoring',
    icon: '👤',
    color: '#6F42C1',
    skus: [
      {
        id: 'rumSessions',
        label: 'RUM Sessions',
        unit: 'per 1K sessions/month',
        inputType: 'number',
        placeholder: '0',
        tooltip:
          'A RUM session starts when a user visits your app and ends after 15 minutes of inactivity or 4 hours total. Page views, actions, and errors within a session are not counted separately — only the session itself.',
      },
      {
        id: 'rumReplay',
        label: 'Session Replay',
        unit: 'per 1K replays/month',
        inputType: 'number',
        placeholder: '0',
        tooltip:
          'Visual recordings of user sessions. Not all sessions need replay enabled — typically only a sample (1–10%). Replays are stored for 30 days by default.',
      },
      {
        id: 'rumInvestigate',
        label: 'RUM Investigate',
        unit: 'per 1K sessions/month',
        inputType: 'number',
        placeholder: '0',
        tooltip:
          'RUM Investigate bundle includes enhanced session data for deeper investigation. Typically used for error-heavy sessions.',
      },
    ],
  },
  {
    id: 'serverless',
    label: 'Serverless',
    icon: '⚡',
    color: '#FFC107',
    skus: [
      {
        id: 'serverlessFunctions',
        label: 'Serverless Functions',
        unit: 'M invocations/month',
        inputType: 'number',
        placeholder: '0',
        tooltip:
          'AWS Lambda, Azure Functions, GCP Cloud Functions. Each function invocation = 1. Billed on total monthly invocations across all functions. The first 150K invocations are included free with any infrastructure host.',
      },
      {
        id: 'serverlessApps',
        label: 'Serverless App Instances',
        unit: 'active instances/month',
        inputType: 'number',
        placeholder: '0',
        tooltip:
          'For serverless containers (AWS Fargate, GCP Cloud Run). Each concurrently running container instance = 1. Uses 99th percentile of peak hourly active instances.',
      },
    ],
  },
  {
    id: 'databaseMonitoring',
    label: 'Database Monitoring',
    icon: '🗄️',
    color: '#17A2B8',
    skus: [
      {
        id: 'dbmHosts',
        label: 'Database Monitoring',
        unit: 'database hosts',
        inputType: 'number',
        placeholder: '0',
        tooltip:
          'Each database host (RDS instance, Aurora cluster, self-hosted Postgres/MySQL/SQL Server/Oracle) = 1 DBM host. A single host can run multiple databases — it still counts as 1. Read replicas each count separately.',
      },
    ],
  },
  {
    id: 'ciVisibility',
    label: 'CI Visibility',
    icon: '🔧',
    color: '#6C757D',
    skus: [
      {
        id: 'ciPipeline',
        label: 'CI Pipeline Visibility',
        unit: 'committer seats/month',
        inputType: 'number',
        placeholder: '0',
        tooltip:
          'Each developer who triggers CI pipeline runs in the month = 1 committer seat. Billed on the number of unique committers, not pipeline runs.',
      },
      {
        id: 'testOptimization',
        label: 'Test Optimization',
        unit: 'committer seats/month',
        inputType: 'number',
        placeholder: '0',
        tooltip:
          'Flaky test detection, test run analysis. Priced per active committer per month.',
      },
    ],
  },
  {
    id: 'cloudSecurity',
    label: 'Cloud Security',
    icon: '🛡️',
    color: '#DC3545',
    skus: [
      {
        id: 'csmPro',
        label: 'CSM Pro Hosts',
        unit: 'hosts',
        inputType: 'number',
        placeholder: '0',
        tooltip:
          'Cloud Security Management Pro. Covers CSPM (Cloud Security Posture Management) + Threat Detection for hosts. Same 99th percentile host counting as infrastructure.',
      },
      {
        id: 'csmEnterprise',
        label: 'CSM Enterprise Hosts',
        unit: 'hosts',
        inputType: 'number',
        placeholder: '0',
        tooltip:
          'Includes all CSM Pro features plus Identity Risks (CIEM) and AI-powered investigation.',
      },
      {
        id: 'workloadProtection',
        label: 'Workload Protection Hosts',
        unit: 'hosts',
        inputType: 'number',
        placeholder: '0',
        tooltip:
          'Runtime security monitoring using eBPF. Detects kernel-level threats, file integrity monitoring. Previously called Cloud Workload Security.',
      },
      {
        id: 'appApiProtection',
        label: 'App & API Protection',
        unit: 'hosts',
        inputType: 'number',
        placeholder: '0',
        tooltip:
          'WAF-as-a-service, API security monitoring. Blocks attacks in real time. Previously called Application Security Management (ASM).',
      },
    ],
  },
  {
    id: 'obsPipelines',
    label: 'Observability Pipelines',
    icon: '🔀',
    color: '#28A745',
    skus: [
      {
        id: 'obsPipelines',
        label: 'Observability Pipelines',
        unit: 'GB/month',
        inputType: 'number',
        placeholder: '0',
        tooltip:
          'Route, filter, transform, and sample log and metric data before it reaches its destination. Priced per GB ingested through the pipeline. Can reduce downstream Datadog log costs by sampling before ingest.',
      },
    ],
  },
  {
    id: 'platformGovernance',
    label: 'Platform & Governance',
    icon: '⚙️',
    color: '#343A40',
    skus: [
      {
        id: 'sensitiveDataScanner',
        label: 'Sensitive Data Scanner',
        unit: 'GB scanned/month',
        inputType: 'number',
        placeholder: '0',
        tooltip:
          'Scans log content for PII, credentials, and sensitive patterns. Measured on GB of log data passing through the scanner. Does not require full log indexing.',
      },
      {
        id: 'auditTrail',
        label: 'Audit Trail',
        unit: '% of Datadog spend',
        inputType: 'number',
        placeholder: '0',
        tooltip:
          'Audit Trail captures all Datadog user activity (who accessed what, when). Priced at 2% of total Datadog monitoring fees. Minimum $250/month.',
      },
      {
        id: 'errorTracking',
        label: 'Error Tracking',
        unit: 'K errors/month',
        inputType: 'number',
        placeholder: '0',
        tooltip:
          "Groups error occurrences from APM, logs, and RUM. First 50,000 errors/month included in base fee ($25/mo Annual). Additional errors billed per 1,000. An 'error' = a unique error occurrence, not a unique error type.",
      },
      {
        id: 'incidentMgmt',
        label: 'Incident Management Seats',
        unit: 'seats',
        inputType: 'number',
        placeholder: '0',
        tooltip:
          'Number of users who need to create, manage, or respond to incidents in Datadog. Read-only access to incidents is free for all users.',
      },
      {
        id: 'onCall',
        label: 'On-Call Seats',
        unit: 'seats',
        inputType: 'number',
        placeholder: '0',
        tooltip:
          'On-call scheduling, escalation policies, and alerting. Per active on-call responder per month.',
      },
      {
        id: 'llmObservability',
        label: 'LLM Observability',
        unit: 'per 10K LLM events/month',
        inputType: 'number',
        placeholder: '0',
        tooltip:
          'Traces for LLM API calls (OpenAI, Anthropic, etc.). 1 LLM event = 1 model call (prompt + completion). Monitors latency, cost, and quality of AI model calls.',
      },
      {
        id: 'usm',
        label: 'Universal Service Monitoring',
        unit: 'hosts',
        inputType: 'number',
        placeholder: '0',
        tooltip:
          'Automatically detects and maps all services without code changes, using eBPF. Must purchase the same number of USM hosts as infrastructure hosts. Cannot be purchased standalone.',
      },
    ],
  },
];
