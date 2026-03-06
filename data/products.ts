import { StoreProduct } from "@/lib/types";

const ingredientSeeds = [
  "닭가슴살",
  "두부",
  "브로콜리",
  "현미",
  "양배추",
  "계란",
  "연어",
  "시금치",
  "토마토",
  "양파",
  "마늘",
  "당근",
  "감자",
  "버섯",
  "파프리카",
  "귀리",
  "우유",
  "요거트",
  "바나나",
  "사과",
] as const;

const oasisBasePrices: Record<(typeof ingredientSeeds)[number], number> = {
  닭가슴살: 8900,
  두부: 3200,
  브로콜리: 2900,
  현미: 6800,
  양배추: 3400,
  계란: 6900,
  연어: 12900,
  시금치: 2500,
  토마토: 4800,
  양파: 3900,
  마늘: 3500,
  당근: 2800,
  감자: 3600,
  버섯: 4300,
  파프리카: 5200,
  귀리: 6100,
  우유: 3100,
  요거트: 5400,
  바나나: 4300,
  사과: 5800,
};

const coupangBasePrices: Record<(typeof ingredientSeeds)[number], number> = {
  닭가슴살: 8200,
  두부: 2800,
  브로콜리: 2600,
  현미: 6100,
  양배추: 3000,
  계란: 6200,
  연어: 11800,
  시금치: 2200,
  토마토: 4400,
  양파: 3300,
  마늘: 2900,
  당근: 2400,
  감자: 3200,
  버섯: 3900,
  파프리카: 4700,
  귀리: 5500,
  우유: 2800,
  요거트: 4900,
  바나나: 3900,
  사과: 5200,
};

const oasisHome = "https://www.oasis.co.kr";
const coupangHome = "https://www.coupang.com";

function makeStoreProducts(store: "oasis" | "coupang"): StoreProduct[] {
  return ingredientSeeds.flatMap((ingredientName, index) => {
    const basePrice = store === "oasis" ? oasisBasePrices[ingredientName] : coupangBasePrices[ingredientName];
    const searchUrl =
      store === "oasis"
        ? `${oasisHome}/search?query=${encodeURIComponent(ingredientName)}`
        : `${coupangHome}/np/search?q=${encodeURIComponent(ingredientName)}`;

    return [
      {
        id: `${store}-${index}-a`,
        store,
        ingredientName,
        title: `${ingredientName} 기본형`,
        imagePath: `/assets/products/product-${(index % 12) + 1}.svg`,
        unitText: "1팩",
        price: basePrice,
        url: searchUrl,
      },
      {
        id: `${store}-${index}-b`,
        store,
        ingredientName,
        title: `${ingredientName} 대용량`,
        imagePath: `/assets/products/product-${((index + 4) % 12) + 1}.svg`,
        unitText: "2팩",
        price: Math.round(basePrice * 1.7),
        url: searchUrl,
      },
    ];
  });
}

const oasisProducts = makeStoreProducts("oasis");
const coupangProducts = makeStoreProducts("coupang");

export const products: StoreProduct[] = [...oasisProducts, ...coupangProducts];

export const productsByStore = {
  oasis: oasisProducts,
  coupang: coupangProducts,
};

export const ingredientNames = ingredientSeeds;
