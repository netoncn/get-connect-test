import { TestBed } from '@angular/core/testing';
import { TranslatePipe } from './translate.pipe';
import { I18nService } from '../../core/services/i18n.service';

describe('TranslatePipe', () => {
  let pipe: TranslatePipe;
  let i18nMock: { t: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    i18nMock = {
      t: vi.fn((key: string) => `translated:${key}`),
    };

    TestBed.configureTestingModule({
      providers: [
        TranslatePipe,
        { provide: I18nService, useValue: i18nMock },
      ],
    });

    pipe = TestBed.inject(TranslatePipe);
  });

  it('should return translated string', () => {
    const result = pipe.transform('hello.world');
    expect(result).toBe('translated:hello.world');
    expect(i18nMock.t).toHaveBeenCalledWith('hello.world', undefined);
  });

  it('should return empty string for null', () => {
    const result = pipe.transform(null);
    expect(result).toBe('');
    expect(i18nMock.t).not.toHaveBeenCalled();
  });

  it('should return empty string for undefined', () => {
    const result = pipe.transform(undefined);
    expect(result).toBe('');
    expect(i18nMock.t).not.toHaveBeenCalled();
  });

  it('should pass params to i18n.t()', () => {
    const params = { name: 'Alice', count: 42 };
    pipe.transform('greeting', params);
    expect(i18nMock.t).toHaveBeenCalledWith('greeting', params);
  });
});
