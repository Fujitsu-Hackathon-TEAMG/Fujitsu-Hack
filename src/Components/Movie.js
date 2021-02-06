import React, { Component , Prompt } from "react";
import "video-react/dist/video-react.css"; // import css
import CssBaseline from '@material-ui/core/CssBaseline';
import Container from '@material-ui/core/Container';
import { withRouter } from 'react-router-dom'
import { Link } from 'react-router-dom'
import Typography from '@material-ui/core/Typography';
import * as faceapi from 'face-api.js';
import { createStyles, lighten, makeStyles, Theme } from '@material-ui/core/styles';

import { firestorage } from '../lib/firebase.js';
const {format} = require('util');

const classes = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
  },
  menuButton: {
    marginRight: theme.spacing(2),
  },
  title: {
    flexGrow: 1,
  },
  table: {
    minWidth: 650,
  },
}));

let FaceModel_loaded = false;
const SCORE_THRESHHOLD = 0.7;

async function setupModel(){
  try{
    await faceapi.nets.tinyFaceDetector.load("/");
    await faceapi.nets.faceLandmark68TinyNet.load("/");
    console.log("MODEL_SETUP_FINISH")
    FaceModel_loaded = true
  }catch(error){
    console.log("MODEL_SETUP_FAILED : ", error.message)
    return;
  };
}


class AppMovie extends Component {
  constructor(props) {
    super(props);
    this.u = "https://www.youtube.com/embed/"
    this.full_url = this.u+this.props.location.state.url.slice(17)+"?autoplay=1&mute=1"
    this.startTime = 0
    this.endTime = 0
    this.elapsedTime = 0
    this.state = {
      nowTime: '状態：アクティブかどうか判定します',
      capture_count: 0,
      look_count: 0,
    };

    this.video = document.getElementById('webcam');
    this.canvas = document.getElementById('snapshot');

    setupModel();

  }

  getTime(timelag = 0) {
    let japanTime = new Date().getTime()
    let nowTime = new Date(japanTime + timelag*60*60*1000)
    let year = nowTime.getFullYear()
    let month = nowTime.getMonth() + 1
    let date = nowTime.getDate()
    let hours = nowTime.getHours()
    let minutes = nowTime.getMinutes()
    let seconds = nowTime.getSeconds()

    if (hours < 10) hours = `0${hours}`
    if (minutes < 10) minutes = `0${minutes}`
    if (seconds < 10) seconds = `0${seconds}`

    const time = `${year}年 ${month}月 ${date}日 ${hours}:${minutes}:${seconds}`
    return time
    }
  winFocus(){
          window.focus();
      }
  componentWillMount(){
    window.addEventListener("blur", this.onblur,false)
    function winFocus(){
            window.focus();}
    /* ウィンドウの読み込み完了時 */
    window.onload=winFocus;
    /* ウィンドウからフォーカスが外れた時 */
    window.onblur=winFocus;
  }
  componentDidMount(){
    window.addEventListener("focus", this.onFocus,false)
    var snapshotCanvas = document.getElementById('snapshot');
    
    var video = document.getElementById('webcam');
    try{
      navigator.mediaDevices
      .getUserMedia({
        audio: false,
        video: true ,
        facingMode: "user",
      }).then((stream) => {
        video.srcObject = stream;
        video.play();
        setTimeout(() => {
          this.snapshot(video, snapshotCanvas, stream);
          //10秒に一回カウント
          this.intervalID = setInterval(() => {this.onTimerSnspshot(video, snapshotCanvas, stream)},10000,);
        }, 3000);
      });
    }catch(error){
      console.error('mediaDevice.getUserMedia() error:', error);
      return NaN;
    }
  }

  onFocus = (event) => {
    console.log("アクティぶ")
    this.endTime = Date.now();
    this.elapsedTime += (this.endTime-this.startTime)
    window.focus()
    this.setState({
      nowTime:this.getTime(0)+"  状態：アクティブです"
      });
  }

  onblur = (event) => {
    console.log("非アクティぶ")
    window.focus()
    this.setState({
        nowTime: this.getTime(0)+"  状態：非アクティブです"
         // 開始時
      });
    this.startTime = Date.now();
  }

