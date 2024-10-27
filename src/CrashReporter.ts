import Debug from 'debug';
import { app, crashReporter } from 'electron';

const debug = Debug('5ire:CrashReporter');

export default function initCrashReporter() {
  crashReporter.start({
    productName: app.getName(),
    ignoreSystemCrashHandler: true,
    submitURL: 'https://o4505482377363456.ingest.sentry.io/api/4505482393157632/minidump/?sentry_key=fd227cb30ce44d3e9ca51bbb815b509c',
  });
  crashReporter.addExtraParameter("version", app.getVersion())
  debug('CrashReporter initialized');
}
