export default function checkInstall(moduleName) {
  try {
    require.resolve(moduleName);
    return true;
  } catch (e) {
    console.error(`${moduleName} module is not found. It is depended on`);
    console.error(`Install: npm i --save ${moduleName}`);
  }
  return false;
}
