// Fixed example data for the simulated run. Module sources and versions mirror
// src/orefy_harness/data/modules.yaml in the agent harness.

export type Service = 'ec2' | 's3' | 'iam' | 'lambda' | 'sqs' | 'sns' | 'dynamodb'

export interface L10n {
  de: string
  en: string
}

const params = new URLSearchParams(typeof window === 'undefined' ? '' : window.location.search)

/** `?company=Name` personalises the tour for a prospect. React escapes the value on output. */
const company = params.get('company')?.trim().slice(0, 40) || 'Demo GmbH'

/** `?lang=en` opens the demo in English, for links from the English website. */
export const START_LANG: 'de' | 'en' = params.get('lang') === 'en' ? 'en' : 'de'

/** `?fast` shortens the simulated waiting times, for live presentations. */
export const SPEED = params.has('fast') ? 0.15 : 1

export const CONTACT_EMAIL = 'info@orefy.cloud'
/** Optional form endpoint (accepts a JSON POST, e.g. Formspree). Without it the form prepares an e-mail. */
export const CONTACT_ENDPOINT = (import.meta.env?.VITE_CONTACT_ENDPOINT as string | undefined) || ''
export const WEBSITE_URL = 'https://orefy.cloud/'

/** Plain-language explanations for the technical terms the demo cannot avoid. */
export const TERMS = {
  clickops: { de: 'Von Hand in der AWS-Konsole angelegt, ohne Code und ohne Dokumentation.', en: 'Created by hand in the AWS console, without code or documentation.' },
  iac: { de: 'Die Infrastruktur ist als Textdatei beschrieben. Änderungen sind nachvollziehbar und wiederholbar.', en: 'The infrastructure is described in text files. Changes are traceable and repeatable.' },
  terraform: { de: 'Verbreitetes, offenes Werkzeug, um Infrastruktur als Code zu beschreiben.', en: 'Widely used open tool for describing infrastructure as code.' },
  zerodiff: { de: 'Ein Abgleich zwischen Code und Live-Umgebung zeigt keinen Unterschied: nichts hinzuzufügen, zu ändern oder zu löschen.', en: 'Comparing code and live environment shows no difference: nothing to add, change or destroy.' },
  import: { de: 'Verknüpft eine bestehende Ressource mit dem Code, ohne sie neu anzulegen.', en: 'Links an existing resource to the code without recreating it.' },
  module: { de: 'Fertiger, von der Community gepflegter Baustein für wiederkehrende Infrastruktur.', en: 'Ready-made building block for recurring infrastructure, maintained by the community.' },
  raw: { de: 'Ressource ohne passenden Baustein. Sie wird direkt beschrieben und gekennzeichnet.', en: 'Resource without a matching building block. It is described directly and marked.' },
  cicd: { de: 'Eine automatische Pipeline prüft jede Code-Änderung und wendet sie nach Freigabe an, ohne Handarbeit in der Konsole.', en: 'An automatic pipeline checks every code change and applies it after approval, with no manual work in the console.' },
  oidc: { de: 'Die Pipeline erhält kurzlebige Zugangsdaten für genau diesen Lauf. Es werden keine dauerhaften AWS-Schlüssel im Repository gespeichert.', en: 'The pipeline gets short-lived credentials for exactly this run. No permanent AWS keys are stored in the repository.' },
  pr: { de: 'Änderungsvorschlag in Ihrem Code-Repository, den Ihr Team prüft und freigibt.', en: 'Proposed change in your code repository that your team reviews and approves.' },
} satisfies Record<string, L10n>
export type TermKey = keyof typeof TERMS

export const TARGET = {
  name: `${company} · prod-eu`,
  accountId: '4827-1936-0155',
  roleArn: 'arn:aws:iam::482719360155:role/OrefyReadOnly',
  region: 'eu-central-1',
}

export type Provider = 'github' | 'gitlab'

