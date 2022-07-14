import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { User } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateUserDto } from '../model/dto/create-user.dto';
import { FindAllQueryParams } from '../model/dto/find-all-query-params.dto';
import { LoginUserDto } from '../model/dto/login-user.dto';
import { LoginResponseI } from '../model/login-response.interface';
import { UserI } from '../model/user.interface';
import { UserHelperService } from '../service/user-helper/user-helper.service';
import { UserService } from '../service/user-service/user.service';

@Controller('users')
export class UserController {
	constructor(
		private userService: UserService,
		private userHelperService: UserHelperService,
		private prisma: PrismaService,
	) {}

	@Post()
	async create(@Body() createUserDto: CreateUserDto ): Promise<User> {
		const UserEntity: UserI = this.userHelperService.createUserDtoToEntity(createUserDto);
		return this.userService.create(UserEntity);
	}

	@Get()
	async findAll(
		@Query() queryParams: FindAllQueryParams
	): Promise<User[]> {
		queryParams.limit = queryParams.limit > 100 ? 100 : queryParams.limit;	 //set upper limit if more than 100
		return this.userService.findAll(queryParams);
	}

	@Get('/find-by-username')
	async findAllByUsername( @Query('username') username: string ){
		return this.userService.findAllByUsername(username);
	}


	@Post('login')
	async login(@Body() loginUserDto: LoginUserDto): Promise<LoginResponseI> {
		const user: UserI = this.userHelperService.loginUserDtoToEntity(loginUserDto);
		const jwt: string = await this.userService.login(user);
		return {
			accessToken: jwt,
			tokenType: 'JWT',
			expiresIn: 10000
		};
	}
}
