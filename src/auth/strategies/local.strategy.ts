import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-jwt';

export class LocalStrategy extends PassportStrategy(Strategy, 'local') {}
