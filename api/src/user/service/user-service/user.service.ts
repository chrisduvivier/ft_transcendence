import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { AuthService } from 'src/auth/service/auth.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { FindAllQueryParams } from 'src/user/model/dto/find-all-query-params.dto';
import { UserI } from 'src/user/model/user.interface';

const bcrypt = require('bcrypt');

@Injectable()
export class UserService {
	constructor(
		private prisma: PrismaService,
		private readonly authService: AuthService,
	) {}

	async create(newUser: UserI): Promise<User> {
		try {
			const exists: boolean = await this.mailExists(newUser.email);
			if (!exists) {
				const passwordHash: string = await this.hashPassword(newUser.password);
				newUser.password = passwordHash;

				const user = await this.prisma.user.create({
					data: {
						username: newUser.username,
						email: newUser.email,
						password: newUser.password,
					}
				})

				return this.findOne(user.id);
			} else {
				throw new HttpException('Email is already in use', HttpStatus.CONFLICT);
			}
		
		} catch {
			throw new HttpException('Email is already in use', HttpStatus.CONFLICT);
		}
	}

	async login(user: UserI): Promise<string> {

		try {
			const foundUser: UserI = await this.findByEmail(user.email.toLowerCase());
			if (foundUser) {
				const matches: boolean = await this.validatePassword(user.password, foundUser.password);
				if (matches) {
					const payload: User = await this.findOne(foundUser.id);
					return this.authService.generateJwt(payload);
				} else {
					throw new HttpException('Login was not successfull, wrong credentials', HttpStatus.UNAUTHORIZED);
				}
			} else {
				throw new HttpException('Login was not successfull, wrong credentials', HttpStatus.UNAUTHORIZED);
			}
		} catch {
			throw new HttpException('User not found', HttpStatus.NOT_FOUND);
		}
	}

	async 	findAll(params: FindAllQueryParams
    ): Promise<User[]> {
		const skip: number = Number(params.page);
		const take: number = Number(params.limit);
		return this.prisma.user.findMany({
			skip,
			take,
			orderBy: {
				id: 'asc'
			}
		});
	}

	async	findAllByUsername(username: string): Promise<User[]> {
		const user = await this.prisma.user.findMany({
			where: {
				username: { contains: `${username.toLowerCase()}` },
			},
		})
		return user;
	}

	private async hashPassword(password: string): Promise<string> {
		return this.authService.hashPassword(password);
	}

	private async validatePassword(password: string, storedPassword: string): Promise<any> {
		return this.authService.comparePassword(password, storedPassword);
	}

	private async findOne(id: number): Promise<User> {
		const user = await this.prisma.user.findUnique({
			where: {
			  id: id,
			},
		  })
		return user;
	}
	
	// returns password as well for authentication purpose
	private async findByEmail(email: string): Promise<User> {
		const user = await this.prisma.user.findUnique({
			where: {
			  email: email,
			},
			select: {
				id: true,
				email: true,
				username: true,
				password: true,
			}
		  })
		return user;
	}

	public getOne(id: number): Promise<User> {
		const user = this.prisma.user.findFirstOrThrow({
			where: {
				id: id,
			},
		})
		return user;
	}

	private async mailExists(email: string): Promise<boolean> {
		const user = await this.prisma.user.findUnique({
			where: {
				email: email,
			},
		});
		if (user) {
			return true;
		} else {
			return false;
		}
	}

}