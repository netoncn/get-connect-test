import { TestBed, ComponentFixture } from '@angular/core/testing';
import { InviteModalComponent } from './invite-modal.component';
import { I18nService } from '../../../core/services/i18n.service';

const mockI18n = {
  t: vi.fn((key: string) => key),
  language: vi.fn().mockReturnValue('en'),
  loaded: vi.fn().mockReturnValue(true),
  languages: [{ code: 'en', name: 'English' }],
  init: vi.fn(),
  setLanguage: vi.fn(),
};

describe('InviteModalComponent', () => {
  let component: InviteModalComponent;
  let fixture: ComponentFixture<InviteModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InviteModalComponent],
      providers: [{ provide: I18nService, useValue: mockI18n }],
    }).compileComponents();

    fixture = TestBed.createComponent(InviteModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
    expect(component.form).toBeDefined();
    expect(component.form.get('email')).toBeDefined();
    expect(component.form.get('role')).toBeDefined();
  });

  it('onSubmit should emit invite with valid form', () => {
    const emitSpy = vi.fn();
    component.invite.subscribe(emitSpy);

    component.form.setValue({ email: 'test@example.com', role: 'EDITOR' });
    component.onSubmit();

    expect(emitSpy).toHaveBeenCalledWith({
      email: 'test@example.com',
      role: 'EDITOR',
    });
  });

  it('onClose should reset form and emit close', () => {
    const closeSpy = vi.fn();
    component.close.subscribe(closeSpy);

    component.form.setValue({ email: 'test@example.com', role: 'EDITOR' });
    component.onClose();

    expect(component.form.getRawValue()).toEqual({
      email: '',
      role: 'VIEWER',
    });
    expect(closeSpy).toHaveBeenCalled();
  });
});
