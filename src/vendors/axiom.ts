import { Axiom } from '@axiomhq/js';
import { captureException } from '@sentry/electron/main';

let axiom = null;

try {
  axiom = new Axiom({
    token: process.env.AXIOM_TOKEN as string,
    orgId: process.env.AXIOM_ORG_ID as string,
  });
} catch (error) {
  captureException(error);
}

export default {
  ingest(data: { [key: string]: any }[]) {
    try {
      axiom && axiom.ingest('5ire', data);
    } catch (error) {
      captureException(error);
    }
  },
  async flush() {
    try {
      axiom && (await axiom.flush());
    } catch (error) {
      captureException(error);
    }
  },
};
