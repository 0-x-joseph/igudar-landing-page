/**
 * Demo fixture for the "property dossier" preview. Nothing here is a real property or a market statistic:
 * the district yield and the profile are example values, labelled "Example · demo data" wherever they show.
 * Every other figure in the dossier (gross yield, net yield, IRR, deposit rate) comes from lib/finance.
 */
export const DEMO_PROPERTY = {
  name: "Rented apartment building",
  where: "Example city · example district",
  /** Demo district median, as a gross rent yield (fraction). */
  districtGrossYield: 0.071,
  /** Demo investor profile and how well the property fits it, in meter segments. */
  profile: "Example profile: balanced, five-year horizon",
  suitability: { filled: 4, of: 5 },
} as const;
