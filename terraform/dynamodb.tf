# DynamoDB Table - User Profiles
resource "aws_dynamodb_table" "users" {
  name           = "${var.project_name}-${var.environment}-users"
  billing_mode   = var.dynamodb_billing_mode
  hash_key       = "userId"
  range_key      = "email"

  # If using provisioned mode
  read_capacity  = var.dynamodb_billing_mode == "PROVISIONED" ? 3 : null
  write_capacity = var.dynamodb_billing_mode == "PROVISIONED" ? 3 : null

  attribute {
    name = "userId"
    type = "S"
  }

  attribute {
    name = "email"
    type = "S"
  }

  # Enable Point-in-Time Recovery
  point_in_time_recovery {
    enabled = true
  }

  # Server-side encryption
  server_side_encryption {
    enabled = true
  }

  # Stream Configuration (for triggers and replication)
  stream_enabled   = true
  stream_view_type = "NEW_AND_OLD_IMAGES"

  tags = {
    Name = "${var.project_name}-${var.environment}-users-table"
  }
}

# DynamoDB Table - Resume Sections
resource "aws_dynamodb_table" "sections" {
  name           = "${var.project_name}-${var.environment}-sections"
  billing_mode   = var.dynamodb_billing_mode
  hash_key       = "sectionId"
  range_key      = "userId"

  # If using provisioned mode
  read_capacity  = var.dynamodb_billing_mode == "PROVISIONED" ? 5 : null
  write_capacity = var.dynamodb_billing_mode == "PROVISIONED" ? 5 : null

  attribute {
    name = "sectionId"
    type = "S"
  }

  attribute {
    name = "userId"
    type = "S"
  }

  attribute {
    name = "sectionType"
    type = "S"
  }

  attribute {
    name = "createdAt"
    type = "N"
  }

  # GSI1 for querying sections by user and type (e.g., get all experience sections for a user)
  global_secondary_index {
    name            = "GSI1"
    hash_key        = "userId"
    range_key       = "sectionType"
    projection_type = "ALL"
    read_capacity   = var.dynamodb_billing_mode == "PROVISIONED" ? 5 : null
    write_capacity  = var.dynamodb_billing_mode == "PROVISIONED" ? 5 : null
  }

  # GSI2 for querying sections by type and created date (e.g., get most recent experience sections)
  global_secondary_index {
    name            = "GSI2"
    hash_key        = "sectionType"
    range_key       = "createdAt"
    projection_type = "ALL"
    read_capacity   = var.dynamodb_billing_mode == "PROVISIONED" ? 5 : null
    write_capacity  = var.dynamodb_billing_mode == "PROVISIONED" ? 5 : null
  }

  # Enable Point-in-Time Recovery
  point_in_time_recovery {
    enabled = true
  }

  # Server-side encryption
  server_side_encryption {
    enabled = true
  }

  # Stream Configuration (for triggers and replication)
  stream_enabled   = true
  stream_view_type = "NEW_AND_OLD_IMAGES"

  tags = {
    Name = "${var.project_name}-${var.environment}-sections-table"
  }
}

# DynamoDB Table - Resumes
resource "aws_dynamodb_table" "resumes" {
  name           = "${var.project_name}-${var.environment}-resumes"
  billing_mode   = var.dynamodb_billing_mode
  hash_key       = "PK"
  range_key      = "SK"

  read_capacity  = var.dynamodb_billing_mode == "PROVISIONED" ? 5 : null
  write_capacity = var.dynamodb_billing_mode == "PROVISIONED" ? 5 : null

  attribute {
    name = "PK"
    type = "S"
  }

  attribute {
    name = "SK"
    type = "S"
  }

  attribute {
    name = "GSI1PK"
    type = "S"
  }

  attribute {
    name = "GSI1SK"
    type = "S"
  }

  # GSI1 for querying user's resumes sorted by last updated
  # GSI1PK: USER#{userId}
  # GSI1SK: UPDATED#{timestamp}
  global_secondary_index {
    name            = "GSI1"
    hash_key        = "GSI1PK"
    range_key       = "GSI1SK"
    projection_type = "ALL"
    read_capacity   = var.dynamodb_billing_mode == "PROVISIONED" ? 5 : null
    write_capacity  = var.dynamodb_billing_mode == "PROVISIONED" ? 5 : null
  }

  point_in_time_recovery {
    enabled = true
  }

  server_side_encryption {
    enabled = true
  }

  stream_enabled   = true
  stream_view_type = "NEW_AND_OLD_IMAGES"

  tags = {
    Name = "${var.project_name}-${var.environment}-resumes-table"
  }
}

