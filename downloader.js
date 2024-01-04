const fs = require('fs');
var https = require('https');

downloader();



async function fetchUrl(){

    var pagenum = 1;
    var data = []

    var AUTH_TOKEN = "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"
    
    while (pagenum < 10){

    
        var url = 'https://api.github.com/users/blissfulyoshi/gists?page=' + pagenum,
        options = {
            //method: 'POST',
            headers: {
                //'Content-Type': 'application/json',
                //'Accept': 'application/json',
                'Authorization': 'token ' + AUTH_TOKEN
            },
        };

        let datapart = await fetch(url, options).then(response => {

        // Success
        if (response.ok)
          return response.json(); // Returns to then()
      
        // Error
        return Promise.reject(response);
      
      }).then(data => {
            return data;
    
          //console.log(data[0].files)
      
          //for(var file in data[0].files){
      
              //var raw_url = data[0].files[file].raw_url;
              //var filename = data[0].files[file].filename;
              //var dir = "./gists";
      
              //console.log( "downloading... " + filename);
      
              //downloadFile(raw_url, dir + '/' + filename)
              //https.get(raw_url, rsp => rsp.pipe(fs.createWriteStream( dir + '/' + filename )));
          //}
          //data.forEach(element => {
          //    console.log(element.files);
          //});
          //gists = JSON.parse(data);
          //console.log(gists);
      }).catch(err => {
          console.error(err); // Error
      });
      console.log("Page " + pagenum + " done.");
      if(datapart.length == 0){
        console.log("Empty Data at " + pagenum);

      }
      pagenum += 1;
      data = data.concat(datapart);
    }

  return data;
}

async function downloader(){
    const data = await fetchUrl();
    //console.log(data);
    for(let i = 0; i < data.length; i++){
        for(var file in data[i].files){
  
            var raw_url = data[i].files[file].raw_url;
            var filename = data[i].files[file].filename.replace(/\s|:/g,'');
            var dir = "./gists";
            
            if(!filename.includes("Ranked")){
                continue;
            }

            //console.log( "Downloading... " + filename + " at " + raw_url);
    
            downloadFile(raw_url, dir + '/' + filename)
        }
    }

}

async function downloadFile (url, file) {  
    let localFile = fs.createWriteStream(file);
    const request = https.get(url, function(response) {
        var len = parseInt(response.headers['content-length'], 10);
        var cur = 0;
        var total = len / 1048576; //1048576 - bytes in 1 Megabyte

        response.on('data', function(chunk) {
            cur += chunk.length;
            showProgress(file, cur, len, total);
        });

        response.on('end', function() {
            localFile.close();
            console.log("Download complete");
        });

        response.pipe(localFile);
    });
}
function showProgress(file, cur, len, total) {
    console.log("Downloading " + file + " - " + (100.0 * cur / len).toFixed(2) 
        + "% (" + (cur / 1048576).toFixed(2) + " MB) of total size: " 
        + total.toFixed(2) + " MB");
}