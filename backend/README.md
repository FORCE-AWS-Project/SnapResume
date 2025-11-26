# SnapResume Backend

Backend API for SnapResume - A CV/Resume building tool with AI-powered section recommendations.

## Architecture

- **API Gateway**: REST API with Cognito authorization
- **Lambda**: Node.js function handling all API routes
- **DynamoDB**: NoSQL database with single table design
- **Bedrock**: AI-powered section recommendations using Claude 3.5 Sonnet
- **Cognito**: User authentication and authorization

## Project Structure

```
backend/
├── lambda/
│   ├── index.js                    # Main Lambda handler and router
│   ├── package.json                # Dependencies
│   ├── handlers/
│   │   ├── userHandler.js          # User profile operations
│   │   ├── resumeHandler.js        # Resume CRUD operations
│   │   ├── sectionHandler.js       # Section CRUD operations
│   │   ├── templateHandler.js      # Template retrieval
│   │   └── recommendationHandler.js # AI recommendations
│   └── utils/
│       ├── response.js             # Response helpers
│       └── dynamodb.js             # DynamoDB helpers
├── API_ENDPOINTS.md                # Complete API documentation
└── README.md                       # This file
```

## API Endpoints

See [API_ENDPOINTS.md](./API_ENDPOINTS.md) for complete API documentation.

### Quick Reference

- **User Profile**
  - `GET /api/users/me` - Get user profile
  - `PUT /api/users/me` - Update user profile

- **Resumes**
  - `GET /api/resumes` - List resumes
  - `GET /api/resumes/{id}` - Get resume
  - `GET /api/resumes/{id}/full` - Get resume with all sections
  - `POST /api/resumes` - Create resume
  - `PUT /api/resumes/{id}` - Update resume
  - `DELETE /api/resumes/{id}` - Delete resume

- **Sections**
  - `GET /api/sections` - List sections (with optional filters)
  - `GET /api/sections/{id}` - Get section
  - `POST /api/sections` - Create section
  - `PUT /api/sections/{id}` - Update section
  - `DELETE /api/sections/{id}` - Delete section

- **Templates**
  - `GET /api/templates` - List templates
  - `GET /api/templates/{id}` - Get template

- **AI Recommendations**
  - `POST /api/recommendations/sections` - Get section recommendations

## Development

### Prerequisites

- Node.js 18.x or later
- AWS CLI configured with appropriate credentials
- Access to AWS Bedrock (Claude 3.5 Sonnet model)

### Local Development

1. Install dependencies:
```bash
cd backend/lambda
npm install
```

2. Set up environment variables:
```bash
export DYNAMODB_MAIN_TABLE=resume-snap-dev-main
export DYNAMODB_RESUMES_TABLE=resume-snap-dev-resumes
export DYNAMODB_TEMPLATES_TABLE=resume-snap-dev-templates
export DYNAMODB_SESSIONS_TABLE=resume-snap-dev-sessions
export REGION=us-east-1
```

3. Run locally using AWS SAM or LocalStack (optional)

### Deployment

The Lambda function is deployed automatically via Terraform. To manually package and deploy:

1. Package the Lambda function:
```bash
cd backend/lambda
npm run package
```

2. Upload to Lambda:
```bash
aws lambda update-function-code \
  --function-name snapresume-dev-api \
  --zip-file fileb://lambda-function.zip
```

Or let the CI/CD pipeline handle deployment automatically.

## Database Schema

### DynamoDB Tables

#### 1. Main Table
**Purpose**: Stores user profiles and CV sections

**Primary Key**:
- PK: `USER#{userId}` or `SECTION#{userId}#{sectionId}`
- SK: `PROFILE` or `SECTION#{sectionType}#{timestamp}`

**GSI1**: Query sections by user and tags
- GSI1PK: `SECTION#{userId}`
- GSI1SK: `TAGS#{tag1}#{tag2}...`

**GSI2**: Query sections by type
- GSI2PK: `SECTION#{userId}#{sectionType}`
- GSI2SK: `CREATED#{timestamp}`

#### 2. Resumes Table
**Purpose**: Stores resume metadata and section references

**Primary Key**:
- PK: `USER#{userId}`
- SK: `RESUME#{resumeId}`

**GSI1**: Query resumes by last updated
- GSI1PK: `USER#{userId}`
- GSI1SK: `UPDATED#{timestamp}`

#### 3. Templates Table
**Purpose**: Stores resume template definitions

**Primary Key**:
- PK: `TEMPLATE#{templateId}`
- SK: `METADATA`

**GSI1**: Query templates by category
- GSI1PK: `CATEGORY#{category}`
- GSI1SK: `NAME#{name}`

#### 4. Sessions Table
**Purpose**: Stores user sessions (optional)

**Primary Key**:
- PK: `SESSION#{sessionId}`
- SK: `METADATA`

**TTL**: `expiresAt` (automatic cleanup)

