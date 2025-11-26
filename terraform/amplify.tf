# AWS Amplify App for Frontend Hosting
resource "aws_amplify_app" "frontend" {
  name       = "${var.project_name}-${var.environment}-frontend"
  repository = var.github_repo

  # GitHub personal access token from Secrets Manager
  access_token = var.github_token_secret_arn != "" ? data.aws_secretsmanager_secret_version.github_token[0].secret_string : null

  # Build settings
  build_spec = <<-EOT
    version: 1
    frontend:
      phases:
        preBuild:
          commands:
            - cd frontend
            - npm ci
        build:
          commands:
            - npm run build
      artifacts:
        baseDirectory: frontend/build
        files:
          - '**/*'
      cache:
        paths:
          - frontend/node_modules/**/*
    EOT

  # Environment variables for the build
  environment_variables = {
    REACT_APP_API_ENDPOINT         = aws_api_gateway_stage.main.invoke_url
    REACT_APP_COGNITO_USER_POOL_ID = aws_cognito_user_pool.main.id
    REACT_APP_COGNITO_CLIENT_ID    = aws_cognito_user_pool_client.web.id
    REACT_APP_COGNITO_DOMAIN       = aws_cognito_user_pool_domain.main.domain
    REACT_APP_REGION               = var.aws_region
    REACT_APP_IDENTITY_POOL_ID     = aws_cognito_identity_pool.main.id
    REACT_APP_S3_BUCKET            = aws_s3_bucket.user_uploads.bucket
  }

  # Custom rules for SPA routing
  custom_rule {
    source = "/<*>"
    status = "404-200"
    target = "/index.html"
  }

  # Enable auto branch creation
  enable_auto_branch_creation = false
  enable_branch_auto_build    = true
  enable_branch_auto_deletion = false

  # Platform: WEB for SPA
  platform = "WEB"

  tags = {
    Name = "${var.project_name}-${var.environment}-amplify"
  }
}

# Amplify Branch (main branch)
resource "aws_amplify_branch" "main" {
  app_id      = aws_amplify_app.frontend.id
  branch_name = var.github_branch

  enable_auto_build = true
  stage             = var.environment == "prod" ? "PRODUCTION" : "DEVELOPMENT"

  # Environment variables specific to this branch
  environment_variables = {
    ENV = var.environment
  }

  tags = {
    Name = "${var.project_name}-${var.environment}-${var.github_branch}"
  }
}

# Amplify Domain Association (if custom domain provided)
resource "aws_amplify_domain_association" "main" {
  count = var.domain_name != "" ? 1 : 0

  app_id      = aws_amplify_app.frontend.id
  domain_name = var.domain_name

  # Sub domain settings
  sub_domain {
    branch_name = aws_amplify_branch.main.branch_name
    prefix      = ""
  }

  sub_domain {
    branch_name = aws_amplify_branch.main.branch_name
    prefix      = "www"
  }

  depends_on = [aws_route53_record.amplify_validation]
}

# Route 53 record for Amplify domain validation
resource "aws_route53_record" "amplify_validation" {
  count = var.domain_name != "" ? 1 : 0

  zone_id = aws_route53_zone.main[0].zone_id
  name    = var.domain_name
  type    = "A"

  alias {
    name                   = aws_amplify_app.frontend.default_domain
    zone_id                = "Z2FDTNDATAQYW2" # CloudFront hosted zone ID (constant)
    evaluate_target_health = false
  }
}

# Amplify Webhook for manual deployments (optional)
resource "aws_amplify_webhook" "main" {
  app_id      = aws_amplify_app.frontend.id
  branch_name = aws_amplify_branch.main.branch_name
  description = "Manual deployment webhook"
}

# Data source to fetch GitHub token from Secrets Manager
data "aws_secretsmanager_secret" "github_token" {
  count = var.github_token_secret_arn != "" ? 1 : 0
  arn   = var.github_token_secret_arn
}

data "aws_secretsmanager_secret_version" "github_token" {
  count     = var.github_token_secret_arn != "" ? 1 : 0
  secret_id = data.aws_secretsmanager_secret.github_token[0].id
}
