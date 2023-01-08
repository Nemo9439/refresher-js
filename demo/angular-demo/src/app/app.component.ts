import { Component, HostListener } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  title = 'angular-demo';

  @HostListener('document:refresher-js-open-toast')
  sendRefresherEvent(): void {
    console.log('send analytics event');
  }
}
