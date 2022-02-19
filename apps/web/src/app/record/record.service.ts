import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class RecordService {

  constructor(private http: HttpClient) { }

  postBlob(data: any) {
    return this.http.post('/api/blob', data)
  }
}