export const PROVIDERS: { id: Provider; label: string; pr: string; pipeline: string; file: string }[] = [
  { id: 'github', label: 'GitHub', pr: 'Pull Request', pipeline: 'GitHub Actions', file: '.github/workflows/terraform.yml' },
  { id: 'gitlab', label: 'GitLab', pr: 'Merge Request', pipeline: 'GitLab CI/CD', file: '.gitlab-ci.yml' },
]

/** Organisation or group the demo pretends to push into. */
export const DEMO_ORG = 'demo-gmbh'
export const DEFAULT_REPO = 'aws-prod-eu-infrastructure'
/** Write role that lives in the customer's account and is assumed by the customer's pipeline, never by Orefy. */
export const DEPLOY_ROLE_ARN = 'arn:aws:iam::482719360155:role/PipelineTerraformDeploy'

/** Read-only role for the checks. Pull requests never see the write role. */
export const PLAN_ROLE_ARN = 'arn:aws:iam::482719360155:role/PipelineTerraformPlan'
export const STATE_BUCKET = 'demo-gmbh-terraform-state'
/** S3 state locking without DynamoDB needs 1.11 or later. */
export const TERRAFORM_VERSION = '1.11.4'

export const SERVICES: { id: Service; label: string; what: L10n }[] = [
  { id: 'ec2', label: 'EC2 & VPC', what: { de: 'Netzwerke, Subnetze, Security Groups, Instanzen', en: 'Networks, subnets, security groups, instances' } },
  { id: 's3', label: 'S3', what: { de: 'Buckets inkl. Versionierung und Verschlüsselung', en: 'Buckets incl. versioning and encryption' } },
  { id: 'iam', label: 'IAM', what: { de: 'Rollen und angehängte Richtlinien', en: 'Roles and attached policies' } },
  { id: 'lambda', label: 'Lambda', what: { de: 'Funktionen und ihre Konfiguration', en: 'Functions and their configuration' } },
  { id: 'sqs', label: 'SQS', what: { de: 'Warteschlangen', en: 'Queues' } },
  { id: 'sns', label: 'SNS', what: { de: 'Topics', en: 'Topics' } },
  { id: 'dynamodb', label: 'DynamoDB', what: { de: 'Tabellen', en: 'Tables' } },
]

export const SERVICE_LABEL = Object.fromEntries(SERVICES.map((s) => [s.id, s.label])) as Record<Service, string>

export type ModuleKey =
  | 'vpc'
  | 'security_group'
  | 's3_bucket'
  | 'iam_role'
  | 'ec2_instance'
  | 'lambda_function'
  | 'sqs_queue'
  | 'sns_topic'
  | 'dynamodb_table'

export const MODULES: Record<ModuleKey, { source: string; version: string; file: string }> = {
  vpc: { source: 'terraform-aws-modules/vpc/aws', version: '6.7.3', file: 'network.tf' },
  security_group: { source: 'terraform-aws-modules/security-group/aws', version: '6.0.0', file: 'network.tf' },
  s3_bucket: { source: 'terraform-aws-modules/s3-bucket/aws', version: '5.17.0', file: 'storage.tf' },
  iam_role: { source: 'terraform-aws-modules/iam/aws//modules/iam-role', version: '6.8.2', file: 'iam.tf' },
  ec2_instance: { source: 'terraform-aws-modules/ec2-instance/aws', version: '6.4.1', file: 'compute.tf' },
  lambda_function: { source: 'terraform-aws-modules/lambda/aws', version: '8.13.0', file: 'compute.tf' },
  sqs_queue: { source: 'terraform-aws-modules/sqs/aws', version: '5.2.2', file: 'messaging.tf' },
  sns_topic: { source: 'terraform-aws-modules/sns/aws', version: '7.2.0', file: 'messaging.tf' },
  dynamodb_table: { source: 'terraform-aws-modules/dynamodb-table/aws', version: '5.5.2', file: 'storage.tf' },
}

/** One module call in the generated code. `fix` inputs only appear after the verify loop corrected them. */
export interface ModuleCall {
  name: string
  module: ModuleKey
  service: Service
  inputs: { key: string; value: string; fix?: boolean }[]
}

