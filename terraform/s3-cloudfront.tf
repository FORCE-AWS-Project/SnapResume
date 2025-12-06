# S3 Bucket for User Uploads and Static Assets (images, documents, etc.)
resource "aws_s3_bucket" "user_uploads" {
  bucket = "${var.project_name}-${var.environment}-user-uploads"

  tags = {
    Name = "${var.project_name}-${var.environment}-user-uploads"
  }
}

resource "aws_s3_bucket_public_access_block" "user_uploads" {
  bucket = aws_s3_bucket.user_uploads.id

  block_public_acls       = true
  block_public_policy     = false  
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_s3_bucket_versioning" "user_uploads" {
  bucket = aws_s3_bucket.user_uploads.id

  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "user_uploads" {
  bucket = aws_s3_bucket.user_uploads.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

# CORS configuration for direct uploads from browser
resource "aws_s3_bucket_cors_configuration" "user_uploads" {
  bucket = aws_s3_bucket.user_uploads.id

  cors_rule {
    allowed_headers = ["*"]
    allowed_methods = ["GET", "PUT", "POST", "DELETE", "HEAD"]
    allowed_origins = var.domain_name != "" ? [
      "https://${var.domain_name}",
      "https://www.${var.domain_name}",
      "https://*.amplifyapp.com"
    ] : ["https://*.amplifyapp.com"]
    expose_headers  = ["ETag"]
    max_age_seconds = 3000
  }
}

# Lifecycle policy to automatically delete old files
resource "aws_s3_bucket_lifecycle_configuration" "user_uploads" {
  bucket = aws_s3_bucket.user_uploads.id

  rule {
    id     = "delete-old-uploads"
    status = "Enabled"

    # Delete files older than 90 days in temp folder
    expiration {
      days = 90
    }

    filter {
      prefix = "temp/"
    }
  }

  rule {
    id     = "transition-to-glacier"
    status = "Enabled"

    # Move old resumes to cheaper storage after 30 days
    transition {
      days          = 30
      storage_class = "STANDARD_IA"
    }

    transition {
      days          = 90
      storage_class = "GLACIER"
    }

    filter {
      prefix = "resumes/"
    }
  }
}

# CloudFront Origin Access Identity
resource "aws_cloudfront_origin_access_identity" "oai" {
  comment = "OAI for ${var.project_name} user uploads"
}

resource "aws_s3_bucket_policy" "user_uploads" {
  bucket = aws_s3_bucket.user_uploads.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "AllowCloudFrontAccess"
        Effect = "Allow"
        Principal = {
          AWS = aws_cloudfront_origin_access_identity.oai.iam_arn
        }
        Action   = "s3:GetObject"
        Resource = "${aws_s3_bucket.user_uploads.arn}/*"
      },
      {
        Sid    = "PublicReadTemplates"
        Effect = "Allow"
        Principal = "*"
        Action   = "s3:GetObject"
        Resource = "${aws_s3_bucket.user_uploads.arn}/templates/*"
      }
    ]
  })
}

# CloudFront Distribution for User Uploads/Static Assets
resource "aws_cloudfront_distribution" "static_assets" {
  enabled         = true
  is_ipv6_enabled = true
  comment         = "${var.project_name} Static Assets CDN"
  price_class     = "PriceClass_100"

  origin {
    domain_name = aws_s3_bucket.user_uploads.bucket_regional_domain_name
    origin_id   = "S3-UserUploads"

    s3_origin_config {
      origin_access_identity = aws_cloudfront_origin_access_identity.oai.cloudfront_access_identity_path
    }
  }

  default_cache_behavior {
    allowed_methods  = ["GET", "HEAD", "OPTIONS"]
    cached_methods   = ["GET", "HEAD"]
    target_origin_id = "S3-UserUploads"

    forwarded_values {
      query_string = false
      cookies {
        forward = "none"
      }
    }

    viewer_protocol_policy = "redirect-to-https"
    min_ttl                = 0
    default_ttl            = 86400   # 1 day
    max_ttl                = 31536000 # 1 year
    compress               = true
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  viewer_certificate {
    cloudfront_default_certificate = true
    minimum_protocol_version       = "TLSv1.2_2021"
  }

  tags = {
    Name = "${var.project_name}-${var.environment}-static-assets-cdn"
  }
}
