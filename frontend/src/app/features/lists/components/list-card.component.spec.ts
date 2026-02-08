import { TestBed, ComponentFixture } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { ListCardComponent } from './list-card.component';
import { I18nService } from '../../../core/services/i18n.service';
import { List } from '../../../core/models/list.model';

const mockI18n = {
  t: vi.fn((key: string) => key),
  language: vi.fn().mockReturnValue('en'),
  loaded: vi.fn().mockReturnValue(true),
  languages: [{ code: 'en', name: 'English' }],
  init: vi.fn(),
  setLanguage: vi.fn(),
};

const mockList: List = {
  id: '1',
  name: 'Test',
  createdById: 'u1',
  createdAt: new Date(),
  updatedAt: new Date(),
  userRole: 'OWNER' as const,
  itemCount: 5,
  memberCount: 2,
};

describe('ListCardComponent', () => {
  let component: ListCardComponent;
  let fixture: ComponentFixture<ListCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListCardComponent],
      providers: [
        { provide: I18nService, useValue: mockI18n },
        provideRouter([]),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ListCardComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('list', mockList);
    fixture.detectChanges();
  });

  it('should create with input', () => {
    expect(component).toBeTruthy();
    expect(component.list()).toEqual(mockList);
  });

  it('getRoleBadgeClass returns purple for OWNER', () => {
    fixture.componentRef.setInput('list', { ...mockList, userRole: 'OWNER' });
    fixture.detectChanges();

    const result = component.getRoleBadgeClass();
    expect(result).toBe(
      'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
    );
  });

  it('getRoleLabel returns correct i18n key', () => {
    fixture.componentRef.setInput('list', { ...mockList, userRole: 'OWNER' });
    fixture.detectChanges();
    expect(component.getRoleLabel()).toBe('members.owner');

    fixture.componentRef.setInput('list', { ...mockList, userRole: 'EDITOR' });
    fixture.detectChanges();
    expect(component.getRoleLabel()).toBe('members.editor');

    fixture.componentRef.setInput('list', { ...mockList, userRole: 'VIEWER' });
    fixture.detectChanges();
    expect(component.getRoleLabel()).toBe('members.viewer');
  });
});
