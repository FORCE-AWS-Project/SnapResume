# SnapResume API Endpoints

Base URL: `https://api.{domain}/v1`

## Authentication

All endpoints (except auth endpoints) require authentication via AWS Cognito JWT token in the Authorization header:
```
Authorization: Bearer {cognito-jwt-token}
```

Cognito handles:
- User registration (sign up)
- User login (sign in)
- Password reset
- Email verification
- MFA

---

## User Profile Endpoints

### Get User Profile
```http
GET /users/me
```

**Response 200:**
```json
{
  "userId": "user_xyz789",
  "email": "john.doe@example.com",
  "personalInfo": {
    "name": "John Doe",
    "email": "john.doe@example.com",
    "phone": "+1-234-567-8900",
    "location": "San Francisco, CA",
    "linkedin": "https://linkedin.com/in/johndoe",
    "github": "https://github.com/johndoe",
    "portfolio": "https://johndoe.com",
    "summary": "Experienced software engineer..."
  },
  "createdAt": "2024-01-15T10:00:00Z",
  "updatedAt": "2024-01-20T15:30:00Z"
}
```

### Update User Profile
```http
PUT /users/me
```

**Request Body:**
```json
{
  "personalInfo": {
    "name": "John Doe",
    "email": "john.doe@example.com",
    "phone": "+1-234-567-8900",
    "location": "San Francisco, CA",
    "linkedin": "https://linkedin.com/in/johndoe",
    "github": "https://github.com/johndoe",
    "portfolio": "https://johndoe.com",
    "summary": "Experienced software engineer..."
  }
}
```

**Response 200:**
```json
{
  "message": "Profile updated successfully",
  "userId": "user_xyz789",
  "updatedAt": "2024-01-20T15:30:00Z"
}
```

---

## Resume/CV Endpoints

### List All Resumes
```http
GET /resumes
```

**Query Parameters:**
- `limit` (optional): Number of resumes to return (default: 20, max: 100)
- `lastKey` (optional): Pagination key from previous response

**Response 200:**
```json
{
  "resumes": [
    {
      "resumeId": "resume_abc123",
      "name": "Software Engineer Resume - Google",
      "templateId": "TPL_MODERN_001",
      "metadata": {
        "targetRole": "Senior Software Engineer",
        "targetCompany": "Google",
        "matchScore": 87
      },
      "createdAt": "2024-01-15T10:00:00Z",
      "updatedAt": "2024-01-20T15:30:00Z"
    }
  ],
  "lastKey": "resume_xyz456",
  "count": 5
}
```

### Get Resume by ID
```http
GET /resumes/{resumeId}
```

**Response 200:**
```json
{
  "resumeId": "resume_abc123",
  "userId": "user_xyz789",
  "templateId": "TPL_MODERN_001",
  "name": "Software Engineer Resume - Google",
  "selectedSections": {
    "experience": ["exp_001", "exp_002"],
    "education": ["edu_001"],
    "skills": ["skills_001", "skills_002"],
    "projects": ["proj_001"],
    "certifications": ["cert_001"]
  },
  "metadata": {
    "targetRole": "Senior Software Engineer",
    "targetCompany": "Google",
    "keywords": ["backend", "cloud", "leadership"]
  },
  "styling": {
    "colorScheme": "blue",
    "fontFamily": "Inter",
    "fontSize": 11
  },
  "createdAt": "2024-01-15T10:00:00Z",
  "updatedAt": "2024-01-20T15:30:00Z"
}
```

### Create Resume
```http
POST /resumes
```

**Request Body:**
```json
{
  "name": "Software Engineer Resume - Google",
  "templateId": "TPL_MODERN_001",
  "selectedSections": {
    "experience": ["exp_001"],
    "education": ["edu_001"],
    "skills": ["skills_001"]
  },
  "metadata": {
    "targetRole": "Senior Software Engineer",
    "targetCompany": "Google"
  },
  "styling": {
    "colorScheme": "blue",
    "fontFamily": "Inter",
    "fontSize": 11
  }
}
```

