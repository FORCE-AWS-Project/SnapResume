# Amplify Outputs
output "amplify_app_id" {
  description = "Amplify App ID"
  value       = aws_amplify_app.frontend.id
}

output "amplify_app_arn" {
  description = "Amplify App ARN"
  value       = aws_amplify_app.frontend.arn
}

output "amplify_default_domain" {
  description = "Amplify Default Domain"
  value       = aws_amplify_app.frontend.default_domain
}

output "amplify_app_url" {
  description = "Amplify App URL"
  value       = "https://${aws_amplify_branch.main.branch_name}.${aws_amplify_app.frontend.default_domain}"
}

output "amplify_custom_domain" {
  description = "Amplify Custom Domain (if configured)"
  value       = var.domain_name != "" ? "https://${var.domain_name}" : null
}

# S3 and CloudFront Outputs (for user uploads/static assets)
output "s3_user_uploads_bucket_name" {
  description = "Name of the S3 bucket for user uploads"
  value       = aws_s3_bucket.user_uploads.bucket
}

output "cloudfront_static_assets_distribution_id" {
  description = "CloudFront Distribution ID for Static Assets"
  value       = aws_cloudfront_distribution.static_assets.id
}

output "cloudfront_static_assets_domain" {
  description = "CloudFront Domain Name for Static Assets"
  value       = aws_cloudfront_distribution.static_assets.domain_name
}

output "cloudfront_static_assets_url" {
  description = "CloudFront URL for Static Assets"
  value       = "https://${aws_cloudfront_distribution.static_assets.domain_name}"
}

# Cognito Outputs
output "cognito_user_pool_id" {
  description = "Cognito User Pool ID"
  value       = aws_cognito_user_pool.main.id
}

output "cognito_user_pool_arn" {
  description = "Cognito User Pool ARN"
  value       = aws_cognito_user_pool.main.arn
}

output "cognito_user_pool_endpoint" {
  description = "Cognito User Pool Endpoint"
  value       = aws_cognito_user_pool.main.endpoint
}

output "cognito_client_id" {
  description = "Cognito User Pool Client ID"
  value       = aws_cognito_user_pool_client.web.id
  sensitive   = true
}

output "cognito_domain" {
  description = "Cognito User Pool Domain"
  value       = aws_cognito_user_pool_domain.main.domain
}

output "cognito_identity_pool_id" {
  description = "Cognito Identity Pool ID"
  value       = aws_cognito_identity_pool.main.id
}

# API Gateway Outputs
output "api_gateway_id" {
  description = "API Gateway REST API ID"
  value       = aws_api_gateway_rest_api.main.id
}

output "api_gateway_url" {
  description = "API Gateway Invoke URL"
  value       = aws_api_gateway_stage.main.invoke_url
}

output "api_gateway_stage" {
  description = "API Gateway Stage Name"
  value       = aws_api_gateway_stage.main.stage_name
}

# Lambda Outputs
output "lambda_function_name" {
  description = "Lambda Function Name"
  value       = aws_lambda_function.api.function_name
}

output "lambda_function_arn" {
  description = "Lambda Function ARN"
  value       = aws_lambda_function.api.arn
}

output "lambda_function_url" {
  description = "Lambda Function URL"
  value       = aws_lambda_function_url.api.function_url
}

output "lambda_api_function_name" {
  description = "Main API Lambda Function Name"
  value       = aws_lambda_function.api.function_name
}

output "lambda_api_function_arn" {
  description = "Main API Lambda Function ARN"
  value       = aws_lambda_function.api.arn
}

output "lambda_cognito_function_name" {
  description = "Cognito Post-Confirmation Lambda Function Name"
  value       = aws_lambda_function.cognito_post_confirmation.function_name
}

output "lambda_cognito_function_arn" {
  description = "Cognito Post-Confirmation Lambda Function ARN"
  value       = aws_lambda_function.cognito_post_confirmation.arn
}

output "codestar_connection_arn" {
  description = "CodeStar Connection ARN for GitHub"
  value       = aws_codestarconnections_connection.github.arn
}

output "codestar_connection_status" {
  description = "CodeStar Connection Status"
  value       = aws_codestarconnections_connection.github.connection_status
}

# DynamoDB Outputs
output "dynamodb_users_table_name" {
  description = "DynamoDB Users Table Name"
  value       = aws_dynamodb_table.users.name
}

output "dynamodb_users_table_arn" {
  description = "DynamoDB Users Table ARN"
  value       = aws_dynamodb_table.users.arn
}

output "dynamodb_resumes_table_name" {
  description = "DynamoDB Resumes Table Name"
  value       = aws_dynamodb_table.resumes.name
}

