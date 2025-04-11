import { inject, Injectable } from "@angular/core";
import { ApiService } from "./api.service";
import { joinUrl } from "@utils/url.util";
import { environment } from "@environments/environment";
import { Observable } from "rxjs";

@Injectable({ providedIn: 'root' })
export class CustomerService {
  apiService: ApiService = inject(ApiService);

  getCustomerById(id: number) {
    return this.apiService.get(joinUrl(environment.apiUrl, `customers/by-id/${id}`));
  }
  
  getAllCustomers(): Observable<any> {
    return this.apiService.get(joinUrl(environment.apiUrl, 'customers'));
  }

  getAllTypes(): Observable<any> {
    return this.apiService.get(joinUrl(environment.apiUrl, 'customers/types'))
  }

  updateCustomer(values: any): Observable<any> {
    return this.apiService.put(joinUrl(environment.apiUrl, `customers/${values.id}`), values);
  }
}