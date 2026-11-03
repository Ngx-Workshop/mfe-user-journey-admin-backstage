import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  host: { class: 'backstage-app ngx-design-system' },
  selector: 'ngx-seed-mfe',
  imports: [RouterOutlet],
  template: ` <router-outlet></router-outlet> `,
  styles: [``],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {}

// 👇 **IMPORTANT FOR DYMANIC LOADING**
export default App;