const i = (key: string, value: string, fix?: boolean) => ({ key, value, fix })
const q = (s: string) => `"${s}"`

export const CALLS: ModuleCall[] = [
  {
    name: 'prod_main', module: 'vpc', service: 'ec2',
    inputs: [
      i('name', q('prod-main')), i('cidr', q('10.20.0.0/16')),
      i('azs', '["eu-central-1a", "eu-central-1b"]'),
      i('private_subnets', '["10.20.0.0/20", "10.20.16.0/20"]'),
      i('public_subnets', '["10.20.96.0/24", "10.20.97.0/24"]'),
      i('enable_dns_hostnames', 'true'),
    ],
  },
  { name: 'sg_web', module: 'security_group', service: 'ec2', inputs: [i('name', q('web-public')), i('description', q('HTTPS from the internet')), i('vpc_id', 'module.prod_main.vpc_id')] },
  { name: 'sg_bastion_old', module: 'security_group', service: 'ec2', inputs: [i('name', q('bastion-old')), i('description', q('SSH access')), i('vpc_id', 'module.prod_main.vpc_id')] },
  { name: 'sg_orders_db', module: 'security_group', service: 'ec2', inputs: [i('name', q('orders-db')), i('description', q('PostgreSQL from app subnets')), i('vpc_id', 'module.prod_main.vpc_id')] },
  {
    name: 'web_01', module: 'ec2_instance', service: 'ec2',
    inputs: [
      i('name', q('web-01')), i('instance_type', q('t3.medium')), i('ami', q('ami-0a1b2c3d4e5f60718')),
      i('subnet_id', 'module.prod_main.public_subnets[0]'),
      i('vpc_security_group_ids', '[module.sg_web.id]'),
      i('ebs_optimized', 'true', true),
    ],
  },
  {
    name: 'web_02', module: 'ec2_instance', service: 'ec2',
    inputs: [
      i('name', q('web-02')), i('instance_type', q('t3.medium')), i('ami', q('ami-0a1b2c3d4e5f60718')),
      i('subnet_id', 'module.prod_main.public_subnets[1]'),
      i('vpc_security_group_ids', '[module.sg_web.id]'),
    ],
  },
  {
    name: 'bastion', module: 'ec2_instance', service: 'ec2',
    inputs: [
      i('name', q('bastion')), i('instance_type', q('t3.micro')), i('ami', q('ami-09f8e7d6c5b4a3921')),
      i('subnet_id', 'module.prod_main.public_subnets[0]'),
      i('vpc_security_group_ids', '[module.sg_bastion_old.id]'),
    ],
  },
  {
    name: 'media_uploads', module: 's3_bucket', service: 's3',
    inputs: [
      i('bucket', q('demo-gmbh-media-uploads')),
      i('versioning', '{ enabled = true }'),
      i('server_side_encryption_configuration', '{ rule = { apply_server_side_encryption_by_default = { sse_algorithm = "aws:kms" } } }', true),
      i('block_public_acls', 'true'), i('block_public_policy', 'true'),
      i('ignore_public_acls', 'true'), i('restrict_public_buckets', 'true'),
    ],
  },
  {
    name: 'app_logs', module: 's3_bucket', service: 's3',
    inputs: [
      i('bucket', q('demo-gmbh-app-logs')),
      i('block_public_acls', 'true'), i('block_public_policy', 'true'),
      i('ignore_public_acls', 'true'), i('restrict_public_buckets', 'true'),
    ],
  },
  { name: 'reports_export', module: 's3_bucket', service: 's3', inputs: [i('bucket', q('demo-gmbh-reports-export'))] },
  { name: 'role_app_runtime', module: 'iam_role', service: 'iam', inputs: [i('name', q('app-runtime')), i('trust_policy_permissions', '{ ec2 = { principals = [{ type = "Service", identifiers = ["ec2.amazonaws.com"] }] } }'), i('max_session_duration', '7200', true)] },
  { name: 'role_lambda_orders', module: 'iam_role', service: 'iam', inputs: [i('name', q('lambda-orders-exec')), i('trust_policy_permissions', '{ lambda = { principals = [{ type = "Service", identifiers = ["lambda.amazonaws.com"] }] } }')] },
  { name: 'role_legacy_admin', module: 'iam_role', service: 'iam', inputs: [i('name', q('legacy-admin')), i('policies', '{ admin = "arn:aws:iam::aws:policy/AdministratorAccess" }')] },
  { name: 'orders_api', module: 'lambda_function', service: 'lambda', inputs: [i('function_name', q('orders-api')), i('runtime', q('python3.12')), i('handler', q('app.handler')), i('memory_size', '512'), i('timeout', '30', true), i('create_package', 'false'), i('local_existing_package', q('artifacts/orders-api.zip'))] },
  { name: 'invoice_pdf', module: 'lambda_function', service: 'lambda', inputs: [i('function_name', q('invoice-pdf')), i('runtime', q('python3.12')), i('handler', q('render.handler')), i('memory_size', '1024'), i('create_package', 'false'), i('local_existing_package', q('artifacts/invoice-pdf.zip'))] },
  { name: 'nightly_export', module: 'lambda_function', service: 'lambda', inputs: [i('function_name', q('nightly-export')), i('runtime', q('python3.12')), i('handler', q('export.handler')), i('create_package', 'false'), i('local_existing_package', q('artifacts/nightly-export.zip'))] },
  { name: 'orders_queue', module: 'sqs_queue', service: 'sqs', inputs: [i('name', q('orders')), i('visibility_timeout_seconds', '120', true)] },
  { name: 'orders_dlq', module: 'sqs_queue', service: 'sqs', inputs: [i('name', q('orders-dlq')), i('message_retention_seconds', '1209600')] },
  { name: 'email_outbox', module: 'sqs_queue', service: 'sqs', inputs: [i('name', q('email-outbox'))] },
  { name: 'ops_alerts', module: 'sns_topic', service: 'sns', inputs: [i('name', q('ops-alerts')), i('display_name', q('Ops Alerts'), true)] },
  { name: 'order_events', module: 'sns_topic', service: 'sns', inputs: [i('name', q('order-events'))] },
  { name: 'sessions', module: 'dynamodb_table', service: 'dynamodb', inputs: [i('name', q('sessions')), i('hash_key', q('session_id')), i('billing_mode', q('PAY_PER_REQUEST'), true), i('attributes', '[{ name = "session_id", type = "S" }]')] },
  { name: 'order_index', module: 'dynamodb_table', service: 'dynamodb', inputs: [i('name', q('order-index')), i('hash_key', q('order_id')), i('attributes', '[{ name = "order_id", type = "S" }]')] },
]

