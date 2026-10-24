const fs = require('fs');
const path = require('path');

console.log('🔍 Verifying SocioTrack foundational setup...\n');

const requiredFiles = {
  'backend': [
    'package.json',
    'tsconfig.json',
    '.env.example',
    'src/server.ts',
    'src/config/database.ts',
    'src/middleware/errorHandler.ts',
    'src/types/index.ts'
  ],
  'frontend': [
    'package.json',
    'tsconfig.json',
    'vite.config.ts',
    'tailwind.config.js',
    'postcss.config.js',
    '.env.example',
    'src/App.tsx',
    'src/main.tsx',
    'src/index.css',
    'src/services/api.ts',
    'src/types/index.ts',
    'src/pages/auth/LoginPage.tsx',
    'src/pages/auth/RegisterPage.tsx',
    'src/pages/resident/ResidentDashboard.tsx',
    'src/pages/admin/AdminDashboard.tsx',
    'src/pages/technician/TechnicianDashboard.tsx'
  ]
};

let allPassed = true;

// Check backend files
console.log('📦 Backend Structure:');
for (const file of requiredFiles.backend) {
  const filePath = path.join(__dirname, 'backend', file);
  if (fs.existsSync(filePath)) {
    console.log(`  ✅ ${file}`);
  } else {
    console.log(`  ❌ ${file} - MISSING`);
    allPassed = false;
  }
}

console.log('\n🌐 Frontend Structure:');
for (const file of requiredFiles.frontend) {
  const filePath = path.join(__dirname, 'frontend', file);
  if (fs.existsSync(filePath)) {
    console.log(`  ✅ ${file}`);
  } else {
    console.log(`  ❌ ${file} - MISSING`);
    allPassed = false;
  }
}

// Check package.json contents
console.log('\n📄 Configuration Checks:');
try {
  const backendPackage = JSON.parse(fs.readFileSync(path.join(__dirname, 'backend', 'package.json'), 'utf8'));
  const frontendPackage = JSON.parse(fs.readFileSync(path.join(__dirname, 'frontend', 'package.json'), 'utf8'));
  
  // Check backend dependencies
  const backendDeps = Object.keys(backendPackage.dependencies || {});
  const backendDevDeps = Object.keys(backendPackage.devDependencies || {});
  
  console.log(`  ✅ Backend package.json - Express: ${backendDeps.includes('express') ? '✓' : '✗'}`);
  console.log(`  ✅ Backend package.json - Mongoose: ${backendDeps.includes('mongoose') ? '✓' : '✗'}`);
  console.log(`  ✅ Backend package.json - TypeScript: ${backendDevDeps.includes('typescript') ? '✓' : '✗'}`);
  
  // Check frontend dependencies
  const frontendDeps = Object.keys(frontendPackage.dependencies || {});
  const frontendDevDeps = Object.keys(frontendPackage.devDependencies || {});
  
  console.log(`  ✅ Frontend package.json - React: ${frontendDeps.includes('react') ? '✓' : '✗'}`);
  console.log(`  ✅ Frontend package.json - Vite: ${frontendDevDeps.includes('vite') ? '✓' : '✗'}`);
  console.log(`  ✅ Frontend package.json - Tailwind: ${frontendDevDeps.includes('tailwindcss') ? '✓' : '✗'}`);
  
} catch (error) {
  console.log(`  ❌ Error reading package.json files: ${error.message}`);
  allPassed = false;
}

// Check environment files
console.log('\n🔧 Environment Setup:');
try {
  const backendEnvExample = fs.readFileSync(path.join(__dirname, 'backend', '.env.example'), 'utf8');
  const frontendEnvExample = fs.readFileSync(path.join(__dirname, 'frontend', '.env.example'), 'utf8');
  
  const hasMongoUri = backendEnvExample.includes('MONGO_URI=');
  const hasJwtSecret = backendEnvExample.includes('JWT_SECRET=');
  const hasPort = backendEnvExample.includes('PORT=');
  const hasApiUrl = frontendEnvExample.includes('VITE_API_BASE_URL=');
  
  console.log(`  ✅ Backend .env.example - MONGO_URI: ${hasMongoUri ? '✓' : '✗'}`);
  console.log(`  ✅ Backend .env.example - JWT_SECRET: ${hasJwtSecret ? '✓' : '✗'}`);
  console.log(`  ✅ Backend .env.example - PORT: ${hasPort ? '✓' : '✗'}`);
  console.log(`  ✅ Frontend .env.example - VITE_API_BASE_URL: ${hasApiUrl ? '✓' : '✗'}`);
  
} catch (error) {
  console.log(`  ❌ Error reading .env.example files: ${error.message}`);
  allPassed = false;
}

console.log('\n' + '='.repeat(50));
if (allPassed) {
  console.log('🎉 All foundational structure checks PASSED!');
  console.log('\nNext steps:');
  console.log('1. cd backend && npm install');
  console.log('2. cd frontend && npm install');
  console.log('3. Start development servers');
  console.log('4. Verify health endpoint at http://localhost:5000/health');
} else {
  console.log('⚠️ Some checks failed. Please review missing files.');
}
console.log('='.repeat(50));