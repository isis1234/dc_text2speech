let TTS = require("./TTS")

module.exports = (bot, BOT_CLIENT_ID, BOT_TOKEN, VOICERSS_KEY) => {
  const tts = new TTS(VOICERSS_KEY)

  bot.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return
    if (interaction.commandName === 'tts') {
      if(!interaction.guildId){ await interaction.reply('你必須先加入伺服器'); return; }
      if(!interaction.member.voice.channel){ await interaction.reply('你必須先加入語音頻道'); return; }

      let voice_channel_members = (interaction.member.voice.channel.members).map((x) => { return x.user.id })
      if(!voice_channel_members.find((x) => { return x == BOT_CLIENT_ID })){ tts.joinVoiceChannel(interaction) }

      let [ language, text ] = interaction.options._hoistedOptions
      let msg = tts.getSpeech(interaction, language.value, text.value)
    }
  })
}