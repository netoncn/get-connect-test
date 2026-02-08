import { TestBed, ComponentFixture } from '@angular/core/testing';
import { MemberListComponent } from './member-list.component';
import { I18nService } from '../../../core/services/i18n.service';
import { ListMember } from '../../../core/models/list.model';

const mockI18n = {
  t: vi.fn((key: string) => key),
  language: vi.fn().mockReturnValue('en'),
  loaded: vi.fn().mockReturnValue(true),
  languages: [{ code: 'en', name: 'English' }],
  init: vi.fn(),
  setLanguage: vi.fn(),
};

const mockMembers: ListMember[] = [
  {
    id: 'm1',
    userId: 'u1',
    userName: 'Alice',
    userEmail: 'alice@example.com',
    role: 'OWNER',
    createdAt: new Date(),
  },
  {
    id: 'm2',
    userId: 'u2',
    userName: 'Bob',
    userEmail: 'bob@example.com',
    role: 'EDITOR',
    createdAt: new Date(),
  },
];

describe('MemberListComponent', () => {
  let component: MemberListComponent;
  let fixture: ComponentFixture<MemberListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MemberListComponent],
      providers: [{ provide: I18nService, useValue: mockI18n }],
    }).compileComponents();

    fixture = TestBed.createComponent(MemberListComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('members', mockMembers);
    fixture.detectChanges();
  });

  it('should create with inputs', () => {
    expect(component).toBeTruthy();
    expect(component.members()).toEqual(mockMembers);
    expect(component.isOwner()).toBe(false);
  });

  it('onRoleChange should emit event', () => {
    const emitSpy = vi.fn();
    component.roleChange.subscribe(emitSpy);

    const member = mockMembers[1];
    component.onRoleChange(member, 'VIEWER');

    expect(emitSpy).toHaveBeenCalledWith({ member, role: 'VIEWER' });
  });

  it('onRemove should emit member', () => {
    const emitSpy = vi.fn();
    component.removeMember.subscribe(emitSpy);

    const member = mockMembers[1];
    component.onRemove(member);

    expect(emitSpy).toHaveBeenCalledWith(member);
  });
});
