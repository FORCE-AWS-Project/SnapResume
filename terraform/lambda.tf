# Lambda Function for API
resource "aws_lambda_function" "api" {
  filename      = "lambda.zip"
  function_name = "${var.project_name}-${var.environment}-api"
  role          = aws_iam_role.lambda_exec.arn
  handler       = "index.lambdaHandler"
  runtime       = "nodejs20.x"
  timeout       = 30
  memory_size   = 512

  source_code_hash = fileexists("lambda.zip") ? filebase64sha256("lambda.zip") : null

  environment {
    variables = {
      ENVIRONMENT              = var.environment
      DYNAMODB_USERS_TABLE     = aws_dynamodb_table.users.name
      DYNAMODB_SECTIONS_TABLE  = aws_dynamodb_table.sections.name
      DYNAMODB_RESUMES_TABLE   = aws_dynamodb_table.resumes.name
      DYNAMODB_TEMPLATES_TABLE = aws_dynamodb_table.templates.name
      COGNITO_USER_POOL_ID     = aws_cognito_user_pool.main.id
      COGNITO_CLIENT_ID        = aws_cognito_user_pool_client.web.id
      REGION                   = var.aws_region
      S3_BUCKET                = aws_s3_bucket.user_uploads.bucket
    }
  }

  tracing_config {
    mode = "Active"
  }

  tags = {
    Name = "${var.project_name}-${var.environment}-api-lambda"
  }

  lifecycle {
    ignore_changes = [
      filename,
      source_code_hash
    ]
  }
}

