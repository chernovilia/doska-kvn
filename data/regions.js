// Справочник регионов и городов.
// Регион = агломерация (обычно город + соседние). Один регион = один «маркетинговый» домен.
// City привязан к региону через regionId.
//
// launched: false — регион виден в дропдауне, но объявлений в нём пока нет (или мало).
// domain: маркетинговый домен региона, редиректит на основной /path (пока не куплен — null).

export const REGIONS = [
  {
    id: 'kvn',
    name: 'КВН — Кулебаки, Выкса, Навашино',
    shortName: 'КВН',
    hint: 'Агломерация',
    domain: 'доска-квн.рф',
    launched: true,
    // К каким соседним регионам показывать «дополнение» на карточной ленте.
    neighbors: ['murom', 'arzamas', 'pavlovo']
  },
  {
    id: 'murom',
    name: 'Муром',
    shortName: 'Муром',
    hint: 'Владимирская область',
    domain: 'доска-муром.рф',
    launched: false,
    neighbors: ['kvn']
  },
  {
    id: 'arzamas',
    name: 'Арзамас',
    shortName: 'Арзамас',
    hint: 'Нижегородская область',
    domain: 'доска-арзамас.рф',
    launched: false,
    neighbors: ['kvn', 'pavlovo']
  },
  {
    id: 'pavlovo',
    name: 'Павлово',
    shortName: 'Павлово',
    hint: 'Нижегородская область',
    domain: 'доска-павлово.рф',
    launched: false,
    neighbors: ['kvn', 'arzamas']
  },
  {
    id: 'sarov',
    name: 'Саров',
    shortName: 'Саров',
    hint: 'Нижегородская область',
    domain: 'доска-саров.рф',
    launched: false,
    neighbors: ['arzamas']
  }
];

export const CITIES = [
  // КВН
  { id: 'kulebaki', name: 'Кулебаки', regionId: 'kvn', population: 32000 },
  { id: 'vyksa', name: 'Выкса', regionId: 'kvn', population: 53000 },
  { id: 'navashino', name: 'Навашино', regionId: 'kvn', population: 15000 },
  // Одногородные регионы
  { id: 'murom', name: 'Муром', regionId: 'murom', population: 108000 },
  { id: 'arzamas', name: 'Арзамас', regionId: 'arzamas', population: 103000 },
  { id: 'pavlovo', name: 'Павлово', regionId: 'pavlovo', population: 55000 },
  { id: 'sarov', name: 'Саров', regionId: 'sarov', population: 95000 }
];

// «Место» — универсальный термин для URL-сегмента /[place]:
// это либо id региона (kvn), либо id города (vyksa).
export function resolvePlace(place) {
  if (!place) return null;
  const region = REGIONS.find((r) => r.id === place);
  if (region) {
    return {
      kind: 'region',
      id: region.id,
      region,
      cities: CITIES.filter((c) => c.regionId === region.id)
    };
  }
  const city = CITIES.find((c) => c.id === place);
  if (city) {
    return {
      kind: 'city',
      id: city.id,
      city,
      region: REGIONS.find((r) => r.id === city.regionId)
    };
  }
  return null;
}

// Дефолтный регион — то, что покажем на «/» и в шапке.
// Позже подставим по домену через middleware.
export const DEFAULT_REGION_ID = 'kvn';

export function getRegion(id) {
  return REGIONS.find((r) => r.id === id) || null;
}

export function getCity(id) {
  return CITIES.find((c) => c.id === id) || null;
}

export function getCitiesOfRegion(regionId) {
  return CITIES.filter((c) => c.regionId === regionId);
}

export function cityName(id) {
  return CITIES.find((c) => c.id === id)?.name || '';
}
