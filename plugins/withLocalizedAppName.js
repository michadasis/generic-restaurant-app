const { withDangerousMod } = require('expo/config-plugins');
const fs = require('fs');
const path = require('path');

// Adds a Greek-locale override for the Android launcher label (app_name).
// The default (app.json "name") is used as the fallback for every other language.
module.exports = function withLocalizedAppName(config) {
  return withDangerousMod(config, [
    'android',
    async (config) => {
      const valuesElDir = path.join(
        config.modRequest.platformProjectRoot,
        'app/src/main/res/values-el'
      );
      fs.mkdirSync(valuesElDir, { recursive: true });
      fs.writeFileSync(
        path.join(valuesElDir, 'strings.xml'),
        '<resources>\n  <string name="app_name">Λέσχη UoWM</string>\n</resources>\n'
      );
      return config;
    },
  ]);
};
