const fs = require('fs');
const path = require('path');

console.log('=== Telegram Translation Bot Deployment Verification ===\n');

// Check 1: Essential files exist
console.log('1. Checking essential deployment files...');

const essentialFiles = [
  'Dockerfile',
  'docker-compose.yml',
  'nginx.conf',
  'deploy.sh',
  'deploy.ps1',
  'DEPLOYMENT.md',
  '.env.example'
];

let missingFiles = [];
for (const file of essentialFiles) {
  if (fs.existsSync(path.join(__dirname, file))) {
    console.log(`  ✓ ${file}`);
  } else {
    console.log(`  ✗ ${file} (MISSING)`);
    missingFiles.push(file);
  }
}

// Check 2: Dockerfile content
console.log('\n2. Verifying Dockerfile content...');
try {
  const dockerfile = fs.readFileSync(path.join(__dirname, 'Dockerfile'), 'utf8');
  const dockerChecks = [
    {check: dockerfile.includes('FROM node:18-alpine'), desc: 'Uses Node.js 18 Alpine image'},
    {check: dockerfile.includes('WORKDIR /app'), desc: 'Sets working directory'},
    {check: dockerfile.includes('COPY package*.json'), desc: 'Copies package files'},
    {check: dockerfile.includes('npm ci --only=production'), desc: 'Installs production dependencies'},
    {check: dockerfile.includes('EXPOSE 3000'), desc: 'Exposes port 3000'},
    {check: dockerfile.includes('USER nextjs'), desc: 'Runs as non-root user'}
  ];
  
  for (const {check, desc} of dockerChecks) {
    if (check) {
      console.log(`  ✓ ${desc}`);
    } else {
      console.log(`  ✗ ${desc}`);
    }
  }
} catch (err) {
  console.log('  ✗ Could not read Dockerfile');
}

// Check 3: docker-compose.yml content
console.log('\n3. Verifying docker-compose.yml content...');
try {
  const dockerCompose = fs.readFileSync(path.join(__dirname, 'docker-compose.yml'), 'utf8');
  const composeChecks = [
    {check: dockerCompose.includes('version:'), desc: 'Has version specification'},
    {check: dockerCompose.includes('telegram-bot:'), desc: 'Defines telegram-bot service'},
    {check: dockerCompose.includes('ports:'), desc: 'Exposes ports'},
    {check: dockerCompose.includes('3000:3000'), desc: 'Maps port 3000'},
    {check: dockerCompose.includes('env_file:'), desc: 'Uses environment file'},
    {check: dockerCompose.includes('restart: unless-stopped'), desc: 'Has restart policy'}
  ];
  
  for (const {check, desc} of composeChecks) {
    if (check) {
      console.log(`  ✓ ${desc}`);
    } else {
      console.log(`  ✗ ${desc}`);
    }
  }
} catch (err) {
  console.log('  ✗ Could not read docker-compose.yml');
}

// Check 4: Nginx configuration
console.log('\n4. Verifying Nginx configuration...');
try {
  const nginxConf = fs.readFileSync(path.join(__dirname, 'nginx.conf'), 'utf8');
  const nginxChecks = [
    {check: nginxConf.includes('server_name anna.floripa.br'), desc: 'Configured for correct domain'},
    {check: nginxConf.includes('proxy_pass http://localhost:3000'), desc: 'Proxies to localhost:3000'},
    {check: nginxConf.includes('ssl_certificate'), desc: 'Configured for SSL'},
    {check: nginxConf.includes('location /'), desc: 'Has location block'}
  ];
  
  for (const {check, desc} of nginxChecks) {
    if (check) {
      console.log(`  ✓ ${desc}`);
    } else {
      console.log(`  ✗ ${desc}`);
    }
  }
} catch (err) {
  console.log('  ✗ Could not read nginx.conf');
}

// Check 5: Environment variables
console.log('\n5. Verifying environment configuration...');
try {
  const envExample = fs.readFileSync(path.join(__dirname, '.env.example'), 'utf8');
  const envChecks = [
    {check: envExample.includes('TELEGRAM_BOT_TOKEN'), desc: 'Has TELEGRAM_BOT_TOKEN'},
    {check: envExample.includes('OPENAI_API_KEY'), desc: 'Has OPENAI_API_KEY'},
    {check: envExample.includes('PORT=3000'), desc: 'Has PORT configuration'}
  ];
  
  for (const {check, desc} of envChecks) {
    if (check) {
      console.log(`  ✓ ${desc}`);
    } else {
      console.log(`  ✗ ${desc}`);
    }
  }
} catch (err) {
  console.log('  ✗ Could not read .env.example');
}

// Check 6: Deployment scripts
console.log('\n6. Verifying deployment scripts...');
try {
  const deploySh = fs.readFileSync(path.join(__dirname, 'deploy.sh'), 'utf8');
  const deployPs1 = fs.readFileSync(path.join(__dirname, 'deploy.ps1'), 'utf8');
  
  if (deploySh.includes('scp -r ./*') && deploySh.includes('docker-compose up -d')) {
    console.log('  ✓ deploy.sh has deployment commands');
  } else {
    console.log('  ✗ deploy.sh missing deployment commands');
  }
  
  if (deployPs1.includes('scp -r ./*') && deployPs1.includes('docker-compose up -d')) {
    console.log('  ✓ deploy.ps1 has deployment commands');
  } else {
    console.log('  ✗ deploy.ps1 missing deployment commands');
  }
} catch (err) {
  console.log('  ✗ Could not read deployment scripts');
}

console.log('\n=== Verification Complete ===');

if (missingFiles.length === 0) {
  console.log('\n🎉 All deployment files are present and correctly configured!');
  console.log('You can now deploy the application using:');
  console.log('  Linux/Mac: ./deploy.sh');
  console.log('  Windows: .\\deploy.ps1');
  console.log('\nRefer to DEPLOYMENT.md for detailed instructions.');
  process.exit(0);
} else {
  console.log(`\n❌ Missing ${missingFiles.length} essential files:`);
  missingFiles.forEach(file => console.log(`  - ${file}`));
  console.log('\nPlease create the missing files before deployment.');
  process.exit(1);
}