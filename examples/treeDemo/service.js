//获取物料目录

let data = [
  {
    CatalogID: "45043524-aa33-41e3-b568-07f9a6b03994",
    CatalogCode: "16",
    CatalogName: "楼地面地毯",
    UOM: "m2",
    IsLowest: true,
    CatalogType: 1,
    Model: "",
    IsEnable: true
  },
  {
    CatalogID: "90cd28bf-7e7c-416b-93ce-34d4d01087e0",
    CatalogCode: "02",
    CatalogName: "氯丁酚醛粘结剂",
    UOM: "吨",
    IsLowest: true,
    CatalogType: 1,
    Model: "单组份",
    IsEnable: true
  },
  {
    CatalogID: "1767dd1b-b982-4f3b-bd77-52f356d4aa7b",
    CatalogCode: "03",
    CatalogName: "洞门帘布橡胶板",
    UOM: "块",
    IsLowest: true,
    CatalogType: 1,
    Model: "R3705*R3630*R3105*20",
    IsEnable: true
  },
  {
    CatalogID: "b3935b17-7d90-484d-90a2-6c6a9d65f272",
    CatalogCode: "17",
    CatalogName: "淋浴器",
    UOM: "套",
    IsLowest: true,
    CatalogType: 1,
    Model: "",
    IsEnable: true
  },
  {
    CatalogID: "c65328e5-a823-4f5a-b527-97b55645e23c",
    CatalogCode: "18",
    CatalogName: "大便器",
    UOM: "套",
    IsLowest: true,
    CatalogType: 1,
    Model: "",
    IsEnable: true
  },
  {
    CatalogID: "e2c92e99-3689-45fc-b813-c32b4c895729",
    CatalogCode: "19",
    CatalogName: "小便器",
    UOM: "套",
    IsLowest: true,
    CatalogType: 1,
    Model: "",
    IsEnable: true
  },
  {
    CatalogID: "b863e40a-94a2-42cd-bb29-549a0427b0f3",
    CatalogCode: "13",
    CatalogName: "浴盆",
    UOM: "组",
    IsLowest: true,
    CatalogType: 1,
    Model: "",
    IsEnable: true
  },
  {
    CatalogID: "c81611f4-853b-448b-a2fa-ca5dc98d1fbd",
    CatalogCode: "14",
    CatalogName: "洗脸盆",
    UOM: "组",
    IsLowest: true,
    CatalogType: 1,
    Model: "",
    IsEnable: true
  },
  {
    CatalogID: "42277bc1-87f8-4dde-abdb-fcf95505d1e8",
    CatalogCode: "04",
    CatalogName: "三元乙丙密封垫",
    UOM: "环",
    IsLowest: true,
    CatalogType: 1,
    Model: "标准盾构",
    IsEnable: true
  },
  {
    CatalogID: "e41021ba-be2b-487d-9790-cda9273db096",
    CatalogCode: "05",
    CatalogName: "丁腈橡胶软木垫",
    UOM: "平方",
    IsLowest: true,
    CatalogType: 1,
    Model: "6mm",
    IsEnable: true
  },
  {
    CatalogID: "5e0d4b74-50dd-4eee-b829-beb5d6bcd6e7",
    CatalogCode: "06",
    CatalogName: "丁腈橡胶软木垫",
    UOM: "平方",
    IsLowest: true,
    CatalogType: 1,
    Model: "3mm",
    IsEnable: true
  },
  {
    CatalogID: "a2ee5a8b-6659-437e-942f-e81227f7bf70",
    CatalogCode: "07",
    CatalogName: "丁腈橡胶软木垫",
    UOM: "平方",
    IsLowest: true,
    CatalogType: 1,
    Model: "2mm",
    IsEnable: true
  },
  {
    CatalogID: "5bde144c-5b5b-46a3-8e92-de4a10691901",
    CatalogCode: "08",
    CatalogName: "丁腈橡胶软木垫",
    UOM: "平方",
    IsLowest: true,
    CatalogType: 1,
    Model: "1mm",
    IsEnable: true
  },
  {
    CatalogID: "397f3de6-a15f-44ae-b2ff-c34486adac63",
    CatalogCode: "09",
    CatalogName: "遇水膨胀止水条",
    UOM: "米",
    IsLowest: true,
    CatalogType: 1,
    Model: "4*200mm",
    IsEnable: true
  },
  {
    CatalogID: "c00ec156-db14-4e2e-ac61-483489384a4b",
    CatalogCode: "10",
    CatalogName: "遇水膨胀止水条",
    UOM: "米",
    IsLowest: true,
    CatalogType: 1,
    Model: "3*200mm",
    IsEnable: true
  },
  {
    CatalogID: "84e8ca40-4a53-453c-9691-4c8d023b5b8b",
    CatalogCode: "11",
    CatalogName: "丁基腻子片",
    UOM: "片",
    IsLowest: true,
    CatalogType: 1,
    Model: "150*50*1.5mm",
    IsEnable: true
  },
  {
    CatalogID: "170a50e0-ac5d-4af5-96ce-188aa176cefc",
    CatalogCode: "12",
    CatalogName: "遇水膨胀橡胶垫圈",
    UOM: "个",
    IsLowest: true,
    CatalogType: 1,
    Model: "∮30",
    IsEnable: true
  },
  {
    CatalogID: "1",
    CatalogCode: "WZ",
    CatalogName: "物资目录",
    UOM: "",
    IsLowest: false,
    CatalogType: 1,
    Model: "",
    IsEnable: true
  },
  {
    CatalogID: "fa97de4f-b643-4412-8f56-55a33113a400",
    CatalogCode: "01",
    CatalogName: "环控电控柜（进线）",
    UOM: "面",
    IsLowest: true,
    CatalogType: 1,
    Model: "BL01、BL05、BL08 AL01、AL05、AL09、AL12、AL13，800*1000",
    IsEnable: true
  }
];

export function getCatalogTree({ pId }) {
  return new Promise(resolve => {
    setTimeout(() => {
      let arr = [];

      if (pId) {
        data.forEach((d, i) => {
          let temp = Object.assign({}, d);
          temp.CatalogID = pId + "-" + i;
          temp.key = pId + "-" + i;

          arr.push(temp);
        });
      } else {
        arr = data;
      }

      resolve({ data: arr, state: true });
    }, 3000);
  });
}
