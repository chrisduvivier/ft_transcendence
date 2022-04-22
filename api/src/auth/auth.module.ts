import { Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { AuthController } from './controllers/auth.controller';
import { AuthService } from './services/auth.service';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'client/auth'),
      exclude: ['/api*'],
    }),
    AuthModule,
  ],
  controllers: [AuthController],
  providers: [AuthService]
})
export class AuthModule {}
