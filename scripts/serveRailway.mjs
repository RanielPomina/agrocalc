import { spawn } from 'node:child_process';

const port = process.env.PORT ?? '3000';
const child = spawn('serve', ['dist', '-s', '-l', `tcp://0.0.0.0:${port}`], {
  shell: process.platform === 'win32',
  stdio: 'inherit',
});

child.on('exit', (code) => {
  process.exit(code ?? 0);
});