import { BlacklistItem } from '../types';

export const DEFAULT_BLACKLISTS: BlacklistItem[] = [
  {
    id: '1',
    title: 'Spamhaus DROP List',
    path: 'https://www.spamhaus.org/drop/drop.txt',
    active: true,
    count: 0
  },
  {
    id: '2',
    title: 'Tor Exit Nodes',
    path: 'https://check.torproject.org/exit-addresses',
    active: true,
    count: 0
  }
];

export class BlacklistManager {
  private lists: Map<string, Set<string>> = new Map();
  private enabled: boolean;

  constructor(enabled = true) {
    this.enabled = enabled;
  }

  public setEnabled(enabled: boolean) {
    this.enabled = enabled;
  }

  public isEnabled(): boolean {
    return this.enabled;
  }

  public addList(title: string, ipList: string[]) {
    const set = new Set(ipList.map(ip => ip.trim()));
    this.lists.set(title, set);
  }

  public removeList(title: string) {
    this.lists.delete(title);
  }

  public check(host: string): string[] | false {
    if (!this.enabled || this.lists.size === 0) return false;

    const matchedLists: string[] = [];

    for (const [title, set] of this.lists.entries()) {
      if (set.has(host)) {
        matchedLists.push(title);
      }
    }

    return matchedLists.length > 0 ? matchedLists : false;
  }
}
