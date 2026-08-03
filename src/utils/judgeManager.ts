import { JudgeItem } from '../types';

export const DEFAULT_JUDGES: JudgeItem[] = [
  {
    id: '1',
    url: 'http://azenv.net/',
    title: 'azenv.net',
    validate: '',
    working: true,
    timeout: 120,
    checking: false
  },
  {
    id: '2',
    url: 'https://httpbin.org/get',
    title: 'httpbin SSL',
    validate: 'origin',
    working: true,
    timeout: 180,
    checking: false
  },
  {
    id: '3',
    url: 'http://httpbin.org/get',
    title: 'httpbin HTTP',
    validate: 'origin',
    working: true,
    timeout: 160,
    checking: false
  },
  {
    id: '4',
    url: 'https://api.ipify.org?format=json',
    title: 'ipify SSL',
    validate: 'ip',
    working: true,
    timeout: 90,
    checking: false
  }
];

export class JudgeManager {
  private judges: JudgeItem[];
  private swap: boolean;
  private currentUsualIndex = 0;
  private currentSSLIndex = 0;

  constructor(judges: JudgeItem[] = DEFAULT_JUDGES, swap = true) {
    this.judges = judges;
    this.swap = swap;
  }

  public getUsual(): string {
    const usual = this.judges.filter(j => !j.url.startsWith('https://') && j.working !== false);
    if (usual.length === 0) return 'http://httpbin.org/get';
    if (!this.swap || usual.length === 1) return usual[0].url;

    const judge = usual[this.currentUsualIndex % usual.length];
    this.currentUsualIndex++;
    return judge.url;
  }

  public getSSL(): string {
    const ssl = this.judges.filter(j => j.url.startsWith('https://') && j.working !== false);
    if (ssl.length === 0) return 'https://httpbin.org/get';
    if (!this.swap || ssl.length === 1) return ssl[0].url;

    const judge = ssl[this.currentSSLIndex % ssl.length];
    this.currentSSLIndex++;
    return judge.url;
  }

  public getAny(): string {
    const alive = this.judges.filter(j => j.working !== false);
    if (alive.length === 0) return 'https://httpbin.org/get';
    return alive[Math.floor(Math.random() * alive.length)].url;
  }

  public validateResponse(body: string, judgeUrl: string): boolean {
    const judge = this.judges.find(j => j.url === judgeUrl);
    if (!judge || !judge.validate) return true;
    try {
      return new RegExp(judge.validate, 'i').test(body);
    } catch {
      return true;
    }
  }

  public async pingJudge(judge: JudgeItem): Promise<{ working: boolean; timeout: number }> {
    const start = performance.now();
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 6000);
      const res = await fetch(judge.url, { signal: controller.signal, cache: 'no-store' });
      clearTimeout(timer);
      const elapsed = Math.round(performance.now() - start);
      return { working: res.ok, timeout: elapsed };
    } catch {
      return { working: false, timeout: 0 };
    }
  }
}
