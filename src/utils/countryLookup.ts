export interface CountryInfo {
  name: string;
  flag: string;
  code: string;
  city?: string;
}

// Convert ISO 3166-1 alpha-2 code to Emoji Flag
export const getFlagEmoji = (countryCode: string): string => {
  if (!countryCode || countryCode === 'ZZ' || countryCode.length !== 2) return '🌐';
  const codePoints = countryCode
    .toUpperCase()
    .split('')
    .map(char => 127397 + char.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
};

const COUNTRY_NAME_MAP: Record<string, string> = {
  US: 'United States', GB: 'United Kingdom', CA: 'Canada', DE: 'Germany',
  FR: 'France', NL: 'Netherlands', RU: 'Russian Federation', CN: 'China',
  JP: 'Japan', KR: 'Korea, South', BR: 'Brazil', IN: 'India',
  AU: 'Australia', IT: 'Italy', ES: 'Spain', SG: 'Singapore',
  SE: 'Sweden', CH: 'Switzerland', PL: 'Poland', UA: 'Ukraine',
  TR: 'Turkey', RO: 'Romania', HK: 'Hong Kong', TW: 'Taiwan',
  ID: 'Indonesia', VN: 'Vietnam', TH: 'Thailand', MX: 'Mexico',
  AR: 'Argentina', ZA: 'South Africa', FI: 'Finland', NO: 'Norway',
  DK: 'Denmark', BE: 'Belgium', AT: 'Austria', CZ: 'Czech Republic',
  HU: 'Hungary', MY: 'Malaysia', PH: 'Philippines',
  IL: 'Israel', AE: 'United Arab Emirates', SA: 'Saudi Arabia', CL: 'Chile',
  CO: 'Colombia', NZ: 'New Zealand', IE: 'Ireland', PT: 'Portugal',
  GR: 'Greece', BG: 'Bulgaria', SK: 'Slovakia', LT: 'Lithuania',
  LV: 'Latvia', EE: 'Estonia', HR: 'Croatia', RS: 'Serbia',
  ZZ: 'Unknown'
};

export const lookupCountry = (ip: string | null): CountryInfo => {
  if (!ip) {
    return { name: 'Unknown', flag: '🌐', code: 'ZZ' };
  }

  // Fast offline prefix approximation + hash deterministic fallback for demo/testing
  const parts = ip.split('.').map(Number);
  let code = 'US';

  if (parts.length === 4) {
    const p1 = parts[0];
    if (p1 >= 1 && p1 <= 30) code = 'US';
    else if (p1 >= 31 && p1 <= 50) code = 'DE';
    else if (p1 >= 51 && p1 <= 70) code = 'GB';
    else if (p1 >= 71 && p1 <= 95) code = 'FR';
    else if (p1 >= 96 && p1 <= 115) code = 'NL';
    else if (p1 >= 116 && p1 <= 140) code = 'RU';
    else if (p1 >= 141 && p1 <= 165) code = 'CN';
    else if (p1 >= 166 && p1 <= 185) code = 'JP';
    else if (p1 >= 186 && p1 <= 200) code = 'BR';
    else if (p1 >= 201 && p1 <= 223) code = 'SG';
    else {
      const keys = Object.keys(COUNTRY_NAME_MAP);
      code = keys[(p1 + parts[1]) % keys.length] || 'US';
    }
  }

  const name = COUNTRY_NAME_MAP[code] || 'Unknown';
  const flag = getFlagEmoji(code);

  return { name, flag, code };
};
