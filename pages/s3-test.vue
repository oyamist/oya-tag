<template>
  <div>
    <!--script src="/lib/aws-sdk-2.715.0.min.js"></script-->
    AWS[{{!!AWS}}]<div v-if="AWS">ok</div>
    <input type="file" id="file-chooser" />
    <button id="upload-button" style="display:none">Upload to S3</button>
    <div id="results"></div>
    <div id="fb-root"></div>
    <script v-if="AWS" type="text/javascript">
        var appId = '731506077677049';
        var roleArn = 'arn:aws:iam::870712634613:role/oya-tag-fb-s3-role';
        var bucketName = 'oya-tag';
        AWS.config.region = 'us-west-1';
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
                console.log(`dbg file.type`, file.type);
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
    </script>
  </div>
</template>

<script>
import Vue from "vue";

  export default {
    name: "s3-test",
    props: {
    },
    data: () => ({
      AWS: null,
    }),
    methods: {
    },
    computed: {
    },
    mounted() {
      setTimeout(()=>{
        console.log(`dbg aws`, window.AWS);
        Vue.set(this, "AWS", window.AWS);
      }, 1000);
    },
  }
</script>
<style scoped>
</style>
