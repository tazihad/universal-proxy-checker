import {
  RawProxy,
  ProxyResultItem,
  CoreOptions,
  Protocol,
  AnonymityLevel,
  CheckingStats,
  ProxyInspectionData
} from '../types';
import { JudgeManager } from './judgeManager';
import { BlacklistManager } from './blacklistManager';
import { lookupCountry, lookupCountryByName } from './countryLookup';

export interface CheckerCallbacks {
  onProgress: (stats: CheckingStats) => void;
  onProxyDone: (proxyResult: ProxyResultItem) => void;
  onComplete: (results: ProxyResultItem[]) => void;
}

export class CheckerEngine {
  private queue: RawProxy[] = [];
  private options: CoreOptions;
  private judgeManager: JudgeManager;
  private blacklistManager: BlacklistManager;
  private clientIp: string = '';
  private isStopped: boolean = false;
  private isRunning: boolean = false;

  private stats: CheckingStats = {
    all: 0,
    done: 0,
    speed: 0,
    elapsed: 0,
    protocols: { http: 0, https: 0, socks4: 0, socks5: 0 }
  };

  private results: Map<string, ProxyResultItem> = new Map();
  private startTime: number = 0;

  constructor(
    proxies: RawProxy[],
    options: CoreOptions,
    judgeManager: JudgeManager,
    blacklistManager: BlacklistManager,
    clientIp: string = ''
  ) {
    this.queue = options.shuffle ? [...proxies].sort(() => Math.random() - 0.5) : [...proxies];
    this.options = options;
    this.judgeManager = judgeManager;
    this.blacklistManager = blacklistManager;
    this.clientIp = clientIp;

    this.stats.all = this.queue.length;
  }

  public async start(callbacks: CheckerCallbacks): Promise<void> {
    if (this.isRunning) return;
    this.isRunning = true;
    this.isStopped = false;
    this.startTime = performance.now();

    // Determine target protocols
    const activeProtocols = (Object.keys(this.options.protocols) as Protocol[]).filter(
      p => this.options.protocols[p]
    );

    if (activeProtocols.length === 0) {
      callbacks.onComplete([]);
      this.isRunning = false;
      return;
    }

    const concurrency = Math.min(Math.max(1, this.options.threads), 500);
    let queueIndex = 0;

    const intervalTimer = setInterval(() => {
      if (this.isStopped) {
        clearInterval(intervalTimer);
        return;
      }
      const now = performance.now();
      const elapsedSec = Math.max(0.1, (now - this.startTime) / 1000);
      this.stats.elapsed = Math.round(elapsedSec);
      this.stats.speed = Math.round((this.stats.done / elapsedSec) * 10) / 10;
      callbacks.onProgress({ ...this.stats });
    }, 100);

    const worker = async () => {
      while (queueIndex < this.queue.length && !this.isStopped) {
        const raw = this.queue[queueIndex++];
        if (!raw) break;

        await this.checkProxy(raw, activeProtocols, callbacks);

        this.stats.done++;
      }
    };

    const workers: Promise<void>[] = [];
    for (let i = 0; i < concurrency; i++) {
      workers.push(worker());
    }

    await Promise.all(workers);
    clearInterval(intervalTimer);

    const finalResults = Array.from(this.results.values());
    callbacks.onComplete(finalResults);
    this.isRunning = false;
  }

  public stop(): void {
    this.isStopped = true;
  }

