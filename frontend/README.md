# Infra Provisioning Portal Frontend

React + TypeScript frontend for the self-service infrastructure provisioning platform.

## Overview

This frontend provides a self-service portal where users can:

- authenticate using AWS Cognito Hosted UI
- browse infrastructure templates
- search templates
- submit infrastructure requests
- view their submitted requests
- view request details and status
- monitor request lifecycle updates

The frontend communicates with the backend using REST APIs secured with Cognito ID tokens.

---

## Tech Stack

- React
- TypeScript
- Material UI
- Axios
- React Router
- AWS Amplify Auth
- AWS Cognito Hosted UI

---

## Main Features

- Cognito Hosted UI login/logout
- protected routes
- dynamic template catalog
- template search
- dynamic request forms
- request submission
- My Requests page
- Request Details page
- auto-refresh request status polling
- dark/light theme toggle
- responsive left navigation

---

## Project Structure

```text
src/
  api/
    axios.ts
    templates.ts
    requests.ts

  auth/
    AuthProvider.tsx
    ProtectedRoute.tsx
    cognitoConfig.ts

  components/
    AppLayout.tsx
    DynamicField.tsx
    DynamicForm.tsx
    TemplateCard.tsx
    RequestStatusTimeline.tsx

  context/
    TemplateCatalogContext.tsx
    ThemeModeContext.tsx

  pages/
    TemplateCatalogPage.tsx
    TemplateRequestPage.tsx
    MyRequestsPage.tsx
    RequestDetailsPage.tsx

  types/
    template.ts
    request.ts

  utils/
    requestStatus.ts

  App.tsx
  main.tsx
  theme.ts
  vite-env.d.ts