**Response 201:**
```json
{
  "resumeId": "resume_abc123",
  "message": "Resume created successfully",
  "createdAt": "2024-01-15T10:00:00Z"
}
```

### Update Resume
```http
PUT /resumes/{resumeId}
```

**Request Body:**
```json
{
  "name": "Software Engineer Resume - Google (Updated)",
  "selectedSections": {
    "experience": ["exp_001", "exp_002"],
    "education": ["edu_001"],
    "skills": ["skills_001", "skills_002"]
  },
  "metadata": {
    "targetRole": "Senior Software Engineer",
    "targetCompany": "Google",
    "keywords": ["backend", "cloud"]
  }
}
```

**Response 200:**
```json
{
  "message": "Resume updated successfully",
  "updatedAt": "2024-01-20T15:30:00Z"
}
```

### Delete Resume
```http
DELETE /resumes/{resumeId}
```

**Response 200:**
```json
{
  "message": "Resume deleted successfully"
}
```

### Get Full Resume Data (with all sections populated)
```http
GET /resumes/{resumeId}/full
```

**Response 200:**
```json
{
  "resumeId": "resume_abc123",
  "name": "Software Engineer Resume - Google",
  "templateId": "TPL_MODERN_001",
  "data": {
    "personalInfo": {
      "name": "John Doe",
      "email": "john.doe@example.com",
      "phone": "+1-234-567-8900"
    },
    "experience": [
      {
        "sectionId": "exp_001",
        "company": "Tech Corp",
        "position": "Senior Software Engineer",
        "description": "Led development...",
        "tags": ["backend", "leadership", "cloud"]
      }
    ],
    "education": [...],
    "skills": [...],
    "projects": [...],
    "certifications": [...]
  }
}
```

---

## Section Endpoints

### List All Sections
```http
GET /sections
```

**Query Parameters:**
- `type` (optional): Filter by section type (experience, education, skills, projects, certifications)
- `tags` (optional): Comma-separated tags for filtering (e.g., "backend,cloud")
- `limit` (optional): Number of sections to return (default: 50, max: 100)

**Response 200:**
```json
{
  "sections": [
    {
      "sectionId": "exp_001",
      "sectionType": "experience",
      "company": "Tech Corp",
      "position": "Senior Software Engineer",
      "location": "San Francisco, CA",
      "startDate": "2020-01",
      "endDate": "2023-12",
      "current": false,
      "description": "Led development of microservices platform...",
      "achievements": ["Reduced API latency by 40%"],
      "technologies": ["React", "Node.js", "AWS"],
      "tags": ["backend", "leadership", "cloud"],
      "createdAt": "2024-01-10T10:00:00Z",
      "updatedAt": "2024-01-10T10:00:00Z"
    }
  ],
  "count": 15
}
```

### Get Section by ID
```http
GET /sections/{sectionId}
```

**Response 200:**
```json
{
  "sectionId": "exp_001",
  "sectionType": "experience",
  "company": "Tech Corp",
  "position": "Senior Software Engineer",
  "location": "San Francisco, CA",
  "startDate": "2020-01",
  "endDate": "2023-12",
  "current": false,
  "description": "Led development of microservices platform...",
  "achievements": ["Reduced API latency by 40%"],
  "technologies": ["React", "Node.js", "AWS"],
  "tags": ["backend", "leadership", "cloud"],
  "createdAt": "2024-01-10T10:00:00Z",
  "updatedAt": "2024-01-10T10:00:00Z"
}
```

### Create Section
```http
POST /sections
```

