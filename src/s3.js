(function(exports) {

    class S3 {
        constructor(opts={}) {
            this.AWS = opts.AWS;
            if (!this.AWS) {
                throw new Error("AWS is required");
            }
            this.appId = opts.appId || '731506077677049';
            this.region = opts.region || 'us-west-1';
            this.roleArn = opts.roleArn ||
                'arn:aws:iam::870712634613:role/oya-tag-fb-s3-role';
            this.bucketName = opts.bucketName || 'oya-tag';
            this.bucket = new this.AWS.S3({
                params: {
                    Bucket: bucketName
                }
            });
            this.AWS.config.region = this.region;
        }

        save(opts||{}) {
            var fname = opts.name || "oyatag.json";
            var userId = opts.userId || "test-user";
            var authApp = opts.authApp || "facebook";
            var body = opts.body || {data:null};
            var contentType = opts.contentType || "application/json";

            var pbody = (resolve, reject) => { try {
                var objKey = `${authApp}-${userId}/${fname}`;
                var params = {
                    Key: objKey,
                    ContentType: contentType,
                    Body: body,
                    ACL: 'public-read'
                };
                bucket.putObject(params, function (err, data) {
                    if (err) {
                        console.error(err);
                        reject(err);
                    } else {
                        console.log(`s3.bucket.putObject`, data);
                        resolve({
                            data,
                        });
                        //listObjs();
                    }
                });
            } catch(e) { reject(e); }};
            return new Promise(pbody);
        }

    } // class S3

    module.exports = exports.S3 = S3;
})(typeof exports === "object" ? exports : (exports = {}));

/*
        var fbUserId;
        var bucket = new AWS.S3({
            params: {
                Bucket: bucketName
            }
        });
        var fileChooser = document.getElementById('file-chooser');
        var button = document.getElementById('upload-button');
        var results = document.getElementById('results');
        button.addEventListener('click', function () {
            var file = fileChooser.files[0];
            if (file) {
                results.innerHTML = '';
                //Object key will be facebook-USERID#/FILE_NAME
                var objKey = 'facebook-' + fbUserId + '/' + file.name;
                var params = {
                    Key: objKey,
                    ContentType: file.type,
                    Body: file,
                    ACL: 'public-read'
                };
                bucket.putObject(params, function (err, data) {
                    if (err) {
                        results.innerHTML = 'ERROR: ' + err;
                    } else {
                        listObjs();
                    }
                });
            } else {
                results.innerHTML = 'Nothing to upload.';
            }
        }, false);
        function listObjs() {
            var prefix = 'facebook-' + fbUserId;
            bucket.listObjects({
                Prefix: prefix
            }, function (err, data) {
                if (err) {
                    results.innerHTML = 'ERROR: ' + err;
                } else {
                    var objKeys = "";
                    data.Contents.forEach(function (obj) {
                        objKeys += obj.Key + "<br>";
                    });
                    results.innerHTML = objKeys;
                }
            });
        }
        /*!
         * Login to your application using Facebook.
         * Uses the Facebook SDK for JavaScript available here:
         * https://developers.facebook.com/docs/javascript/gettingstarted/
         */
        window.fbAsyncInit = function () {
          console.log(`dbg fbAsyncInit()`);
          try {
            FB.init({
                appId: appId,
                status: false,
            });
            console.log(`dbg FB.init() ok`);
            FB.login(function (response) {
              console.log(`dbg FB.login()`, response);
                bucket.config.credentials = new AWS.WebIdentityCredentials({
                    ProviderId: 'graph.facebook.com',
                    RoleArn: roleArn,
                    WebIdentityToken: response.authResponse.accessToken
                });
                fbUserId = response.authResponse.userID;
                button.style.display = 'block';
            });
            console.log(`dbg FB.fbAsyncInit() done`);
          } catch(e) {
            console.error(`dbg fbAsyncInit failed`, e.message);
          }
        };
         // Load the Facebook SDK asynchronously
        (function (d, s, id) {
            var js, fjs = d.getElementsByTagName(s)[0];
            if (d.getElementById(id)) {
                return;
            }
            js = d.createElement(s);
            js.id = id;
            js.src = "//connect.facebook.net/en_US/all.js";
            fjs.parentNode.insertBefore(js, fjs);
        }(document, 'script', 'facebook-jssdk'));
*/
