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

// Reverse map: lowercase country name -> ISO code (built from COUNTRY_NAME_MAP)
const NAME_TO_CODE: Record<string, string> = Object.entries(COUNTRY_NAME_MAP).reduce(
  (acc, [code, name]) => {
    acc[name.toLowerCase()] = code;
    return acc;
  },
  {} as Record<string, string>
);

// Additional common name aliases not covered by the primary map
const NAME_ALIASES: Record<string, string> = {
  'russia': 'RU',
  'russian federation': 'RU',
  'south korea': 'KR',
  'korea': 'KR',
  'usa': 'US',
  'united states of america': 'US',
  'uk': 'GB',
  'britain': 'GB',
  'great britain': 'GB',
  'czechia': 'CZ',
  'czech republic': 'CZ',
  'viet nam': 'VN',
  'vietnam': 'VN',
  'uae': 'AE',
  'emirates': 'AE',
  'singapore': 'SG',
  'indonesia': 'ID',
  'peru': 'PE',
  'mexico': 'MX',
  'egypt': 'EG',
  'chile': 'CL',
  'argentina': 'AR',
  'india': 'IN',
  'china': 'CN',
  'taiwan': 'TW',
  'hong kong': 'HK',
  'thailand': 'TH',
  'malaysia': 'MY',
  'philippines': 'PH',
  'ukraine': 'UA',
  'turkey': 'TR',
  'romania': 'RO',
  'poland': 'PL',
  'sweden': 'SE',
  'norway': 'NO',
  'finland': 'FI',
  'denmark': 'DK',
  'netherlands': 'NL',
  'belgium': 'BE',
  'austria': 'AT',
  'switzerland': 'CH',
  'portugal': 'PT',
  'spain': 'ES',
  'italy': 'IT',
  'france': 'FR',
  'germany': 'DE',
  'japan': 'JP',
  'brazil': 'BR',
  'australia': 'AU',
  'canada': 'CA',
  'israel': 'IL',
  'south africa': 'ZA',
  'new zealand': 'NZ',
  'ireland': 'IE',
  'greece': 'GR',
  'bulgaria': 'BG',
  'slovakia': 'SK',
  'croatia': 'HR',
  'serbia': 'RS',
  'hungary': 'HU',
  'colombia': 'CO',
  'saudi arabia': 'SA',
};

/**
 * Resolves a country name string (e.g. "Singapore", "Indonesia") to a CountryInfo object.
 * Falls back to Unknown if the name cannot be matched.
 */
export const lookupCountryByName = (countryName: string): CountryInfo => {
  if (!countryName) return { name: 'Unknown', flag: '🌐', code: 'ZZ' };

  const key = countryName.trim().toLowerCase();

  // Try exact match in reverse name map first
  const code =
    NAME_TO_CODE[key] ||
    NAME_ALIASES[key] ||
    // Try partial match as last resort
    Object.keys(NAME_TO_CODE).find(n => n.startsWith(key)) && NAME_TO_CODE[Object.keys(NAME_TO_CODE).find(n => n.startsWith(key))!] ||
    Object.keys(NAME_ALIASES).find(n => n.startsWith(key)) && NAME_ALIASES[Object.keys(NAME_ALIASES).find(n => n.startsWith(key))!] ||
    null;

  if (!code) {
    // Return the hint name as-is with an unknown flag so it's still visible
    return { name: countryName.trim(), flag: '🌐', code: 'ZZ' };
  }

  return {
    name: COUNTRY_NAME_MAP[code] || countryName.trim(),
    flag: getFlagEmoji(code),
    code
  };
};