**Request Body (Experience):**
```json
{
  "sectionType": "experience",
  "company": "Tech Corp",
  "position": "Senior Software Engineer",
  "location": "San Francisco, CA",
  "startDate": "2020-01",
  "endDate": "2023-12",
  "current": false,
  "description": "Led development of microservices platform...",
  "achievements": [
    "Reduced API latency by 40%",
    "Mentored 5 junior developers"
  ],
  "technologies": ["React", "Node.js", "AWS", "Docker"],
  "tags": ["backend", "leadership", "cloud", "microservices"]
}
```

**Request Body (Education):**
```json
{
  "sectionType": "education",
  "institution": "University of California, Berkeley",
  "degree": "Bachelor of Science",
  "field": "Computer Science",
  "location": "Berkeley, CA",
  "startDate": "2014-09",
  "endDate": "2018-05",
  "gpa": "3.8",
  "achievements": ["Dean's List (4 semesters)"],
  "tags": ["cs", "bachelor", "algorithms"]
}
```

**Request Body (Skills):**
```json
{
  "sectionType": "skills",
  "category": "Frontend Development",
  "skillsList": ["React", "Vue.js", "TypeScript", "JavaScript"],
  "tags": ["frontend", "ui", "javascript"]
}
```

**Request Body (Projects):**
```json
{
  "sectionType": "projects",
  "name": "E-commerce Platform",
  "description": "Built a scalable e-commerce platform...",
  "url": "https://github.com/johndoe/ecommerce",
  "technologies": ["React", "Node.js", "MongoDB"],
  "achievements": ["10K+ active users"],
  "startDate": "2022-01",
  "endDate": "2023-06",
  "tags": ["ecommerce", "scalability", "fullstack"]
}
```

**Request Body (Certifications):**
```json
{
  "sectionType": "certifications",
  "name": "AWS Solutions Architect Associate",
  "issuer": "Amazon Web Services",
  "date": "2022-06",
  "expiryDate": "2025-06",
  "credentialId": "AWS-SAA-123456",
  "credentialUrl": "https://aws.amazon.com/verification",
  "tags": ["aws", "cloud", "architecture"]
}
```

**Response 201:**
```json
{
  "sectionId": "exp_003",
  "message": "Section created successfully",
  "createdAt": "2024-01-20T10:00:00Z"
}
```

### Update Section
```http
PUT /sections/{sectionId}
```

**Request Body:**
```json
{
  "company": "Tech Corp (Updated)",
  "position": "Lead Software Engineer",
  "description": "Updated description...",
  "achievements": ["New achievement"],
  "tags": ["backend", "leadership", "cloud", "architecture"]
}
```

**Response 200:**
```json
{
  "message": "Section updated successfully",
  "updatedAt": "2024-01-20T15:30:00Z"
}
```

### Delete Section
```http
DELETE /sections/{sectionId}
```

**Response 200:**
```json
{
  "message": "Section deleted successfully"
}
```

---

## Template Endpoints

### List All Templates
```http
GET /templates
```

**Query Parameters:**
- `category` (optional): Filter by category (professional, creative, minimal, etc.)

**Response 200:**
```json
{
  "templates": [
    {
      "templateId": "TPL_MODERN_001",
      "name": "Modern Professional",
      "category": "professional",
      "previewImageUrl": "https://cdn.example.com/previews/modern-001.png",
      "createdAt": "2024-01-10T10:00:00Z"
    }
  ],
  "count": 12
}
```

### Get Template by ID
```http
GET /templates/{templateId}
```

**Response 200:**
```json
{
  "templateId": "TPL_MODERN_001",
  "name": "Modern Professional",
  "category": "professional",
  "templateFileUrl": "https://cdn.example.com/templates/modern-001.html",
  "previewImageUrl": "https://cdn.example.com/previews/modern-001.png",
  "inputDataSchema": {
    "personalInfo": {...},
    "experience": {...},
    "education": {...}
  },
  "createdAt": "2024-01-10T10:00:00Z"
}
```

---

## AI/Bedrock Recommendations Endpoint

