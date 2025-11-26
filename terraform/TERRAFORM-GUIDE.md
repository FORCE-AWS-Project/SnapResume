# Terraform Guide: Understanding Infrastructure as Code

## Table of Contents
1. [What is Terraform?](#what-is-terraform)
2. [How Terraform Works](#how-terraform-works)
3. [Terraform Workflow](#terraform-workflow)
4. [File Structure Explained](#file-structure-explained)
5. [Detailed File Breakdown](#detailed-file-breakdown)
6. [Best Practices](#best-practices)

---

## What is Terraform?

**Terraform** is an Infrastructure as Code (IaC) tool that allows you to define and provision cloud infrastructure using declarative configuration files. Instead of manually clicking through AWS console to create resources, you write code that describes what you want, and Terraform creates it for you.

### Key Benefits

- **Version Control**: Infrastructure code can be versioned in Git
- **Reproducibility**: Deploy identical infrastructure across environments
- **Automation**: Automate infrastructure provisioning and updates
- **Documentation**: Code serves as documentation of your infrastructure
- **Consistency**: Reduces human errors from manual configuration
- **Multi-Cloud**: Works with AWS, Azure, GCP, and 100+ providers

---

## How Terraform Works

### Core Concepts

#### 1. **Providers**
Providers are plugins that allow Terraform to interact with cloud platforms (AWS, Azure, etc.) and services. Each provider offers a set of resources and data sources.

```hcl
provider "aws" {
  region = "us-east-1"
}
```

#### 2. **Resources**
Resources are the fundamental building blocks. Each resource represents an infrastructure object (EC2 instance, S3 bucket, etc.).

```hcl
resource "aws_s3_bucket" "my_bucket" {
  bucket = "my-unique-bucket-name"
}
```

#### 3. **State**
Terraform maintains a **state file** (`terraform.tfstate`) that tracks what infrastructure exists. This is how Terraform knows what needs to be created, updated, or destroyed.

#### 4. **Plan**
Before making changes, Terraform creates an execution plan showing what will happen:
- `+` = Resource will be created
- `-` = Resource will be destroyed
- `~` = Resource will be modified
- `-/+` = Resource will be destroyed and recreated

#### 5. **Apply**
After reviewing the plan, you apply it to make the actual changes to your infrastructure.

---

## Terraform Workflow

```
┌─────────────────────────────────────────────────────────────┐
│                    TERRAFORM WORKFLOW                       │
└─────────────────────────────────────────────────────────────┘

1. WRITE CONFIGURATION
   │
   ├─> Write .tf files describing infrastructure
   │
   ▼

2. TERRAFORM INIT
   │
   ├─> Downloads provider plugins
   ├─> Initializes backend for state storage
   ├─> Prepares working directory
   │
   ▼

3. TERRAFORM PLAN
   │
   ├─> Reads configuration files
   ├─> Compares with current state
   ├─> Shows what will change
   │
   ▼

4. TERRAFORM APPLY
   │
   ├─> Executes the plan
   ├─> Creates/updates/deletes resources
   ├─> Updates state file
   │
   ▼

5. INFRASTRUCTURE DEPLOYED ✓
   │
   ├─> Resources are live in AWS
   ├─> State file reflects current reality
   │
   ▼

6. TERRAFORM DESTROY (when needed)
   │
   └─> Removes all infrastructure
```

### Commands Explained

```bash
# Initialize Terraform (run first)
terraform init

# Format code to canonical style
terraform fmt

# Validate configuration syntax
terraform validate

# Show execution plan (what will change)
terraform plan

# Apply changes to infrastructure
terraform apply

# Destroy all infrastructure
terraform destroy

# Show current state
terraform show

# List all resources in state
terraform state list

# View outputs
terraform output
```

---

## File Structure Explained

Our Terraform project is organized into multiple files for better maintainability:

```
terraform/
├── providers.tf              # Provider and Terraform configuration
├── variables.tf              # Input variables (customizable values)
├── terraform.tfvars.example  # Example variable values
├── outputs.tf                # Output values after deployment
├── s3-cloudfront.tf         # S3 and CloudFront resources
├── cognito.tf               # Authentication resources
├── api-gateway.tf           # API Gateway configuration
├── lambda.tf                # Lambda functions
├── dynamodb.tf              # Database tables
├── route53-waf.tf           # DNS and security
├── cicd.tf                  # CI/CD pipeline
├── cloudwatch.tf            # Monitoring and logging
├── .gitignore               # Files to exclude from Git
└── README.md                # Setup instructions
```

### Why Multiple Files?

Terraform reads **all `.tf` files** in a directory and treats them as a single configuration. We split them into multiple files for:

1. **Organization**: Each file focuses on a specific service
2. **Maintainability**: Easier to find and update resources
3. **Collaboration**: Multiple team members can work on different files
4. **Readability**: Smaller files are easier to understand

---

## Detailed File Breakdown

### 1. `providers.tf` - Foundation Configuration

**Purpose**: Configures Terraform settings and AWS provider

```hcl
terraform {
  required_version = ">= 1.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}
```

**What it does**:
- Sets minimum Terraform version required
- Specifies which provider plugins to use (AWS)
- Configures provider version constraints
- Sets up default tags for all resources
- Creates multiple provider instances (regular and us-east-1 for CloudFront)

**Why we need it**:
- Every Terraform project needs a provider to interact with cloud platforms
- CloudFront requires certificates in us-east-1, so we need two AWS providers

---

### 2. `variables.tf` - Configuration Parameters

**Purpose**: Defines input variables that make the configuration flexible

```hcl
variable "aws_region" {
  description = "AWS region for resources"
  type        = string
  default     = "us-east-1"
}
```

**What it does**:
- Declares variables that can be customized
- Sets default values
- Defines data types (string, number, bool)
- Provides descriptions for documentation

**Why we need it**:
- Makes configuration reusable across environments (dev, staging, prod)
- Allows customization without changing code
- You set actual values in `terraform.tfvars`

**Example usage**:
```hcl
# In variables.tf - declaration
variable "project_name" {
  type    = string
  default = "resume-snap"
}

# In terraform.tfvars - actual value
project_name = "my-custom-name"

# In other files - reference
resource "aws_s3_bucket" "example" {
  bucket = "${var.project_name}-bucket"
}
```

---

### 3. `terraform.tfvars.example` - Configuration Template

**Purpose**: Template showing what values you need to provide

**What it does**:
- Shows example values for all variables
- Serves as documentation for required settings
- Users copy this to `terraform.tfvars` and fill in their values

**Why we need it**:
- `terraform.tfvars` contains sensitive data (excluded from Git)
- This example helps new users know what to configure
- Documents all available configuration options

**Usage**:
```bash
cp terraform.tfvars.example terraform.tfvars
# Edit terraform.tfvars with your actual values
```

---

### 4. `s3-cloudfront.tf` - Content Delivery

**Purpose**: Creates storage and CDN for static website files

**Resources created**:
- **S3 Bucket**: Stores your frontend files (HTML, CSS, JS, images)
- **Bucket Policies**: Controls access (only CloudFront can read)
- **CloudFront Distribution**: CDN that caches and serves content globally
- **Origin Access Identity (OAI)**: Allows CloudFront to access private S3 bucket
- **ACM Certificate**: SSL/TLS certificate for HTTPS

**What it does**:
```
User Request
    ↓
CloudFront (CDN)
    ↓
S3 Bucket (Static Files)
```

**Why we need it**:
- **Fast**: CloudFront caches content at edge locations worldwide
- **Secure**: S3 bucket is private, only CloudFront can access
- **Cost-effective**: Reduces bandwidth costs
- **HTTPS**: Provides SSL certificate for secure connections

**Key Features**:
- Compression enabled for faster downloads
- Custom error pages (404 redirects to index.html for SPA routing)
- Cache behaviors for different content types
- Encryption at rest

---

### 5. `cognito.tf` - User Authentication

**Purpose**: Manages user registration, login, and authentication

**Resources created**:
- **User Pool**: Database of users with email/password
- **User Pool Client**: Configuration for your app to connect
- **Identity Pool**: Provides temporary AWS credentials
- **IAM Roles**: Permissions for authenticated users

**What it does**:
```
User Sign Up/Login
    ↓
Cognito User Pool (authenticates)
    ↓
JWT Token issued
    ↓
Identity Pool (provides AWS credentials)
    ↓
User can access API Gateway
```

**Why we need it**:
- **Secure Authentication**: Industry-standard OAuth 2.0 / OpenID Connect
- **User Management**: Built-in password policies, MFA, email verification
- **Token-based**: Stateless authentication with JWT tokens
- **No server management**: Fully managed by AWS

**Features included**:
- Email verification
- Password policies (complexity requirements)
- Optional MFA (Multi-Factor Authentication)
- Account recovery via email
- Advanced security mode (blocks suspicious sign-ins)

---

### 6. `api-gateway.tf` - API Management

**Purpose**: Creates and manages REST API endpoints

**Resources created**:
- **REST API**: Main API definition
- **Authorizer**: Validates Cognito tokens
- **Resources & Methods**: API routes (paths and HTTP methods)
- **Integration**: Connects API to Lambda functions
- **Stage**: Deployment environment (dev, staging, prod)
- **Usage Plan**: Rate limiting and throttling

**What it does**:
```
Client Request with JWT Token
    ↓
API Gateway (validates token with Cognito)
    ↓
Routes to Lambda function
    ↓
Returns response to client
```

**Why we need it**:
- **Security**: Validates authentication tokens before reaching Lambda
- **Rate Limiting**: Prevents abuse with throttling
- **CORS**: Allows frontend to call API from different domain
- **Monitoring**: Logs all requests for debugging
- **Versioning**: Deploy different versions/stages

**Key Features**:
- Cognito authorizer (only authenticated users can access)
- CORS configuration for cross-origin requests
- CloudWatch logging for all requests
- Usage plans with quotas and throttling
- Proxy integration with Lambda (passes entire request)

---

### 7. `lambda.tf` - Backend Business Logic

**Purpose**: Serverless compute for your application backend

**Resources created**:
- **Lambda Function**: Your Node.js backend code
- **IAM Execution Role**: Permissions for Lambda
- **CloudWatch Log Group**: Stores function logs
- **Lambda Permission**: Allows API Gateway to invoke function

**What it does**:
```
API Gateway Request
    ↓
Lambda Function executes
    ↓
Reads/writes to DynamoDB
    ↓
Returns response
```

**Why we need it**:
- **Serverless**: No servers to manage, auto-scales
- **Cost-effective**: Pay only for execution time
- **Isolated**: Each function runs in its own environment
- **Fast**: Can handle thousands of concurrent requests

**Permissions included**:
- Read/write to DynamoDB tables
- Query Cognito for user information
- Upload/download from S3
- Write logs to CloudWatch
- X-Ray tracing for debugging

**Environment variables**:
- Database table names
- Cognito User Pool ID
- Region information
- Other configuration

---

### 8. `dynamodb.tf` - Database Layer

**Purpose**: NoSQL database for storing application data

**Resources created**:
- **Main Table**: Generic key-value store with flexible schema
- **Resumes Table**: Stores resume documents
- **Sessions Table**: User session management
- **Global Secondary Indexes (GSI)**: Alternative query patterns
- **Auto-scaling**: Automatically adjusts capacity (if provisioned mode)

**What it does**:
```
Lambda Function
    ↓
DynamoDB Tables
    ├─> Main (flexible data)
    ├─> Resumes (user resumes)
    └─> Sessions (login sessions)
```

**Why we need it**:
- **Fast**: Single-digit millisecond latency
- **Scalable**: Handles any amount of traffic
- **Flexible**: No fixed schema required
- **Managed**: No database servers to maintain

**Table Design**:

**Main Table** (Single-table design pattern):
- PK (Partition Key): Main identifier
- SK (Sort Key): Sub-identifier for sorting
- GSI1/GSI2: Alternative access patterns

**Resumes Table**:
- userId: Who owns the resume
- resumeId: Unique resume identifier
- Indexes for querying by status and date

**Sessions Table**:
- sessionId: Unique session identifier
- userId: Who owns the session
- TTL: Automatic deletion when expired

**Features**:
- Point-in-time recovery (backups)
- Encryption at rest
- TTL (Time To Live) for automatic cleanup
- Streams for triggering events
- PAY_PER_REQUEST billing (no capacity planning)

---

### 9. `route53-waf.tf` - DNS and Security

**Purpose**: Domain management and web application firewall

**Resources created**:

**Route 53** (DNS):
- **Hosted Zone**: DNS records for your domain
- **A Records**: Points domain to CloudFront
- **Certificate Validation Records**: Proves you own the domain

**AWS WAF** (Web Application Firewall):
- **Web ACL**: Collection of security rules
- **Rate Limiting**: Blocks IPs making too many requests
- **Managed Rule Sets**: Protection against common attacks

**What it does**:
```
User types yourdomain.com
    ↓
Route 53 DNS lookup
    ↓
Returns CloudFront IP
    ↓
WAF checks request for threats
    ↓
Allows or blocks request
```

**Why we need it**:

**Route 53**:
- **DNS Management**: Resolves your domain to CloudFront
- **SSL/TLS**: Validates certificate ownership
- **Health Checks**: Can route around failures
- **Fast**: Global DNS with low latency

**WAF**:
- **Security**: Protects against OWASP Top 10 vulnerabilities
- **Rate Limiting**: Prevents DDoS attacks
- **SQL Injection Protection**: Blocks malicious database queries
- **XSS Protection**: Prevents cross-site scripting attacks
- **Bot Protection**: Identifies and blocks bots

**WAF Rules included**:
1. **Rate Limiting**: Max 2000 requests per 5 minutes per IP
2. **Common Rule Set**: Protection against known attacks
3. **Known Bad Inputs**: Blocks requests with malicious patterns
4. **SQL Injection Protection**: Detects SQL injection attempts

---

### 10. `cicd.tf` - Continuous Integration/Deployment

**Purpose**: Automates building and deploying your application

**Resources created**:
- **S3 Artifacts Bucket**: Stores build artifacts
- **CodeBuild Projects**: Builds frontend and backend
- **CodePipeline**: Orchestrates the entire process
- **IAM Roles**: Permissions for CI/CD services

**What it does**:
```
Developer pushes to GitHub
    ↓
CodePipeline triggered
    ↓
CodeBuild: Build Frontend
    ├─> npm install
    ├─> npm run build
    └─> Upload to S3

CodeBuild: Build Backend
    ├─> npm install
    ├─> npm test
    ├─> Create zip package
    └─> Update Lambda function
    ↓
Deployment complete ✓
```

**Pipeline Stages**:

1. **Source**: Monitors GitHub for changes
2. **Build**: Compiles and tests code (parallel builds)
3. **Deploy**: Updates Lambda and S3 automatically

**Why we need it**:
- **Automation**: No manual deployments
- **Consistency**: Same process every time
- **Speed**: Deploy in minutes, not hours
- **Testing**: Runs tests before deploying
- **Rollback**: Easy to revert to previous version

**Environment variables injected**:
- API endpoints
- Cognito configuration
- S3 bucket names
- CloudFront distribution IDs

---

### 11. `cloudwatch.tf` - Monitoring and Observability

**Purpose**: Monitor application health and performance

**Resources created**:
- **Dashboard**: Visual graphs of key metrics
- **Alarms**: Notifications when things go wrong
- **Log Groups**: Centralized logging
- **Log Insights Queries**: Pre-built search queries
- **X-Ray Sampling**: Distributed tracing configuration
- **SNS Topic**: Email/SMS notifications for alarms

**What it does**:
```
Application runs
    ↓
Sends metrics & logs to CloudWatch
    ↓
Alarms evaluate thresholds
    ↓
SNS sends notifications if problems detected
```

**Metrics monitored**:

**Lambda**:
- Invocation count
- Error rate
- Duration (latency)
- Throttles (capacity issues)

**API Gateway**:
- Total requests
- 4XX errors (client errors)
- 5XX errors (server errors)
- Latency

**DynamoDB**:
- Read/write capacity usage
- Throttled requests
- User errors
- System errors

**CloudFront**:
- Request count
- Bytes downloaded
- Error rates
- Cache hit ratio

**Why we need it**:
- **Visibility**: Know what's happening in real-time
- **Troubleshooting**: Debug issues with logs
- **Alerting**: Get notified of problems immediately
- **Performance**: Track and optimize response times
- **Cost Management**: Monitor resource usage

**Alarms configured**:
- Lambda errors > 10 in 5 minutes
- Lambda duration > 25 seconds
- API 5XX errors > 10 in 5 minutes
- API latency > 5 seconds
- DynamoDB throttling
- CloudFront 5XX error rate > 5%

---

### 12. `outputs.tf` - Export Important Values

**Purpose**: Displays important information after deployment

**What it does**:
- Shows URLs, IDs, and ARNs after `terraform apply`
- Exports values for use in other tools/scripts
- Provides configuration needed by frontend/backend

**Why we need it**:
- **Configuration**: Get API endpoints for your frontend
- **Integration**: Connect other services to your infrastructure
- **Documentation**: Quick reference for important values
- **Automation**: Other scripts can read these values

**Example outputs**:
```bash
# After running terraform apply:

cloudfront_url = "https://d123456.cloudfront.net"
api_gateway_url = "https://abc123.execute-api.us-east-1.amazonaws.com/dev"
cognito_user_pool_id = "us-east-1_abc123def"
```

**Environment configuration outputs**:
- Frontend needs: API URL, Cognito IDs, region
- Backend needs: DynamoDB table names, S3 bucket
- CI/CD needs: CodePipeline name, build projects

---

## How They Work Together

### Execution Flow

1. **User visits website**:
   - DNS (Route 53) → CloudFront → S3 (frontend files)

2. **User signs up/logs in**:
   - Frontend → Cognito → JWT token issued

3. **User makes API request**:
   - Frontend → API Gateway (validates token) → Lambda → DynamoDB

4. **Developer pushes code**:
   - GitHub → CodePipeline → CodeBuild → Deploy

5. **Monitoring**:
   - All services → CloudWatch metrics & logs
   - Alarms → SNS → Email notifications

### Resource Dependencies

Terraform automatically handles dependencies:

```
Route 53 depends on → CloudFront
                      ↓
CloudFront depends on → S3 Bucket
                        ACM Certificate
                        WAF

API Gateway depends on → Lambda Function
                         Cognito User Pool
                         CloudWatch Log Group

Lambda depends on → IAM Role
                    DynamoDB Tables

CodePipeline depends on → CodeBuild Projects
                          S3 Artifacts Bucket
                          IAM Roles
```

Terraform creates resources in the correct order automatically!

---

## Best Practices

### 1. State Management

**For Production**, use remote state:

```hcl
terraform {
  backend "s3" {
    bucket         = "my-terraform-state"
    key            = "resume-snap/terraform.tfstate"
    region         = "us-east-1"
    encrypt        = true
    dynamodb_table = "terraform-state-lock"
  }
}
```

**Why?**
- State file contains sensitive data
- Team collaboration requires shared state
- Locking prevents concurrent modifications
- S3 versioning allows state recovery

### 2. Variable Files

- Use `terraform.tfvars` for values (Git ignored)
- Use `-var-file=prod.tfvars` for multiple environments
- Never commit secrets to Git

### 3. Module Organization

For larger projects, organize into modules:

```
terraform/
├── modules/
│   ├── networking/
│   ├── compute/
│   └── database/
└── environments/
    ├── dev/
    ├── staging/
    └── prod/
```

### 4. Security

- Enable encryption everywhere (S3, DynamoDB, logs)
- Use least privilege IAM policies
- Enable MFA for Cognito
- Use WAF to protect against attacks
- Store secrets in AWS Secrets Manager
- Enable CloudTrail for audit logs

### 5. Cost Optimization

- Use PAY_PER_REQUEST for DynamoDB (small projects)
- Enable S3 lifecycle policies to delete old files
- Use Lambda reserved concurrency to prevent runaway costs
- Set up billing alarms in CloudWatch
- Review CloudFront cache settings

### 6. Workflow

```bash
# Daily workflow
git pull
terraform fmt          # Format code
terraform validate     # Check syntax
terraform plan         # Review changes
terraform apply        # Deploy if looks good
git add .
git commit -m "Update infrastructure"
git push
```

---

## Common Terraform Commands Reference

```bash
# Initialize and setup
terraform init                 # Initialize working directory
terraform init -upgrade        # Upgrade provider plugins

# Planning and validation
terraform fmt                  # Format all .tf files
terraform validate            # Validate configuration
terraform plan                # Show execution plan
terraform plan -out=plan.out  # Save plan to file

# Applying changes
terraform apply               # Apply changes (asks for confirmation)
terraform apply -auto-approve # Apply without confirmation
terraform apply plan.out      # Apply saved plan

# Inspecting state
terraform show                # Show current state
terraform state list          # List all resources
terraform state show <resource>  # Show specific resource
terraform output              # Show all outputs
terraform output <name>       # Show specific output

# Destroying resources
terraform destroy             # Destroy all resources
terraform destroy -target=<resource>  # Destroy specific resource

# Importing existing resources
terraform import <resource> <id>  # Import existing AWS resource

# Working with workspaces (environments)
terraform workspace list      # List workspaces
terraform workspace new dev   # Create new workspace
terraform workspace select dev # Switch workspace

# Debugging
terraform console             # Interactive console
TF_LOG=DEBUG terraform apply  # Enable debug logging
```

---

## Troubleshooting Common Issues

### Issue: "Error: Provider configuration not found"
**Solution**: Run `terraform init` to download providers

### Issue: "Error: resource already exists"
**Solution**: Import existing resource or destroy and recreate

### Issue: "Error: state lock"
**Solution**: Wait for lock to release or force unlock:
```bash
terraform force-unlock <lock-id>
```

### Issue: Changes not applying
**Solution**: Check Terraform state is in sync:
```bash
terraform refresh
terraform plan
```

### Issue: Costs too high
**Solution**: Review resources:
```bash
terraform state list
# Check each resource in AWS console
# Destroy unused resources
```

---

## Additional Resources

- [Official Terraform Documentation](https://www.terraform.io/docs)
- [AWS Provider Documentation](https://registry.terraform.io/providers/hashicorp/aws/latest/docs)
- [Terraform Best Practices](https://www.terraform-best-practices.com/)
- [AWS Well-Architected Framework](https://aws.amazon.com/architecture/well-architected/)

---

## Summary

**Terraform lets you**:
- Define infrastructure as code
- Version control your infrastructure
- Automate deployments
- Ensure consistency across environments
- Collaborate with teams

**Our configuration includes**:
- ✅ Secure authentication (Cognito)
- ✅ Serverless backend (Lambda + API Gateway)
- ✅ Global CDN (CloudFront)
- ✅ NoSQL database (DynamoDB)
- ✅ Automated deployments (CodePipeline)
- ✅ Complete monitoring (CloudWatch)
- ✅ Web security (WAF)
- ✅ DNS management (Route 53)

**Next steps**:
1. Review each .tf file to understand resources
2. Customize `terraform.tfvars` for your project
3. Run `terraform plan` to see what will be created
4. Deploy with `terraform apply`
5. Monitor with CloudWatch dashboard

Happy infrastructure coding! 🚀
