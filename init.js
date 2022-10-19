const { SlashCommandBuilder, Routes, REST } = require('discord.js')

module.exports = (bot, BOT_CLIENT_ID, BOT_TOKEN) => {
  try{
    bot.on("ready", async () => {
      // console.log(`${bot.user.tag} restarted.`)
      const rest = new REST({ version: '10' }).setToken(BOT_TOKEN);
      
      console.log('Started refreshing application (/) commands.')
      const Guilds = bot.guilds.cache.map((guild) => {
      return {
        id: guild.id,
        name: guild.name
      }
      })
      for(let i=0; i<Guilds.length; i++){
      await rest.put(
        Routes.applicationGuildCommands(BOT_CLIENT_ID.toString(), (Guilds[i].id).toString()), 
        { body: command_builder() 
      })
      }
      console.log('Successfully reloaded application (/) commands.')
    })
  }catch(error){
    console.error(error)
  }
}

function command_builder(){
  let cmds = []

  // /ping
  cmds.push(new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Replies with Pong!')
  )

  // /tts
  cmds.push(new SlashCommandBuilder()
    .setName('tts')
    .setDescription('Text to speech')

    //language
    .addStringOption((option) =>{
      return option.setName('language')
      .setDescription('加入YouTube')
      .setRequired(true)
      .addChoices(
        { name: 'Chinese (Hong Kong)', value: "zh-hk" },
        { name: 'Chinese (Taiwan)', value: "zh-tw" },
        { name: 'English (Great Britain)', value: "en-gb" },
        { name: 'Japanese', value: "ja-jp" },
        { name: 'Korean', value: "ko-kr" },
        { name: 'Thai', value: "th-th" },
        { name: 'Vietnamese', value: "vi-vn" },
      )
    })

    //text
    .addStringOption((option) =>{
      return option.setName('text')
        .setDescription('The textual content for converting to speech (length limited by 100KB).')
        .setRequired(true)
    })
  )
  return cmds
}