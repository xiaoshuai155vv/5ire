import { app, crashReporter } from 'electron';
import { debug } from './main/logging';

export default function initCrashReporter() {
  crashReporter.start({
    productName: app.getName(),
    ignoreSystemCrashHandler: true,
    submitURL: `${process.env.SENTRY_DSN}/minidump/?sentry_key=${process.env.SENTRY_KEY}`,
  });
  crashReporter.addExtraParameter('version', app.getVersion());
  debug('CrashReporter initialized');
}
