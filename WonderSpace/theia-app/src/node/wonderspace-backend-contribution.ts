import { injectable } from '@theia/core/shared/inversify';
import { BackendApplicationContribution } from '@theia/core/lib/node';
import { Application } from 'express';

@injectable()
export class WonderSpaceBackendContribution implements BackendApplicationContribution {
  configure(app: Application): void {
    app.get('/api/health', (_req, res) => {
      res.status(200).json({ status: 'ok', service: 'wonderspace-theia-app' });
    });
  }
}
