import express from 'express';
import cors from 'cors';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Enable CORS for the frontend
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175', 'http://localhost:5176']
}));

app.use(express.json());

// Configuration - allowed base paths for security
const ALLOWED_TEMPLATE_PATHS = [
  '/Users/mifo/Desktop/Galaxy',
  '/Users/mifo/Desktop/galaxy-governance'
];

// Validate that a path is within allowed directories
function isPathAllowed(requestedPath) {
  const normalizedPath = path.normalize(requestedPath);
  return ALLOWED_TEMPLATE_PATHS.some(allowedPath =>
    normalizedPath.startsWith(allowedPath)
  );
}

// Endpoint to fetch README content from boilerplate directory
app.get('/api/boilerplate/readme', async (req, res) => {
  try {
    const boilerplatePath = req.query.path;

    if (!boilerplatePath) {
      return res.status(400).json({ error: 'Path parameter is required' });
    }

    // Security check - ensure path is within allowed directories
    if (!isPathAllowed(boilerplatePath)) {
      return res.status(403).json({ error: 'Access to this path is not allowed' });
    }

    const readmePath = path.join(boilerplatePath, 'README.md');

    try {
      const content = await fs.readFile(readmePath, 'utf-8');
      res.json({
        content,
        path: readmePath,
        success: true
      });
    } catch (fileError) {
      if (fileError.code === 'ENOENT') {
        res.status(404).json({
          error: 'README.md not found',
          path: readmePath
        });
      } else {
        throw fileError;
      }
    }
  } catch (error) {
    console.error('Error reading README:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
});

// Endpoint to list available boilerplates in a directory
app.get('/api/boilerplates/list', async (req, res) => {
  try {
    const basePath = req.query.basePath || '/Users/mifo/Desktop/Galaxy';

    if (!isPathAllowed(basePath)) {
      return res.status(403).json({ error: 'Access to this path is not allowed' });
    }

    const directories = await fs.readdir(basePath, { withFileTypes: true });
    const boilerplates = directories
      .filter(dirent => dirent.isDirectory())
      .map(dirent => ({
        name: dirent.name,
        path: path.join(basePath, dirent.name)
      }));

    res.json({ boilerplates });
  } catch (error) {
    console.error('Error listing boilerplates:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
  console.log(`Allowed template paths: ${ALLOWED_TEMPLATE_PATHS.join(', ')}`);
});