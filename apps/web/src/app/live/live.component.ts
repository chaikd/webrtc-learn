import { ActivatedRoute, Router } from '@angular/router';
import { Component, OnDestroy, OnInit, ViewChild, ElementRef } from '@angular/core';
import { io } from 'socket.io-client'
import { RtcService } from '../services/rtc.service';
import { environment } from '../../environments/environment';

interface User {
  socketId?: any;
  peerconnection?: RTCPeerConnection;
  username?: string;
}

@Component({
  selector: 'webrtc-live',
  templateUrl: './live.component.html',
  styleUrls: ['./live.component.scss']
})
export class LiveComponent implements OnInit, OnDestroy {

  ws: any
  userList: Array<User> | any = []
  localStream: any
  currentUser: User = {}
  mediaConstraintsa: any
  isMeeting = false
  textMsg = ''
  msgList: Array<{
    msg?: string,
    time?: string,
    from?: string,
    socketId?: any
  }> = []
  @ViewChild('messageBox') messageBox: ElementRef | any
  isMute = true
  vType = 'camera'

  set _isMeeting(v: any) {
    this.isMeeting = v
    if(v) {
      this.connectAllPeer()
    } else {
      this.disconnectAllPeer()
    }
  }

  get _isMeeting() {
    return this.isMeeting
  }


  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private rtcService: RtcService
  ) { }

  ngOnInit(): void {
    this.clientWs()
  }

  ngOnDestroy(): void {
    this.leave()
    this.ws.disconnect()
    this.rtcService.closeStream(this.localStream)
  }

  clientWs() {
    const wsURL = environment.wsURL
    this.ws = io(`${wsURL}/meeting`, {
      query: {
        room: this.route.snapshot.params['id']
      }
    })
    this.ws.on("connect", () => {
      console.log('connected');
      this.currentUser.username = this.route.snapshot.params['username']
      this.send({
        type: 'login',
        username: this.currentUser.username
      })
    })
    this.ws.on('message', (res: any) => {
      switch(res.type){
        case 'talk':
          this.onTalk(res)
          break;
        case 'login':
          this.onLogin(res)
          break;
        case 'memberJoin':
          this.onMemberJoin(res)
          break
        case 'memberOut':
          this.onMemberOut(res)
          break;
        case 'leave':
          this.onLeave(res)
          break;
        case 'offer':
          this.onOffer(res)
          break;
        case 'answer':
          this.onAnswer(res)
          break;
        case 'candidate':
          this.oncandidate(res)
          break;
      }
    })
  }

  onTalk(res: any) {
    this.msgList.push(res)
    setTimeout(() => {
      this.msgScrollToBottom()
    }, 0);
  }

  async onLogin(res: any) {
    if (res.success) {
      const stream = await this.rtcService.getVideoStream('camera')
      this.localStream = stream
      this.currentUser = res.from
      this.userList = res.users
      this.msgList = res.messages
      this.setupAllPeerConnection(stream)
      this.send({
        type: 'memberJoin'
      })
    } else {
      alert('用户名已存在')
      this.router.navigateByUrl('/login')
    }
  }

  async onMemberJoin(res: any) {
    if(!this.localStream) {
      this.localStream = await this.rtcService.getVideoStream('camera')
    }
    const user = {
      ...res.user
    }
    user.peerconnection = await this.createPeerConnection(this.localStream, user)
    this.userList.push(user)
    if(this._isMeeting) {
      this.connectPeer(user)
    }
    // this.setMeetingState()
  }

  onMemberOut(res: any) {
    this.userList.forEach(async (user: any) => {
      if (user.socketId === res.from || this.currentUser.socketId === res.from) {
        if(user.peerconnection) {
          this.disconnectPeer(user)
        }
      }
    })
    // this.setMeetingState()
  }

  async onOffer(res: any) {
    const user = this.findUser(res.from)
    const peerconnection = user.peerconnection
    peerconnection.setRemoteDescription(new RTCSessionDescription(res.offer))
    peerconnection.createAnswer().then((answer: any) => {
      this.send({
        type: 'answer',
        answer,
        touser: user.username,
        socketId: user.socketId
      })
      peerconnection.setLocalDescription(answer)
    })
  }

  onAnswer(res: any) {
    const user = this.findUser(res.from)
    const peerconnection = user.peerconnection
    peerconnection.setRemoteDescription(new RTCSessionDescription(res.answer))
  }

  oncandidate(res: any) {
    const user = this.findUser(res.from)
    const peerconnection = user.peerconnection
    peerconnection.addIceCandidate(new RTCIceCandidate(res.candidate))
  }

  onLeave(res: any) {
    this.userList = this.userList.filter((user: any) => {
      return user.socketId !== res.from
    })
    // this.setMeetingState()
  }

  leave() {
    this.send({
      type: 'leave'
    })
    // if (this.localStream) {
    //   this.stopAllTrack()
    // }
    this._isMeeting = false
  }

  async setupAllPeerConnection(stream: any) {
    return new Promise((resolve, reject) => {
      this.userList.forEach(async (user: User, key: number) => {
        if (user.socketId === this.currentUser.socketId) return
        user.peerconnection = await this.createPeerConnection(stream, user)
        if (key === this.userList.length - 1) {
          console.log('this.userList.length: ', this.userList.length);
          resolve(true)
        }
      })
    })
  }

  joinMeeting() {
    this._isMeeting = true
  }

  async createPeerConnection(stream: any, user: any) {
    return this.rtcService.setupPeerConnection().then(peerconnection => {
      for (const track of stream.getTracks()) {
        peerconnection.addTrack(track, stream);
      }
      peerconnection.ontrack = e => {
        user.stream = e.streams[0]
      }
      peerconnection.onicecandidate = e => {
        if (e.candidate) {
          this.send({
            type: 'candidate',
            candidate: e.candidate,
            socketId: user.socketId
          })
        }
      }
      return peerconnection
    })
  }

  

  
  
  
  
  

  stopAllTrack() {
    this.rtcService.closeStream(this.localStream)
  }
  
  async openCam() {
    if(this.vType === 'display' && this.localStream) {
      this.stopAllTrack()
    }
    this.vType = 'camera'
    let stream = await this.rtcService.getVideoStream('camera')
    if (!this.isMute) {
      stream = await this.rtcService.addAudioStream(stream)
    }
    this.localStream = stream
    this.changeTrack()
  }

  changeTrack(cb?: any, isShare = false) {
    this.userList.forEach(async(user: any, key: number) => {
      const peerconnection = user.peerconnection
      if (isShare || peerconnection?.iceConnectionState === 'connected') {
        await this.setupAllPeerConnection(this.localStream)
        await this.connectPeer(user)
      }
      if (key === this.userList.length - 1) {
        if(cb) {
          cb()
        }
      }
    })
  }

  async shareScreen() {
    this.rtcService.getVideoStream('display')?.then(async (stream: any) => {
      stream.oninactive = () => {
        this.leave()
        this.openCam()
      }
      if (this.vType === 'camera' && this.localStream) {
        this.stopAllTrack()
      }
      if (this._isMeeting) {
        this._isMeeting = false
      }
      this.vType = 'display'
      if (!this.isMute) {
        stream = await this.rtcService.addAudioStream(stream)
      }
      this.localStream = stream
      this.changeTrack(() => {
        this._isMeeting = true
      }, true)
    }).catch((error: any) => {
      console.log(error)
    })
  }

  async switchMute() {
    this.isMute = !this.isMute
    if(this.isMute) {
      this.localStream = await this.rtcService.removeAudioStream(this.localStream)
    } else {
      this.localStream = await this.rtcService.addAudioStream(this.localStream)
    }
    this.changeTrack()
  }

  setMeetingState() {
    const joinUsers = this.userList.filter((user: any) => {
      return user.peerconnection && user.peerconnection.iceConnectionState === 'connected'
    })
    if (joinUsers.length === this.userList.length - 1) {
      this._isMeeting = true
    }
  }

  disconnectAllPeer() {
    this.userList.forEach(async (user: any) => {
      if (user.peerconnection) {
        this.disconnectPeer(user)
      }
    })
  }

  async disconnectPeer(user: any) {
    user.peerconnection.close()
    user.peerconnection = await this.createPeerConnection(this.localStream, user)
    user.stream = undefined
  }

  connectAllPeer() {
    this.userList.forEach((user: any) => {
      const peerconnection = user.peerconnection
      if (peerconnection) {
        this.connectPeer(user)
      }
    })
  }

  connectPeer(touser: any) {
    return touser.peerconnection?.createOffer().then((offer: any) => {
      this.send({
        type: 'offer',
        offer,
        touser: touser.username,
        socketId: touser.socketId
      })
      touser.peerconnection.setLocalDescription(offer)
    })
  }

  sendMsg(msg: any) {
    this.send({
      type: 'talk',
      msg
    }, () => {
      this.textMsg = ''
    })
  }

  msgScrollToBottom = () => {
    this.messageBox.nativeElement.scrollTop = this.messageBox.nativeElement.scrollHeight;
  }

  findUser(socketId: any) {
    return this.userList.find((v: any) => {
      return socketId === v.socketId
    })
  }

  send(msg: any, cb?: any) {
    this.ws.send(JSON.stringify(msg), cb)
  }

}
