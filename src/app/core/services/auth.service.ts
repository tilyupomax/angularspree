import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs/Observable';
import { Response } from '@angular/http';
import { HttpService } from './http';
import { AppState } from '../../interfaces';
import { Store } from '@ngrx/store';
import { AuthActions } from '../../auth/actions/auth.actions';
import { AuthService as OauthService } from 'ng2-ui-auth';

@Injectable()
export class AuthService {

  /**
   * Creates an instance of AuthService.
   * @param {HttpService} http
   * @param {AuthActions} actions
   * @param {Store<AppState>} store
   *
   * @memberof AuthService
   */
  constructor(
    private http: HttpService,
    private actions: AuthActions,
    private store: Store<AppState>,
    private oAuthService: OauthService
  ) {

  }

  /**
   *
   *
   * @param {any} data
   * @returns {Observable<any>}
   *
   * @memberof AuthService
   */
  login(data): Observable<any> {
    return this.http.post(
      'spree/login.json',
      { spree_user: data }
    ).map((res: Response) => {
      data = res.json();
      if (!data.error) {
        // Setting token after login
        this.setTokenInLocalStorage(data);
        this.store.dispatch(this.actions.loginSuccess());
      } else {
        this.http.loading.next({
          loading: false,
          hasError: true,
          hasMsg: 'Please enter valid Credentials'
        });
      }
      return data;
    });
    // catch should be handled here with the http observable
    // so that only the inner obs dies and not the effect Observable
    // otherwise no further login requests will be fired
    // MORE INFO https://youtu.be/3LKMwkuK0ZE?t=24m29s
  }

  /**
   *
   *
   * @param {any} data
   * @returns {Observable<any>}
   *
   * @memberof AuthService
   */
  register(data): Observable<any> {
    return this.http.post(
      'api/account',
      { spree_user: data }
    ).map((res: Response) => {
      data = res.json();
      if (!data.errors) {
        // Setting token after login
        this.setTokenInLocalStorage(res.json());
        this.store.dispatch(this.actions.loginSuccess());
      } else {
        this.http.loading.next({
          loading: false,
          hasError: true,
          hasMsg: 'Please enter valid Credentials'
        });
      }
      return res.json();
    });
    // catch should be handled here with the http observable
    // so that only the inner obs dies and not the effect Observable
    // otherwise no further login requests will be fired
    // MORE INFO https://youtu.be/3LKMwkuK0ZE?t=24m29s
  }



  forgetPassword(data): Observable<any> {
    return this.http.post(
      'api/passwords/#{data.id}',
      { spree_user: data }
    ).map((res: Response) => {
      data = res.json();
      if (!data.errors) {
        this.store.dispatch(this.actions.forgetPasswordSuccess());
      } else {
        this.http.loading.next({
          loading: false,
          hasError: true,
          hasMsg: 'enter valid email'
        });
      }
      return res.json();
    });
  }

  updatePassword(data): Observable<any> {
    console.log(data)
    return this.http.put(
      'api/passwords',
      { spree_user: data }
    ).map((res: Response) => {
      res.json();
    });
  }

  /**
   *
   *
   * @returns {Observable<any>}
   *
   * @memberof AuthService
   */
  authorized(): Observable<any> {
    return this.http
      .get('spree/api/v1/users')
      .map((res: Response) => res.json());
    // catch should be handled here with the http observable
    // so that only the inner obs dies and not the effect Observable
    // otherwise no further login requests will be fired
    // MORE INFO https://youtu.be/3LKMwkuK0ZE?t=24m29s
  }

  /**
   *
   *
   * @returns
   *
   * @memberof AuthService
   */
  logout() {
    return this.http.get('spree/logout.json')
      .map((res: Response) => {
        // Setting token after login
        localStorage.removeItem('user');
        this.store.dispatch(this.actions.logoutSuccess());
        return res.json();
      });
  }

  /**
   *
   *
   * @private
   * @param {any} user_data
   *
   * @memberof AuthService
   */
  private setTokenInLocalStorage(user_data): void {
    const jsonData = JSON.stringify(user_data);
    localStorage.setItem('user', jsonData);
  }

  socialLogin(provider: string) {
    return this.oAuthService.authenticate(provider).map((res: Response) => {
      this.setTokenInLocalStorage(res);
      return res;
    }).catch((res: Response) => {
      this.http.loading.next({
        loading: false,
        hasError: true,
        hasMsg: `Could not login with ${provider}. Error: ${res}`
      });
      return Observable.of('Social login failed');
    });
  }
}
