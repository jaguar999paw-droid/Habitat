#!/usr/bin/env node
/**
 * test-claude.js — Test Claude API connectivity from Node.js
 * 
 * Usage: node test-claude.js <API_KEY> [model] [backend_url]
 * 
 * Examples:
 *   node test-claude.js sk-ant-v7-xxxxxxxxxxxxxxxx
 *   node test-claude.js sk-ant-v7-xxxxxxxxxxxxxxxx claude-haiku-4-5-20251001
 */

const apiKey = process.argv[2];
const model = process.argv[3] || 'claude-sonnet-4-6';
const backend = process.argv[4] || 'http://localhost:3001';

if (!apiKey) {
  console.log('❌ Usage: node test-claude.js <API_KEY> [model] [backend_url]');
  console.log('');
  console.log('Example:');
  console.log('  node test-claude.js sk-ant-v7-xxxxxxxxxxxxxxxx');
  console.log('  node test-claude.js sk-ant-v7-xxxxxxxxxxxxxxxx claude-haiku-4-5-20251001');
  console.log('');
  console.log('Available models:');
  console.log('  - claude-sonnet-4-6 (recommended, default)');
  console.log('  - claude-haiku-4-5-20251001 (fast, cheap)');
  console.log('  - claude-opus-4-6 (highest quality, requires Pro)');
  process.exit(1);
}

async function testClaude() {
  console.log('🧪 Testing Claude API Connectivity');
  console.log('────────────────────────────────────');
  console.log(`Backend:  ${backend}`);
  console.log(`Model:    ${model}`);
  console.log(`API Key:  ${apiKey.substring(0, 8)}...${apiKey.slice(-8)}`);
  console.log('');

  // Check backend health
  console.log('1️⃣  Checking backend health...');
  try {
    const healthRes = await fetch(`${backend}/api/health`);
    if (!healthRes.ok) throw new Error(`Health check failed: ${healthRes.status}`);
    const health = await healthRes.json();
    console.log(`✅ Backend is healthy (v${health.version})`);
    console.log(`   ML Service: ${health.mlService}`);
    console.log('');
  } catch (err) {
    console.error(`❌ Backend is not running on ${backend}`);
    console.error(`   Error: ${err.message}`);
    console.error('   Start it with: npm run dev:backend');
    process.exit(1);
  }

  // Test Claude API using diagnostic endpoint
  console.log('2️⃣  Testing Claude API with diagnostic endpoint...');
  try {
    const testRes = await fetch(`${backend}/api/test-claude`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ apiKey, model }),
    });

    const testData = await testRes.json();

    console.log('Response:');
    console.log(JSON.stringify(testData, null, 2));
    console.log('');

    if (testData.success) {
      console.log('✅ Claude API is working correctly!');
      console.log('');
      console.log('You can now:');
      console.log('  1. Return to the Landing screen');
      console.log('  2. Paste your API key again');
      console.log('  3. Try generating a song');
      process.exit(0);
    } else if (testData.message && testData.message.includes('permission') || testData.message.includes('Access')) {
      console.log('❌ Access Denied: Your account tier does not support this model.');
      console.log('');
      console.log('✅ Try this instead:');
      console.log('  1. On the Landing screen, switch to "Haiku 4.5" (free tier compatible)');
      console.log('  2. Keep your API key');
      console.log('  3. Try generating again');
      console.log('');
      console.log('Or upgrade your Anthropic account:');
      console.log('  https://console.anthropic.com/account/billing');
      process.exit(1);
    } else {
      console.log('❌ Claude API test failed. Check the error details above.');
      console.log('');
      console.log('Common issues:');
      console.log('  • Invalid or expired API key');
      console.log('  • API key was revoked');
      console.log('  • Wrong model name');
      console.log('  • Account has insufficient balance');
      console.log('  • Rate limit exceeded (try again in a moment)');
      process.exit(1);
    }
  } catch (err) {
    console.error('❌ Error during Claude API test:');
    console.error(`   ${err.message}`);
    process.exit(1);
  }
}

testClaude();
