import { Injectable } from '@angular/core';
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  intercept(req: HttpRequest<any>, next: HttpHandler) {

  const token = sessionStorage.getItem('token');
  const system = sessionStorage.getItem('system');

  let headers: any = {};

  if (system) headers['System'] = system;

  if (token && !req.url.includes('login_user.php')) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const cloned = req.clone({ setHeaders: headers });

  return next.handle(cloned);
}
}