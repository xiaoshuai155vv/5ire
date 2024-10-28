import { Axiom } from '@axiomhq/js';
import { captureException } from '@sentry/electron/main';

const axiom = new Axiom({
  token: process.env.AXIOM_TOKEN as string,
  orgId: process.env.AXIOM_ORG_ID as string,
});

export default {
  ingest(data: { [key: string]: any }[]) {
    try {
      axiom.ingest('5ire', data);
    } catch (error) {
      captureException(error);
    }
  },
  async flush() {
    try {
      await axiom.flush();
    } catch (error) {
      captureException(error);
    }
  },
};
