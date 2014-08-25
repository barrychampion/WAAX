!function(WX){"use strict";function a(a){WX.Plugin.defineType(this,"Generator"),this._lfo=WX.OSC(),this._lfoGain=WX.Gain(),this._osc=WX.OSC(),this._amp=WX.Gain(),this._osc.to(this._amp).to(this._output),this._lfo.to(this._lfoGain).to(this._osc.detune),this._lfo.start(0),this._osc.start(0),this._amp.gain.value=0,WX.defineParams(this,{oscType:{type:"Itemized",name:"Waveform","default":"sine",model:b},oscFreq:{type:"Generic",name:"Freq","default":WX.mtof(60),min:20,max:5e3,unit:"Hertz"},lfoType:{type:"Itemized",name:"LFO Type","default":"sine",model:b},lfoRate:{type:"Generic",name:"Rate","default":1,min:0,max:20,unit:"Hertz"},lfoDepth:{type:"Generic",name:"Depth","default":1,min:0,max:500,unit:"LinearGain"}}),WX.Plugin.initPreset(this,a)}var b=[{key:"Sine",value:"sine"},{key:"Square",value:"square"},{key:"Sawtooth",value:"sawtooth"},{key:"Triangle",value:"triangle"}];a.prototype={info:{name:"SimpleOsc",api_version:"1.0.0-alpha",plugin_version:"0.0.1",author:"hoch",type:"instrument",description:"1 oscillator synth"},defaultPreset:{oscType:"Sine",oscFreq:WX.mtof(60),lfoType:"Sine",lfoRate:1,lfoDepth:1},$oscType:function(a){this._osc.type=a},$oscFreq:function(a,b,c){this._osc.frequency.set(a,b,c)},$lfoType:function(a){this._lfo.type=a},$lfoRate:function(a,b,c){this._lfo.frequency.set(a,b,c)},$lfoDepth:function(a,b,c){this._lfoGain.gain.set(a,b,c)},noteOn:function(a,b,c){c=c||WX.now,this._amp.gain.set(b/127,[c,.02],3),this.$oscFreq(WX.mtof(a),c+.02,1)},glide:function(a,b){b=b||WX.now,this.$oscFreq(WX.mtof(a),b+.02,1)},noteOff:function(a){a=a||WX.now,this._amp.gain.set(0,[a,.2],3)},onData:function(a,b){switch(a){case"noteon":this.noteOn(b.pitch,b.velocity);break;case"glide":this.glide(b.pitch);break;case"noteoff":this.noteOff()}}},WX.Plugin.extendPrototype(a,"Generator"),WX.Plugin.register(a)}(WX);
//# sourceMappingURL=../plug_ins.map