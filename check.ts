import fs from 'fs';
const dir = 'public';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.png'));
for (const file of files) {
  const stats = fs.statSync(`${dir}/${file}`);
  console.log(`${file}: ${stats.size} bytes`);
}
