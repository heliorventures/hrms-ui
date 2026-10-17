import { parseArgs } from 'node:util';

import { loadConfig } from './config.mjs';
import { requireDemo, safeFailure } from './contracts.mjs';
import { verifySourceContract, writeSourceContract } from './discover.mjs';
import { runStories } from './runner.mjs';
import { stories } from './scenarios/index.mjs';

try {
  const { positionals, values } = parseArgs({
    allowPositionals: true,
    options: { only: { type: 'string' }, config: { type: 'string' }, resume: { type: 'string' }, list: { type: 'boolean' } },
  });
  const command = positionals[0];
  if (command === 'discover') {
    const contract = writeSourceContract();
    console.log(JSON.stringify({ status: 'discovered', files: contract.files.length, output: 'source-contracts.json' }));
  } else if (command === 'check') {
    verifySourceContract();
    await import('./inspect.mjs');
  } else if (command === 'record') {
    if (values.list) {
      console.log(JSON.stringify(stories.map(({ id, title, requires }) => ({ id, title, requires }))));
    } else {
      const selected = values.only?.split(',').map(value => value.trim()) ?? stories.map(story => story.id);
      requireDemo(selected.every(id => stories.some(story => story.id === id)), 'UNKNOWN_STORY', 'One of the selected recording IDs is unknown. Use record --list.');
      const result = await runStories(loadConfig(values.config), stories.filter(story => selected.includes(story.id)), { resume: values.resume });
      if (result.status !== 'complete') process.exitCode = 1;
    }
  } else {
    console.log('Commands: discover | check | record [--only id,id] [--resume output/run/manifest.json] [--list]');
    process.exitCode = 1;
  }
} catch (error) {
  console.error(JSON.stringify(safeFailure(error)));
  process.exitCode = 1;
}
