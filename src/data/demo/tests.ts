export type TestStatus = 'pass' | 'fail' | 'edge';

export interface TestCase {
  id: string;
  method: string;
  endpoint: string;
  description: string;
  expected: string;
  status: TestStatus;
}

export const functionalTests: TestCase[] = [
  { id: 'f1', method: 'POST', endpoint: '/api/auth/signup', description: 'Valid signup with new email', expected: '201 { user, accessToken }', status: 'pass' },
  { id: 'f2', method: 'POST', endpoint: '/api/auth/login', description: 'Valid credentials', expected: '200 { user, accessToken }', status: 'pass' },
  { id: 'f3', method: 'POST', endpoint: '/api/auth/logout', description: 'Clear session cookie', expected: '200 { success: true }', status: 'pass' },
  { id: 'f4', method: 'POST', endpoint: '/api/auth/refresh', description: 'Refresh with valid cookie', expected: '200 { accessToken }', status: 'pass' },
  { id: 'f5', method: 'GET', endpoint: '/api/auth/me', description: 'Get current user profile', expected: '200 { user }', status: 'pass' },
  { id: 'f6', method: 'GET', endpoint: '/api/projects', description: 'List all user projects', expected: '200 Project[]', status: 'pass' },
  { id: 'f7', method: 'POST', endpoint: '/api/projects', description: 'Create new project', expected: '201 Project', status: 'pass' },
  { id: 'f8', method: 'POST', endpoint: '/api/projects/upload', description: 'Upload PRD file (PDF)', expected: '200 { jobId, status }', status: 'pass' },
  { id: 'f9', method: 'GET', endpoint: '/api/projects/:id/analysis', description: 'Get analysis results', expected: '200 AnalysisResult', status: 'pass' },
  { id: 'f10', method: 'GET', endpoint: '/api/projects/:id/tasks', description: 'List tasks with filters', expected: '200 { features, stories, tasks }', status: 'pass' },
  { id: 'f11', method: 'PATCH', endpoint: '/api/projects/:id/tasks/:taskId', description: 'Update task status', expected: '200 Task', status: 'pass' },
  { id: 'f12', method: 'GET', endpoint: '/api/projects/:id/sprints', description: 'Get sprints with tasks', expected: '200 Sprint[]', status: 'pass' },
];

export const edgeCaseTests: TestCase[] = [
  { id: 'e1', method: 'POST', endpoint: '/api/projects/upload', description: 'Upload exactly 10MB file', expected: '200 { jobId }', status: 'edge' },
  { id: 'e2', method: 'POST', endpoint: '/api/auth/signup', description: 'Email with + alias (user+test@mail.com)', expected: '201 { user }', status: 'edge' },
  { id: 'e3', method: 'POST', endpoint: '/api/projects/upload', description: 'PRD with only headings, no body text', expected: '200 { jobId } with low health score', status: 'edge' },
  { id: 'e4', method: 'GET', endpoint: '/api/projects/:id/tasks', description: 'Filter by non-existent featureId', expected: '200 { tasks: [] }', status: 'edge' },
  { id: 'e5', method: 'PATCH', endpoint: '/api/projects/:id/tasks/:taskId', description: 'Set status to same current status', expected: '200 Task (idempotent)', status: 'edge' },
  { id: 'e6', method: 'POST', endpoint: '/api/projects/:id/chat', description: 'Message with 10,000+ characters', expected: '200 ChatMessage (truncated)', status: 'edge' },
  { id: 'e7', method: 'GET', endpoint: '/api/projects/:id/status', description: 'Poll after processing already complete', expected: '200 { status: "complete" }', status: 'edge' },
  { id: 'e8', method: 'POST', endpoint: '/api/projects', description: 'Project name with unicode characters', expected: '201 Project', status: 'edge' },
];

export const negativeTests: TestCase[] = [
  { id: 'n1', method: 'POST', endpoint: '/api/auth/login', description: 'Invalid password', expected: '401 { error: "Invalid credentials" }', status: 'fail' },
  { id: 'n2', method: 'POST', endpoint: '/api/auth/login', description: 'Non-existent email', expected: '401 { error: "Invalid credentials" }', status: 'fail' },
  { id: 'n3', method: 'POST', endpoint: '/api/auth/signup', description: 'Duplicate email', expected: '409 { error: "Email already registered" }', status: 'fail' },
  { id: 'n4', method: 'POST', endpoint: '/api/auth/signup', description: 'Password under 8 characters', expected: '400 { error: "Password too short" }', status: 'fail' },
  { id: 'n5', method: 'GET', endpoint: '/api/projects/:id', description: 'Access another user\'s project', expected: '403 { error: "Forbidden" }', status: 'fail' },
  { id: 'n6', method: 'POST', endpoint: '/api/projects/upload', description: 'Upload 15MB file (exceeds limit)', expected: '413 { error: "File too large" }', status: 'fail' },
  { id: 'n7', method: 'POST', endpoint: '/api/projects/upload', description: 'Upload .exe file', expected: '400 { error: "Unsupported file type" }', status: 'fail' },
  { id: 'n8', method: 'GET', endpoint: '/api/auth/me', description: 'No authorization header', expected: '401 { error: "Unauthorized" }', status: 'fail' },
  { id: 'n9', method: 'DELETE', endpoint: '/api/projects/:id', description: 'Delete non-existent project', expected: '404 { error: "Not found" }', status: 'fail' },
  { id: 'n10', method: 'POST', endpoint: '/api/projects/:id/chat', description: 'Empty message body', expected: '400 { error: "Content required" }', status: 'fail' },
];

