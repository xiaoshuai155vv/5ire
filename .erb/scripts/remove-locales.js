const glob = require('glob');
const fs = require('fs');

// https://www.electron.build/configuration/configuration#afterpack
exports.default = async function removeLocales(context) {
  const languages = ['en', 'zh_CN'];
  const localeDirs = `${context.appOutDir}/${
    context.packager.appInfo.productName
  }.app/Contents/Frameworks/Electron Framework.framework/Resources/!(${languages.join(
    '|',
  )}).lproj`;
  console.log('After Pack, remove unused locales:', localeDirs);
  const res = glob.GlobSync(localeDirs);
  res.found.forEach((dir) => {
    console.log('remove locale file:', dir);
    fs.rmSync(dir, { recursive: true, force: true });
  });
};
