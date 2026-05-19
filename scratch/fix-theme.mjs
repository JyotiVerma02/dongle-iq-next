import fs from 'fs';
import path from 'path';

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(function(file) {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) { 
      results = results.concat(walk(file));
    } else { 
      if (file.endsWith('.tsx') || file.endsWith('.ts')) {
        results.push(file);
      }
    }
  });
  return results;
}

const files = walk('./app/admin/dashboard/components');

let count = 0;
files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let original = content;
  
  // Replace standard tailwind colors with theme css variables
  content = content.replace(/bg-white dark:bg-gray-950/g, 'bg-[var(--card)]');
  content = content.replace(/border-gray-200 dark:border-gray-800/g, 'border-[var(--border-soft)]');
  content = content.replace(/text-gray-900 dark:text-white/g, 'text-[var(--foreground)]');
  content = content.replace(/text-gray-500 dark:text-gray-400/g, 'text-[var(--muted)]');
  content = content.replace(/bg-gray-50 dark:bg-gray-900\/50/g, 'bg-[var(--background-alt)]');
  content = content.replace(/bg-gray-50\/50 dark:bg-gray-900\/50/g, 'bg-[var(--background-alt)]');
  content = content.replace(/bg-gray-50 dark:bg-gray-900/g, 'bg-[var(--background-alt)]');
  
  if (content !== original) {
    fs.writeFileSync(file, content);
    console.log(`Updated ${file}`);
    count++;
  }
});

console.log(`Updated ${count} files.`);
