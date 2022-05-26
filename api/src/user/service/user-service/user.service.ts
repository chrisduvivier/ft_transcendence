import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IPaginationOptions, paginate, Pagination } from 'nestjs-typeorm-paginate';
import { from, Observable } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { AuthService } from 'src/auth/service/auth.service';
import { UserEntity } from 'src/user/model/user.entity';
import { UserI } from 'src/user/model/user.interface';
import { Repository } from 'typeorm';

const bcrypt = require('bcrypt');

@Injectable()
export class UserService {
	constructor(
		@InjectRepository(UserEntity)
		private readonly userRepository: Repository<UserEntity>,
		private readonly authService: AuthService
	) {}

	create(newUser: UserI): Observable<UserI> {
		return this.mailExists(newUser.email).pipe(
			switchMap((exists: boolean) => {
				if (exists === false) {				//hash pass and create
					return this.hashPassword(newUser.password).pipe(
						switchMap((passwordHash: string) => {
							//overwrite the user password with the hash, to store ths hash in the db
							newUser.password = passwordHash;
							return from(this.userRepository.save(newUser)).pipe(
								switchMap((user: UserI) => this.findOne(user.id))
							);
						})
					)
				} else {
					throw new HttpException('Email is already in use', HttpStatus.CONFLICT);
				}
			})
		)
	}

	login(user: UserI): Observable<string> {
		return this.findByEmail(user.email).pipe(
			switchMap((foundUser: UserI) => {
				if (foundUser) {
					return this.validatePassword(user.password, foundUser.password).pipe(
						switchMap((res: boolean) => {
							if (res) {
								return this.findOne(foundUser.id).pipe(
									switchMap((payload: UserI) => this.authService.generateJwt(payload))
								)
							} else {
								throw new HttpException('Login was not successfull, wrong credentials', HttpStatus.UNAUTHORIZED);
							}
						})
					)
				} else {
					throw new HttpException('User not found', HttpStatus.NOT_FOUND);
				}
			})
		)
	}

	findAll(options: IPaginationOptions): Observable<Pagination<UserI>> {
		return from(paginate<UserEntity>(this.userRepository, options));
	}

	private hashPassword(password: string): Observable<string> {
		return this.authService.hashPassword(password);
	}

	private validatePassword(password: string, storedPassword: string): Observable<any> {
		return this.authService.comparePassword(password, storedPassword);
	}

	private findOne(id: number): Observable<UserI> {
		return from(this.userRepository.findOne({ id }));
	}

	private mailExists(email: string): Observable<boolean> {
		return from(this.userRepository.findOne({email})).pipe(
			map((user: UserI) => {
				if (user) { 
					return true;
				} else {
					return false;
				}
			})
		)
	}

	// returns password as well for authentication purpose
	private findByEmail(email: string): Observable<UserI> {
		return from(this.userRepository.findOne( {email}, {select: ['id', 'email', 'username', 'password']} ));
	}
}