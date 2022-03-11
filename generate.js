const fs = require("fs");
const path = require("path");
const XLSX = require("xlsx");
const EXCEL_PATH = path.resolve(__dirname, "./excel");
const JSON_PATH = path.resolve(__dirname, "./json_data");
const DEFAULT_SHEET = "Sheet1";
const files = fs.readdirSync(EXCEL_PATH);
let areas = [],
  provinces = [],
  districts = [],
  wards = [];
let tree = {};
let treeWithArea = {};
files.forEach(file_name => {
  if (file_name.includes("vùng")) {
    const areas_workbook = XLSX.readFile(
      path.resolve(EXCEL_PATH, file_name)
    ).Sheets[DEFAULT_SHEET];
    areas = XLSX.utils
      .sheet_to_json(areas_workbook, { raw: true })
      .map(x => ({
        code: x["Mã"],
        name: x["Tên"],
        unit: x["Cấp"]
      }))
      .filter(x => x.code);
    fs.writeFileSync(
      path.resolve(JSON_PATH, "areas.json"),
      JSON.stringify(areas, null, 2)
    );
  } else if (file_name.includes("tỉnh")) {
    const provinces_workbook = XLSX.readFile(
      path.resolve(EXCEL_PATH, file_name)
    ).Sheets[DEFAULT_SHEET];
    provinces = XLSX.utils
      .sheet_to_json(provinces_workbook, { raw: true })
      .map(x => ({
        code: x["Mã"],
        name: x["Tên"],
        unit: x["Cấp"],
        area_code: x["Mã vùng"],
        area_name: x["Vùng"],
        full_name: `${x["Tên"]}, ${x["Vùng"]}`
      }))
      .filter(x => x.code);
    fs.writeFileSync(
      path.resolve(JSON_PATH, "provinces.json"),
      JSON.stringify(provinces, null, 2)
    );
  } else if (file_name.includes("huyện")) {
    const districts_workbook = XLSX.readFile(
      path.resolve(EXCEL_PATH, file_name)
    ).Sheets[DEFAULT_SHEET];
    districts = XLSX.utils
      .sheet_to_json(districts_workbook, { raw: true })
      .map(x => ({
        code: x["Mã"],
        name: x["Tên"],
        unit: x["Cấp"],
        province_code: x["Mã TP"],
        province_name: x["Tỉnh / Thành Phố"],
        area_code: x["Mã vùng"],
        area_name: x["Vùng"],
        full_name: `${x["Tên"]}, ${x["Tỉnh / Thành Phố"]}, ${x["Vùng"]}`
      }))
      .filter(x => x.code);
    fs.writeFileSync(
      path.resolve(JSON_PATH, "districts.json"),
      JSON.stringify(districts, null, 2)
    );
  } else if (file_name.includes("xã")) {
    const wards_workbook = XLSX.readFile(path.resolve(EXCEL_PATH, file_name))
      .Sheets[DEFAULT_SHEET];
    wards = XLSX.utils
      .sheet_to_json(wards_workbook, { raw: true })
      .map(x => ({
        code: x["Mã"],
        name: x["Tên"],
        unit: x["Cấp"],
        district_code: x["Mã QH"],
        district_name: x["Quận Huyện"],
        province_code: x["Mã TP"],
        province_name: x["Tỉnh / Thành Phố"],
        area_code: x["Mã vùng"],
        area_name: x["Vùng"],
        full_name: `${x["Tên"]}, ${x["Quận Huyện"]}, ${x["Tỉnh / Thành Phố"]}, ${x["Vùng"]}`
      }))
      .filter(x => x.code);
    fs.writeFileSync(
      path.resolve(JSON_PATH, "wards.json"),
      JSON.stringify(wards, null, 2)
    );
  }
});

areas.forEach(area => {
  treeWithArea[area.code] = area;
});

provinces.forEach(province => {
  if (!treeWithArea[province.area_code].provinces) {
    treeWithArea[province.area_code].provinces = {};
  }
  treeWithArea[province.area_code].provinces[province.code] = province;
});

districts.forEach(district => {
  if (!treeWithArea[district.area_code].provinces[district.province_code].districts) {
    treeWithArea[district.area_code].provinces[district.province_code].districts = {};
  }
  treeWithArea[district.area_code].provinces[district.province_code].districts[district.code] = district;
});

wards.forEach(ward => {
  if (!treeWithArea[ward.area_code].provinces[ward.province_code].districts[ward.district_code].wards) {
    treeWithArea[ward.area_code].provinces[ward.province_code].districts[ward.district_code].wards = {};
  }
  treeWithArea[ward.area_code].provinces[ward.province_code].districts[ward.district_code].wards[
    ward.code
  ] = ward;
});
fs.writeFileSync(
  path.resolve(JSON_PATH, "treeWithArea.json"),
  JSON.stringify(tree, null, 2)
);


provinces.forEach(province => {
  tree[province.code] = province;
});

districts.forEach(district => {
  if (!tree[district.province_code].districts) {
    tree[district.province_code].districts = {};
  }
  tree[district.province_code].districts[district.code] = district;
});

wards.forEach(ward => {
  if (!tree[ward.province_code].districts[ward.district_code].wards) {
    tree[ward.province_code].districts[ward.district_code].wards = {};
  }
  tree[ward.province_code].districts[ward.district_code].wards[
    ward.code
  ] = ward;
});
fs.writeFileSync(
  path.resolve(JSON_PATH, "tree.json"),
  JSON.stringify(tree, null, 2)
);