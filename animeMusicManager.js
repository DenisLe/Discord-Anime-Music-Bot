const sqlite3 = require('sqlite3').verbose();

class animeMusicManager{
    constructor(){
    }


    //queryAnilist();
    //queryDatabase();
    
    
    // Queries Anilist with TheXinTin
    static async queryAnilist(name){

        // Here we define our query as a multi-line string
        // Storing it in a separate .graphql/.gql file is also possible
        var query = `
            query ($userName: String) {
            MediaListCollection(userName: $userName, type: ANIME, status_in: [COMPLETED, CURRENT]) {
            lists { 
                entries {
                id,
                score,
                status,
                repeat,
                priority,
                media{
                    averageScore
                    title {
                    romaji
                    english
                    }
                }
                }
            }
            }
        }
        `;
    
        // Define our query variables and values that will be used in the query request
        var variables = {
            userName: name
        };

        // Define the config we'll need for our Api request
        var url = 'https://graphql.anilist.co',
            options = {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                body: JSON.stringify({
                    query: query,
                    variables: variables
                }) 
            };

        // Make the HTTP Api request
        let data = await fetch(url, options).then(this.handleResponse)
                        .then(data => {return data;})
                        .catch(this.handleError);

        //console.log(data)
        return data;
    }
    
    //Handles response from fetch query
    static handleResponse(response) {
        return response.json().then(function (json) {
            return response.ok ? json : Promise.reject(json);
        });
    }
    
    //Handles data returned from fetch
    static handleData(data) {
        return data;
    }
    
    //Error
    static handleError(error) {
        //alert('Error, check console');
        console.error(error);
    }
    
    static parseData(data){

        const titles = [];

        if(data == undefined || data == null){
            return null
        }
        
        const lists = data.data.MediaListCollection.lists;
    
        for (var i = 0; i < lists.length; i++){
    
            const animeEntries = data.data.MediaListCollection.lists[i].entries;
            var title = "";
    
            for (var x = 0; x < animeEntries.length; x++){
    
                title = animeEntries[x].media.title.english;
    
                if (title === null){
                    title = animeEntries[x].media.title.romaji;
                }
                
                let newTitle = title.replace("‘", "'");                               
                let newTitle2 = newTitle.replace("’", "'")
                let newTitle3 = newTitle2.replace(/\'/g,"''")
                titles.push("'" + newTitle3 + "'");

                //titles.push("'" + title + "'");
                
                
                //console.log(title);
            }
        }
    
        //const shortList = this.randomSelection(this.count, titles)

        return titles;
        //queryDatabase(shortList);
    }

    static randomSelection(num, originalArray){
        //let newArr = [];
        if (num >= originalArray.length) {
          return originalArray;
        }

        const shuffled = originalArray.sort(() => 0.5 - Math.random());
        let selected = shuffled.slice(0,num);

        //for (let i = 0; i < num; i++) {
        //  let newElem = originalArray[Math.floor(Math.random() * originalArray.length)];
        //  newArr.push(newElem);
        //}
        return selected;
    }
    
    //Query Database with data from Anilist
    static async queryDatabase(list){

        return await new Promise((resolve, reject) => {
            const songLinks = [];

            let db = new sqlite3.Database('./Enhanced-AMQ-Database.db', sqlite3.OPEN_READWRITE, (err) => {
                if (err) {
                  console.error(err.message);
                }
                console.log('Connected to the WCZ Purgatorium.');
              });
        
        
            //let placeholders = list.map((l) => '(?)').join(',');
            //let sql = 'INSERT INTO temporary(Name) VALUES ' + placeholders;
        
            let whereQuery = list.map((l) => l).join(" OR animeENName = ");
            whereQuery = "animeENName = " + whereQuery;
        
            db.serialize(() => {
                db.each(`SELECT animeENName name,
                                audio audio
                                FROM songsAnimes
                                WHERE ` + whereQuery + ` COLLATE NOCASE`, (err, row) => {
                                    if (err) {
                                        console.error(err.message);
                                        reject(err);
                                      }

                                      if(row !== undefined){
                                        songLinks.push(row);
                                        console.log(row.name + "\t" + row.audio);
                                      }
                                      resolve(songLinks);
                                });
                                
            });
        
            //return songLinks
        });
    }
}

module.exports = animeMusicManager;