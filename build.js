const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('Starting custom build process...');

// Run the React build
try {
  console.log('Running React build...');
  execSync('react-scripts build', { stdio: 'inherit' });
  console.log('React build completed successfully.');
} catch (error) {
  console.error('Error during React build:', error);
  process.exit(1);
}

// Verify the build directory exists
const buildDir = path.join(__dirname, 'build');
if (!fs.existsSync(buildDir)) {
  console.error('Build directory does not exist after build!');
  process.exit(1);
}

// Verify index.html exists
const indexPath = path.join(buildDir, 'index.html');
if (!fs.existsSync(indexPath)) {
  console.error('index.html does not exist in build directory!');
  process.exit(1);
}

// Create _redirects file in the build directory
const redirectsPath = path.join(buildDir, '_redirects');
fs.writeFileSync(redirectsPath, '/* /index.html 200');
console.log('Created _redirects file in build directory.');

// Copy 404.html to the build directory
const notFoundSourcePath = path.join(__dirname, 'public', '404.html');
const notFoundDestPath = path.join(buildDir, '404.html');
if (fs.existsSync(notFoundSourcePath)) {
  fs.copyFileSync(notFoundSourcePath, notFoundDestPath);
  console.log('Copied 404.html to build directory.');
}

// Create a web.config file for IIS (just in case)
const webConfigPath = path.join(buildDir, 'web.config');
const webConfigContent = `<?xml version="1.0"?>
<configuration>
  <system.webServer>
    <rewrite>
      <rules>
        <rule name="React Routes" stopProcessing="true">
          <match url=".*" />
          <conditions logicalGrouping="MatchAll">
            <add input="{REQUEST_FILENAME}" matchType="IsFile" negate="true" />
            <add input="{REQUEST_FILENAME}" matchType="IsDirectory" negate="true" />
          </conditions>
          <action type="Rewrite" url="index.html" />
        </rule>
      </rules>
    </rewrite>
  </system.webServer>
</configuration>`;
fs.writeFileSync(webConfigPath, webConfigContent);
console.log('Created web.config file in build directory.');

// Create a .htaccess file for Apache servers
const htaccessPath = path.join(buildDir, '.htaccess');
const htaccessContent = `<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteCond %{REQUEST_FILENAME} !-l
  RewriteRule . /index.html [L]
</IfModule>`;
fs.writeFileSync(htaccessPath, htaccessContent);
console.log('Created .htaccess file in build directory.');

console.log('Custom build process completed successfully.'); 