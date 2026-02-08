import { TestBed, ComponentFixture } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { AcceptInviteComponent } from './accept-invite.component';
import { ListsService } from '../../core/services/lists.service';
import { I18nService } from '../../core/services/i18n.service';
import { of, throwError } from 'rxjs';

const mockI18n = {
  t: vi.fn((key: string) => key),
  language: vi.fn().mockReturnValue('en'),
  loaded: vi.fn().mockReturnValue(true),
  languages: [{ code: 'en', name: 'English' }],
  init: vi.fn(),
  setLanguage: vi.fn(),
};

describe('AcceptInviteComponent', () => {
  let component: AcceptInviteComponent;
  let fixture: ComponentFixture<AcceptInviteComponent>;
  let mockListsService: any;
  let router: Router;

  function createComponent(token: string | null) {
    const mockRoute = {
      snapshot: { paramMap: { get: vi.fn().mockReturnValue(token) } },
    };

    TestBed.configureTestingModule({
      imports: [AcceptInviteComponent],
      providers: [
        provideRouter([]),
        { provide: ListsService, useValue: mockListsService },
        { provide: I18nService, useValue: mockI18n },
        { provide: ActivatedRoute, useValue: mockRoute },
      ],
    }).compileComponents();

    router = TestBed.inject(Router);
    vi.spyOn(router, 'navigate').mockResolvedValue(true);

    fixture = TestBed.createComponent(AcceptInviteComponent);
    component = fixture.componentInstance;
  }

  beforeEach(() => {
    mockListsService = {
      acceptInvite: vi.fn().mockReturnValue(
        of({ listId: '1', listName: 'Test List', message: 'ok' })
      ),
    };
  });

  afterEach(() => {
    TestBed.resetTestingModule();
  });

  it('should create', () => {
    createComponent('test-token');
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should redirect to /lists when no token', () => {
    createComponent(null);
    fixture.detectChanges();
    expect(router.navigate).toHaveBeenCalledWith(['/lists']);
    expect(mockListsService.acceptInvite).not.toHaveBeenCalled();
  });

  it('should set listId and listName on success', () => {
    createComponent('test-token');
    fixture.detectChanges();

    expect(mockListsService.acceptInvite).toHaveBeenCalledWith('test-token');
    expect(component.listId()).toBe('1');
    expect(component.listName()).toBe('Test List');
    expect(component.loading()).toBe(false);
  });

  it('should set error on failure', () => {
    mockListsService.acceptInvite.mockReturnValue(
      throwError(() => ({ error: { message: 'Invite expired' } }))
    );

    createComponent('bad-token');
    fixture.detectChanges();

    expect(component.error()).toBe('Invite expired');
    expect(component.loading()).toBe(false);
  });
});
