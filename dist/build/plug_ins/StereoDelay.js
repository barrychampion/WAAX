!function(WX){"use strict";function StereoDelay(preset){WX.Plugin.defineType(this,"Processor"),this._lDelay=WX.Delay(),this._rDelay=WX.Delay(),this._lFeedback=WX.Gain(),this._rFeedback=WX.Gain(),this._lXtalk=WX.Gain(),this._rXtalk=WX.Gain(),this._dry=WX.Gain(),this._wet=WX.Gain();{var _splitter=WX.Splitter(2);WX.Merger(2)}this._input.to(_splitter),this._input.to(this._dry),_splitter.connect(this._lDelay,0,0),this._nLDelay.to(this._lFeedback),this._lFeedback.to(this._lDelay),this._lFeedback.to(this._rXtalk),this._rXtalk.to(this._rDelay),this._lDelay.connect(nMerger,0,0),nSplitter.connect(this._rDelay,1,0),this._rDelay.to(this._rFeedback),this._rFeedback.to(this._rDelay),this._rFeedback.to(this._lXtalk),this._lXtalk.to(this._lDelay),this._rDelay.connect(nMerger,0,1),nMerger.to(this._wet),this._dry.to(this._output),this._wet.to(this._output),WX.defineParams(this,{delayTimeLeft:{type:"Generic",unit:"Seconds","default":.125,min:.025,max:5},delayTimeRight:{type:"Generic",unit:"Seconds","default":.25,min:.025,max:5},feedbackLeft:{type:"Generic",unit:"","default":.25,min:0,max:1},feedbackRight:{type:"Generic",unit:"","default":.125,min:0,max:1},crosstalk:{type:"Generic",unit:"","default":.1,min:0,max:1},mix:{type:"Generic",unit:"","default":1,min:0,max:1}}),WX.Plugin.initPreset(this,preset)}StereoDelay.prototype={info:{name:"StereoDelay",api_version:"1.0.0-alpha",plugin_version:"0.0.1",author:"hoch",type:"effect",description:"stereo delay with feedback"},defaultPreset:{delayTimeLeft:.125,delayTimeRight:.25,feedbackLeft:.25,feedbackRight:.125,crosstalk:.1,mix:1},$delayTimeLeft:function(value,time,rampType){this._lDelay.delayTime.set(value,time,rampType)},$delayTimeRight:function(value,time,rampType){this._rDelay.delayTime.set(value,time,rampType)},$feedbackLeft:function(value,time,rampType){this._lFeedback.gain.set(value,time,rampType)},$feedbackRight:function(value,time,rampType){this._rFeedback.gain.set(value,time,rampType)},$crosstalk:function(value,time,rampType){this._lXtalk.gain.set(value,time,rampType),this._rXtalk.gain.set(value,time,rampType)},$mix:function(value,time,rampType){this._dry.gain.set(1-value,time,rampType),this._wet.gain.set(value,time,rampType)}},WX.Plugin.extendPrototype(StereoDelay,"Processor"),WX.Plugin.register(StereoDelay)}(WX);
//# sourceMappingURL=../waax_all.map