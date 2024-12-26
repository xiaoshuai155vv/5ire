// @ts-ignore
import { Axiom } from '@axiomhq/js';
import { captureException } from '../main/logging';

let axiom = null;

try {
  axiom = new Axiom({
    token: process.env.AXIOM_TOKEN as string,
    orgId: process.env.AXIOM_ORG_ID as string,
  });
} catch (err: any) {
  captureException(err);
}

export default {
  ingest(data: { [key: string]: any }[]) {
    try {
      axiom && axiom.ingest('5ire', data);
    } catch (err: any) {
      captureException(err);
    }
  },
  async flush() {
    try {
      axiom && (await axiom.flush());
    } catch (err: any) {
      captureException(err);
    }
  },
};