export interface Resource {
  id: string
  name: string
  service: Service
  kind: string
  /** 'clickops' = unmanaged, will be imported. 'iac' = already under Terraform, skipped. */
  managed: 'clickops' | 'iac'
  /** Module call this resource is imported into. Absent for raw fallback and skipped resources. */
  call?: string
  /** Terraform address of the import. */
  address?: string
  /** Raw fallback: plain aws_* resource without a module match. */
  raw?: { type: string; name: string; file: string; args: [string, string][] }
}

const m = (id: string, name: string, service: Service, kind: string, call: string, sub: string): Resource => ({
  id, name, service, kind, managed: 'clickops', call, address: `module.${call}.${sub}`,
})
const skipped = (id: string, name: string, service: Service, kind: string): Resource => ({ id, name, service, kind, managed: 'iac' })

export const RESOURCES: Resource[] = [
  m('vpc-07c1e9a4f2d83b51', 'prod-main', 'ec2', 'VPC', 'prod_main', 'aws_vpc.this[0]'),
  m('subnet-0b7a2e19c4d58f03', 'prod-main-private-a', 'ec2', 'Subnet', 'prod_main', 'aws_subnet.private[0]'),
  m('subnet-04e8c3f6a91b72d5', 'prod-main-private-b', 'ec2', 'Subnet', 'prod_main', 'aws_subnet.private[1]'),
  m('subnet-0c95d1b7e3a40f68', 'prod-main-public-a', 'ec2', 'Subnet', 'prod_main', 'aws_subnet.public[0]'),
  m('subnet-01f3a8d2b6c94e70', 'prod-main-public-b', 'ec2', 'Subnet', 'prod_main', 'aws_subnet.public[1]'),
  m('igw-0e2d4f6a8b1c3d5e7', 'prod-main', 'ec2', 'Internet Gateway', 'prod_main', 'aws_internet_gateway.this[0]'),
  m('sg-0a91c7e3b5d2f4861', 'web-public', 'ec2', 'Security Group', 'sg_web', 'aws_security_group.this[0]'),
  m('sg-03b8d6f1a4c7e9250', 'bastion-old', 'ec2', 'Security Group', 'sg_bastion_old', 'aws_security_group.this[0]'),
  m('sg-0f4e2c8a6b1d3975c', 'orders-db', 'ec2', 'Security Group', 'sg_orders_db', 'aws_security_group.this[0]'),
  m('i-0c3e5a7b9d1f2468a', 'web-01', 'ec2', 'EC2 Instance', 'web_01', 'aws_instance.this[0]'),
  m('i-08b6d4f2a0c1e3579', 'web-02', 'ec2', 'EC2 Instance', 'web_02', 'aws_instance.this[0]'),
  m('i-05a7c9e1b3d2f4680', 'bastion', 'ec2', 'EC2 Instance', 'bastion', 'aws_instance.this[0]'),
  {
    id: 'eipalloc-0d1f3b5a7c9e2468', name: 'web-01', service: 'ec2', kind: 'Elastic IP', managed: 'clickops',
    address: 'aws_eip.web_01',
    raw: { type: 'aws_eip', name: 'web_01', file: 'compute.tf', args: [['domain', '"vpc"'], ['instance', 'module.web_01.id']] },
  },
  {
    id: 'ops-2023', name: 'ops-2023', service: 'ec2', kind: 'Key Pair', managed: 'clickops',
    address: 'aws_key_pair.ops_2023',
    raw: { type: 'aws_key_pair', name: 'ops_2023', file: 'compute.tf', args: [['key_name', '"ops-2023"'], ['public_key', 'var.ops_public_key']] },
  },

  m('demo-gmbh-media-uploads', 'demo-gmbh-media-uploads', 's3', 'S3 Bucket', 'media_uploads', 'aws_s3_bucket.this[0]'),
  m('demo-gmbh-media-uploads/versioning', 'demo-gmbh-media-uploads', 's3', 'Bucket Versioning', 'media_uploads', 'aws_s3_bucket_versioning.this[0]'),
  m('demo-gmbh-media-uploads/encryption', 'demo-gmbh-media-uploads', 's3', 'Bucket Encryption', 'media_uploads', 'aws_s3_bucket_server_side_encryption_configuration.this[0]'),
  m('demo-gmbh-media-uploads/public-access', 'demo-gmbh-media-uploads', 's3', 'Public Access Block', 'media_uploads', 'aws_s3_bucket_public_access_block.this[0]'),
  m('demo-gmbh-app-logs', 'demo-gmbh-app-logs', 's3', 'S3 Bucket', 'app_logs', 'aws_s3_bucket.this[0]'),
  m('demo-gmbh-app-logs/public-access', 'demo-gmbh-app-logs', 's3', 'Public Access Block', 'app_logs', 'aws_s3_bucket_public_access_block.this[0]'),
  m('demo-gmbh-reports-export', 'demo-gmbh-reports-export', 's3', 'S3 Bucket', 'reports_export', 'aws_s3_bucket.this[0]'),
  skipped('demo-gmbh-terraform-state', 'demo-gmbh-terraform-state', 's3', 'S3 Bucket'),

  m('app-runtime', 'app-runtime', 'iam', 'IAM Role', 'role_app_runtime', 'aws_iam_role.this[0]'),
  m('lambda-orders-exec', 'lambda-orders-exec', 'iam', 'IAM Role', 'role_lambda_orders', 'aws_iam_role.this[0]'),
  m('legacy-admin', 'legacy-admin', 'iam', 'IAM Role', 'role_legacy_admin', 'aws_iam_role.this[0]'),
  skipped('ci-deploy', 'ci-deploy', 'iam', 'IAM Role'),

  m('orders-api', 'orders-api', 'lambda', 'Lambda Function', 'orders_api', 'aws_lambda_function.this[0]'),
  m('invoice-pdf', 'invoice-pdf', 'lambda', 'Lambda Function', 'invoice_pdf', 'aws_lambda_function.this[0]'),
  m('nightly-export', 'nightly-export', 'lambda', 'Lambda Function', 'nightly_export', 'aws_lambda_function.this[0]'),

  m('https://sqs.eu-central-1.amazonaws.com/482719360155/orders', 'orders', 'sqs', 'SQS Queue', 'orders_queue', 'aws_sqs_queue.this[0]'),
  m('https://sqs.eu-central-1.amazonaws.com/482719360155/orders-dlq', 'orders-dlq', 'sqs', 'SQS Queue', 'orders_dlq', 'aws_sqs_queue.this[0]'),
  m('https://sqs.eu-central-1.amazonaws.com/482719360155/email-outbox', 'email-outbox', 'sqs', 'SQS Queue', 'email_outbox', 'aws_sqs_queue.this[0]'),

  m('arn:aws:sns:eu-central-1:482719360155:ops-alerts', 'ops-alerts', 'sns', 'SNS Topic', 'ops_alerts', 'aws_sns_topic.this[0]'),
  m('arn:aws:sns:eu-central-1:482719360155:order-events', 'order-events', 'sns', 'SNS Topic', 'order_events', 'aws_sns_topic.this[0]'),

  m('sessions', 'sessions', 'dynamodb', 'DynamoDB Table', 'sessions', 'aws_dynamodb_table.this[0]'),
  m('order-index', 'order-index', 'dynamodb', 'DynamoDB Table', 'order_index', 'aws_dynamodb_table.this[0]'),
  skipped('feature-flags', 'feature-flags', 'dynamodb', 'DynamoDB Table'),
]