# Lambda Permission for API Gateway
resource "aws_lambda_permission" "api_gateway" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.api.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_api_gateway_rest_api.main.execution_arn}/*/*"
}

# Lambda Execution Role
resource "aws_iam_role" "lambda_exec" {
  name = "${var.project_name}-${var.environment}-lambda-exec"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Principal = {
          Service = "lambda.amazonaws.com"
        }
        Action = "sts:AssumeRole"
      }
    ]
  })
}

# Lambda Basic Execution Policy
resource "aws_iam_role_policy_attachment" "lambda_basic" {
  role       = aws_iam_role.lambda_exec.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

# Lambda X-Ray Policy
resource "aws_iam_role_policy_attachment" "lambda_xray" {
  role       = aws_iam_role.lambda_exec.name
  policy_arn = "arn:aws:iam::aws:policy/AWSXRayDaemonWriteAccess"
}

# Lambda Custom Policy for DynamoDB and Cognito
resource "aws_iam_role_policy" "lambda_custom" {
  name = "${var.project_name}-${var.environment}-lambda-policy"
  role = aws_iam_role.lambda_exec.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "dynamodb:GetItem",
          "dynamodb:PutItem",
          "dynamodb:UpdateItem",
          "dynamodb:DeleteItem",
          "dynamodb:Query",
          "dynamodb:Scan",
          "dynamodb:BatchGetItem",
          "dynamodb:BatchWriteItem"
        ]
        Resource = [
          aws_dynamodb_table.users.arn,
          "${aws_dynamodb_table.users.arn}/index/*",
          aws_dynamodb_table.sections.arn,
          "${aws_dynamodb_table.sections.arn}/index/*",
          aws_dynamodb_table.resumes.arn,
          "${aws_dynamodb_table.resumes.arn}/index/*",
          aws_dynamodb_table.templates.arn,
          "${aws_dynamodb_table.templates.arn}/index/*",
        ]
      },
      {
        Effect = "Allow"
        Action = [
          "cognito-idp:AdminGetUser",
          "cognito-idp:AdminUpdateUserAttributes",
          "cognito-idp:ListUsers"
        ]
        Resource = aws_cognito_user_pool.main.arn
      },
      {
        Effect = "Allow"
        Action = [
          "s3:GetObject",
          "s3:PutObject",
          "s3:DeleteObject"
        ]
        Resource = "${aws_s3_bucket.user_uploads.arn}/*"
      },
      {
        Effect = "Allow"
        Action = [
          "bedrock:InvokeModel",
          "bedrock:InvokeModelWithResponseStream"
        ]
        Resource = [
          "arn:aws:bedrock:${var.aws_region}::foundation-model/anthropic.claude-3-sonnet-20240229-v1:0",
          "arn:aws:bedrock:${var.aws_region}::foundation-model/anthropic.claude-*"
        ]
      }
    ]
  })
}

# CloudWatch Log Group for Lambda
resource "aws_cloudwatch_log_group" "lambda_api" {
  name              = "/aws/lambda/${aws_lambda_function.api.function_name}"
  retention_in_days = 30

  tags = {
    Name = "${var.project_name}-${var.environment}-lambda-logs"
  }
}

# Lambda Function URL (optional - for direct access)
resource "aws_lambda_function_url" "api" {
  function_name      = aws_lambda_function.api.function_name
  authorization_type = "AWS_IAM"

  cors {
    allow_credentials = true
    allow_origins     = ["*"]
    allow_methods     = ["*"]
    allow_headers     = ["*"]
    max_age           = 86400
  }
}

# Lambda Function for Cognito Post-Confirmation Trigger
resource "aws_lambda_function" "cognito_post_confirmation" {
  filename      = "lambda.zip"
  function_name = "${var.project_name}-${var.environment}-lambda"
  role          = aws_iam_role.cognito_lambda_exec.arn
  handler       = "src/handlers/lambda.lambdaHandler"
  runtime       = "nodejs20.x"
  timeout       = 30
  memory_size   = 256

  source_code_hash = fileexists("lambda.zip") ? filebase64sha256("lambda.zip") : null

  environment {
    variables = {
      ENVIRONMENT          = var.environment
      DYNAMODB_USERS_TABLE = aws_dynamodb_table.users.name
      REGION               = var.aws_region
    }
  }

  tracing_config {
    mode = "Active"
  }

  tags = {
    Name = "${var.project_name}-${var.environment}-cognito-post-confirmation-lambda"
  }

  lifecycle {
    ignore_changes = [
      filename,
      source_code_hash
    ]
  }
}

# Lambda Execution Role for Cognito Triggers
resource "aws_iam_role" "cognito_lambda_exec" {
  name = "${var.project_name}-${var.environment}-cognito-lambda-exec"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Principal = {
          Service = "lambda.amazonaws.com"
        }
        Action = "sts:AssumeRole"
      }
    ]
  })
}

# Lambda Basic Execution Policy for Cognito Trigger
resource "aws_iam_role_policy_attachment" "cognito_lambda_basic" {
  role       = aws_iam_role.cognito_lambda_exec.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

# Lambda X-Ray Policy for Cognito Trigger
resource "aws_iam_role_policy_attachment" "cognito_lambda_xray" {
  role       = aws_iam_role.cognito_lambda_exec.name
  policy_arn = "arn:aws:iam::aws:policy/AWSXRayDaemonWriteAccess"
}

# Lambda Custom Policy for Cognito Trigger
resource "aws_iam_role_policy" "cognito_lambda_custom" {
  name = "${var.project_name}-${var.environment}-cognito-lambda-policy"
  role = aws_iam_role.cognito_lambda_exec.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "dynamodb:PutItem",
          "dynamodb:UpdateItem"
        ]
        Resource = [
          aws_dynamodb_table.users.arn
        ]
      },
      {
        Effect = "Allow"
        Action = [
          "cognito-idp:AdminGetUser",
          "cognito-idp:AdminUpdateUserAttributes"
        ]
        Resource = aws_cognito_user_pool.main.arn
      }
    ]
  })
}

# CloudWatch Log Group for Cognito Lambda
resource "aws_cloudwatch_log_group" "lambda_cognito" {
  name              = "/aws/lambda/${aws_lambda_function.cognito_post_confirmation.function_name}"
  retention_in_days = 30

  tags = {
    Name = "${var.project_name}-${var.environment}-cognito-lambda-logs"
  }
}

# Lambda Permission for Cognito to invoke the post-confirmation trigger
resource "aws_lambda_permission" "cognito_post_confirmation" {
  statement_id  = "AllowCognitoInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.cognito_post_confirmation.function_name
  principal     = "cognito-idp.amazonaws.com"
  source_arn    = aws_cognito_user_pool.main.arn
}
