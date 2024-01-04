const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, AttachmentBuilder } = require('discord.js');
//const { animeMusicManager } = require('animeMusicManager.js');
const sqlite3 = require('sqlite3').verbose();
const animeMusicManager = require('../../animeMusicManager');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('amq')
		.setDescription('Returns mp3s of anime songs from an Anilist of the provided username')
		.addStringOption(option =>
			option.setName("username")
			.setDescription("Anilist Username"))
		.addIntegerOption(option =>
			option.setName("min_int")
			.setDescription("Lower bound for difficulty. Default 20"))
		.addIntegerOption(option =>
			option.setName("max_int")
			.setDescription("Upper bound for difficulty. Default 100"))
		.addStringOption(option =>
			option.setName("anime_title")
			.setDescription("Anime Title"))
		.addIntegerOption(option =>
			option.setName("count")
			.setDescription("Number of songs to return")),
	async execute(interaction) {

		const username = interaction.options.getString("username") ?? "";
		const animeTitle = interaction.options.getString("anime_title") ?? "";
		const count = interaction.options.getInteger("count") ?? 10;
		const minInt = interaction.options.getInteger("min_int") ?? 20;
		const maxInt = interaction.options.getInteger("max_int") ?? 100;


		if (username != ""){

		
			const data = await animeMusicManager.queryAnilist(username);
			const titles = animeMusicManager.parseData(data);
			let whereQuery

			if(titles == null){
				interaction.reply("User not found.")
			}

			else if(titles.length > 0){
				await interaction.deferReply();

				const shortList = animeMusicManager.randomSelection(count, titles);

				let db = new sqlite3.Database('./Enhanced-AMQ-Database.db', sqlite3.OPEN_READWRITE, (err) => {
					if (err) {
					console.error(err.message);
					}
					console.log('Connected to the WCZ AniSong Database.');
				});
			
				if(animeTitle == ""){
					whereQuery = shortList.map((l) => l).join(" OR animeENName = ");
					whereQuery = "animeENName = " + whereQuery;			
					console.log(whereQuery);	
				}
				else{
					whereQuery = "animeENName LIKE '%" + animeTitle + "%'";
					console.log(whereQuery);
				}

		
				let rows = await new Promise((resolve, reject) =>			
					db.all(`SELECT animeENName name,
									audio audio,
									HQ HQ,
									MQ MQ,
									songName songName,
									songArtist songArtist,
									songType songType,
									songNumber songNumber,
									songDifficulty songDifficulty
									FROM songsAnimes
									WHERE ` + whereQuery + ` COLLATE NOCASE`, (err, rows) => {
										if (err) {
											console.error(err.message);
											reject(err);
										}
										else{
											resolve(rows);
										}
								
									}));
				//db.close();

					if((rows != null || rows != undefined) && rows.length > 0){

					
					console.log("User Query Successful");
					console.log("Row Count: " + rows.length);
					
					const test = rows.filter((row => row.songDifficulty > minInt));
					const test2 = test.filter((row => row.audio));

					//Testing shuffling list and slicing off count
					const shuffled = test2.sort(() => 0.5 - Math.random());
					console.log(shuffled.length);

					const selected = shuffled.slice(0,count);
					console.log(selected.length)

					for(let i = 0; i < selected.length; i++){

					}




					var item = test[Math.floor(Math.random()*test.length)];

					//
					while (item.audio == null){
						item = test[Math.floor(Math.random()*test.length)];
					}

					const button = new ButtonBuilder()
						.setLabel('mp3')
						.setURL(item.audio)
						.setStyle(ButtonStyle.Link);

					var videoLink = item.HQ != null ? item.HQ : item.MQ;
					var type;

					if(item.songType == 1){
						type = "OP" + item.songNumber;
					}
					else if(item.songType == 2){
						type = "ED "+ item.songNumber;
					}
					else{
						type = "IN"
					}

					const row = new ActionRowBuilder()
						.addComponents(button);

					await interaction.editReply({
						content: 	"From user: " + username + "\n" +
									"Anime Title: " + "||" + item.name + "|| " + "\n" +
									"Song Name: " + "||" + item.songName + "|| " + "\n" +
									"Artist: " + "||" + item.songArtist + "|| " + "\n" +
									"Type: " + "||" + type + "|| " + "\n" +
									"Video Link: " + "||" + videoLink + "|| " + "\n"
									,
						components: [row],
						files: [new AttachmentBuilder(item.audio)],
					});	
				}
				else{
					await interaction.editReply("Anime Bot did not find any matching anime.")
					console.log("Random Query Successful");
					console.log("Row Count: " + rows.length);
				}
			}
			else{
				await interaction.editReply("Query failed. No songs found.")
			}
		}
		else{
			await interaction.deferReply();
			let whereQuery;

			let db = new sqlite3.Database('./Enhanced-AMQ-Database.db', sqlite3.OPEN_READWRITE, (err) => {
				if (err) {
				console.error(err.message);
				}
				console.log('Connected to the WCZ AniSong Database.');
			});

			if(animeTitle == ""){
				whereQuery = "songId = (SELECT songId FROM songsAnimes ORDER BY RANDOM() LIMIT 25)";		
				console.log(whereQuery);		
			}
			else{
				whereQuery = "animeENName LIKE '%" + animeTitle + "%'";
				console.log(whereQuery);
			}

			

			let rows = await new Promise((resolve, reject) =>			
			db.all(`SELECT animeENName name,
							audio audio,
							HQ HQ,
							MQ MQ,
							songName songName,
							songArtist songArtist,
							songType songType,
							songNumber songNumber,
							songDifficulty songDifficulty
							FROM songsAnimes
							WHERE ` + whereQuery + ` COLLATE NOCASE`, (err, rows) => {
								if (err) {
									console.error(err.message);
									reject(err);
								}
								else{
									resolve(rows);
								}
							}));

			if((rows != null || rows != undefined) && rows.length > 0){

				console.log("Random Query Successful");
				console.log("Row Count: " + rows.length);

				var item = rows[Math.floor(Math.random()*rows.length)];

				//
				//while (item.audio == null){
				//	item = rows[Math.floor(Math.random()*rows.length)];
				//}

				const button = new ButtonBuilder()
					.setLabel('mp3')
					.setURL(item.audio)
					.setStyle(ButtonStyle.Link);

				var videoLink = item.HQ != null ? item.HQ : item.MQ;
				var type;

				if(item.songType == 1){
					type = "OP" + item.songNumber;
				}
				else if(item.songType == 2){
					type = "ED "+ item.songNumber;
				}
				else{
					type = "IN"
				}

				const row = new ActionRowBuilder()
					.addComponents(button);

				await interaction.editReply({
					content: 	"Anime Title: " + "||" + item.name + "|| " + "\n" +
								"Song Name: " + "||" + item.songName + "|| " + "\n" +
								"Artist: " + "||" + item.songArtist + "|| " + "\n" +
								"Type: " + "||" + type + "|| " + "\n" +
								"Video Link: " + "||" + videoLink + "|| " + "\n"
								,
					components: [row],
					files: [new AttachmentBuilder(item.audio)],
				});	
			}
			else{
				await interaction.editReply("Anime Bot did not find any matching anime.")
				console.log("Random Query Successful");
				console.log("Row Count: " + rows.length);
			}
		}


		
	},
};