/** What the first plan gets wrong per service, and how the verify loop corrects it. */
export const DEVIATIONS: Record<Service, { address: string; attr: string; live: string; planned: string; input: string }> = {
  ec2: { address: 'module.web_01.aws_instance.this[0]', attr: 'ebs_optimized', live: 'true', planned: 'false', input: 'ebs_optimized = true' },
  s3: { address: 'module.media_uploads.aws_s3_bucket_server_side_encryption_configuration.this[0]', attr: 'sse_algorithm', live: '"aws:kms"', planned: '"AES256"', input: 'sse_algorithm = "aws:kms"' },
  iam: { address: 'module.role_app_runtime.aws_iam_role.this[0]', attr: 'max_session_duration', live: '7200', planned: '3600', input: 'max_session_duration = 7200' },
  lambda: { address: 'module.orders_api.aws_lambda_function.this[0]', attr: 'timeout', live: '30', planned: '3', input: 'timeout = 30' },
  sqs: { address: 'module.orders_queue.aws_sqs_queue.this[0]', attr: 'visibility_timeout_seconds', live: '120', planned: '30', input: 'visibility_timeout_seconds = 120' },
  sns: { address: 'module.ops_alerts.aws_sns_topic.this[0]', attr: 'display_name', live: '"Ops Alerts"', planned: 'null', input: 'display_name = "Ops Alerts"' },
  dynamodb: { address: 'module.sessions.aws_dynamodb_table.this[0]', attr: 'billing_mode', live: '"PAY_PER_REQUEST"', planned: '"PROVISIONED"', input: 'billing_mode = "PAY_PER_REQUEST"' },
}

