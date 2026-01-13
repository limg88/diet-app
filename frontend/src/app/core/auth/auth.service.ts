import { Injectable, computed, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { tap } from 'rxjs/operators';

type LoginResponse = { accessToken: string };
type RegisterResponse = { id: string; email: string };

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly tokenKey = 'dietapp_token';
  private readonly _token = signal<string | null>(this.getStoredToken());
  readonly token = computed(() => this._token());
  readonly isAuthenticated = computed(() => Boolean(this._token()));

  constructor(private readonly http: HttpClient) {}

  login(email: string, password: string) {
    return this.http
      .post<LoginResponse>(`${environment.apiBaseUrl}/auth/login`, { email, password })
      .pipe(tap((response) => this.setToken(response.accessToken)));
  }

  register(email: string, password: string) {
    return this.http.post<RegisterResponse>(`${environment.apiBaseUrl}/auth/register`, {
      email,
      password,
    });
  }

  logout() {
    this.setToken(null);
  }

  private setToken(token: string | null) {
    if (token) {
      localStorage.setItem(this.tokenKey, token);
    } else {
      localStorage.removeItem(this.tokenKey);
    }
    this._token.set(token);
  }

  private getStoredToken() {
    return localStorage.getItem(this.tokenKey);
  }
}