### Get Section Recommendations
```http
POST /recommendations/sections
```

**Description:** Analyzes a job description and recommends which sections to include in the resume.

**Request Body:**
```json
{
  "jobDescription": "We are looking for a Senior Software Engineer with 5+ years of experience in backend development, cloud infrastructure (AWS), and microservices architecture. Strong leadership and mentoring skills required. Experience with Docker, Kubernetes, and CI/CD pipelines is a plus.",
  "resumeId": "resume_abc123"
}
```

**Response 200:**
```json
{
  "recommendations": {
    "experience": [
      {
        "sectionId": "exp_001",
        "matchScore": 95,
        "matchedKeywords": ["backend", "cloud", "microservices", "AWS", "leadership"],
        "reason": "This experience section strongly matches the job requirements with backend development, AWS cloud expertise, and demonstrated leadership in microservices architecture."
      },
      {
        "sectionId": "exp_002",
        "matchScore": 72,
        "matchedKeywords": ["fullstack", "agile"],
        "reason": "Shows additional technical versatility and agile methodology experience."
      }
    ],
    "skills": [
      {
        "sectionId": "skills_002",
        "matchScore": 88,
        "matchedKeywords": ["backend", "cloud", "AWS"],
        "reason": "Backend and cloud skills directly align with job requirements."
      },
      {
        "sectionId": "skills_003",
        "matchScore": 85,
        "matchedKeywords": ["Docker", "Kubernetes", "CI/CD"],
        "reason": "DevOps skills match the 'plus' requirements mentioned in the job description."
      }
    ],
    "education": [
      {
        "sectionId": "edu_001",
        "matchScore": 65,
        "matchedKeywords": ["cs", "algorithms"],
        "reason": "Computer Science degree provides foundational knowledge relevant to the role."
      }
    ],
    "projects": [
      {
        "sectionId": "proj_001",
        "matchScore": 78,
        "matchedKeywords": ["scalability", "fullstack"],
        "reason": "Demonstrates hands-on experience with scalable systems."
      }
    ],
    "certifications": [
      {
        "sectionId": "cert_001",
        "matchScore": 92,
        "matchedKeywords": ["aws", "cloud", "architecture"],
        "reason": "AWS certification directly validates the required cloud infrastructure expertise."
      }
    ]
  },
  "overallMatchScore": 87,
  "suggestedResumeName": "Senior Software Engineer - Backend & Cloud",
  "analysis": {
    "strengths": [
      "Strong AWS and cloud infrastructure experience",
      "Demonstrated leadership and mentoring capabilities",
      "Extensive microservices architecture knowledge",
      "DevOps skills with Docker and Kubernetes"
    ],
    "gaps": [
      "Could emphasize CI/CD pipeline experience more prominently"
    ],
    "recommendations": [
      "Highlight specific AWS services used in past roles",
      "Quantify team leadership experience (number of team members mentored)",
      "Add metrics around microservices performance improvements"
    ]
  }
}
```

---

## Error Responses

All endpoints may return the following error responses:

**400 Bad Request:**
```json
{
  "error": "Bad Request",
  "message": "Invalid request body",
  "details": ["Field 'sectionType' is required"]
}
```

**401 Unauthorized:**
```json
{
  "error": "Unauthorized",
  "message": "Invalid or missing authentication token"
}
```

**403 Forbidden:**
```json
{
  "error": "Forbidden",
  "message": "You don't have permission to access this resource"
}
```

**404 Not Found:**
```json
{
  "error": "Not Found",
  "message": "Resume with id 'resume_abc123' not found"
}
```

**500 Internal Server Error:**
```json
{
  "error": "Internal Server Error",
  "message": "An unexpected error occurred"
}
```

---

## Rate Limiting

- Standard endpoints: 100 requests per minute per user
- AI/Bedrock endpoints: 10 requests per minute per user
- Exceeded rate limit returns HTTP 429 (Too Many Requests)
