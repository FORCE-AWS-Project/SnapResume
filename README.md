# SnapResume

**Serverless Resume Builder with AI Capabilities**

SnapResume is a modern, cloud-native application designed to help users create professional resumes effortlessly. leveraging the power of AWS Serverless architecture and Generative AI.

## 🚀 Features

*   **✨ Smart Resume Builder**: Intuitive editor with real-time preview and customizable templates.
*   **🤖 AI-Powered**: 
    *   **AI Search & Recommendation**: Powered by **AWS Bedrock (Claude 3 Sonnet)** to suggest improvements and tailored content.
*   **🔐 Secure Authentication**: Full user management (Signup, Login, MFA) using **AWS Cognito**.
*   **📄 PDF Generation**: High-quality PDF export functionality.
*   **☁️ Cloud Native**: Built entirely on a serverless stack algorithm for maximum scalability and cost-efficiency.

## 🛠️ Tech Stack

### Frontend
*   **Framework**: React 19 + Vite
*   **UI Library**: Ant Design
*   **Routing**: React Router v7
*   **State/Utils**: Axios, Day.js, HTML2PDF

### Backend
*   **Runtime**: Node.js (TypeScript)
*   **Framework**: Express with Serverless HTTP
*   **Compute**: AWS Lambda
*   **Storage**: Amazon S3 (Assets)

### Database
*   **NoSQL**: Amazon DynamoDB
*   **Pattern**: Single-Table Design for efficiency

### Infrastructure & DevOps
*   **IaC**: Terraform
*   **CI/CD**: AWS CodePipeline & AWS CodeBuild
*   **CDN**: Amazon CloudFront
*   **Security**: AWS WAF & Route 53

## 🏗️ Architecture Overview

The application follows a standard Serverless Web Application architecture:

1.  **Users** access the frontend via **CloudFront** (CDN) which serves static assets from **S3**.
2.  **Authentication** is handled directly by **Cognito** (User Pools).
3.  **API Requests** go through **API Gateway**, which routes them to **Lambda** functions.
4.  **Lambda** executes business logic, interacting with **DynamoDB** for data and **Bedrock** for AI tasks.

## 🏁 Getting Started

### Prerequisites
*   Node.js (v18+)
*   AWS CLI (configured with credentials)
*   Terraform (v1.0+)

### Installation

1.  **Clone the repository**
    ```bash
    git clone <repository-url>
    cd SnapResume
    ```

2.  **Install Frontend Dependencies**
    ```bash
    cd frontend
    npm install
    ```

3.  **Install Backend Dependencies**
    ```bash
    cd ../backend
    npm install
    ```

### Running Locally

**Frontend Development Server**
```bash
cd frontend
npm run dev
```

**Backend Development**
```bash
cd backend
npm run watch
```

## ☁️ Infrastructure & Deployment

This project uses **Terraform** for all infrastructure provisioning.

> [!IMPORTANT]
> For a detailed guide on the infinite structure layout, resources created, and deployment steps, please refer to the **[Terraform Guide](terraform/TERRAFORM-GUIDE.md)**.

## 📄 License

This project is licensed under the ISC License.
