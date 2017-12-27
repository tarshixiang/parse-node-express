let express = require('express');
let path = require('path');
let favicon = require('serve-favicon');
let logger = require('morgan');
let cookieParser = require('cookie-parser');
let bodyParser = require('body-parser');
let ParseServer = require('parse-server').ParseServer;
let ParseDashboard = require('parse-dashboard');
let Parse = require('parse/node');

const https = require('https');
const nodemailer = require('nodemailer');

let rp = require('request-promise');
let timers = require('timers');


let index = require('./routes/index');
let users = require('./routes/users');

let app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

let api = new ParseServer({
  databaseURI: 'mongodb://localhost:27017/test', // Connection string for your MongoDB database
  appId: '123',
  masterKey: '123456', // Keep this key secret!
  serverURL: 'http://localhost:1337/parse' // Don't forget to change to https if needed
});

let dashboard = new ParseDashboard({
  "apps": [
    {
      "serverURL": "http://localhost:1337/parse",
      "appId": "123",
      "masterKey": "123456",
      "appName": "MyApp"
    },
  ],
  "users": [
    {
      "user": 'admin',
      "pass": '123456'
      }
    ]
});
Parse.initialize('123', '', '123456');
Parse.serverURL = 'http://localhost:1337/parse';
// Serve the Parse API on the /parse URL prefix
app.use('/parse', api);
app.use('/dashboard', dashboard);
app.listen(1337, function() {
  console.log('parse-server-example running on port 1337.');
});

app.use('/', index);
app.use('/users', users);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  let err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

let serverDog = function(cb) {
  https.get('https://aapi.xiaoiron.com/v1', (res) => {
    cb(null, res.statusCode)
  }).on('error', (e) => {
    cb(e, null)
  });
}

let send = function() {
  const transporter = nodemailer.createTransport({
    service: 'qq',
    port: 465, // SMTP 端口
    secureConnection: true, // 使用 SSL
    auth: {
        user: '785263824@qq.com',
        //这里密码不是qq密码，是你设置的smtp密码
        pass: 'vugsdxerpkdybefd'
    }
  });
  const mailOptions = {
      from: '785263824@qq.com', // 发件地址
      to: '785263824@qq.com', // 收件列表
      subject: '小铁蹦掉了啊', // 标题
      //text和html两者只支持一种
      text: '崩瞎卡拉卡！！！！', // 标题
      html: '<b>崩瞎卡拉卡！！！！</b>' // html 内容
  };
  // send mail with defined transport object
  transporter.sendMail(mailOptions, function(error, info){
      if(error){
          return console.log(error);
      }
      console.log('Message sent: ' + info.response);
      var Dog = Parse.Object.extend("Dog");
      var dog = new Dog();
      dog.set("desc", '小铁蹦掉了');
      dog.save(null, {
        success: function(dog) {
          console.log('New object created with objectId: ' + dog.id);
        },
        error: function(dog, error) {
          console.log('Failed to create new object, with error code: ' + error.message);
        }
      });
  });
}
let sendMssage = function() {
  let i = 1;
  let timer = timers.setInterval(function(){
    i++;
    serverDog(function(err, data) {
      if(err){
        send();
        timers.clearInterval(timer);
        return ;
      }
    });
  }, 1000*60*30);
}
sendMssage();
module.exports = app;
