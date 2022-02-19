import { Injectable, OnInit } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class RtcService {

  // PeerConnection = window.RTCPeerConnection || window.mozRTCPeerConnection || window.webkitRTCPeerConnection;
  // SessionDescription = window.RTCSessionDescription || window.mozRTCSessionDescription || window.webkitRTCSessionDescription;

  videoConstraint = { frameRate: { ideal: 10, max: 15 } }

  constructor() {
    this.setGetUserMediaFn()
  }

  getUserMedia(constraints: any): Promise<any> {
    return navigator.mediaDevices.getUserMedia(constraints)
  }

  getDisplayMedia() {
    return (navigator.mediaDevices as any).getDisplayMedia()
  }

  setGetUserMediaFn() {
    if (!navigator.mediaDevices) {
      (navigator.mediaDevices as any) = {};
    }

    // 一些浏览器部分支持 mediaDevices。我们不能直接给对象设置 getUserMedia
    if (navigator.mediaDevices.getUserMedia === undefined) {
      navigator.mediaDevices.getUserMedia = function (constraints) {

        // 首先，如果有getUserMedia的话，就获得它
        // const getUserMedia = navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
        let getUserMedia: any;
        if (!getUserMedia) {
          return Promise.reject(new Error('getUserMedia is not implemented in this browser'));
        }

        return new Promise(function (resolve, reject) {
          getUserMedia.call(navigator, constraints, resolve, reject);
        });
      }
    }
  }

  setupPeerConnection() {
    const configuration = {
        // 'iceServers': [{}]
      }
    const theConnection = new RTCPeerConnection(configuration)
    return Promise.resolve(theConnection)
  }

  getVideoStream(type: 'camera' | 'display', constraints?: any): Promise<any> | undefined {
    if (type === 'camera') {
      constraints = constraints ? constraints :{
        video: { frameRate: { ideal: 10, max: 15 } }
      }
      return this.getUserMedia(constraints)
    } else {
      return this.getDisplayMedia()
    }
  }

  getAudioStream() {
    return this.getUserMedia({audio: true})
  }

  async addAudioStream(stream: any) {
    const audioStream = await this.getAudioStream()
    stream.addTrack(audioStream.getTracks()[0])
    return stream
  }

  async removeAudioStream(stream: any) {
    const audioTrack = stream.getTracks().find((v: any) => v.kind === 'audio')
    stream.removeTrack(audioTrack)
    return stream
  }

  closeStream(stream: any) {
    stream.getTracks().forEach((track: any) => {
      track.stop()
    })
  }

}
