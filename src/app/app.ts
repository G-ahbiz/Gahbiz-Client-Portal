import { Component, signal, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { HeaderComponent } from './shared/components/header/header.component';
import { RouterOutlet } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { filter } from 'rxjs/operators';
import { Subscription } from 'rxjs';
import { ToastContainerComponent } from './shared/components/toast-container/toast-container.component';

@Component({
  selector: 'app-root',
  imports: [HeaderComponent, ToastContainerComponent, RouterOutlet, TranslateModule, CommonModule],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements OnInit, OnDestroy {
  title = 'Gahbiz-Client-Portal';

  // signal to drive header visibility (can be used directly in template)
  showHeader = signal<boolean>(true);

  private sub = new Subscription();

  constructor(private router: Router, private activatedRoute: ActivatedRoute) {}

  ngOnInit(): void {
    // update showHeader on each completed navigation
    this.sub.add(
      this.router.events
        .pipe(filter(e => e instanceof NavigationEnd))
        .subscribe(() => {
          // get deepest activated route snapshot
          let snapshot = this.activatedRoute.snapshot;
          while (snapshot.firstChild) {
            snapshot = snapshot.firstChild;
          }

          // if route data has hideHeader === true, we hide header
          const hide = !!snapshot.data?.['hideHeader'];
          this.showHeader.set(!hide);
        })
    );

    // also run once on initial load (in case there's no NavigationEnd emitted yet)
    const initialSnapshot = this.activatedRoute.snapshot;
    let deepest = initialSnapshot;
    while (deepest.firstChild) {
      deepest = deepest.firstChild;
    }
    this.showHeader.set(!Boolean(deepest.data?.['hideHeader']));
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }
}