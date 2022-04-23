import { Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      /**
       * Static files root directory. Default: "client"
       */
      rootPath: join(__dirname, '..', 'client'),
      /**
       * Paths to exclude when serving the static app. WARNING! Not supported by `fastify`. If you use `fastify`, you can exclude routes using regexp (set the `renderPath` to a regular expression) instead.
       */
      // exclude: ['/api*'], 
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}