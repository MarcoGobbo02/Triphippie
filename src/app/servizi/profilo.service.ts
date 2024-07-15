import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {jwtDecode}  from 'jwt-decode';
import { Observable } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class ProfiloService {

  constructor(private http: HttpClient) {}

  url = "http://localhost:8765/api/users"
  tokenKey = "Bearer Token"

  getIdFromToken(token: string) {
      const actualToken = token.replace('Bearer ', '');
      console.log(actualToken)
      const decodedToken: any = jwtDecode(actualToken);
      console.log(decodedToken)
      const userId = decodedToken['user-id'];
      return userId;
  }

  getUser(id: number){
    let IDUrl = `${this.url}/${id}`;
    return this.http.get(IDUrl)
  }

  deleteUser(id: number){
    let IDUrl = `${this.url}/${id}`;
    localStorage.clear();
    return this.http.delete(IDUrl)
  }

  editUser(id: number, user: {username: string,password: string, firstName: string, lastName: string, dateOfBirth: string, email: string, about: string, city:string}){
    let IDUrl = `${this.url}/${id}`;
    return this.http.put(IDUrl, user)
  }

  getPhoto(id: number): Observable<Blob> {
    let photourl = `${this.url}/${id}/profileImage`;
    return this.http.get(photourl, { responseType: 'blob' });
  }

  addPhoto(id: number, imageFile: File): Observable<any> {
    let photourl = `${this.url}/${id}/profileImage`;
    const formData = new FormData();
    formData.append('profileImage', imageFile);

    return this.http.post(photourl, formData);
  }

  editPhoto(id: number, imageFile: File): Observable<any> {
    let photourl = `${this.url}/${id}/profileImage`;
    const formData = new FormData();
    formData.append('profileImage', imageFile);

    return this.http.put(photourl, formData);
  }

  deletePhoto(id: number): Observable<any> {
    let photourl = `${this.url}/${id}/profileImage`;
    return this.http.delete(photourl);
  }
}
