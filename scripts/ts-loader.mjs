import { pathToFileURL } from 'node:url';
import path from 'node:path';
import fs from 'node:fs';

export async function resolve(specifier, context, nextResolve) {
  if (specifier.startsWith('@/')) {
    const rawPath = specifier.replace(/^@\//, '');
    const srcPath = path.resolve(process.cwd(), 'src', rawPath);
    for (const ext of ['.ts', '.tsx', '.js', '.json']) {
      if (fs.existsSync(srcPath + ext)) {
        return {
          shortCircuit: true,
          url: pathToFileURL(srcPath + ext).href,
        };
      }
    }
    if (fs.existsSync(srcPath)) {
      return {
        shortCircuit: true,
        url: pathToFileURL(srcPath).href,
      };
    }
  }
  return nextResolve(specifier, context);
}
