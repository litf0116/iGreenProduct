export type CountryCode = 'TH' | 'ID' | 'BR' | 'MX';

export interface Country {
  code: CountryCode;
  nameEn: string;
  nameTh: string;
  name: string;
}

export const COUNTRIES: Country[] = [
  { code: 'TH', nameEn: 'Thailand', nameTh: 'ไทย', name: 'Thailand' },
  { code: 'ID', nameEn: 'Indonesia', nameTh: 'อินโดนีเซีย', name: 'Indonesia' },
  { code: 'BR', nameEn: 'Brazil', nameTh: 'บราซิล', name: 'Brazil' },
  { code: 'MX', nameEn: 'Mexico', nameTh: 'เม็กซิโก', name: 'Mexico' },
] as const;

export const COUNTRY_CODES = COUNTRIES.map((c) => c.code) as readonly CountryCode[];

export function getCountryByCode(code: string): Country | undefined {
  return COUNTRIES.find((c) => c.code === code);
}

export function getCountryByName(name: string): Country | undefined {
  const lowerName = name.toLowerCase();
  return COUNTRIES.find(
    (c) =>
      c.nameEn.toLowerCase() === lowerName ||
      c.nameTh.toLowerCase() === lowerName ||
      c.name.toLowerCase() === lowerName
  );
}

export function getCountryName(code: string, language: 'en' | 'th' = 'en'): string {
  const country = getCountryByCode(code);
  if (!country) return code;
  return language === 'th' ? country.nameTh : country.nameEn;
}

export function isValidCountryCode(code: string): code is CountryCode {
  return COUNTRY_CODES.includes(code as CountryCode);
}

export function isValidCountry(value: string): boolean {
  if (!value || value.trim() === '') return false;
  return COUNTRIES.some(
    (c) =>
      c.code === value.toUpperCase() ||
      c.nameEn.toLowerCase() === value.toLowerCase() ||
      c.nameTh.toLowerCase() === value.toLowerCase()
  );
}

export function splitCountries(countries: string): string[] {
  if (!countries || countries.trim() === '') return [];
  return countries.split(',').map((c) => c.trim()).filter((c) => c !== '');
}

export function parseCountries(countries: string): CountryCode[] {
  const codes = splitCountries(countries);
  return codes.filter(isValidCountryCode) as CountryCode[];
}

export function formatCountries(countries: CountryCode[], separator: string = ', '): string {
  return countries.map((c) => getCountryName(c)).join(separator);
}

export const COUNTRY_OPTIONS = COUNTRIES.map((country) => ({
  value: country.code,
  label: country.nameEn,
  labelTh: country.nameTh,
}));
