import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';

import AOS from 'aos';
import 'aos/dist/aos.css';

// Initialize AOS
document.addEventListener('DOMContentLoaded', () => {
  AOS.init({
    duration: 800,
    easing: 'ease-in-out',
    once: true
  });
});

bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));
