// Boilerplate configuration
// Add new boilerplates here without modifying component code

export type BoilerplateTemplate = {
  id: string;
  name: string;
  description?: string;
  language: string;
  framework: string;
  database?: string;
  // Full path to the boilerplate directory
  path: string;
};

// Get paths from environment variables
const basePath = import.meta.env.VITE_TEMPLATES_BASE_PATH || '/templates';
const rustActixPath = import.meta.env.VITE_RUST_ACTIX_TEMPLATE_PATH || 'spark';

export const boilerplateTemplates: BoilerplateTemplate[] = [
  {
    id: 'rust-actix-postgres',
    name: 'Rust + Actix-web + PostgreSQL',
    description: 'RESTful API with Rust, Actix-web framework and PostgreSQL database',
    language: 'Rust',
    framework: 'Actix-web',
    database: 'PostgreSQL',
    path: `${basePath}/${rustActixPath}`
  },
  // Add more boilerplates here as needed
  // Just add new environment variables in .env and reference them here
];

// Helper function to get boilerplate by name
export const getBoilerplateByName = (name: string): BoilerplateTemplate | undefined => {
  return boilerplateTemplates.find(template => template.name === name);
};

// Helper function to get boilerplate by id
export const getBoilerplateById = (id: string): BoilerplateTemplate | undefined => {
  return boilerplateTemplates.find(template => template.id === id);
};

// Function to fetch README content from boilerplate directory
export const fetchBoilerplateReadme = async (template: BoilerplateTemplate): Promise<string> => {
  try {
    // In a real app, this would be an API call to your backend
    // For now, we'll return a placeholder
    const readmePath = `${template.path}/README.md`;

    // This would need to be replaced with actual file reading logic
    // through your backend API
    console.log(`Would fetch README from: ${readmePath}`);

    // Placeholder return
    return `README content would be loaded from: ${readmePath}`;
  } catch (error) {
    console.error('Error fetching README:', error);
    return 'Unable to load README.md';
  }
};