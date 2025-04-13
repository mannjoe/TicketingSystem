import { inject, Injectable } from "@angular/core";
import { ApiService } from "./api.service";
import { joinUrl } from "@utils/url.util";
import { environment } from "@environments/environment";
import { Observable } from "rxjs";

@Injectable({ providedIn: 'root' })
export class TicketService {
  apiService: ApiService = inject(ApiService);

  getAllStatuses(): Observable<any> {
    return this.apiService.get(joinUrl(environment.apiUrl, 'tickets/statuses'))
  }

  getAllTickets(): Observable<any> {
    return this.apiService.get(joinUrl(environment.apiUrl, 'tickets'))
  }

  createTicket(data: any): Observable<any> {
    return this.apiService.post(joinUrl(environment.apiUrl, 'tickets'), data);
  }

  updateTicket(code: string, data: any): Observable<any> {
    return this.apiService.put(joinUrl(environment.apiUrl, `tickets/${code}`), data);
  }

  getTicketByCode(code: string): Observable<any> {
    return this.apiService.get(joinUrl(environment.apiUrl, `tickets/by-code/${code}`));
  }

  getDropdownOptions(id: string): Observable<any> {
    return this.apiService.get(joinUrl(environment.apiUrl, `tickets/${id}/dropdown-options`));
  }
}
