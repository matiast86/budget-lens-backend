import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule, JwtSignOptions } from '@nestjs/jwt';

@Global()
@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: ['.env.development', '.env'],
      isGlobal: true,
    }),

    JwtModule.registerAsync({
      global: true,
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const secret = config.get<string>('JWT_SECRET');
        if (!secret) {
          throw new Error('JWT_SECRET not defined');
        }

        const expiresIn = (config.get<string>('JWT_EXPIRATION') ??
          '60m') as JwtSignOptions['expiresIn'];

        return {
          secret,
          signOptions: {
            expiresIn: expiresIn,
            algorithm: 'HS256',
          },
        };
      },
    }),
  ],
})
export class SharedModule {}
