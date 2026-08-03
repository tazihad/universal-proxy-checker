import { RawProxy } from '../types';

export const isIP = (str: string): boolean =>
  /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test(str);

export const isUrlLink = (str: string): boolean => {
  const trimmed = str.trim();
  if (!/^https?:\/\//i.test(trimmed)) return false;
  // If it's a single proxy with protocol e.g. http://1.2.3.4:8080 or http://user:pass@1.2.3.4:8080, it's a proxy not a list URL
  if (/^https?:\/\/(?:[^:@\s]+:[^:@\s]+@)?(?:\d{1,3}\.){3}\d{1,3}:\d{1,5}\/?$/i.test(trimmed)) {
    return false;
  }
  return true;
};

export const parseSingleProxy = (inputStr: string): RawProxy | null => {
  try {
    const trimmed = inputStr.trim();
    if (!trimmed) return null;

    // Pattern 1: user:pass@host:port or host:port
    const authHostMatch = /^(?:([^:@\s]+):([^:@\s]+)@)?([a-zA-Z0-9.-]+):(\d{1,5})$/.exec(trimmed);
    if (authHostMatch) {
      const user = authHostMatch[1];
      const pass = authHostMatch[2];
      const host = authHostMatch[3];
      const port = Number(authHostMatch[4]);

      if (port >= 1 && port <= 65535) {
        return {
          host,
          port,
          auth: user && pass ? `${user}:${pass}` : 'none',
          type: isIP(host) ? 'v4' : 'url'
        };
      }
    }

    // Pattern 2: host:port:user:pass
    const hostPortAuthMatch = /^([a-zA-Z0-9.-]+):(\d{1,5}):([^:@\s]+):([^:@\s]+)$/.exec(trimmed);
    if (hostPortAuthMatch) {
      const host = hostPortAuthMatch[1];
      const port = Number(hostPortAuthMatch[2]);
      const user = hostPortAuthMatch[3];
      const pass = hostPortAuthMatch[4];

      if (port >= 1 && port <= 65535) {
        return {
          host,
          port,
          auth: `${user}:${pass}`,
          type: isIP(host) ? 'v4' : 'url'
        };
      }
    }

    // Pattern 3: protocol://[user:pass@]host:port
    const urlMatch = /^(?:https?|socks[45]):\/\/(?:([^:@\s]+):([^:@\s]+)@)?([a-zA-Z0-9.-]+):(\d{1,5})/i.exec(trimmed);
    if (urlMatch) {
      const user = urlMatch[1];
      const pass = urlMatch[2];
      const host = urlMatch[3];
      const port = Number(urlMatch[4]);

      if (port >= 1 && port <= 65535) {
        return {
          host,
          port,
          auth: user && pass ? `${user}:${pass}` : 'none',
          type: isIP(host) ? 'v4' : 'url'
        };
      }
    }

    return null;
  } catch {
    return null;
  }
};

export interface ParseResult {
  list: RawProxy[];
  errors: string[];
  total: number;
  unique: number;
  fetchedUrlsCount?: number;
}

export const parseProxyList = (rawText: string): ParseResult => {
  const lines = rawText.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0);
  const total = lines.length;

  const uniqueLinesSet = new Set<string>();
  lines.forEach(l => uniqueLinesSet.add(l));

  const successedMap = new Map<string, RawProxy>();
  const failed: string[] = [];

  for (const line of uniqueLinesSet) {
    const parsed = parseSingleProxy(line);
    if (parsed) {
      const key = `${parsed.auth}@${parsed.host}:${parsed.port}`;
      if (!successedMap.has(key)) {
        successedMap.set(key, parsed);
      }
    } else {
      failed.push(line);
    }
  }

  return {
    list: Array.from(successedMap.values()),
    errors: failed,
    total,
    unique: uniqueLinesSet.size
  };
};

// Async parser that also fetches links containing proxy lists
export const parseProxyListAsync = async (rawText: string): Promise<ParseResult> => {
  const lines = rawText.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0);

  let accumulatedText = '';
  let fetchedUrlsCount = 0;

  for (const line of lines) {
    if (isUrlLink(line)) {
      try {
        fetchedUrlsCount++;
        const res = await fetch(line);
        if (res.ok) {
          const fetchedText = await res.text();
          accumulatedText += '\n' + fetchedText;
        }
      } catch {
        // Failed URL fetch
      }
    } else {
      accumulatedText += '\n' + line;
    }
  }

  const parseRes = parseProxyList(accumulatedText);
  return {
    ...parseRes,
    fetchedUrlsCount
  };
};

export const shuffleArray = <T>(array: T[]): T[] => {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
};
