import { ConfigService } from '@nestjs/config';

export const mockConfigService = (values: Record<string, unknown>) => {
  const configService = {
    provide: ConfigService,
    useValue: {
      get: jest.fn((key: string, defaultValue: string) => {
        return values[key] || defaultValue;
      }),
    },
  };

  return configService;
};