  private async checkProxy(
    raw: RawProxy,
    targetProtocols: Protocol[],
    callbacks: CheckerCallbacks
  ): Promise<void> {
    const proxyKey = `${raw.auth}@${raw.host}:${raw.port}`;
    const detectedProtocols: Protocol[] = [];
    const fullDataList: ProxyInspectionData[] = [];

    let minTimeout = Infinity;
    let detectedIp: string | null = null;
    let detectedAnon: AnonymityLevel = 'elite';
    let detectedServer: string | null = null;
    let isKeepAlive = false;

    for (const proto of targetProtocols) {
      if (this.isStopped) break;

      let attempts = 0;
      const maxAttempts = Math.max(1, this.options.retries + 1);
      let success = false;

      while (attempts < maxAttempts && !success && !this.isStopped) {
        attempts++;
        const judgeUrl = proto === 'http'
          ? this.judgeManager.getUsual()
          : proto === 'https'
          ? this.judgeManager.getSSL()
          : this.judgeManager.getAny();

        const startMs = performance.now();
        try {
          const controller = new AbortController();
          const timer = setTimeout(() => controller.abort(), this.options.timeout);

          // Standard Web API fetch simulate proxy check call
          const res = await fetch(judgeUrl, {
            signal: controller.signal,
            cache: 'no-store',
            headers: this.options.keepAlive ? { Connection: 'keep-alive' } : {}
          });
          clearTimeout(timer);

          const elapsed = Math.round(performance.now() - startMs);
          const body = await res.text();

          if (this.judgeManager.validateResponse(body, judgeUrl)) {
            success = true;
            detectedProtocols.push(proto);
            this.stats.protocols[proto]++;

            if (elapsed < minTimeout) {
              minTimeout = elapsed;
            }

            // Anonymity check
            const anon = this.calculateAnon(body);
            if (proto === 'http') {
              detectedAnon = anon;
            }

            // IP extraction
            const extractedIp = this.extractIp(body) || raw.host;
            detectedIp = extractedIp;

            // Server capture
            if (this.options.captureServer) {
              detectedServer = this.extractServer(body, res.headers);
            }

            // Keep alive check
            if (this.options.keepAlive) {
              const connHeader = res.headers.get('connection') || res.headers.get('keep-alive');
              if (connHeader && connHeader.toLowerCase().includes('keep-alive')) {
                isKeepAlive = true;
              }
            }

            // Inspection data
            if (this.options.captureFullData) {
              const headersObj: Record<string, string> = {};
              res.headers.forEach((val, key) => { headersObj[key] = val; });

              fullDataList.push({
                protocol: proto,
                timings: elapsed,
                anon,
                judge: judgeUrl,
                response: {
                  headers: headersObj,
                  body: body.slice(0, 1000)
                }
              });
            }
          }
        } catch {
          // Failed attempt
        }
      }
    }

    if (detectedProtocols.length > 0) {
      const countryInfo = raw.countryHint
        ? lookupCountryByName(raw.countryHint)
        : lookupCountry(detectedIp || raw.host);
      const blacklists = this.blacklistManager.check(raw.host);

      const resultItem: ProxyResultItem = {
        id: proxyKey,
        host: raw.host,
        port: raw.port,
        auth: raw.auth,
        type: raw.type,
        protocols: detectedProtocols,
        anon: detectedAnon,
        ip: detectedIp,
        timeout: minTimeout === Infinity ? 0 : minTimeout,
        country: countryInfo,
        server: detectedServer,
        keepAlive: isKeepAlive,
        blacklists,
        fullData: fullDataList.length > 0 ? fullDataList : undefined
      };

      this.results.set(proxyKey, resultItem);
      callbacks.onProxyDone(resultItem);
    }
  }

  private calculateAnon(body: string): AnonymityLevel {
    if (this.clientIp && body.includes(this.clientIp)) {
      return 'transparent';
    }
    if (/HTTP_VIA|PROXY_REMOTE_ADDR|X_FORWARDED_FOR/i.test(body)) {
      return 'anonymous';
    }
    return 'elite';
  }

  private extractIp(body: string): string | null {
    const ipMatch = /(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)/.exec(body);
    return ipMatch ? ipMatch[0] : null;
  }

  private extractServer(body: string, headers: Headers): string | null {
    const serverHeader = headers.get('server');
    if (serverHeader) return serverHeader.toLowerCase();

    if (/squid/i.test(body)) return 'squid';
    if (/mikrotik/i.test(body)) return 'mikrotik';
    if (/tinyproxy/i.test(body)) return 'tinyproxy';
    if (/litespeed/i.test(body)) return 'litespeed';
    if (/varnish/i.test(body)) return 'varnish';
    if (/haproxy/i.test(body)) return 'haproxy';
    return null;
  }
}
