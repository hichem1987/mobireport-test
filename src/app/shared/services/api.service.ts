import { Injectable } from '@angular/core';
import { Signalement } from '../models/signalement';
import { Observation } from '../models/observation';
import { Observable, throwError, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import {
  HttpClient,
  HttpHeaders,
  HttpErrorResponse,
} from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  endpoint: string = 'https://mobireport-test.herokuapp.com/api';
  headers = new HttpHeaders().set('Content-Type', 'application/json');

  constructor(private http: HttpClient) {}

  // ajouter signalement
  creerSignalement(data: Signalement): Observable<any> {
    let API_URL = `${this.endpoint}/add-signalement`;
    return this.http.post(API_URL, data);
  }

  // Get all signalements
  getSignalements() {
    return this.http.get(`${this.endpoint}`);
  }

  // Get signalement
  getSignalement(id): Observable<Partial<Signalement>> {
    let API_URL = `${this.endpoint}/read-signalement/${id}`;
    return this.http.get(API_URL, { headers: this.headers }).pipe(
      map((res: Partial<Signalement>) => {
        return res || {};
      }),
      catchError(this.errorMgmt)
    );
  }

  // Update signalement
  modifierSignalement(id, data): Observable<any> {
    let API_URL = `${this.endpoint}/update-signalement/${id}`;
    return this.http.put(API_URL, data, { headers: this.headers });
  }

  // Delete signalement
  supprimerSignalement(id): Observable<any> {
    var API_URL = `${this.endpoint}/delete-signalement/${id}`;
    return this.http.delete(API_URL).pipe(catchError(this.errorMgmt));
  }

  // Error handling
  errorMgmt(error: HttpErrorResponse) {
    let errorMessage = '';
    if (error.error instanceof ErrorEvent) {
      // Get client-side error
      errorMessage = error.error.message;
    } else {
      // Get server-side error
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
    }
    console.log(errorMessage);
    return throwError(() => {
      return errorMessage;
    });
  }
  // getting observations list
  getObservations(): Observable<Observation[]> {
    return this.http.get<Observation[]>(`${this.endpoint}/observations`);
  }
}
