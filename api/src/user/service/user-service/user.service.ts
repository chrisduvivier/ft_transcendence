import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '@prisma/client';
import { IPaginationOptions, paginate, Pagination } from 'nestjs-typeorm-paginate';
import { AuthService } from 'src/auth/service/auth.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserEntity } from 'src/user/model/user.entity';
import { UserI } from 'src/user/model/user.interface';
import { Like, Repository } from 'typeorm';

const bcrypt = require('bcrypt');

@Injectable()
export class UserService {
	constructor(

		private prisma: PrismaService,
		private readonly authService: AuthService,

		@InjectRepository(UserEntity)
		private readonly userRepository: Repository<UserEntity>,
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

				// const user = await this.userRepository.save(this.userRepository.create(newUser));
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
			console.log("foundUser");
			console.log(foundUser);
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

	async 	findAll(options: IPaginationOptions): Promise<Pagination<UserI>> {
		return paginate<UserEntity>(this.userRepository, options);
	}

	async	findAllByUsername(username: string): Promise<User[]> {
		const user = await this.prisma.user.findMany({
			where: {
				username: { contains: `${username.toLowerCase()}` },
			},
		})
		return user;
		
		// return this.userRepository.find({
		// 	where: {
		// 		username: Like(`%${username.toLowerCase()}%`)	//lowercased, so it corresponds to how they are stored.
		// 	}
		// })
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
			  id: 1,
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
		// return (this.userRepository.findOne( {email}, {select: ['id', 'email', 'username', 'password']} ));
	}

	public getOne(id: number): Promise<User> {
		const user = this.prisma.user.findFirstOrThrow({
			where: {
				id: id,
			},
		})
		return user;
		// return this.userRepository.findOneOrFail({ id });
	}

	/* TODO: prevent user creation process when the username(unique) already exists, right now we only check the email 
		and calling with existing username crash server
	*/
	// private userExists(newUser: UserI): Observable<boolean> {
	// 	return from(this.userRepository.findOne({newUserusername})).pipe(
	// 		map((user: UserI) => {
	// 			if (user) { 
	// 				return true;
	// 			} else {
	// 				return false;
	// 			}
	// 		})
	// 	)
	// }

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