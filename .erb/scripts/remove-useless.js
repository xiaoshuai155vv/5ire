const glob = require('glob');
const fs = require('fs');
const path = require('path');

async function removeLocales(context) {
  const languages = ['en', 'zh_CN'];
  const localeDirs = path.join(
    context.appOutDir,
    `${context.packager.appInfo.productName}.app`,
    'Contents',
    'Frameworks',
    'Electron Framework.framework',
    'Resources',
    `!(${languages.join('|')}).lproj`,
  );
  console.log(`\nRemove useless language files\n`);
  const res = glob.GlobSync(localeDirs);
  res.found.forEach((dir) => {
    console.log('Remove locale file:', dir);
    fs.rmSync(dir, { recursive: true, force: true });
  });
}

async function removeUnusedOnnxRuntime(context) {
  const nodeModulesDir = path.join(
    context.appOutDir,
    `${context.packager.appInfo.productName}.app`,
    'Contents',
    'Resources',
    'app.asar.unpacked',
    'node_modules',
  );
  const onnxruntimeDir = path.join(
    nodeModulesDir,
    'onnxruntime-node',
    'bin',
    'napi-v3',
  );
  const onnxruntimeUnusedDirs = path.join(
    onnxruntimeDir,
    `!(${context.packager.platform.nodeName})`,
  );
  console.log(`\nRemove unused onnx runtime from\n`, onnxruntimeUnusedDirs);
  const res = glob.GlobSync(onnxruntimeUnusedDirs);
  res.found.forEach((dir) => {
    console.log('Remove unused runtime:', dir);
    fs.rmSync(dir, { recursive: true, force: true });
  });
}

// https://www.electron.build/configuration/configuration#afterpack
exports.default = async function remove(context) {
  console.log('After Pack, remove useless files');
  await removeLocales(context);
  await removeUnusedOnnxRuntime(context);
};
