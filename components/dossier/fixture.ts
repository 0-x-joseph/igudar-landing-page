/**
 * Demo fixture for the "property dossier" preview. Nothing here is a real property or a market statistic:
 * the district yield and the suitability score are example values, labelled "Example · demo data" wherever
 * they show. Their names (the property, its city and the example profile) are copy and live in
 * `messages/<locale>/sections.json` under `dossier.demo`. Every other figure in the dossier (gross yield,
 * net yield, IRR, deposit rate) comes from lib/finance.
 */
export const DEMO_PROPERTY = {
  /** Demo district median, as a gross rent yield (fraction). */
  districtGrossYield: 0.071,
  /** How well the property fits the demo investor profile, in meter segments. */
  suitability: { filled: 4, of: 5 },
} as const;
