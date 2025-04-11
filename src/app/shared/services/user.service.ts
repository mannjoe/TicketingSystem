import { inject, Injectable } from "@angular/core";
import { ApiService } from "./api.service";
import { joinUrl } from "@utils/url.util";
import { environment } from "@environments/environment";
import { Observable } from "rxjs";

@Injectable({ providedIn: 'root' })
export class UserService {
  apiService: ApiService = inject(ApiService);

  getUserByUsername(username: string) {
    return this.apiService.get(joinUrl(environment.apiUrl, `users/by-username/${username}`));
  }

  getAllUsers(): Observable<any> {
    return this.apiService.get(joinUrl(environment.apiUrl, 'users'));
  }

  getActiveUsers(): Observable<any> {
    return this.apiService.get(joinUrl(environment.apiUrl, 'users/active'));
  }

  getAllRoles(): Observable<any> {
    return this.apiService.get(joinUrl(environment.apiUrl, 'users/roles'))
  }

  updateUser(values: any): Observable<any> {
    return this.apiService.put(joinUrl(environment.apiUrl, `users/${values.username}`), values);
  }
}