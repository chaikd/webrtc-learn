import { Component, OnInit } from '@angular/core';
import { environment} from '../../environments/environment';

@Component({
  selector: 'webrtc-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  githubUrl = environment.githubUrl
  
  constructor() { }

  ngOnInit(): void {
  }

}
