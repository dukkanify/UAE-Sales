export function unsplash(photoId: string, width = 1200): string {
  return `https://images.unsplash.com/${photoId}?auto=format&fit=crop&w=${width}&q=85`;
}

export const demoImageSets = {
  cars: {
    g63: [
      unsplash("photo-1563720360172-1f859e989174"),
      unsplash("photo-1618843479313-40f8afb4b4d8"),
      unsplash("photo-1544636331-e26879cd4d9b"),
    ],
    landCruiser: [
      unsplash("photo-1544636331-e26879cd4d9b"),
      unsplash("photo-1519641470654-76cead7bddfa"),
      unsplash("photo-1503376780353-7e6692767b70"),
    ],
    patrol: [
      unsplash("photo-1519641470654-76cead7bddfa"),
      unsplash("photo-1549317661-bd32c8ce0db2"),
      unsplash("photo-1533473359331-0135ef1b58bf"),
    ],
    bmwX7: [
      unsplash("photo-1555215695-3004980ad54e"),
      unsplash("photo-1617531653332-bd46c24f2068"),
      unsplash("photo-1617814076367-b759f7d7e44e"),
    ],
    teslaModelY: [
      unsplash("photo-1617704549226-007ecc5d850b"),
      unsplash("photo-1560958089-b8a1929cea89"),
      unsplash("photo-1536700503339-1e4b06520771"),
    ],
  },
  realEstate: {
    villaPalm: [
      unsplash("photo-1600607687939-ce8a6c25118c"),
      unsplash("photo-1600585154340-be6161a56a0c"),
      unsplash("photo-1600047509807-ba8f99d2cd7a"),
    ],
    downtownApt: [
      unsplash("photo-1502672260266-1c1ef2d93688"),
      unsplash("photo-1522708323590-d24dbb6b0267"),
      unsplash("photo-1560448204-e02f11c2d0e1"),
    ],
    arabianRanches: [
      unsplash("photo-1600585154340-be6161a56a0c"),
      unsplash("photo-1600047509807-ba8f99d2cd7a"),
      unsplash("photo-1600566753190-17f0baa2a6c3"),
    ],
    officeBay: [
      unsplash("photo-1486406146926-c627a92ad1ab"),
      unsplash("photo-1497366216548-37526070297c"),
      unsplash("photo-1497366811353-6870744d04b2"),
    ],
    studioJvc: [
      unsplash("photo-1522708323590-d24dbb6b0267"),
      unsplash("photo-1505693416388-ac5ce068fe85"),
      unsplash("photo-1560448204-e02f11c2d0e1"),
    ],
  },
  mobiles: {
    iphone16ProMax: [
      unsplash("photo-1695048133142-1a20484d2569"),
      unsplash("photo-1592750475338-74b7b21085ab"),
      unsplash("photo-1511707171634-5f897ff02aa9"),
    ],
    galaxyS25Ultra: [
      unsplash("photo-1610945415295-d9bbf067c593"),
      unsplash("photo-1511707171634-5f897ff02aa9"),
      unsplash("photo-1585060544812-6b45742d762f"),
    ],
    iphone15Pro: [
      unsplash("photo-1695048133142-1a20484d2569"),
      unsplash("photo-1678652197950-62d4e2f3c8b4"),
      unsplash("photo-1592899677977-9c10ca588bbd"),
    ],
    ipadProM4: [
      unsplash("photo-1544244015-0df4b3ffc6b0"),
      unsplash("photo-1561154464-82e9adf32764"),
      unsplash("photo-1631549916768-4119b2e5f126"),
    ],
    macbookProM3: [
      unsplash("photo-1517336714731-489689fd1ca8"),
      unsplash("photo-1611186874728-f292b5a01a68"),
      unsplash("photo-1496181133206-80ce9b88a853"),
    ],
  },
  electronics: {
    ps5: [
      unsplash("photo-1606813907291-d86efa9b94db"),
      unsplash("photo-1622297845775-5ff3fef71d13"),
      unsplash("photo-1493711662062-fa541adb3fc8"),
    ],
    lgOled: [
      unsplash("photo-1593359677879-a4bb92f829d1"),
      unsplash("photo-1461151304267-38535e780c79"),
      unsplash("photo-1571209510353-4117b7a5dde7"),
    ],
    canonR6: [
      unsplash("photo-1516035069371-29a1b244cc32"),
      unsplash("photo-1502920917128-1aa500764cbd"),
      unsplash("photo-1452587925148-ce544e77e70d"),
    ],
    boseSoundbar: [
      unsplash("photo-1545454679177-b72de2d4c8a0"),
      unsplash("photo-1558618666-fcd25c85cd64"),
      unsplash("photo-1484704849700-f032a568e944"),
    ],
    appleWatchUltra: [
      unsplash("photo-1434493789847-2f02dc6ca35d"),
      unsplash("photo-1546868871-7041f2a55e12"),
      unsplash("photo-1579586337278-3befd40fd17a"),
    ],
  },
  furniture: {
    italianSofa: [
      unsplash("photo-1555041469-a586c61ea9bc"),
      unsplash("photo-1616486338812-3dadae4b4ace"),
      unsplash("photo-1493663284031-b7e3aefcae8e"),
    ],
    diningTable: [
      unsplash("photo-1617806113103-48e815e0efb1"),
      unsplash("photo-1586023492125-27b2c045efd7"),
      unsplash("photo-1615529328331-f8917597711f"),
    ],
    bedroomSet: [
      unsplash("photo-1505693416388-ac5ce068fe85"),
      unsplash("photo-1616594039964-ae9021a400a0"),
      unsplash("photo-1631049307264-da0ec9d70304"),
    ],
    officeDesk: [
      unsplash("photo-1518455027359-061f52bc737d"),
      unsplash("photo-1497366754035-f200968a6e72"),
      unsplash("photo-1524758631624-e2822e304c36"),
    ],
    gardenSet: [
      unsplash("photo-1600585154526-990dced4db0a"),
      unsplash("photo-1600607687644-c7171b42498b"),
      unsplash("photo-1600047509358-9dc75507daeb"),
    ],
  },
  services: {
    homeCleaning: [
      unsplash("photo-1581578731548-c64695cc6952"),
      unsplash("photo-1628177142898-93e36e4e3a50"),
      unsplash("photo-1558618666-fcd25c85cd64"),
    ],
    villaMaintenance: [
      unsplash("photo-1503387762-592deb58ef4e"),
      unsplash("photo-1581578731548-c64695cc6952"),
      unsplash("photo-1504307651254-35680f356dfd"),
    ],
    carDetailing: [
      unsplash("photo-1607860108855-64efe207e5dc"),
      unsplash("photo-1520340359834-6cb6fb6280af"),
      unsplash("photo-1486262715619-67b85e0b08d3"),
    ],
    movingService: [
      unsplash("photo-1600518464441-9154a4dea21b"),
      unsplash("photo-1600880292203-757bb62b4baf"),
      unsplash("photo-1558618666-fcd25c85cd64"),
    ],
    acRepair: [
      unsplash("photo-1585771724684-a3825d18b863"),
      unsplash("photo-1621905251189-08b45d6a269e"),
      unsplash("photo-1504307651254-35680f356dfd"),
    ],
  },
  jobs: {
    salesExecutive: [
      unsplash("photo-1556761175-b413da4baf72"),
      unsplash("photo-1521737711867-e3b97375f902"),
      unsplash("photo-1600880292089-90a7e086ee0c"),
    ],
    realEstateAgent: [
      unsplash("photo-1560518883-ce09059eeffa"),
      unsplash("photo-1560472354-b33ff0c44a43"),
      unsplash("photo-1556761175-b413da4baf72"),
    ],
    deliveryDriver: [
      unsplash("photo-1600880292203-757bb62b4baf"),
      unsplash("photo-1586528116311-ad8dd3c8310d"),
      unsplash("photo-1566576912321-d58ddd7a6088"),
    ],
    accountant: [
      unsplash("photo-1554224155-6726b3ff858f"),
      unsplash("photo-1454165804606-c3d57bc86b40"),
      unsplash("photo-1556761175-b413da4baf72"),
    ],
    graphicDesigner: [
      unsplash("photo-1561070791-2526d30994b5"),
      unsplash("photo-1586281380349-632531db7ed4"),
      unsplash("photo-1556761175-b413da4baf72"),
    ],
  },
} as const;

export const sellerAvatars = {
  alNoorMotors: unsplash("photo-1560179707-f14e90ef3623", 200),
  dubaiElite: unsplash("photo-1560518883-ce09059eeffa", 200),
  gulfElectronics: unsplash("photo-1560472354-b33ff0c44a43", 200),
  emiratesHome: unsplash("photo-1581578731548-c64695cc6952", 200),
  goldenKey: unsplash("photo-1560518883-ce09059eeffa", 200),
  khalidAlMansoori: unsplash("photo-1507003211169-0a1dd7228f2d", 200),
  fatimaAlZaabi: unsplash("photo-1494790108377-be9c29b29330", 200),
  omarHassan: unsplash("photo-1472099645785-5658abf4ff4e", 200),
  priyaSharma: unsplash("photo-1438761681033-6461ffad8d80", 200),
  ahmedAlMansoori: unsplash("photo-1500648767791-00dcc994a43e", 200),
};
