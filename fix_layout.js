import fs from 'fs';
const content = fs.readFileSync('src/components/ProjectViewV2.tsx', 'utf8');
const lines = content.split('\n');
// We know lines 500 to 513 (1-indexed) are junk
// 500 is index 499
const start = 499;
const end = 512;
lines.splice(start, end - start + 1);
fs.writeFileSync('src/components/ProjectViewV2.tsx', lines.join('\n'));
console.log('Cleaned up lines');
