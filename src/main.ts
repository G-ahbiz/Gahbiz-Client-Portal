import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';
import { loadBootstrapOnInteraction } from '@shared/utils/lazy-bootstrap';

bootstrapApplication(App, appConfig)
  .then(() => {
    // Lazy load Bootstrap JS after app is ready to reduce TBT
    loadBootstrapOnInteraction();
  })
  .catch((err) => console.error(err));
