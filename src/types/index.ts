export type Protocol = 'http' | 'https' | 'socks4' | 'socks5';
export type AnonymityLevel = 'elite' | 'anonymous' | 'transparent';

export interface RawProxy {
  host: string;
  port: number;
  auth: string; // 'none' or 'user:pass'
  type: string;
}

export interface ProxyInspectionData {
  protocol: Protocol;
  timings?: number;
  anon: AnonymityLevel;
  judge: string;
  response?: {
    body?: string;
    headers?: Record<string, string>;
  };
}

export interface ProxyResultItem {
  id: string; // unique identifier host:port
  host: string;
  port: number;
  auth: string;
  type: string;
  protocols: Protocol[];
  anon: AnonymityLevel;
  ip: string | null;
  timeout: number;
  country: {
    name: string;
    flag: string;
    code: string;
    city?: string;
  };
  server: string | null;
  keepAlive: boolean;
  blacklists: string[] | false;
  fullData?: ProxyInspectionData[];
}

export interface JudgeItem {
  id: string;
  url: string;
  title?: string;
  validate?: string;
  working?: boolean;
  timeout?: number;
  checking?: boolean;
}

export interface BlacklistItem {
  id: string;
  title: string;
  path: string; // URL or content pattern
  addresses?: string[];
  active: boolean;
  count?: number;
}

export interface CoreOptions {
  protocols: Record<Protocol, boolean>;
  captureFullData: boolean;
  captureServer: boolean;
  keepAlive: boolean;
  threads: number;
  retries: number;
  timeout: number;
  shuffle: boolean;
}

export interface ResultsFilterState {
  search: string;
  anons: Record<AnonymityLevel, boolean>;
  protocols: Record<Protocol, boolean>;
  misc: {
    onlyKeepAlive: boolean;
  };
  blacklists: Record<string, boolean>;
  ports: {
    input: string;
    allow: boolean; // true = allow listed ports, false = disallow
  };
  maxTimeout: number;
  selectedCountries: string[]; // empty means all selected
  sorting: {
    key: 'host' | 'port' | 'anon' | 'timeout' | 'country' | 'server' | 'protocols';
    dir: 'asc' | 'desc';
  };
}

export interface ExportOptions {
  protocolFormat: 1 | 2; // 1: Host:Port, 2: Protocol://Host:Port
  authFormat: 1 | 2;     // 1: User:Pass@Host:Port, 2: Host:Port:User:Pass
}

export interface CheckingStats {
  all: number;
  done: number;
  speed: number;
  elapsed: number;
  protocols: Record<Protocol, number>;
}
