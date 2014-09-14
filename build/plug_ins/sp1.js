!function(WX){"use strict";function SP1Voice(sampler){this.parent=sampler,this.params=sampler.params,this.voiceKey=null,this.minDur=null,this._src=WX.Source(),this._srcGain=WX.Gain(),this._src.to(this._srcGain).to(this.parent._filter),this._src.buffer=this.parent.clip.buffer}function SP1(preset){WX.PlugIn.defineType(this,"Generator"),this.ready=!1,this.clip=null,this.numVoice=0,this.voices=[];for(var i=0;128>i;i++)this.voices[i]=[];this._filter=WX.Filter(),this._filter.to(this._output),WX.defineParams(this,{tune:{type:"Generic",name:"Tune","default":48,min:0,max:127,unit:"Semitone"},pitchMod:{type:"Boolean",name:"PitchMod","default":!0},velocityMod:{type:"Boolean",name:"VeloMod","default":!0},ampAttack:{type:"Generic",name:"Att","default":.02,min:0,max:5,unit:"Seconds"},ampDecay:{type:"Generic",name:"Dec","default":.04,min:0,max:5,unit:"Seconds"},ampSustain:{type:"Generic",name:"Sus","default":.25,min:0,max:1,unit:"LinearGain"},ampRelease:{type:"Generic",name:"Rel","default":.2,min:0,max:10,unit:"Seconds"},filterType:{type:"Itemized",name:"FiltType","default":"lowpass",model:WX.FILTER_TYPES},filterFrequency:{type:"Generic",name:"FiltFreq","default":2500,min:20,max:2e4,unit:"Hertz"},filterQ:{type:"Generic",name:"FiltQ","default":0,min:0,max:40},filterGain:{type:"Generic",name:"FiltGain","default":0,min:-40,max:40,unit:"LinearGain"}}),WX.PlugIn.initPreset(this,preset)}SP1Voice.prototype={noteOn:function(pitch,velocity,time){var p=this.params,basePitch=p.tune.get(),att=p.ampAttack.get(),dec=p.ampDecay.get(),sus=p.ampSustain.get(),scale=p.velocityMod.get()?WX.veltoamp(velocity):1;p.pitchMod.get()&&(this._src.playbackRate.value=Math.pow(2,(pitch-basePitch)/12)),this._src.start(time),this._srcGain.gain.set(0,time,0),this._srcGain.gain.set(scale,time+att,1),this._srcGain.gain.set(sus*scale,[time+att,dec],3),this.minDur=time+att+dec},noteOff:function(pitch,velocity,time){if(this.minDur){time=time<WX.now?WX.now:time;var p=this.params,rel=p.ampRelease.get();this.voiceKey=pitch,this._src.stop(this.minDur+rel+1),time<this.minDur?(this._srcGain.gain.cancel(this.minDur),this._srcGain.gain.set(0,[this.minDur,rel],3)):this._srcGain.gain.set(0,[time,rel],3)}}},SP1.prototype={info:{name:"SP1",version:"0.0.1",api_version:"1.0.0-alpha",author:"Hongchan Choi",type:"Generator",description:"Versatile Single-Zone Sampler"},defaultPreset:{tune:60,pitchMod:!0,velocityMod:!0,ampAttack:.01,ampDecay:.44,ampSustain:.06,ampRelease:.06,filterType:"LP",filterFrequency:5e3,filterQ:0,filterGain:0,output:1},$filterType:function(value){this._filter.type=value},$filterFrequency:function(value,time,rampType){this._filter.frequency.set(value,time,rampType)},$filterQ:function(value,time,rampType){this._filter.Q.set(value,time,rampType)},$filterGain:function(value,time,rampType){this._filter.gain.set(value,time,rampType)},noteOn:function(pitch,velocity,time){time=time||WX.now;var voice=new SP1Voice(this);this.voices[pitch].push(voice),this.numVoice++,voice.noteOn(pitch,velocity,time)},noteOff:function(pitch,velocity,time){time=time||WX.now;for(var playing=this.voices[pitch],i=0;i<playing.length;i++)playing[i].noteOff(pitch,velocity,time),this.numVoice--;this.voices[pitch]=[]},onData:function(action,data){switch(action){case"noteon":this.noteOn(data.pitch,data.velocity);break;case"noteoff":this.noteOff(data.pitch,data.velocity)}},_onprogress:function(){},_onloaded:function(clip){this.setClip(clip),WX.Log.info("Clip loaded:",clip.name)},isReady:function(){return this.ready},setClip:function(clip){this.clip=clip,this.ready=!0},loadClip:function(clip){WX.loadClip(clip,this._onloaded.bind(this),this._onprogress.bind(this))}},WX.PlugIn.extendPrototype(SP1,"Generator"),WX.PlugIn.register(SP1)}(WX);