## Authentication

The API uses AWS Cognito for authentication. Users must:

1. **Sign up**: Use Cognito hosted UI or SDK
2. **Sign in**: Get JWT token from Cognito
3. **Include token**: Add `Authorization: Bearer {token}` header to all API requests

The Lambda function extracts the user ID from the Cognito authorizer context:
```javascript
const userId = event.requestContext?.authorizer?.claims?.sub;
```

## AI Recommendations

The recommendation endpoint uses AWS Bedrock with Claude 3.5 Sonnet to:

1. Analyze job description
2. Compare with user's CV sections
3. Rank sections by relevance
4. Provide match scores and reasoning
5. Suggest improvements

### Example Request

```bash
curl -X POST https://api.example.com/api/recommendations/sections \
  -H "Authorization: Bearer {cognito-token}" \
  -H "Content-Type: application/json" \
  -d '{
    "jobDescription": "We are looking for a Senior Software Engineer with 5+ years...",
    "resumeId": "resume_abc123"
  }'
```

### Example Response

```json
{
  "recommendations": {
    "experience": [
      {
        "sectionId": "exp_001",
        "matchScore": 95,
        "matchedKeywords": ["backend", "cloud", "microservices"],
        "reason": "This experience directly matches the required backend and cloud expertise."
      }
    ],
    "skills": [...],
    "education": [...]
  },
  "overallMatchScore": 87,
  "suggestedResumeName": "Senior Software Engineer - Backend & Cloud",
  "analysis": {
    "strengths": ["Strong AWS experience", "Leadership skills"],
    "gaps": ["Could emphasize CI/CD more"],
    "recommendations": ["Highlight specific AWS services used"]
  }
}
```

## Error Handling

The API returns standard HTTP status codes:

- `200 OK` - Success
- `201 Created` - Resource created
- `400 Bad Request` - Invalid request
- `401 Unauthorized` - Missing or invalid auth token
- `403 Forbidden` - Insufficient permissions
- `404 Not Found` - Resource not found
- `429 Too Many Requests` - Rate limit exceeded
- `500 Internal Server Error` - Server error

Error response format:
```json
{
  "error": "Error Type",
  "message": "Detailed error message",
  "details": ["Optional array of validation errors"]
}
```

## Rate Limiting

- Standard endpoints: 100 requests/minute per user
- AI/Bedrock endpoints: 10 requests/minute per user

Rate limiting is configured in API Gateway usage plans.

## Monitoring

### CloudWatch Logs

- Lambda logs: `/aws/lambda/snapresume-{env}-api`
- API Gateway logs: `/aws/apigateway/snapresume-{env}`

### CloudWatch Metrics

- Lambda duration, errors, invocations
- API Gateway 4xx, 5xx errors, latency
- DynamoDB throttles, capacity

### X-Ray Tracing

Enabled on both Lambda and API Gateway for distributed tracing.

## Testing

### Manual Testing with curl

```bash
# Get user profile
curl -X GET https://api.example.com/api/users/me \
  -H "Authorization: Bearer {token}"

# Create section
curl -X POST https://api.example.com/api/sections \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "sectionType": "experience",
    "company": "Tech Corp",
    "position": "Software Engineer",
    "tags": ["backend", "cloud"]
  }'
```

### Integration Testing

Use Postman or similar tool with the API documentation to test all endpoints.

## Security

- All endpoints require Cognito authentication (except templates)
- CORS enabled for allowed origins
- API Gateway throttling and rate limiting
- DynamoDB encryption at rest
- Lambda functions run in isolated execution environments
- IAM roles follow least privilege principle

## Cost Optimization

- DynamoDB on-demand pricing (pay per request)
- Lambda charged per invocation and duration
- API Gateway charged per million requests
- Bedrock charged per token (only for recommendation endpoint)

**Estimated costs** (for 10K monthly active users):
- DynamoDB: ~$10/month
- Lambda: ~$5/month
- API Gateway: ~$3.5/month
- Bedrock: Variable based on usage (~$0.003 per request)

**Total**: ~$20-30/month for 10K users

## Troubleshooting

### Lambda Timeout
- Default timeout: 30 seconds
- Increase in `lambda.tf` if needed
- Check CloudWatch logs for bottlenecks

### DynamoDB Throttling
- Switch to on-demand billing mode
- Or increase provisioned capacity
- Add exponential backoff in code

### Bedrock Access Denied
- Ensure Bedrock is enabled in your AWS region
- Verify IAM permissions include `bedrock:InvokeModel`
- Check if Claude 3.5 Sonnet model is available

### CORS Errors
- Verify allowed origins in API Gateway
- Check Authorization header is included
- OPTIONS preflight must return 200

## Contributing

1. Create a feature branch
2. Make changes
3. Test locally
4. Update API documentation if needed
5. Submit pull request

## License

Proprietary - All rights reserved
