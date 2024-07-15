import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private http: HttpClient) {}

  url = "http://localhost:8765/api/users"
  tokenKey = "Bearer Token"
  private isLoggedIn = new BehaviorSubject<boolean>(this.isAuthenticated());  

  Login(user: {username: string, password: string}){
    let LoginUrl = `${this.url}/login`;
    return this.http.post(LoginUrl, user, {responseType: 'text'})
    .pipe(
      tap(token => {
        localStorage.setItem(this.tokenKey, token);
        this.isLoggedIn.next(true);
      })
    );
  }

  logout(){
    localStorage.clear();
    this.isLoggedIn.next(false);
  }

  Registrazione(user: {username: string,password: string, firstName: string, lastName: string, dateOfBirth: string, email: string, about: string, city:string}){
    return this.http.post(this.url, user)
  }

  getToken(){
    return localStorage.getItem(this.tokenKey);
  }

  isAuthenticated(): boolean {
    if (typeof localStorage === 'undefined') {
      return false;
    }
    return !!localStorage.getItem(this.tokenKey);
  }

  get isLoggedIn$() {
    return this.isLoggedIn.asObservable();
  }
}
