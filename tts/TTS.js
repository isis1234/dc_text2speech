const { 
  joinVoiceChannel, VoiceConnectionStatus, entersState, 
  createAudioPlayer, AudioPlayerStatus, createAudioResource, 
  NoSubscriberBehavior, StreamType 
} = require('@discordjs/voice')
const VoiceRSSClient = require("voice-rss-client")
const fs = require("fs")

module.exports = class TTS {
  constructor(key) {
    this.key = key

    // https://discord.js.org/#/docs/main/stable/class/VoiceConnection
    this.connection = {}

    // https://discord.js.org/#/docs/main/stable/class/StreamDispatcher
    this.dispatcher = {}

    this.player = {}

    this.playing = {}
  }

  async joinVoiceChannel(intr){
    try{
      this.connection[intr.guild.id] = joinVoiceChannel({
        channelId: intr.member.voice.channel.id,
        guildId: intr.member.voice.channel.guild.id,
        adapterCreator: intr.member.voice.channel.guild.voiceAdapterCreator,
        selfMute: false,
        selfDeaf: false
      })
      .on('stateChange', (oldState, newState) => {
        if(oldState.status != newState.status)
          console.log(`[ ${intr.guild.name} ] 🎙 Voice from ${oldState.status} to ${newState.status}`)
      })

      this.player[intr.guild.id] = createAudioPlayer({
        behaviors: {
          noSubscriber: NoSubscriberBehavior.Pause,
        },
      })
      .on('stateChange', (oldState, newState) => {
        console.log(`[ ${intr.guild.name} ] 🎙 Audio player from ${oldState.status} to ${newState.status}`)
        if(newState.status === "idle"){ 
          this.playing[intr.guild.id] = null; 
          // this.player[intr.guild.id].stop()
        }
      })
      .on('error', error => {
        console.error(`Error: ${error.message} with resource ${error.resource.metadata.title}`);
        this.connection[intr.guild.id].destroy()
      })  
      await entersState(this.connection[intr.guild.id], VoiceConnectionStatus.Ready, 30_000)

    }catch(err){
      console.log(err)
      this.connection[intr.guild.id].destroy()
      throw err
    }
  }

  async getSpeech(intr, language, text){
    const guildID = intr.guild.id
    if (!this.connection[guildID]) { this.joinVoiceChannel(intr) }

    try {
      if(!this.playing[guildID]){
        this.playing[guildID] = text
        VoiceRSSClient.getSpeech({ apiKey: this.key, audioFormat: "16khz_16bit_stereo", audioCodec: "OGG", language, text }).then((audioStr) => {
          const resource = createAudioResource(`data:audio/ogg; codecs=opus;base64,${audioStr.split(",")[1]}`, { 
            metadata: { title: text },
            inputType: StreamType.WebmOpus
          })
          this.player[guildID].play(resource)
          this.dispatcher[guildID] = this.connection[guildID].subscribe(this.player[guildID])
        });
        await intr.reply(`🗣 ${text}`)
      }else{
        await intr.reply('Wait for current speech')
      }
    } catch(e) {
      console.log(e)
    }
  }
}