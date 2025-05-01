import { type ClassConstructor, Transform, Type, plainToInstance } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsNumber,
  IsString,
  IsUrl,
  Max,
  Min,
  validateSync,
} from 'class-validator';
import dotenv from 'dotenv';

let loaded = false;

if (!loaded) {
  // Load environment variables from .env file
  dotenv.config();

  loaded = true;
}

export function validate<T extends object>(
  configClass: ClassConstructor<T>,
  config: Record<string, unknown>,
) {
  const validatedConfig = plainToInstance(configClass, config, {
    enableImplicitConversion: true,
  });
  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    throw new Error(errors.toString());
  }

  return validatedConfig;
}

export enum AppEnv {
  development = 'development',
  production = 'production',
  test = 'test',
  provision = 'provision',
}

export enum LogLevels {
  info = 'info',
  debug = 'debug',
}

class GoogleConfig {
  @IsString()
  api_key!: string;

  @IsString()
  cx_key!: string;
}

// Used to init defaults
const { NODE_ENV = AppEnv.development } = process.env as { NODE_ENV?: AppEnv };

class EnvironmentVariables {
  @IsEnum(AppEnv)
  NODE_ENV: AppEnv = AppEnv.development;

  @IsString()
  DB_PATH!: string;

  @IsEnum(LogLevels)
  LOG_LEVEL: LogLevels = NODE_ENV === AppEnv.production ? LogLevels.info : LogLevels.debug;

  @IsBoolean()
  LOG_ENABLED: boolean = [AppEnv.production, AppEnv.development].includes(NODE_ENV);

  @IsUrl()
  TRANSLATOR_URL!: string;

  @IsString()
  TRANSLATOR_KEY!: string;

  @IsNumber()
  @Max(100)
  @Min(0)
  BOT_DAMN_RATE: number = 10;

  @IsUrl()
  HOROSCORE_URL!: string;

  @IsUrl()
  QUOTE_URL!: string;

  @IsUrl()
  NEWS_URL!: string;

  @IsUrl()
  BASH_URL!: string;

  @IsUrl()
  WEATHER_URL!: string;

  @IsUrl()
  SAUBER_CURRENCIES_URL!: string;

  @IsUrl()
  CROCUS_CURRENCIES_URL!: string;

  @IsUrl()
  GAZPROM_CURRENCIES_URL!: string;

  @IsUrl()
  ALFA_CURRENCIES_URL!: string;

  @IsUrl()
  TINKOFF_CURRENCIES_URL!: string;

  @IsString()
  GIPHY_KEY!: string;

  @Type(() => GoogleConfig)
  @Transform(({ value }) => JSON.parse(value), { toClassOnly: true })
  GOOGLE!: GoogleConfig[];

  @IsString()
  APP_TELEGRAM_BOT_TOKEN!: string;

  @IsUrl()
  TTS_URL!: string;

  @IsString()
  TOR_PATH: string = 'tor';

  @IsUrl()
  LLM_BASE_URL!: string;

  @IsString()
  LLM_API_KEY!: string;

  @IsString()
  LLM_HEAVY_MODEL!: string;

  @IsString()
  LLM_LIGHT_MODEL!: string;
}

const config = validate(EnvironmentVariables, process.env);

export default config;
