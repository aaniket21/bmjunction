const fs = require('fs');
const assert = require('assert');

console.log('Running infrastructure tests...');

try {
  // Test 1: Check if apps/web directory exists
  assert.ok(fs.existsSync('./apps/web'), 'apps/web directory should exist');
  
  // Test 2: Check if package.json exists in apps/web
  assert.ok(fs.existsSync('./apps/web/package.json'), 'Next.js package.json should exist in apps/web');
  
  console.log('✅ Infrastructure tests passed');
} catch (error) {
  console.error('❌ Infrastructure test failed:');
  console.error(error.message);
  process.exit(1);
}
