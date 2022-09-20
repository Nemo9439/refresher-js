import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  title = 'angular-demo';

  constructor() {
    document.addEventListener('refresher-js-open-toast', function () {
      console.log('refresher-js-open-toast custom event was triggered');
    });
  }
}