  snapshot(video, canvas, stream){ 
  var ctx =  canvas.getContext('2d'); 
  canvas.width =video.videoWidth;
  canvas.height =video.videoHeight;
  var w = canvas.width;
  var h = canvas.height; 
  ctx.drawImage(video, 0, 0, w, h);

  console.log(w,h);

  // Create a root reference
  var storageRef = firestorage.ref();
  // Create a reference to 'mountains.jpg'
  var mountainsRef = storageRef.child('mountains.jpg');

  canvas.toBlob(function(blob) {
    var img = document.createElement('image');
    img.srcObject = stream;
    
    mountainsRef.put(blob).then(function(img) {
      console.log('Uploaded a blob or file!');
    });
  }, 'image/jpeg', 0.95); 
}

  onTimerSnspshot(video, canvas, stream){
  var txt = document.getElementById("text")
  var txt2 = document.getElementById("text2")
  canvas.width =video.videoWidth;
  canvas.height =video.videoHeight;
  var w = canvas.width;
  var h = canvas.height;
  //  webカメラの映像から顔認識を行う
  if(FaceModel_loaded){
  const useTinyModel = true;
  faceapi.detectSingleFace(
      video,
      new faceapi.TinyFaceDetectorOptions({
      inputSize: 160,
      scoreThreshold: SCORE_THRESHHOLD
      })
    ).withFaceLandmarks(useTinyModel)
    .then((detection)=>{
      this.setState( {capture_count: this.state.capture_count+1} );
      if(!detection){
        return
      }
      // 認識データをリサイズ
      const resizedDetection = faceapi.resizeResults(detection, {
        width: w,
        height: h,
      })

      
      var landmarks = resizedDetection.landmarks;
      
      var ns = landmarks.getNose()[3];
      var lo = landmarks.getJawOutline()[0];  //左頬
      var ro = landmarks.getJawOutline()[16]; //右頬

      var ln = Math.sqrt((lo.x-ns.x)**2+(lo.y-ns.y)**2);
      var rn = Math.sqrt((ro.x-ns.x)**2+(ro.y-ns.y)**2);

      if(Math.max(ln/rn, rn/ln)>3.3 || ln+rn<150){
      }else{
        this.setState( {look_count: this.state.look_count+1} );
      }

      // ランドマークをキャンバスに描画
      //faceapi.draw.drawDetections(canvas, resizedDetection);
    })/*.catch((error)=>{
      console.log("Detected Error : " + error.message)
    });*/
  }
}

  render() {
    //const play = (event) =>{
      //this.setState({
        //  nowTime: this.getTime(0)
        //});
      //};
    // ウィンドウがアクティブでなくなった際に実行する関数
    //const pause = (event) => {
      //this.setState({
        //  nowTime: this.getTime(0)
        //});
      //};
    		// 実行させる処理を記述
    // ウィンドウをフォーカスしたら指定した関数を実行
    //window.addEventListener('focus', play);
    // ウィンドウからフォーカスが外れたら指定した関数を実行
    //window.addEventListener('blur', pause);
    const push_tag = (event) => {
      const title    = 'お子さんが授業を終了しました';
      const options  = {
        body : 'お子さんが{授業名}の終了を始めました',
        icon : 'アイコン画像のパス',
        data : {foo : '任意のデータ'}
        };
      const notification = new Notification(title, options);
      notification.addEventListener('click', (event) => {
      console.dir(event);}, false);
      };

    return (
      <div>
      <Link to="/ChildPage" onClick={push_tag}><Typography variant="h6" className={classes.title} style={{margin:'auto',width:'250%',fontSize: "18px"}}>
        戻る
      </Typography></Link>
      <Typography variant="h6" className={classes.title} style={{margin:'auto',width:'250%',fontSize: "18px"}}>
        日時:{this.state.nowTime}　非アクティブだった合計時間(秒){this.elapsedTime/1000}
      </Typography>
      <CssBaseline/><Container>
        <iframe width="800" height="600" loading = "lazy" src={this.full_url} frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen>
        </iframe></Container>
        <Typography variant="h6" className={classes.title} style={{margin:'auto',width:'250%',fontSize: "18px"}}>
          (画面を見ている時間) {this.state.look_count} / {this.state.capture_count} (授業時間)
        </Typography>
        <video id="webcam" hidden></video>
        <canvas id="snapshot" hidden></canvas>
        </div>
    );
  }
}

export default withRouter(AppMovie);
