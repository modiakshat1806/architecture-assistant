// src/lib/pipeline/requestlyExporter.ts

interface CodeFile {
  name: string;
  language: string;
  content: string;
  children?: CodeFile[];
  type?: 'file' | 'folder';
}

export function generateRequestlyConfig(codeStructure: CodeFile[], projectName: string) {
  const routes = extractRoutes(codeStructure, projectName);

  return routes.map((route, index) => {
    const timestamp = Date.now();
    const idSuffix = Math.random().toString(36).substring(2, 7);
    
    return {
      creationDate: timestamp,
      description: `Auto-generated mock for ${projectName}`,
      groupId: "",
      id: `Response_${idSuffix}`,
      isSample: false,
      name: `Mock: ${route.method} ${route.path} - ${timestamp}`,
      objectType: "rule",
      pairs: [
        {
          source: {
            filters: [],
            key: "Url",
            operator: "Contains",
            value: route.path
          },
          response: {
            type: "static",
            value: JSON.stringify(route.sampleResponse, null, 2),
            statusCode: route.statusCode ? route.statusCode.toString() : "200",
            resourceType: "restApi"
          },
          id: Math.random().toString(36).substring(2, 7)
        }
      ],
      ruleType: "Response",
      status: "Active",
      createdBy: "blueprint-ai",
      currentOwner: "blueprint-ai",
      lastModifiedBy: "blueprint-ai",
      schemaVersion: "3.0.0",
      modificationDate: timestamp
    };
  });
}


/**
 * Heuristically extracts API routes from generated backend code.
 * Scans files for common Express.js route definitions (e.g., app.get, router.post).
 */
function extractRoutes(codeStructure: CodeFile[], projectName: string) {
  const routes: Array<{ method: string; path: string; sampleResponse: any; statusCode: number }> = [];

  // Original regex removed to use the broader one below


  const flattenFiles = (files: CodeFile[]): CodeFile[] => {
    let result: CodeFile[] = [];
    for (const f of files) {
      if (f.type === 'file' || f.content) {
        result.push(f);
      }
      if (f.children) {
        result = result.concat(flattenFiles(f.children));
      }
    }
    return result;
  };

  const flatFiles = flattenFiles(codeStructure);

  // Broad regex to catch backend route definitions (.get, .post) OR frontend fetches (axios.get, fetch)
  // Ensures the path starts with a '/'
  const routeRegex = /(?:get|post|put|delete|patch|fetch)\s*\(\s*['"`](\/[^'"`]+)['"`]/gi;

  for (const file of flatFiles) {
    if (!file || !file.content || typeof file.content !== 'string') continue;
    
    let match;
    while ((match = routeRegex.exec(file.content)) !== null) {
      if (!match[1] || !match[2]) continue;

      // Ensure method is standard HTTP verb
      let rawMethod = match[1].toUpperCase();
      // Handle the 'fetch('/path')' edge case which implies GET
      const method = rawMethod === 'FETCH' ? 'GET' : rawMethod;
      let path = match[2];

      // Try to build a somewhat intelligent mock response based on the path
      let sampleResponse: any = { message: "Success" };
      let statusCode = 200;

      if (method === 'GET') {
         if (path.includes(':id') || path.match(/\/[a-zA-Z]+\/[^/]+$/)) {
             sampleResponse = { id: "123", name: "Sample Item", data: "Mocked AI Data" };
         } else {
             sampleResponse = [
               { id: "1", name: "Mocked Item 1" }, 
               { id: "2", name: "Mocked Item 2" }
             ];
         }
      } else if (method === 'POST') {
          statusCode = 201;
          sampleResponse = { success: true, id: "new-id", message: "Resource created successfully" };
      } else if (method === 'DELETE') {
          sampleResponse = { success: true, message: "Resource deleted successfully" };
      } else if (method === 'PUT' || method === 'PATCH') {
          sampleResponse = { success: true, message: "Resource updated successfully" };
      }

      routes.push({
        method,
        path,
        sampleResponse,
        statusCode
      });
    }
  }

  // If no routes were found, provide a default fallback mock just to demonstrate it works
  if (routes.length === 0) {
      routes.push({
          method: "GET",
          path: "/api/health",
          sampleResponse: { status: "ok", service: projectName, version: "1.0.0" },
          statusCode: 200
      });
  }

  // Deduplicate by path + method
  const uniqueRoutes = [];
  const seen = new Set();
  for (const route of routes) {
      const key = `${route.method}-${route.path}`;
      if (!seen.has(key)) {
          seen.add(key);
          uniqueRoutes.push(route);
      }
  }

  return uniqueRoutes;
}
