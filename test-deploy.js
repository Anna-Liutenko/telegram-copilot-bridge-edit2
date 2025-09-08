const fs = require('fs');
const path = require('path');

// Test that all required files exist for deployment
const requiredFiles = [
  'Dockerfile',
  'docker-compose.yml',
  'package.json',
  '.env.example',
  'nginx.conf',
  'deploy.sh',
  'deploy.ps1',
  'DEPLOYMENT.md'
];

console.log('Checking deployment files...');

let allFilesExist = true;

for (const file of requiredFiles) {
  if (fs.existsSync(path.join(__dirname, file))) {
    console.log(`✓ ${file} exists`);
  } else {
    console.log(`✗ ${file} is missing`);
    allFilesExist = false;
  }
}

// Check that docker-compose.yml has the correct content
const dockerComposeContent = fs.readFileSync(path.join(__dirname, 'docker-compose.yml'), 'utf8');
if (dockerComposeContent.includes('telegram-bot') && dockerComposeContent.includes('3000:3000')) {
  console.log('✓ docker-compose.yml has correct content');
} else {
  console.log('✗ docker-compose.yml is missing required configuration');
  allFilesExist = false;
}

// Check that nginx.conf has the correct content
const nginxContent = fs.readFileSync(path.join(__dirname, 'nginx.conf'), 'utf8');
if (nginxContent.includes('anna.floripa.br') && nginxContent.includes('proxy_pass')) {
  console.log('✓ nginx.conf has correct content');
} else {
  console.log('✗ nginx.conf is missing required configuration');
  allFilesExist = false;
}

if (allFilesExist) {
  console.log('\n✅ All deployment files are present and correct!');
  console.log('You can now proceed with deployment using either:');
  console.log('  - ./deploy.sh (on Linux/Mac)');
  console.log('  - .\\deploy.ps1 (on Windows)');
  console.log('Refer to DEPLOYMENT.md for detailed instructions.');
} else {
  console.log('\n❌ Some deployment files are missing or incorrect.');
  console.log('Please check the issues above before deploying.');
}

process.exit(allFilesExist ? 0 : 1);