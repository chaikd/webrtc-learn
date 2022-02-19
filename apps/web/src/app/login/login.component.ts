import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Route, Router } from '@angular/router';

@Component({
  selector: 'webrtc-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  userName = ''
  roomId = ''
  errorInput = false

  @ViewChild('name') name: any
  @ViewChild('room') room: any
  constructor(
    private router: Router
  ) { }

  ngOnInit(): void {
  }

  joinLive() {
  }

  joinMeeting() {
    this.inputvalid()
    if (this.userName && this.roomId) {
      this.router.navigate([`/meeting/${this.room.value}/${this.name.value}`])
    }
  }

  inputvalid() {
    this.name.control.markAsTouched()
    this.room.control.markAsTouched()
  }

}