output "dynamodb_templates_table_name" {
  description = "DynamoDB Templates Table Name"
  value       = aws_dynamodb_table.templates.name
}

output "route53_name_servers" {
  description = "Route 53 Name Servers"
  value       = var.domain_name != "" ? aws_route53_zone.main[0].name_servers : null
}

output "domain_name" {
  description = "Domain Name"
  value       = var.domain_name != "" ? var.domain_name : "${aws_amplify_branch.main.branch_name}.${aws_amplify_app.frontend.default_domain}"
}

# WAF Outputs
output "waf_web_acl_id" {
  description = "WAF Web ACL ID"
  value       = var.enable_waf ? aws_wafv2_web_acl.main[0].id : null
}

output "waf_web_acl_arn" {
  description = "WAF Web ACL ARN"
  value       = var.enable_waf ? aws_wafv2_web_acl.main[0].arn : null
}

# CI/CD Outputs
output "codepipeline_name" {
  description = "CodePipeline Name"
  value       = aws_codepipeline.main.name
}

output "codepipeline_arn" {
  description = "CodePipeline ARN"
  value       = aws_codepipeline.main.arn
}

output "codebuild_backend_project_name" {
  description = "CodeBuild Backend Project Name"
  value       = aws_codebuild_project.backend.name
}

# CloudWatch Outputs
output "cloudwatch_dashboard_name" {
  description = "CloudWatch Dashboard Name"
  value       = aws_cloudwatch_dashboard.main.dashboard_name
}

output "sns_alarms_topic_arn" {
  description = "SNS Alarms Topic ARN"
  value       = var.enable_cloudwatch_alarms ? aws_sns_topic.alarms[0].arn : null
}

# CloudFront API Outputs
output "cloudfront_api_distribution_id" {
  description = "CloudFront Distribution ID for API"
  value       = aws_cloudfront_distribution.static_assets.id
}

output "cloudfront_api_domain" {
  description = "CloudFront Domain Name for API"
  value       = aws_cloudfront_distribution.static_assets.domain_name
}

output "cloudfront_api_url" {
  description = "CloudFront URL for API"
  value       = "https://${aws_cloudfront_distribution.static_assets.domain_name}"
}

# Environment Configuration Output
output "frontend_env_config" {
  description = "Frontend environment configuration"
  value = {
    REACT_APP_API_ENDPOINT         = "https://${aws_cloudfront_distribution.static_assets.domain_name}/api"
    REACT_APP_COGNITO_USER_POOL_ID = aws_cognito_user_pool.main.id
    REACT_APP_COGNITO_CLIENT_ID    = aws_cognito_user_pool_client.web.id
    REACT_APP_COGNITO_DOMAIN       = aws_cognito_user_pool_domain.main.domain
    REACT_APP_REGION               = var.aws_region
    REACT_APP_IDENTITY_POOL_ID     = aws_cognito_identity_pool.main.id
    REACT_APP_S3_BUCKET            = aws_s3_bucket.user_uploads.bucket
    REACT_APP_CDN_URL              = "https://${aws_cloudfront_distribution.static_assets.domain_name}"
    REACT_APP_CLOUDFRONT_API_URL   = "https://${aws_cloudfront_distribution.static_assets.domain_name}"
  }
  sensitive = true
}

output "backend_env_config" {
  description = "Backend environment configuration"
  value = {
    DYNAMODB_USERS_TABLE      = aws_dynamodb_table.users.name
    DYNAMODB_SECTIONS_TABLE   = aws_dynamodb_table.sections.name
    DYNAMODB_RESUMES_TABLE    = aws_dynamodb_table.resumes.name
    DYNAMODB_TEMPLATES_TABLE  = aws_dynamodb_table.templates.name
    COGNITO_USER_POOL_ID      = aws_cognito_user_pool.main.id
    COGNITO_CLIENT_ID         = aws_cognito_user_pool_client.web.id
    REGION                    = var.aws_region
    S3_BUCKET                 = aws_s3_bucket.user_uploads.bucket
  }
}

# Quick Start URLs
output "application_urls" {
  description = "Quick access URLs for the application"
  value = {
    frontend    = var.domain_name != "" ? "https://${var.domain_name}" : "https://${aws_amplify_branch.main.branch_name}.${aws_amplify_app.frontend.default_domain}"
    api         = "https://${aws_cloudfront_distribution.static_assets.domain_name}/api"
    amplify_console = "https://console.aws.amazon.com/amplify/home?region=${var.aws_region}#/${aws_amplify_app.frontend.id}"
    cloudwatch  = "https://console.aws.amazon.com/cloudwatch/home?region=${var.aws_region}#dashboards:name=${aws_cloudwatch_dashboard.main.dashboard_name}"
  }
}
