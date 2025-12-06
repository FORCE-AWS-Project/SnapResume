# AWS Amplify App for Frontend Hosting
resource "aws_amplify_app" "frontend" {
  name       = "${var.project_name}-${var.environment}-frontend"
  repository = var.github_repo_url

  access_token = var.github_access_token

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
        baseDirectory: frontend/dist
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

  tags = {
    Name = "${var.project_name}-${var.environment}-amplify"
  }
}

# Amplify Branch (main branch)
resource "aws_amplify_branch" "main" {
  app_id      = aws_amplify_app.frontend.id
  branch_name = var.github_branch_frontend

  enable_auto_build = true
  stage             = var.environment == "prod" ? "PRODUCTION" : "DEVELOPMENT"

  # Environment variables specific to this branch
  environment_variables = {
    ENV = var.environment
  }

  tags = {
    Name = "${var.project_name}-${var.environment}-${var.github_branch_frontend}"
  }
}