import { Injectable } from '@nestjs/common';

@Injectable()
export class AuthService {
    getHello(): string {
        return 'Hello World! This is the Authentication page!';
      }
}
