import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import * as queryString from 'query-string';
import { Router } from '@angular/router';
import { AngularFireAuth } from '@angular/fire/auth';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  isSignedIn = false;

  constructor(
    private http: HttpClient,
    private router: Router,
    private afAuth: AngularFireAuth
  ) {}

  async signIn() {
    const twitchSignin = () => {
      const twitchAuthParams = {
        client_id: environment.twitch.client_id,
        redirect_uri: environment.twitch.redirect_uri,
        response_type: 'code',
        scope:
          // tslint:disable-next-line:max-line-length
          'openid analytics:read:games bits:read channel:read:subscriptions user:edit user:edit:broadcast user:read:broadcast user:read:email chat:edit chat:read channel:moderate',
        claims: JSON.stringify({
          id_token: {
            email: null,
            sub: null
          },
          userinfo: {
            picture: null,
            preferred_username: null
          }
        })
      };

      const url =
        'https://id.twitch.tv/oauth2/authorize?' +
        queryString.stringify(twitchAuthParams, { encode: false });
      location.href = url;
    };

    try {
      const token = JSON.parse(localStorage.getItem('token'));
      if (!token) {
        return twitchSignin();
      }
      await this.afAuth.auth.signInWithCustomToken(token);
      if (this.verifyLocalStorage()) {
        this.router.navigate(['/dashboard']);
      }
    } catch (error) {
      console.error(error);
    }
  }

  async getTokens(code: string) {
    try {
      const response: any = await this.http
        .post(environment.api + 'auth/token', { code })
        .toPromise();
      localStorage.setItem('twitch', JSON.stringify(response.twitch));
      localStorage.setItem('token', JSON.stringify(response.token));
      this.isSignedIn = true;
      await this.afAuth.auth.signInWithCustomToken(response.token);
      if (this.verifyLocalStorage()) {
        this.router.navigate(['/dashboard']);
      }
      return response;
    } catch (error) {
      console.error('Failed to get tokens', error.message);
    }
  }

  verifyLocalStorage() {
    try {
      const {
        access_token,
        expires_in,
        id_token,
        refresh_token,
        scope,
        token_type,
        userId
      } = JSON.parse(localStorage.getItem('twitch'));
      const token = JSON.parse(localStorage.getItem('token'));
      return (
        access_token &&
        expires_in &&
        id_token &&
        refresh_token &&
        scope &&
        token_type &&
        userId &&
        token_type &&
        token
      );
    } catch (e) {
      return false;
    }
  }

  async refreshToken() {
    const twitch = JSON.parse(localStorage.getItem('twitch'));
    const response = await this.http
      .post(environment.api + 'auth/refresh', {
        refresh_token: twitch.refresh_token
      })
      .toPromise();
    localStorage.setItem('twitch', { ...twitch, ...response });
    return response;
  }

  isExpired(): boolean {
    try {
      const { expires_in, issued_at } = JSON.parse(
        localStorage.getItem('twitch')
      );
      return issued_at + expires_in < Date.now();
    } catch (e) {
      throw new Error('Not signed in');
    }
  }

  updateSignedInStatus(): boolean {
    try {
      const { access_token, refresh_token } = JSON.parse(
        localStorage.getItem('twitch')
      );
      return access_token && refresh_token;
    } catch (e) {
      return false;
    }
  }
}
