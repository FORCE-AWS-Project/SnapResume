# Resume Snap - Terraform Infrastructure

This directory contains Terraform configuration files to deploy the complete AWS infrastructure for Resume Snap application.

## Architecture Overview

The infrastructure includes:
- **CloudFront CDN** with **S3** for static asset distribution
- **AWS Amplify** for frontend hosting
- **Cognito** for user authentication and authorization
- **API Gateway** with Lambda backend
- **DynamoDB** for data storage
- **Route 53** for DNS management
- **AWS WAF** for web application firewall protection
- **CodePipeline** and **CodeBuild** for CI/CD
- **CloudWatch** for monitoring and logging

## Prerequisites

1. **AWS Account** with appropriate permissions
2. **Terraform** installed (version >= 1.0)
3. **AWS CLI** configured with credentials
4. **GitHub Personal Access Token** (for CI/CD)

## File Structure

```
terraform/
├── providers.tf          # Terraform and AWS provider configuration
├── variables.tf          # Input variables
├── terraform.tfvars.example  # Example variable values
├── s3-cloudfront.tf      # S3 and CloudFront resources
├── cognito.tf            # Cognito authentication resources
├── api-gateway.tf        # API Gateway configuration
├── lambda.tf             # Lambda functions
├── dynamodb.tf           # DynamoDB tables
├── route53-waf.tf        # Route 53 and WAF resources
├── cicd.tf               # CodePipeline and CodeBuild
├── cloudwatch.tf         # CloudWatch monitoring and alarms
└── outputs.tf            # Output values
```

## Setup Instructions

### 1. Configure Variables

Copy the example variables file and edit with your values:

```bash
cp terraform.tfvars.example terraform.tfvars
```

Edit `terraform.tfvars` with your configuration:

```hcl
aws_region   = "us-east-1"
project_name = "resume-snap"
environment  = "dev"
domain_name  = "yourdomain.com"  # Optional
github_repo  = "your-username/your-repo"
```

### 2. Store GitHub Token in AWS Secrets Manager

```bash
aws secretsmanager create-secret \
  --name github-token \
  --secret-string "your-github-personal-access-token" \
  --region us-east-1
```

Note the ARN and add it to `terraform.tfvars`:

```hcl
github_token_secret_arn = "arn:aws:secretsmanager:us-east-1:123456789012:secret:github-token-xxxxx"
```

### 3. Create Lambda Deployment Package

Before running Terraform, create a placeholder Lambda package:

```bash
cd terraform
mkdir -p lambda-temp
cd lambda-temp
echo 'exports.handler = async (event) => { return { statusCode: 200, body: "Hello" }; };' > index.js
zip ../lambda-placeholder.zip index.js
cd ..
rm -rf lambda-temp
```

### 4. Initialize Terraform

```bash
terraform init
```

### 5. Review the Plan

```bash
terraform plan
```

### 6. Apply the Configuration

```bash
terraform apply
```

Type `yes` when prompted to confirm.

## Important Notes

### Custom Domain Setup

If using a custom domain:
1. After deployment, note the Route 53 name servers from outputs
2. Update your domain registrar to use these name servers
3. Wait for DNS propagation (can take up to 48 hours)

### Certificate Validation

The ACM certificate requires DNS validation. Terraform will automatically create the required Route 53 records if you're using Route 53 for DNS.

### Lambda Deployment

The initial Lambda function is deployed with placeholder code. Use CodePipeline or update the function manually:

```bash
# Update Lambda function code
aws lambda update-function-code \
  --function-name resume-snap-dev-api \
  --zip-file fileb://your-lambda-code.zip
```

### CI/CD Pipeline

The CodePipeline requires:
1. GitHub repository with proper structure
2. `buildspec.yml` files in frontend/ and backend/ directories
3. GitHub OAuth token with repo access

### State Management

For production, configure S3 backend for state storage:

1. Uncomment the backend configuration in `providers.tf`
2. Create an S3 bucket and DynamoDB table for state locking
3. Run `terraform init -migrate-state`

## Outputs

After successful deployment, Terraform outputs important values:

```bash
# View all outputs
terraform output

# View specific output
terraform output api_gateway_url

# Get frontend configuration
terraform output -json frontend_env_config
```

## Monitoring

Access CloudWatch dashboard:
```bash
# Get dashboard URL
echo "https://console.aws.amazon.com/cloudwatch/home?region=$(terraform output -raw aws_region)#dashboards:name=$(terraform output -raw cloudwatch_dashboard_name)"
```

## Cost Estimation

Approximate monthly costs (us-east-1):
- CloudFront: $0.085/GB + requests
- Lambda: Free tier (1M requests/month)
- DynamoDB: PAY_PER_REQUEST mode charges per request
- API Gateway: $3.50 per million requests
- Cognito: Free tier (50,000 MAUs)
- S3: $0.023/GB
- Route 53: $0.50/hosted zone
- WAF: $5/month + $1/rule

## Cleanup

To destroy all resources:

```bash
terraform destroy
```

**Warning**: This will delete all resources and data. Make sure to backup any important data before destroying.

## Troubleshooting

### Common Issues

1. **Certificate Validation Timeout**
   - Ensure Route 53 is configured correctly
   - Check DNS propagation status

2. **Lambda Permissions**
   - Verify IAM roles have correct permissions
   - Check CloudWatch logs for errors

3. **API Gateway 403 Errors**
   - Verify Cognito authorizer configuration
   - Check if user is authenticated

4. **CodePipeline Failures**
   - Check CodeBuild logs
   - Verify GitHub token permissions
   - Ensure buildspec.yml files exist

## Additional Resources

- [Terraform AWS Provider Documentation](https://registry.terraform.io/providers/hashicorp/aws/latest/docs)
- [AWS Well-Architected Framework](https://aws.amazon.com/architecture/well-architected/)
- [Terraform Best Practices](https://www.terraform-best-practices.com/)

## Support

For issues or questions:
1. Check CloudWatch logs
2. Review Terraform state: `terraform show`
3. Validate configuration: `terraform validate`
