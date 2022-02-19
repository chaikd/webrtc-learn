import { RecordService } from './record.service';
import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { RtcService } from '../services/rtc.service';

@Component({
  selector: 'webrtc-record',
  templateUrl: './record.component.html',
  styleUrls: ['./record.component.scss']
})
export class RecordComponent implements OnInit {

  localStream: any
  streamType: 'camera' | 'screen' = 'camera'
  @ViewChild('video') video: ElementRef | any
  @ViewChild('player') player: ElementRef | any
  recorder: any
  isRecording: 'recording' | 'inactive' | 'over' = 'inactive'
  downloading = false
  playing = false
  

  constructor(
    private rtcService: RtcService,
    private recordService: RecordService
  ) { }

  ngOnInit(): void {
    this.getStream()
  }

  async getStream(streamType?: any) {
    if ((streamType || this.streamType) === 'camera') {
      this.rtcService.getUserMedia({
        video: true,
        audio: true
      }).then(stream => {
        if (this.localStream) {
          this.localStream.getTracks().forEach((track: any) => {
            track.stop()
          })
        }
        this.localStream = stream
        this.video.nativeElement.muted = true
      })
      this.streamType = streamType ? streamType : this.streamType
    } if ((streamType || this.streamType) === 'screen') {
      let audioStream, screenStream, error
      try {
        audioStream = await this.rtcService.getUserMedia({audio: true})
        screenStream = await this.rtcService.getDisplayMedia()
      } catch (err) {
        error = err
      }
      if (!error) {
        if (this.localStream) {
          this.localStream.getTracks().forEach((track: any) => {
            track.stop()
          })
        }
        screenStream.addTrack(audioStream.getTracks()[0])
        this.localStream = screenStream
        this.video.nativeElement.muted = true
        this.streamType = streamType ? streamType : this.streamType
      }
    }
  }

  recordStart() {
    this.recorder = new MediaRecorder(this.localStream)
    this.recorder.ondataavailable = (blob: any) => {
      const url = URL.createObjectURL(blob.data)
      this.player.nativeElement.src=url
      this.PostBlob(blob.data)
    }
    this.recorder.start()
    this.isRecording = 'recording'
  }

  recordStop() {
    this.recorder.stop()
    this.isRecording = 'over'
    if (this.localStream) {
      this.localStream.getTracks().forEach((track: any) => {
        track.stop()
      })
    }
  }

  reRecord() {
    this.isRecording = 'inactive'
    this.recorder = undefined
    this.getStream('camera')
  }

  download() {
    if(this.downloading) return
    this.downloading = true
    const a = document.createElement('a');
    a.href = this.player.nativeElement.src;
    a.style.display = 'none';
    a.download = 'local.mp4';
    a.click();
    this.downloading = false;
  }

  play() {
    this.player.nativeElement.play()
  }

  playStop() {
    this.player.nativeElement.pause()
    this.playing = false
  }

  onPlay() {
    this.playing = true
  }

  onPause() {
    this.playing = false
  }

  PostBlob(blob: any) {
    // this.recordService.postBlob({blob}).subscribe((res: any) => {
    //   console.log(res)
    // })


    // const video = document.createElement('video');
    // video.controls = true;

    // const source = document.createElement('source');
    // source.src = URL.createObjectURL(blob);
    // source.type = 'video/mp4; codecs=mpeg4';

    // const a = document.createElement('a');
    // a.href = source.src;
    // a.download = 'Play mp4 in VLC Player.mp4'
    // a.style.display = 'none';
    // // a.download = 'local.webm';
    // a.click();
    // video.appendChild(source);

    // video['download'] = 'Play mp4 in VLC Player.mp4';

    // document.appendChild(document.createElement('hr'));
    // const h2 = document.createElement('h2');
    // h2.innerHTML = '<a href="' + source.src + '" target="_blank" download="Play mp4 in VLC Player.mp4" style="font-size:200%;color:red;">Download Converted mp4 and play in VLC player!</a>';
    // document.appendChild(h2);
    // h2.style.display = 'block';
    // document.appendChild(video);

    // video.tabIndex = 0;
    // video.focus();
    // video.play();

    // document.querySelector('#record-video').disabled = false;
  }

}
