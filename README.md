# Self-Service Infrastructure Provisioning Platform

A GitOps-style self-service infrastructure platform that allows users to request pre-approved cloud infrastructure through a web portal, automatically generate Terraform stack code, raise a pull request in a Terraform repository, and provision infrastructure through GitHub Actions workflows.

---

## Overview

This platform is composed of three major parts:

1. **Frontend Portal**
   - React + TypeScript + Material UI
   - AWS Cognito authentication
   - browse templates
   - submit requests
   - track request status

2. **Backend API**
   - Node.js + Express + TypeScript
   - validates Cognito JWT tokens
   - validates request parameters
   - persists request records in DynamoDB
   - maps templates to Terraform modules
   - creates GitHub branches and PRs
   - generates Terraform stack files

3. **Terraform / Infrastructure Repository**
   - reusable Terraform modules
   - generated request stack folders
   - GitHub Actions plan/apply/destroy workflows
   - remote Terraform state in S3
   - Terraform locking in DynamoDB

Together these form a secure, auditable, review-driven infrastructure provisioning workflow.

---

## High-Level Flow

### 1. User Authentication
- user opens the frontend portal
- unauthenticated users are redirected to AWS Cognito Hosted UI
- Cognito authenticates the user and returns an ID token
- frontend stores session and sends bearer token to backend APIs

### 2. Browse and Submit Template Request
- user browses available templates
- templates are grouped by provider and category
  - AWS
  - Azure
- user selects a template
- frontend renders a dynamic form based on template metadata
- user submits the request

### 3. Backend Request Processing
- backend validates the Cognito token
- backend validates required fields and regex patterns
- backend generates a unique request ID
- backend normalizes parameters if needed
  - example: S3 bucket naming normalization and uniqueness suffixing
- backend persists the request in DynamoDB with status:
  - `PR_CREATED`

### 4. GitHub PR Creation
- backend maps the template to a Terraform module
- backend creates a branch in the Terraform repo:
  - `request/<request-id>`
- backend generates stack files under:
  - `stacks/<request-id>/`
- backend commits generated files to the branch
- backend opens a pull request to `main`
- backend stores:
  - PR URL
  - PR number
  - branch name
  in DynamoDB

### 5. GitHub Actions: Plan
- PR workflow runs automatically
- it detects changed stack directories
- runs:
  - `terraform fmt`
  - `terraform init`
  - `terraform validate`
  - `terraform plan`
- posts plan output as a PR comment
- updates request status in DynamoDB:
  - `PLAN_COMPLETED`
  - or `PLAN_FAILED`

### 6. GitHub Actions: Apply
- once PR is approved and merged to `main`
- apply workflow runs automatically
- it runs:
  - `terraform init`
  - `terraform apply`
- updates DynamoDB request status:
  - `APPLY_IN_PROGRESS`
  - `COMPLETED`
  - or `FAILED`

### 7. Frontend Status Tracking
- frontend Request Details page polls backend
- backend reads live request status from DynamoDB
- user sees:
  - status chip
  - last updated time
  - status timeline
  - PR details

---

## Repository / Project Structure

This platform may be organized as separate projects or repos.

### Example structure
```text
frontend/
backend/
terraform-live/