export type Severity = 'high' | 'medium' | 'low'

export interface Finding {
  id: string
  /** Shown only when this service was inspected. `null` applies to every run. */
  service: Service | null
  severity: Severity
  title: L10n
  resource: string
  control: string
  file: string
  diff: { sign: '+' | '-' | ' '; text: string }[]
}

const d = (sign: '+' | '-' | ' ', text: string) => ({ sign, text })

export const FINDINGS: Finding[] = [
  {
    id: 'public-bucket', service: 's3', severity: 'high',
    title: { de: 'Bucket erlaubt öffentlichen Lesezugriff', en: 'Bucket allows public read access' },
    resource: 'demo-gmbh-reports-export', control: 'CIS 2.1.5', file: 'storage.tf',
    diff: [
      d(' ', 'module "reports_export" {'), d(' ', '  bucket = "demo-gmbh-reports-export"'),
      d('+', '  block_public_acls       = true'), d('+', '  block_public_policy     = true'),
      d('+', '  ignore_public_acls      = true'), d('+', '  restrict_public_buckets = true'), d(' ', '}'),
    ],
  },
  {
    id: 'unencrypted-volume', service: 'ec2', severity: 'high',
    title: { de: 'Root-Volume nicht verschlüsselt', en: 'Root volume not encrypted at rest' },
    resource: 'bastion', control: 'BSI C5 KRY-03', file: 'compute.tf',
    diff: [d(' ', 'module "bastion" {'), d(' ', '  name = "bastion"'), d('+', '  root_block_device = { encrypted = true }'), d(' ', '}')],
  },
  {
    id: 'open-ssh', service: 'ec2', severity: 'medium',
    title: { de: 'Security Group offen für 0.0.0.0/0 auf Port 22', en: 'Security group open to 0.0.0.0/0 on port 22' },
    resource: 'bastion-old', control: 'ISO 27001 A.8.20', file: 'network.tf',
    diff: [
      d(' ', 'module "sg_bastion_old" {'), d(' ', '  ingress_rules = { ssh = {'),
      d('-', '    cidr_ipv4 = "0.0.0.0/0"'), d('+', '    cidr_ipv4 = "10.20.0.0/16"'), d(' ', '  } }'), d(' ', '}'),
    ],
  },
  {
    id: 'admin-role', service: 'iam', severity: 'medium',
    title: { de: 'Rolle mit vollem Administratorzugriff', en: 'Role with full administrator access' },
    resource: 'legacy-admin', control: 'NIS2 Art. 21', file: 'iam.tf',
    diff: [
      d(' ', 'module "role_legacy_admin" {'),
      d('-', '  policies = { admin = "arn:aws:iam::aws:policy/AdministratorAccess" }'),
      d('+', '  policies = { read = "arn:aws:iam::aws:policy/ReadOnlyAccess" }'), d(' ', '}'),
    ],
  },
  {
    id: 'cost-center-tag', service: null, severity: 'low',
    title: { de: 'Tag „CostCenter“ fehlt', en: 'Missing "CostCenter" tag' },
    resource: '', control: 'Interne Richtlinie', file: 'providers.tf',
    diff: [
      d(' ', 'provider "aws" {'), d(' ', '  region = var.region'),
      d('+', '  default_tags {'), d('+', '    tags = { CostCenter = var.cost_center }'), d('+', '  }'), d(' ', '}'),
    ],
  },
]

export function resourcesFor(services: Service[]): Resource[] {
  return RESOURCES.filter((r) => services.includes(r.service))
}

export function findingsFor(services: Service[]): Finding[] {
  return FINDINGS.filter((f) => f.service === null || services.includes(f.service))
}

/** The one deviation the demo shows: taken from the first inspected service. */
export function deviationFor(services: Service[]) {
  const first = SERVICES.find((s) => services.includes(s.id))
  return first ? DEVIATIONS[first.id] : null
}

export function stats(services: Service[]) {
  const all = resourcesFor(services)
  const imports = all.filter((r) => r.managed === 'clickops')
  const raw = imports.filter((r) => r.raw)
  const calls = CALLS.filter((c) => services.includes(c.service))
  return {
    total: all.length,
    clickops: imports.length,
    iac: all.length - imports.length,
    clickopsShare: all.length ? Math.round((imports.length / all.length) * 100) : 0,
    imports: imports.length,
    moduleCalls: calls.length,
    raw: raw.length,
  }
}
