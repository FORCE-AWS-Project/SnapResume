variable "aws_region" {
  description = "AWS region for resources"
  type        = string
  default     = "us-east-1"
}

variable "project_name" {
  description = "Project name"
  type        = string
  default     = "resume-snap"
}

variable "environment" {
  description = "Environment (dev, staging, prod)"
  type        = string
  default     = "dev"
}

variable "domain_name" {
  description = "Domain name for the application"
  type        = string
  default     = ""
}

variable "github_repo_url" {
  description = "GitHub repository in url form"
  type        = string
  default     = "https://github.com/FORCE-AWS-Project/SnapResume"
}

variable "github_repo"{
  description = "GitHub repository (format: owner/repo)"
  type        = string
  default     = "FORCE-AWS-Project/SnapResume"
}

variable "github_branch_frontend" {
  description = "GitHub branch for CI/CD"
  type        = string
  default     = "dev"
}

variable "github_branch_backend" {
  description = "GitHub branch for CI/CD"
  type        = string
  default     = "dev"
}

variable "github_token_secret_arn" {
  description = "ARN of the secret containing GitHub token"
  type        = string
  default     = ""
}

variable "github_access_token" {
  description = "GitHub personal access token for Amplify"
  type        = string
  default     = ""
  sensitive   = true
}

variable "lambda_runtime" {
  description = "Lambda runtime"
  type        = string
  default     = "nodejs24.x"
}

variable "dynamodb_billing_mode" {
  description = "DynamoDB billing mode"
  type        = string
  default     = "PAY_PER_REQUEST"
}

variable "enable_waf" {
  description = "Enable AWS WAF"
  type        = bool
  default     = true
}

variable "enable_cloudwatch_alarms" {
  description = "Enable CloudWatch alarms"
  type        = bool
  default     = true
}
