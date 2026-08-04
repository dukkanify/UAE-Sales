import type { CategoryFieldOption } from "@/types";

function toOptions(brands: readonly string[]): CategoryFieldOption[] {
  return brands.map((brand) => ({ label: brand, value: brand }));
}

/** Popular car brands in the UAE market — searchable by first letters. */
export const CAR_BRANDS = [
  "Toyota",
  "Nissan",
  "Honda",
  "Lexus",
  "Mercedes-Benz",
  "BMW",
  "Audi",
  "Porsche",
  "Land Rover",
  "Range Rover",
  "Jeep",
  "Ford",
  "Chevrolet",
  "GMC",
  "Hyundai",
  "Kia",
  "Mazda",
  "Mitsubishi",
  "Volkswagen",
  "Volvo",
  "Tesla",
  "Infiniti",
  "Cadillac",
  "Genesis",
  "Suzuki",
  "Subaru",
  "Peugeot",
  "Renault",
  "Dodge",
  "Chrysler",
  "Jaguar",
  "MINI",
  "Bentley",
  "Rolls-Royce",
  "Ferrari",
  "Lamborghini",
  "Maserati",
  "McLaren",
  "Aston Martin",
  "Geely",
  "Changan",
  "MG",
  "Haval",
  "BYD",
  "Jetour",
  "Isuzu",
  "Skoda",
  "Seat",
  "Cupra",
  "Fiat",
  "Alfa Romeo",
  "Hummer",
] as const;

/** Phone / tablet brands. */
export const MOBILE_BRANDS = [
  "Apple",
  "Samsung",
  "Huawei",
  "Xiaomi",
  "OPPO",
  "vivo",
  "realme",
  "OnePlus",
  "Google",
  "Honor",
  "Nokia",
  "Sony",
  "Nothing",
  "Motorola",
  "Infinix",
  "Tecno",
  "iTel",
  "Asus",
  "Lenovo",
  "HTC",
] as const;

/** Consumer electronics brands (laptops, TVs, audio, cameras, gaming). */
export const ELECTRONICS_BRANDS = [
  "Apple",
  "Samsung",
  "Sony",
  "LG",
  "Dell",
  "HP",
  "Lenovo",
  "Asus",
  "Acer",
  "Microsoft",
  "Huawei",
  "Xiaomi",
  "Bose",
  "JBL",
  "Canon",
  "Nikon",
  "GoPro",
  "DJI",
  "Nintendo",
  "PlayStation",
  "Xbox",
  "Dyson",
  "Philips",
  "Panasonic",
  "Toshiba",
  "Hisense",
  "TCL",
  "Beats",
  "Anker",
  "Logitech",
  "Razer",
  "MSI",
  "Alienware",
  "Garmin",
  "Fitbit",
] as const;

/** Fashion / watches / bags — for future dynamic fashion fields. */
export const FASHION_BRANDS = [
  "Rolex",
  "Omega",
  "Cartier",
  "Tag Heuer",
  "Patek Philippe",
  "Audemars Piguet",
  "Louis Vuitton",
  "Gucci",
  "Chanel",
  "Hermès",
  "Prada",
  "Dior",
  "Nike",
  "Adidas",
  "Zara",
  "H&M",
  "Uniqlo",
] as const;

export const carBrandOptions = toOptions(CAR_BRANDS);
export const mobileBrandOptions = toOptions(MOBILE_BRANDS);
export const electronicsBrandOptions = toOptions(ELECTRONICS_BRANDS);
export const fashionBrandOptions = toOptions(FASHION_BRANDS);

export function getBrandOptionsForCategory(
  categoryId: string,
): CategoryFieldOption[] {
  switch (categoryId) {
    case "cars":
      return carBrandOptions;
    case "mobiles":
      return mobileBrandOptions;
    case "electronics":
      return electronicsBrandOptions;
    case "fashion":
      return fashionBrandOptions;
    default:
      return [];
  }
}

/** Match brands by Latin/Arabic prefix or substring (case-insensitive). */
export function filterBrandOptions(
  options: CategoryFieldOption[],
  query: string,
): CategoryFieldOption[] {
  const q = query.trim().toLowerCase();
  if (!q) return options;

  const starts: CategoryFieldOption[] = [];
  const contains: CategoryFieldOption[] = [];

  for (const option of options) {
    const label = option.label.toLowerCase();
    const value = option.value.toLowerCase();
    if (label.startsWith(q) || value.startsWith(q)) {
      starts.push(option);
    } else if (label.includes(q) || value.includes(q)) {
      contains.push(option);
    }
  }

  return [...starts, ...contains];
}
