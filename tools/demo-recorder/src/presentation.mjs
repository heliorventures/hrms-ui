import { performance } from 'node:perf_hooks';

import { requireDemo } from './contracts.mjs';

function browserOverlay() {
  window.__demoShow = ({ title, caption, rect, step, preview, sample, simulatedGps }) => {
    let root = document.getElementById('__demo-recorder');
    if (!root) {
      root = document.createElement('div');
      root.id = '__demo-recorder';
      root.style.cssText = 'position:fixed;inset:0;z-index:2147483647;pointer-events:none;font-family:Inter,Segoe UI,sans-serif;';
      const header = document.createElement('div');
      header.dataset.part = 'header';
      header.style.cssText = 'position:absolute;top:18px;left:50%;transform:translateX(-50%);padding:14px 24px;border:1px solid #ffffff40;border-radius:16px;background:#0f172aee;color:white;box-shadow:0 10px 30px #0003;display:flex;gap:22px;align-items:center;max-width:80%;';
      const badge = document.createElement('span');
      badge.dataset.part = 'badge';
      badge.style.cssText = 'color:#67e8f9;letter-spacing:1.5px;font-size:13px;font-weight:700;white-space:nowrap;';
      const heading = document.createElement('span');
      heading.dataset.part = 'title';
      heading.style.cssText = 'font-size:20px;font-weight:600;white-space:nowrap;';
      header.append(badge, heading);
      const focus = document.createElement('div');
      focus.dataset.part = 'focus';
      focus.style.cssText = 'position:absolute;border:3px solid #22d3ee;border-radius:10px;box-shadow:0 0 0 6px #22d3ee30,0 0 0 9999px #02061733;transition:all 180ms ease;';
      const subtitle = document.createElement('div');
      subtitle.dataset.part = 'caption';
      subtitle.style.cssText = 'position:absolute;bottom:30px;left:50%;transform:translateX(-50%);max-width:80%;min-width:500px;box-sizing:border-box;padding:20px 30px;border-radius:16px;color:white;background:#0f172af5;text-align:center;font-size:25px;line-height:1.4;box-shadow:0 8px 35px #0004;';
      const pointer = document.createElement('div');
      pointer.dataset.part = 'pointer';
      pointer.style.cssText = 'position:absolute;width:20px;height:20px;border-radius:50%;border:3px solid white;background:#22d3ee;box-shadow:0 2px 10px #0007;';
      const marker = document.createElement('div');
      marker.style.cssText = 'position:absolute;right:0;bottom:0;width:16px;height:16px;background:#00ff00;';
      root.append(focus, header, subtitle, pointer, marker);
      document.body.append(root);
    }
    root.querySelector('[data-part=badge]').textContent = preview ? 'RECORDER PREVIEW' : sample ? 'SAMPLE PAYROLL DATA' : simulatedGps ? 'DEMO · SIMULATED GPS' : 'HRMS DEMO';
    root.querySelector('[data-part=title]').textContent = `${String(step).padStart(2, '0')}  ${title}`;
    root.querySelector('[data-part=caption]').textContent = caption;
    const focus = root.querySelector('[data-part=focus]');
    const pointer = root.querySelector('[data-part=pointer]');
    focus.style.display = rect ? 'block' : 'none';
    pointer.style.display = rect ? 'block' : 'none';
    if (rect) {
      Object.assign(focus.style, { left: `${rect.x - 6}px`, top: `${rect.y - 6}px`, width: `${rect.width + 12}px`, height: `${rect.height + 12}px` });
      const left = rect.x + Math.min(rect.width - 8, rect.width * 0.7);
      const top = rect.y + Math.min(rect.height - 8, rect.height * 0.7);
      pointer.animate([{ transform: 'scale(1.4)' }, { transform: 'scale(1)' }], { duration: 350 });
      pointer.style.left = `${left}px`;
      pointer.style.top = `${top}px`;
    }
  };
  window.__demoHide = () => document.getElementById('__demo-recorder')?.remove();
}

export async function installPresentation(context) {
  await context.addInitScript(browserOverlay);
}

export class Presenter {
  constructor(page, config, title, startedAt, preview = false) {
    Object.assign(this, { page, config, title, startedAt, preview, scenes: [] });
  }

  elapsed() { return (performance.now() - this.startedAt) / 1000; }

  async show(caption, locator, action) {
    let rect = null;
    if (locator) {
      await locator.waitFor({ state: 'visible' });
      requireDemo(await locator.count() === 1, 'AMBIGUOUS_FIELD', 'The recording target is not unique. Review its source contract.');
      await locator.scrollIntoViewIfNeeded();
      rect = await locator.boundingBox();
      requireDemo(rect, 'FIELD_NOT_VISIBLE', 'The recording field has no visible bounds.');
    }
    const start = this.elapsed();
    await this.page.evaluate(args => window.__demoShow(args), {
      title: this.title, caption, rect, step: this.scenes.length + 1, preview: this.preview, sample: this.sample === true, simulatedGps: this.simulatedGps === true,
    });
    await this.page.waitForTimeout(Math.min(this.config.paceMs, 700));
    if (action) await action();
    await this.page.waitForTimeout(this.config.paceMs);
    const end = this.elapsed();
    this.scenes.push({ start, end, caption });
    await this.page.evaluate(() => window.__demoHide());
    // Separate scene markers by several encoded frames, even for adjacent fields.
    await this.page.waitForTimeout(200);
  }

  fill(locator, value, caption, secret = false) {
    return this.show(caption, locator, async () => {
      if (secret || ['date', 'number', 'file'].includes(await locator.getAttribute('type'))) await locator.fill(value);
      else {
        await locator.fill('');
        await locator.pressSequentially(value, { delay: 24 });
      }
    });
  }

  select(locator, label, caption) {
    return this.show(caption, locator, () => locator.selectOption({ label }));
  }

  click(locator, caption) {
    return this.show(caption, locator, () => locator.click());
  }
}
