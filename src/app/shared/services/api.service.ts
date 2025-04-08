import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root', // Provide the service at the root level
})
export class ApiService {
  constructor(private http: HttpClient) {}

  /**
   * Generic method to perform a GET request.
   * @param url The API endpoint URL.
   * @param headers Optional custom headers.
   * @returns An observable of the API response.
   */
  get<T>(url: string, headers?: HttpHeaders): Observable<T> {
    return this.http.get<T>(url, { headers }).pipe(
      catchError(this.handleError) // Handle errors
    );
  }

  /**
   * Generic method to perform a POST request.
   * @param url The API endpoint URL.
   * @param data The payload to send.
   * @param headers Optional custom headers.
   * @returns An observable of the API response.
   */
  post<T>(url: string, data: any, headers?: HttpHeaders): Observable<T> {
    return this.http.post<T>(url, data, { headers }).pipe(
      catchError(this.handleError) // Handle errors
    );
  }

  /**
   * Generic method to perform a PUT request.
   * @param url The API endpoint URL.
   * @param data The payload to send.
   * @param headers Optional custom headers.
   * @returns An observable of the API response.
   */
  put<T>(url: string, data: any, headers?: HttpHeaders): Observable<T> {
    return this.http.put<T>(url, data, { headers }).pipe(
      catchError(this.handleError) // Handle errors
    );
  }

  /**
   * Generic method to perform a DELETE request.
   * @param url The API endpoint URL.
   * @param headers Optional custom headers.
   * @returns An observable of the API response.
   */
  delete<T>(url: string, headers?: HttpHeaders): Observable<T> {
    return this.http.delete<T>(url, { headers }).pipe(
      catchError(this.handleError) // Handle errors
    );
  }

  /**
   * Handle HTTP errors.
   * @param error The HTTP error response.
   * @returns An observable with a user-facing error message.
   */
  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'An unknown error occurred!';
    if (error.error instanceof ErrorEvent) {
      // Client-side or network error
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Server-side error
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
    }
    console.error(errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}