export const unitStubs: TestCase[] = [
  { id: 'u1', method: 'UNIT', endpoint: 'analysisService.ts', description: 'analyzeProject() returns typed AnalysisResult', expected: 'AnalysisResult with all fields populated', status: 'pass' },
  { id: 'u2', method: 'UNIT', endpoint: 'taskGenerator.ts', description: 'generateTasks() produces tasks for each user story', expected: 'Task[] with length >= stories.length', status: 'pass' },
  { id: 'u3', method: 'UNIT', endpoint: 'authService.ts', description: 'hashPassword() produces bcrypt hash', expected: 'String starting with $2b$', status: 'pass' },
  { id: 'u4', method: 'UNIT', endpoint: 'authService.ts', description: 'verifyToken() rejects expired JWT', expected: 'Throws TokenExpiredError', status: 'fail' },
  { id: 'u5', method: 'UNIT', endpoint: 'codeGenerator.ts', description: 'generateFiles() returns non-empty content for each file', expected: 'files[].content.length > 0', status: 'pass' },
  { id: 'u6', method: 'UNIT', endpoint: 'architectureGenerator.ts', description: 'generateDiagrams() returns valid Mermaid syntax', expected: 'String containing "graph" or "erDiagram"', status: 'pass' },
];

export const postmanCollection = {
  info: {
    name: "Blueprint.dev API",
    schema: "https://schema.getpostman.com/json/collection/v2.1.0/collection.json",
    description: "Complete API collection for Blueprint.dev — Food Delivery Platform demo"
  },
  variable: [
    { key: "baseUrl", value: "http://localhost:3001/api" },
    { key: "accessToken", value: "" }
  ],
  item: [
    {
      name: "Auth",
      item: [
        {
          name: "Signup",
          request: {
            method: "POST",
            url: "{{baseUrl}}/auth/signup",
            header: [{ key: "Content-Type", value: "application/json" }],
            body: { mode: "raw", raw: JSON.stringify({ email: "dev@blueprint.dev", password: "s3cur3P@ss!" }, null, 2) }
          }
        },
        {
          name: "Login",
          request: {
            method: "POST",
            url: "{{baseUrl}}/auth/login",
            header: [{ key: "Content-Type", value: "application/json" }],
            body: { mode: "raw", raw: JSON.stringify({ email: "dev@blueprint.dev", password: "s3cur3P@ss!" }, null, 2) }
          }
        },
        {
          name: "Refresh Token",
          request: { method: "POST", url: "{{baseUrl}}/auth/refresh" }
        },
        {
          name: "Get Current User",
          request: {
            method: "GET",
            url: "{{baseUrl}}/auth/me",
            header: [{ key: "Authorization", value: "Bearer {{accessToken}}" }]
          }
        },
        {
          name: "Logout",
          request: { method: "POST", url: "{{baseUrl}}/auth/logout" }
        }
      ]
    },
    {
      name: "Projects",
      item: [
        {
          name: "List Projects",
          request: {
            method: "GET",
            url: "{{baseUrl}}/projects",
            header: [{ key: "Authorization", value: "Bearer {{accessToken}}" }]
          }
        },
        {
          name: "Create Project",
          request: {
            method: "POST",
            url: "{{baseUrl}}/projects",
            header: [
              { key: "Authorization", value: "Bearer {{accessToken}}" },
              { key: "Content-Type", value: "application/json" }
            ],
            body: { mode: "raw", raw: JSON.stringify({ name: "Food Delivery Platform", description: "A comprehensive food delivery application" }, null, 2) }
          }
        },
        {
          name: "Upload PRD",
          request: {
            method: "POST",
            url: "{{baseUrl}}/projects/upload",
            header: [{ key: "Authorization", value: "Bearer {{accessToken}}" }],
            body: { mode: "formdata", formdata: [{ key: "projectId", value: "{{projectId}}" }, { key: "file", type: "file", src: "" }] }
          }
        }
      ]
    },
    {
      name: "Analysis & Tasks",
      item: [
        {
          name: "Get Analysis",
          request: {
            method: "GET",
            url: "{{baseUrl}}/projects/{{projectId}}/analysis",
            header: [{ key: "Authorization", value: "Bearer {{accessToken}}" }]
          }
        },
        {
          name: "Get Tasks",
          request: {
            method: "GET",
            url: "{{baseUrl}}/projects/{{projectId}}/tasks",
            header: [{ key: "Authorization", value: "Bearer {{accessToken}}" }]
          }
        },
        {
          name: "Update Task",
          request: {
            method: "PATCH",
            url: "{{baseUrl}}/projects/{{projectId}}/tasks/{{taskId}}",
            header: [
              { key: "Authorization", value: "Bearer {{accessToken}}" },
              { key: "Content-Type", value: "application/json" }
            ],
            body: { mode: "raw", raw: JSON.stringify({ status: "IN_PROGRESS", sprintId: "sprint-1" }, null, 2) }
          }
        }
      ]
    }
  ]
};
