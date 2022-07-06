import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { JwtHelperService } from '@auth0/angular-jwt';
import { Observable, catchError, throwError } from 'rxjs';
import { tap } from 'rxjs/operators';
import { LoginResponseI } from 'src/app/model/login-response.interface';
import { UserI } from 'src/app/model/user.interface';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(
    private http: HttpClient,
    private snackbar: MatSnackBar,
    private jwtService: JwtHelperService,
    ) { }

  login(user: UserI): Observable<LoginResponseI> {
    return this.http.post<LoginResponseI>('api/users/login', user).pipe(
      tap((res: LoginResponseI) => localStorage.setItem('nestjs_chat_app', res.access_token)),
      tap(() => this.snackbar.open('Login Successfull', 'Close', {
        duration: 2000, horizontalPosition: 'right', verticalPosition: 'top'
      })),
      catchError(e => {
        this.snackbar.open(`Login failed, due to: ${e.error.message}`, 'Close', {
          duration: 5000, horizontalPosition: 'right', verticalPosition: 'top'
        })
        return throwError(() => e);
      })
    );
  }

  getLoggedInUser() {
    const decodedToken = this.jwtService.decodeToken();
    return decodedToken.user;
  }
}