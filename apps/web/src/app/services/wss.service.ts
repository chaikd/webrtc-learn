import { Injectable } from '@angular/core';
import { io } from 'socket.io-client'

@Injectable({
  providedIn: 'root'
})
export class WssService {

  ws: any
  
  constructor() { }

  connect(option: {
    username: string,
    roomType: string,
  }) {
    this.ws = io("ws://localhost:3002/hello", {
      query: {
        room: this.route.snapshot.queryParams.id
      }
    })
    this.ws.onmessage = function (event: any) {
      console.log('message', event)
    }
    this.ws.on("connect", () => {
      console.log(this.ws.id);
    })
    this.ws.on("hello", (data: any) => {
      console.log('this.ws.id', data);
    })
  }


}
