/**
 * Canonical list of Kenyan counties. Stored verbatim in `profiles.location`
 * and `suppliers.county` so filtering never depends on fuzzy matching.
 */

export type County = { name: string; capital: string };

export const COUNTIES: County[] = [
  { name: 'Baringo', capital: 'Kabarnet' },
  { name: 'Bomet', capital: 'Bomet' },
  { name: 'Bungoma', capital: 'Bungoma' },
  { name: 'Busia', capital: 'Busia' },
  { name: 'Elgeyo-Marakwet', capital: 'Iten' },
  { name: 'Embu', capital: 'Embu' },
  { name: 'Garissa', capital: 'Garissa' },
  { name: 'Homa Bay', capital: 'Homa Bay' },
  { name: 'Isiolo', capital: 'Isiolo' },
  { name: 'Kajiado', capital: 'Kajiado' },
  { name: 'Kakamega', capital: 'Kakamega' },
  { name: 'Kericho', capital: 'Kericho' },
  { name: 'Kiambu', capital: 'Kiambu' },
  { name: 'Kilifi', capital: 'Kilifi' },
  { name: 'Kirinyaga', capital: 'Kerugoya' },
  { name: 'Kisii', capital: 'Kisii' },
  { name: 'Kisumu', capital: 'Kisumu' },
  { name: 'Kitui', capital: 'Kitui' },
  { name: 'Kwale', capital: 'Kwale' },
  { name: 'Laikipia', capital: 'Nanyuki' },
  { name: 'Lamu', capital: 'Lamu' },
  { name: 'Machakos', capital: 'Machakos' },
  { name: 'Makueni', capital: 'Wote' },
  { name: 'Mandera', capital: 'Mandera' },
  { name: 'Marsabit', capital: 'Marsabit' },
  { name: 'Meru', capital: 'Meru' },
  { name: 'Migori', capital: 'Migori' },
  { name: 'Mombasa', capital: 'Mombasa' },
  { name: 'Murang\u2019a', capital: 'Murang\u2019a' },
  { name: 'Nairobi', capital: 'Nairobi' },
  { name: 'Nakuru', capital: 'Nakuru' },
  { name: 'Nandi', capital: 'Kapsabet' },
  { name: 'Narok', capital: 'Narok' },
  { name: 'Nyamira', capital: 'Nyamira' },
  { name: 'Nyandarua', capital: 'Ol Kalou' },
  { name: 'Nyeri', capital: 'Nyeri' },
  { name: 'Samburu', capital: 'Maralal' },
  { name: 'Siaya', capital: 'Siaya' },
  { name: 'Taita-Taveta', capital: 'Wundanyi' },
  { name: 'Tana River', capital: 'Hola' },
  { name: 'Tharaka-Nithi', capital: 'Kathwana' },
  { name: 'Trans Nzoia', capital: 'Kitale' },
  { name: 'Turkana', capital: 'Lodwar' },
  { name: 'Uasin Gishu', capital: 'Eldoret' },
  { name: 'Vihiga', capital: 'Vihiga' },
  { name: 'Wajir', capital: 'Wajir' },
  { name: 'West Pokot', capital: 'Kapenguria' },
];

/**
 * A handful of high-traffic trading wards used by the location picker on top
 * of the county list. Free text is still accepted for users whose ward is not
 * listed, so this is a convenience, not a constraint.
 */
export const POPULAR_WARDS: { ward: string; county: string }[] = [
  { ward: 'Kayole', county: 'Nairobi' },
  { ward: 'Kibera', county: 'Nairobi' },
  { ward: 'Eastleigh', county: 'Nairobi' },
  { ward: 'Kamkunji', county: 'Nairobi' },
  { ward: 'Westlands', county: 'Nairobi' },
  { ward: 'Thika Town', county: 'Kiambu' },
  { ward: 'Ruiru', county: 'Kiambu' },
  { ward: 'Nakuru Town', county: 'Nakuru' },
  { ward: 'Mombasa Island', county: 'Mombasa' },
];

export const COUNTY_NAMES: string[] = COUNTIES.map((c) => c.name);

/** Short display label for a stored `location` value. */
export function locationLabel(location: string | null | undefined): string {
  if (!location) return 'Kenya';
  const first = location.split(',')[0]?.trim();
  return first && first.length > 0 ? first : 'Kenya';
}

/** Canonical county for a free-form location string, if we recognise one. */
export function countyFromLocation(location: string | null | undefined): string | null {
  if (!location) return null;
  const haystack = location.toLowerCase();
  const match = COUNTIES.find((c) => haystack.includes(c.name.toLowerCase()));
  return match ? match.name : null;
}