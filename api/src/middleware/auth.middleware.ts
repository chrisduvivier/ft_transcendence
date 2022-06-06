import { HttpException, HttpStatus, Injectable, NestMiddleware, Request } from "@nestjs/common";
import { NextFunction } from "express";
import { map } from "rxjs";
import { AuthService } from "src/auth/service/auth.service";
import { UserI } from "src/user/model/user.interface";
import { UserService } from "src/user/service/user-service/user.service";

export interface RequestModel extends Request {
	user: UserI
}

@Injectable()
export class AuthMiddleware implements NestMiddleware {

	constructor(private authService: AuthService, private userService: UserService) { }

	async use(req: RequestModel, res: Response, next: NextFunction) {

		try {
			const tokenArray: string[] = req.headers['authorization'].split(' ');
			const decodedToken = await this.authService.verifyJwt(tokenArray[1]);

			// make sure that the user is not deleted, or the properties or rights did not changed compared to the time when the jwt was issued.
			const user: UserI = await this.userService.getOne(decodedToken.user.id)
			if (user) {
				// add the user to the Request for accessing later
				req.user = user;
				next();
			} else {
				throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
			}
		} catch {
			throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
		}
	}
}