import { MarkerType } from '@xyflow/react';

export const TRACE_NODE_TYPES = {
  requirement: 'requirement',
  service: 'service',
  api: 'api',
  task: 'task',
};

export const initialTraceNodes: any[] = [
  // Requirements (X: 0)
  {
    id: 'req-1',
    type: 'trace',
    position: { x: 0, y: 100 },
    data: { 
      label: 'User Authentication', 
      type: 'requirement', 
      badge: 'PRD-101',
      description: 'Implement a secure, scalable authentication system supporting JWT and social logins.',
      status: 'In Progress'
    }
  },
  {
    id: 'req-2',
    type: 'trace',
    position: { x: 0, y: 300 },
    data: { 
      label: 'Payment Processing', 
      type: 'requirement', 
      badge: 'PRD-102',
      description: 'The system must support PCI-compliant payment processing via Stripe and PayPal.',
      status: 'Open'
    }
  },

  // Services (X: 350)
  {
    id: 'srv-1',
    type: 'trace',
    position: { x: 350, y: 50 },
    data: { 
      label: 'Auth Microservice', 
      type: 'service', 
      badge: 'SVC-AUTH',
      description: 'Node.js service handling identity, token issuance, and validation.',
    }
  },
  {
    id: 'srv-2',
    type: 'trace',
    position: { x: 350, y: 350 },
    data: { 
      label: 'Payment Gateway', 
      type: 'service', 
      badge: 'SVC-PAY',
      description: 'Go-based microservice for interfacing with external payment providers.',
    }
  },

  // APIs (X: 700)
  {
    id: 'api-1',
    type: 'trace',
    position: { x: 700, y: 0 },
    data: { 
      label: '/v1/auth/login', 
      type: 'api', 
      badge: 'POST',
      method: 'POST',
      endpoint: '/v1/auth/login',
      description: 'Authenticates a user and returns a set of JWT tokens.',
    }
  },
  {
    id: 'api-2',
    type: 'trace',
    position: { x: 700, y: 100 },
    data: { 
      label: '/v1/auth/refresh', 
      type: 'api', 
      badge: 'POST',
      method: 'POST',
      endpoint: '/v1/auth/refresh',
      description: 'Issues a new access token using a valid refresh token.',
    }
  },
  {
    id: 'api-3',
    type: 'trace',
    position: { x: 700, y: 300 },
    data: { 
      label: '/v1/payments/charge', 
      type: 'api', 
      badge: 'POST',
      method: 'POST',
      endpoint: '/v1/payments/charge',
      description: 'Processes a payment transaction requests.',
    }
  },

  // Tasks (X: 1050)
  {
    id: 'tsk-1',
    type: 'trace',
    position: { x: 1050, y: -50 },
    data: { 
      label: 'Setup Redis Store', 
      type: 'task', 
      badge: 'TASK-8',
      status: 'Done',
      description: 'Configure Redis for storing blacklisted JWT tokens and session data.',
    }
  },
  {
    id: 'tsk-2',
    type: 'trace',
    position: { x: 1050, y: 50 },
    data: { 
      label: 'Implement Argon2', 
      type: 'task', 
      badge: 'TASK-9',
      status: 'In Progress',
      description: 'Integrate Argon2 hashing for secure password storage.',
    }
  },
  {
    id: 'tsk-3',
    type: 'trace',
    position: { x: 1050, y: 150 },
    data: { 
      label: 'Validate Refresh', 
      type: 'task', 
      badge: 'TASK-10',
      status: 'Open',
      description: 'Logic to verify refresh token rotation and database checks.',
    }
  },
  {
    id: 'tsk-4',
    type: 'trace',
    position: { x: 1050, y: 300 },
    data: { 
      label: 'Stripe Integration', 
      type: 'task', 
      badge: 'TASK-22',
      status: 'Done',
      description: 'Setup Stripe webhook handlers and payment intent creation.',
    }
  },
];

export const initialTraceEdges: any[] = [
  // Req -> Srv
  { id: 'e-r1-s1', source: 'req-1', target: 'srv-1', animated: true },
  { id: 'e-r2-s2', source: 'req-2', target: 'srv-2', animated: true },

  // Srv -> API
  { id: 'e-s1-a1', source: 'srv-1', target: 'api-1' },
  { id: 'e-s1-a2', source: 'srv-1', target: 'api-2' },
  { id: 'e-s2-a3', source: 'srv-2', target: 'api-3' },

  // API -> Task
  { id: 'e-a1-t1', source: 'api-1', target: 'tsk-1' },
  { id: 'e-a1-t2', source: 'api-1', target: 'tsk-2' },
  { id: 'e-a2-t3', source: 'api-2', target: 'tsk-3' },
  { id: 'e-a3-t4', source: 'api-3', target: 'tsk-4' },
];

export const markerEnd = {
  type: MarkerType.ArrowClosed,
  width: 20,
  height: 20,
  color: '#3f3f46',
};
