import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import fs from 'fs';
import path from 'path';
import formidable from 'formidable';

// Custom Vite Plugin for local file uploads
const devUploadPlugin = () => ({
  name: 'dev-upload-plugin',
  configureServer(server) {
    server.middlewares.use('/dev-upload', (req, res, next) => {
      // Only intercept POST requests to /dev-upload
      if (req.method === 'POST') {
        const form = formidable({
          keepExtensions: true,
        });

        form.parse(req, (err, fields, files) => {
          if (err) {
            res.statusCode = 500;
            res.end(JSON.stringify({ ok: false, error: err.message }));
            return;
          }

          // Handle data parsing (formidable v3 returns arrays for fields/files)
          const destPath = Array.isArray(fields.path) ? fields.path[0] : fields.path;
          const uploadedFile = Array.isArray(files.file) ? files.file[0] : files.file;

          if (!destPath || !uploadedFile) {
            res.statusCode = 400;
            res.end(JSON.stringify({ ok: false, error: "Missing file or path" }));
            return;
          }

          // Construct the absolute path to your public folder
          // Using process.cwd() ensures it starts at your project root
          const publicDir = path.resolve(process.cwd(), 'public');
          const finalPath = path.resolve(publicDir, destPath);
          const targetDir = path.dirname(finalPath);

          try {
            // 1. Create the target directory if it doesn't exist (e.g., public/my-project)
            if (!fs.existsSync(targetDir)) {
              fs.mkdirSync(targetDir, { recursive: true });
            }

            // 2. Move the file from the OS temp folder to your public folder
            fs.renameSync(uploadedFile.filepath, finalPath);

            // 3. Return success to your React frontend
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ ok: true, path: '/' + destPath }));
          } catch (fsError) {
            res.statusCode = 500;
            res.end(JSON.stringify({ ok: false, error: "Failed to write file: " + fsError.message }));
          }
        });
      } else {
        // If it's not a POST to /dev-upload, let Vite handle it normally
        next();
      }
    });
  },
});

// https://vite.dev/config/
export default defineConfig({
  plugins: [tailwindcss(),react(), devUploadPlugin()],
})