# DynamoDB Table - Templates
resource "aws_dynamodb_table" "templates" {
  name           = "${var.project_name}-${var.environment}-templates"
  billing_mode   = var.dynamodb_billing_mode
  hash_key       = "PK"
  range_key      = "SK"

  read_capacity  = var.dynamodb_billing_mode == "PROVISIONED" ? 3 : null
  write_capacity = var.dynamodb_billing_mode == "PROVISIONED" ? 3 : null

  attribute {
    name = "PK"
    type = "S"
  }

  attribute {
    name = "SK"
    type = "S"
  }

  attribute {
    name = "GSI1PK"
    type = "S"
  }

  attribute {
    name = "GSI1SK"
    type = "S"
  }

  # GSI1 for querying templates by category
  # GSI1PK: CATEGORY#{category}
  # GSI1SK: NAME#{name}
  global_secondary_index {
    name            = "GSI1"
    hash_key        = "GSI1PK"
    range_key       = "GSI1SK"
    projection_type = "ALL"
    read_capacity   = var.dynamodb_billing_mode == "PROVISIONED" ? 3 : null
    write_capacity  = var.dynamodb_billing_mode == "PROVISIONED" ? 3 : null
  }

  point_in_time_recovery {
    enabled = true
  }

  server_side_encryption {
    enabled = true
  }

  stream_enabled   = true
  stream_view_type = "NEW_AND_OLD_IMAGES"

  tags = {
    Name = "${var.project_name}-${var.environment}-templates-table"
  }
}

# DynamoDB Table - User Sessions
resource "aws_dynamodb_table" "sessions" {
  name           = "${var.project_name}-${var.environment}-sessions"
  billing_mode   = var.dynamodb_billing_mode
  hash_key       = "PK"
  range_key      = "SK"

  read_capacity  = var.dynamodb_billing_mode == "PROVISIONED" ? 3 : null
  write_capacity = var.dynamodb_billing_mode == "PROVISIONED" ? 3 : null

  attribute {
    name = "PK"
    type = "S"
  }

  attribute {
    name = "SK"
    type = "S"
  }

  attribute {
    name = "GSI1PK"
    type = "S"
  }

  attribute {
    name = "GSI1SK"
    type = "S"
  }

  # GSI1 for querying sessions by user
  # GSI1PK: USER#{userId}
  # GSI1SK: CREATED#{timestamp}
  global_secondary_index {
    name            = "GSI1"
    hash_key        = "GSI1PK"
    range_key       = "GSI1SK"
    projection_type = "ALL"
    read_capacity   = var.dynamodb_billing_mode == "PROVISIONED" ? 3 : null
    write_capacity  = var.dynamodb_billing_mode == "PROVISIONED" ? 3 : null
  }

  point_in_time_recovery {
    enabled = true
  }

  server_side_encryption {
    enabled = true
  }

  # TTL for automatic expiration of sessions
  ttl {
    attribute_name = "expiresAt"
    enabled        = true
  }

  tags = {
    Name = "${var.project_name}-${var.environment}-sessions-table"
  }
}

# Auto-scaling for Users Table (if using PROVISIONED mode)
resource "aws_appautoscaling_target" "users_table_read_target" {
  count = var.dynamodb_billing_mode == "PROVISIONED" ? 1 : 0

  max_capacity       = 50
  min_capacity       = 3
  resource_id        = "table/${aws_dynamodb_table.users.name}"
  scalable_dimension = "dynamodb:table:ReadCapacityUnits"
  service_namespace  = "dynamodb"
}

resource "aws_appautoscaling_policy" "users_table_read_policy" {
  count = var.dynamodb_billing_mode == "PROVISIONED" ? 1 : 0

  name               = "${var.project_name}-${var.environment}-users-read-autoscaling"
  policy_type        = "TargetTrackingScaling"
  resource_id        = aws_appautoscaling_target.users_table_read_target[0].resource_id
  scalable_dimension = aws_appautoscaling_target.users_table_read_target[0].scalable_dimension
  service_namespace  = aws_appautoscaling_target.users_table_read_target[0].service_namespace

  target_tracking_scaling_policy_configuration {
    predefined_metric_specification {
      predefined_metric_type = "DynamoDBReadCapacityUtilization"
    }
    target_value = 70.0
  }
}

resource "aws_appautoscaling_target" "users_table_write_target" {
  count = var.dynamodb_billing_mode == "PROVISIONED" ? 1 : 0

  max_capacity       = 50
  min_capacity       = 3
  resource_id        = "table/${aws_dynamodb_table.users.name}"
  scalable_dimension = "dynamodb:table:WriteCapacityUnits"
  service_namespace  = "dynamodb"
}

resource "aws_appautoscaling_policy" "users_table_write_policy" {
  count = var.dynamodb_billing_mode == "PROVISIONED" ? 1 : 0

  name               = "${var.project_name}-${var.environment}-users-write-autoscaling"
  policy_type        = "TargetTrackingScaling"
  resource_id        = aws_appautoscaling_target.users_table_write_target[0].resource_id
  scalable_dimension = aws_appautoscaling_target.users_table_write_target[0].scalable_dimension
  service_namespace  = aws_appautoscaling_target.users_table_write_target[0].service_namespace

  target_tracking_scaling_policy_configuration {
    predefined_metric_specification {
      predefined_metric_type = "DynamoDBWriteCapacityUtilization"
    }
    target_value = 70.0
  }
}
