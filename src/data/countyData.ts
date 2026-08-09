export type Province = "Ulster" | "Leinster" | "Connacht" | "Munster";

export interface CountyDef {
  id: string;
  name: string;
  province: Province;
  pop: number;
  /** label placement x,y in the shared map coordinate space */
  x: number;
  y: number;
}

// [id, name, province, population rank 1-5, label x, label y]
export const RAW_COUNTIES: [string, string, Province, number, number, number][] = [
    ["DON","Donegal","Ulster",3,724,262],
    ["LDY","Derry","Ulster",3,1006,260],
    ["ANT","Antrim","Ulster",4,1155,292],
    ["TYR","Tyrone","Ulster",3,912,405],
    ["FER","Fermanagh","Ulster",2,846,545],
    ["DOW","Down","Ulster",4,1184,520],
    ["ARM","Armagh","Ulster",3,1064,533],
    ["MON","Monaghan","Ulster",2,968,577],
    ["CAV","Cavan","Ulster",2,916,683],
    ["LOU","Louth","Leinster",3,1096,721],

    ["SLI","Sligo","Connacht",2,608,613],
    ["LEI","Leitrim","Connacht",1,763,665],
    ["MAY","Mayo","Connacht",3,364,621],
    ["ROS","Roscommon","Connacht",2,673,749],
    ["GAL","Galway","Connacht",4,566,890],

    ["LFD","Longford","Leinster",2,774,802],
    ["WMH","Westmeath","Leinster",3,887,839],
    ["MEA","Meath","Leinster",4,1039,816],
    ["DUB","Dublin","Leinster",5,1121,942],
    ["KID","Kildare","Leinster",4,1016,976],
    ["OFF","Offaly","Leinster",2,776,971],
    ["LAO","Laois","Leinster",2,868,1069],
    ["CAR","Carlow","Leinster",2,999,1179],
    ["WIC","Wicklow","Leinster",3,1126,1064],
    ["WEX","Wexford","Leinster",3,1076,1266],
    ["KIK","Kilkenny","Leinster",3,919,1272],

    ["CLA","Clare","Munster",3,456,1108],
    ["TIP","Tipperary","Munster",3,758,1252],
    ["LIM","Limerick","Munster",3,546,1265],
    ["WAT","Waterford","Munster",3,833,1382],
    ["COR","Cork","Munster",5,548,1452],
    ["KER","Kerry","Munster",3,360,1451],
  ];

export const EDGES: [string, string][] = [
    ["DON","LDY"],["DON","TYR"],["DON","FER"],["DON","LEI"],
    ["LDY","TYR"],["LDY","ANT"],
    ["ANT","TYR"],["ANT","ARM"],["ANT","DOW"],
    ["TYR","FER"],["TYR","ARM"],["TYR","MON"],
    ["FER","CAV"],["FER","MON"],["FER","LEI"],
    ["ARM","MON"],["ARM","DOW"],["ARM","LOU"],
    ["MON","CAV"],["MON","LOU"],["MON","MEA"],
    ["CAV","LEI"],["CAV","LFD"],["CAV","WMH"],["CAV","MEA"],["CAV","LOU"],
    ["LOU","MEA"],
    ["LEI","SLI"],["LEI","ROS"],["LEI","LFD"],
    ["SLI","ROS"],["SLI","MAY"],
    ["ROS","LFD"],["ROS","WMH"],["ROS","GAL"],["ROS","MAY"],["ROS","OFF"],
    ["MAY","GAL"],
    ["GAL","OFF"],["GAL","TIP"],["GAL","CLA"],
    ["LFD","WMH"],
    ["WMH","MEA"],["WMH","OFF"],
    ["MEA","DUB"],["MEA","KID"],["MEA","OFF"],
    ["DUB","KID"],["DUB","WIC"],
    ["KID","WIC"],["KID","CAR"],["KID","LAO"],["KID","OFF"],
    ["OFF","LAO"],["OFF","TIP"],
    ["LAO","CAR"],["LAO","KIK"],["LAO","TIP"],
    ["CAR","KIK"],["CAR","WEX"],["CAR","WIC"],
    ["WIC","WEX"],
    ["WEX","KIK"],["WEX","WAT"],
    ["KIK","WAT"],["KIK","TIP"],
    ["TIP","WAT"],["TIP","COR"],["TIP","LIM"],["TIP","CLA"],
    ["WAT","COR"],
    ["COR","LIM"],["COR","KER"],
    ["LIM","CLA"],["LIM","KER"],
  ];

export interface County extends CountyDef {
  neighbors: string[];
}

function buildCounties(): Record<string, County> {
  const counties: Record<string, County> = {};
  for (const [id, name, province, pop, x, y] of RAW_COUNTIES) {
    counties[id] = { id, name, province, pop, x, y, neighbors: [] };
  }
  for (const [a, b] of EDGES) {
    counties[a].neighbors.push(b);
    counties[b].neighbors.push(a);
  }
  return counties;
}

/** All 32 counties keyed by id, with adjacency resolved from EDGES. */
export const COUNTIES: Record<string, County> = buildCounties();

/** All 32 county ids, in RAW_COUNTIES order. */
export const ALL_IDS: string[] = RAW_COUNTIES.map(([id]) => id);
