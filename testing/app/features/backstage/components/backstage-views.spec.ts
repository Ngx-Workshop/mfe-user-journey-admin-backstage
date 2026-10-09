import { TestBed } from '@angular/core/testing';
import { OpenApiViewerComponent } from '../../../../../src/app/features/backstage/components/openapi-viewer.component';
import { BackstageFiltersComponent } from '../../../../../src/app/features/backstage/components/backstage-filters.component';
import { BackstageResultsComponent } from '../../../../../src/app/features/backstage/components/backstage-results.component';
import { ServiceCardComponent } from '../../../../../src/app/features/backstage/components/service-card.component';
import { MarkdownViewerComponent } from '../../../../../src/app/features/backstage/components/markdown-viewer.component';
import { DocViewerComponent } from '../../../../../src/app/features/backstage/components/doc-viewer.component';

describe('Backstage views', () => {
  it('renders operations, selection, schemas/examples and search empty state', async () => {
    const fixture = TestBed.createComponent(OpenApiViewerComponent);
    fixture.componentRef.setInput('doc', {
      content: JSON.stringify({
        info: { title: 'Users', version: '1' },
        paths: {
          '/users': {
            get: {
              summary: 'List users',
              responses: {
                '200': {
                  description: 'OK',
                  content: {
                    'application/json': {
                      schema: {
                        type: 'object',
                        properties: { name: { type: 'string' } },
                      },
                      example: { name: 'Ada' },
                    },
                  },
                },
              },
            },
            post: {
              summary: 'Create user',
              requestBody: {
                content: {
                  'application/json': { schema: { type: 'string' } },
                },
              },
            },
          },
        },
      }),
    });
    await fixture.whenStable();
    const element = fixture.nativeElement as HTMLElement;
    expect(element.textContent).toContain('Ada');
    expect(
      element.querySelector('ngx-backstage-schema-tree')
    ).not.toBeNull();
    const buttons = element.querySelectorAll<HTMLButtonElement>(
      'button[aria-pressed]'
    );
    expect(buttons.length).toBe(2);
    buttons[1].click();
    await fixture.whenStable();
    expect(buttons[1].getAttribute('aria-pressed')).toBe('true');
    const search = element.querySelector('input')!;
    search.value = 'no matches';
    search.dispatchEvent(new Event('input'));
    await fixture.whenStable();
    expect(element.textContent).toContain('No operations match');
    expect(element.textContent).toContain('Select an operation');
  });
  it('updates quick prefix selection when parent search changes and emits intent', async () => {
    const fixture = TestBed.createComponent(
      BackstageFiltersComponent
    );
    fixture.componentRef.setInput('searchTerm', 'service-');
    await fixture.whenStable();
    expect(fixture.componentInstance.selectedPrefix()).toBe(
      'service-'
    );
    fixture.componentRef.setInput('searchTerm', 'custom');
    await fixture.whenStable();
    expect(fixture.componentInstance.selectedPrefix()).toBeNull();
    const emit = spyOn(fixture.componentInstance.queryChange, 'emit');
    const input = fixture.nativeElement.querySelector(
      'input'
    ) as HTMLInputElement;
    input.value = 'repo';
    input.dispatchEvent(new Event('input'));
    expect(emit).toHaveBeenCalledWith('repo');
  });
  it('shows recoverable list errors and emits retry', async () => {
    const fixture = TestBed.createComponent(
      BackstageResultsComponent
    );
    fixture.componentRef.setInput('state', {
      loading: false,
      items: [],
      error: 'Unable to load services',
    });
    await fixture.whenStable();
    expect(
      fixture.nativeElement.querySelector('[role=alert]').textContent
    ).toContain('Unable to load services');
    const retry = spyOn(
      fixture.componentInstance.refreshList,
      'emit'
    );
    fixture.nativeElement.querySelector('button').click();
    expect(retry).toHaveBeenCalled();
  });
  it('does not mutate the input language list', async () => {
    const languages = Object.freeze(['z', 'a']);
    const fixture = TestBed.createComponent(ServiceCardComponent);
    fixture.componentRef.setInput('serviceSummaryDto', {
      repoName: 'repo',
      topics: [],
      syncStatus: 'ok',
      deviconLanguages: languages,
    });
    await fixture.whenStable();
    expect(languages).toEqual(['z', 'a']);
  });
  it('sanitizes rendered Markdown and copies raw content', async () => {
    const fixture = TestBed.createComponent(MarkdownViewerComponent);
    fixture.componentRef.setInput('doc', {
      content: '# Title\n<script>alert(1)</script>',
    });
    await fixture.whenStable();
    expect(
      fixture.nativeElement.querySelector('h1').textContent
    ).toBe('Title');
    expect(fixture.nativeElement.querySelector('script')).toBeNull();
    const copy = spyOn(
      navigator.clipboard,
      'writeText'
    ).and.resolveTo();
    await fixture.componentInstance.copy();
    expect(copy).toHaveBeenCalledWith(
      '# Title\n<script>alert(1)</script>'
    );
  });
  it('formats raw JSON and downloads the document content', async () => {
    const fixture = TestBed.createComponent(DocViewerComponent);
    fixture.componentRef.setInput('title', 'Service Metadata');
    fixture.componentRef.setInput('doc', {
      content: '{"name":"repo"}',
      format: 'json',
    });
    await fixture.whenStable();
    expect(
      fixture.nativeElement.querySelector('code').textContent
    ).toContain('"name": "repo"');
    const create = spyOn(URL, 'createObjectURL').and.returnValue(
      'blob:document'
    );
    const revoke = spyOn(URL, 'revokeObjectURL');
    const click = spyOn(HTMLAnchorElement.prototype, 'click');
    fixture.componentInstance.download();
    expect(create).toHaveBeenCalled();
    expect(click).toHaveBeenCalled();
    expect(revoke).toHaveBeenCalledWith('blob:document');
  });
});
