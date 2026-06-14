const { spawn } = require('child_process');

const commands = [
  {
    name: 'backend',
    command: 'npm',
    args: ['--prefix', 'backend', 'run', 'dev']
  },
  {
    name: 'frontend',
    command: 'npm',
    args: ['--prefix', 'frontend', 'run', 'dev']
  }
];

const children = commands.map(({ name, command, args }) => {
  const child = spawn(command, args, {
    cwd: process.cwd(),
    stdio: ['inherit', 'pipe', 'pipe'],
    shell: process.platform === 'win32'
  });

  child.stdout.on('data', (data) => {
    process.stdout.write(`[${name}] ${data}`);
  });

  child.stderr.on('data', (data) => {
    process.stderr.write(`[${name}] ${data}`);
  });

  child.on('exit', (code, signal) => {
    if (signal) {
      return;
    }

    if (code !== 0) {
      console.error(`[${name}] exited with code ${code}`);
      stopAll();
    }
  });

  return child;
});

const stopAll = () => {
  children.forEach((child) => {
    if (!child.killed) {
      child.kill('SIGTERM');
    }
  });
};

process.on('SIGINT', () => {
  stopAll();
  process.exit(0);
});

process.on('SIGTERM', () => {
  stopAll();
  process.exit(0);
});
