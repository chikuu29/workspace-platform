// plugin/vite-plugin-version/index.ts
import fs from 'fs';
import path from 'path';
import { Plugin } from 'vite';

// Function to generate a random version string
function generateRandomVersion() {
  return `v${Math.floor(Math.random() * 10000)}.${Math.floor(Math.random() * 100)}.${Math.floor(Math.random() * 100)}`;
}

function createVersionPlugin(): Plugin {
  console.log("Initializing version plugin");

  const randomVersion = generateRandomVersion(); // Generate version once

  return {
    name: 'vite-plugin-version',
    apply: 'build',
    enforce: 'post',
    generateBundle(_, bundle) {
      console.log(`Replacing placeholder with version: ${randomVersion}`);

      // Iterate over the bundle to replace placeholders in JS files
      for (const fileName in bundle) {
        const chunk = bundle[fileName];

        // Only proceed if the current file is a chunk and contains code
        // Only process chunks that are JavaScript files and exclude `node_modules`
        if (chunk.type === 'chunk' && chunk.code && !fileName.includes('node_modules')) {
          chunk.code = chunk.code.replace(/{{HASH_PLACEHOLDER}}/g, randomVersion);
        }
      }

      // Write version to a JSON file in the dist folder
      const versionFilePath = path.join(process.cwd(), 'dist/version.json');
      const versionContent = JSON.stringify({ version: randomVersion }, null, 2);

      // Write the version.json file to dist
      fs.writeFileSync(versionFilePath, versionContent, 'utf-8');
      console.log(`Version file created at ${versionFilePath} with version ${randomVersion}.`);
    },
  };
}

export default createVersionPlugin;
