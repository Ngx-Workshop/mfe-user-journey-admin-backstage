import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import App from '../../src/app/app';
import { Routes } from '../../src/app/app.routes';

describe('federated app', () => {
  it('renders the router outlet and preserves public route paths', () => {
    TestBed.configureTestingModule({
      imports: [App],
      providers: [
        provideRouter([]),
        provideZonelessChangeDetection(),
      ],
    });
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    expect(
      fixture.nativeElement.querySelector('router-outlet')
    ).not.toBeNull();
    expect(Routes.map((route) => route.path)).toEqual([
      '',
      'list',
      'details/:repo',
      '**',
    ]);
  });
});
