// Service to handle boilerplate operations
import type { BoilerplateTemplate } from '../config/boilerplates';

// Get backend URL from environment or use default
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';

export const boilerplateService = {
  // Fetch README.md content from the boilerplate directory
  async fetchReadme(template: BoilerplateTemplate): Promise<string> {
    try {
      const response = await fetch(`${BACKEND_URL}/api/boilerplate/readme?path=${encodeURIComponent(template.path)}`);

      if (!response.ok) {
        const error = await response.json();
        console.error('Backend error:', error);
        return error.error || 'Failed to load README.md';
      }

      const data = await response.json();
      return data.content;

    } catch (error) {
      console.error('Error fetching README:', error);
      return 'Error loading README.md. Make sure the backend server is running on port 8000.';
    }
  }
};