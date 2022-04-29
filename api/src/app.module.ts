import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }), //import variables from .env file
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.POSTGRES_HOST,
      port: parseInt(<string>process.env.POSTGRES_PORT),
      username: process.env.POSTGRES_USER,
      password: process.env.POSTGRES_PASSWORD,
      database: process.env.POSTGRES_DATABASE,
      autoLoadEntities: true,
      synchronize: true     //don't do it in production or you'll lose data
    }), 
    ServeStaticModule.forRoot({
      /**
       * Static files root directory. Default: "client"
       */
      rootPath: join(__dirname, '..', 'client'),
      /**
       * Paths to exclude when serving the static app. WARNING! Not supported by `fastify`. If you use `fastify`, you can exclude routes using regexp (set the `renderPath` to a regular expression) instead.
       */
      // exclude: ['/api*'], 
    }), AuthModule, UsersModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}