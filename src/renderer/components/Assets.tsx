// import DarkDesign from 'assets/images/design.dark.png'; //704
// import LightDesign from 'assets/images/design.light.png';
// import DarkConstruction from 'assets/images/construction.dark.png'; //744
// import LightConstruction from 'assets/images/construction.light.png';
// import DarkDoor from 'assets/images/door.dark.png'; //935
// import LightDoor from 'assets/images/door.light.png';
// import DarkReading from 'assets/images/reading.dark.png'; //1105
// import LightReading from 'assets/images/reading.light.png'
// import DarkUsage from 'assets/images/usage.dark.png'; //1181
// import LightUsage from 'assets/images/usage.light.png';
// import DarkHint from 'assets/images/hint.dark.png'; //1387
// import LightHint from 'assets/images/hint.light.png';

export function getImage(name: string, theme?: 'light' | 'dark') {
  if (theme) {
    return require(`assets/images/${name}.${theme}.png`);
  }
  return require(`assets/images/${name}`);
}
