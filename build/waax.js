window.WX=function(){"use strict";var Info=function(){var api_version="1.0.0-alpha";return{getVersion:function(){return api_version}}}(),Log=function(){var logLevel=1,_c=window.console;return{setLevel:function(level){logLevel=level},info:function(){if(!(logLevel>1)){var args=Array.prototype.slice.call(arguments);args.unshift("[WX:info]"),_c.log.apply(_c,args)}},warn:function(){if(!(logLevel>2)){var args=Array.prototype.slice.call(arguments);args.unshift("[WX:warn]"),_c.log.apply(_c,args)}},error:function(){var args=Array.prototype.slice.call(arguments);throw args.unshift("[WX:error]"),_c.log.apply(_c,args),new Error("[WX:error]")}}}(),Util=function(){var LOG2=Math.LN2,LOG10=Math.LN10,MIDI1499=3.282417553401589e38;return{isObject:function(obj){return obj===Object(obj)},isFunction:function(fn){return"[object Function]"===toString.call(fn)},isArray:function(arr){return"[object Array]"===toString.call(arr)},isNumber:function(num){return"[object Number]"===toString.call(num)},isBoolean:function(bool){return"[object Boolean]"===toString.call(bool)},hasParam:function(plugin,param){return hasOwnProperty.call(plugin.params,param)},extend:function(target,source){for(var prop in source)target[prop]=source[prop];return target},clone:function(source){var obj={};for(var prop in source)obj[prop]=source[prop];return obj},validateModel:function(model){if(0===model.length)return!1;for(var keys=[],i=0;i<model.length;i++){if(keys.indexOf(model[i].key)>-1)return!1;keys.push(model[i].key)}return!0},findKeyByValue:function(model,value){for(var i=0;i<model.length;i++)if(model[i].value===value)return model[i].key;return null},findValueByKey:function(model,key){for(var i=0;i<model.length;i++)if(model[i].key===key)return model[i].value;return null},clamp:function(value,min,max){return Math.min(Math.max(value,min),max)},random2f:function(min,max){return min+Math.random()*(max-min)},random2:function(min,max){return Math.round(min+Math.random()*(max-min))},mtof:function(midi){return-1500>=midi?0:midi>1499?MIDI1499:440*Math.pow(2,(Math.floor(midi)-69)/12)},ftom:function(freq){return Math.floor(freq>0?Math.log(freq/440)/LOG2*12+69:-1500)},powtodb:function(power){if(0>=power)return 0;var db=100+10/LOG10*Math.log(power);return 0>db?0:db},dbtopow:function(db){return 0>=db?0:(db>870&&(db=870),Math.exp(.1*LOG10*(db-100)))},rmstodb:function(rms){if(0>=rms)return 0;var db=100+20/LOG10*Math.log(rms);return 0>db?0:db},dbtorms:function(db){return 0>=db?0:(db>485&&(db=485),Math.exp(.05*LOG10*(db-100)))},lintodb:function(lin){return 20*(lin>1e-5?Math.log(lin)/LOG10:-5)},dbtolin:function(db){return Math.pow(10,db/20)},veltoamp:function(velocity){return velocity/127}}}();window.hasOwnProperty("webkitAudioContext")||window.hasOwnProperty("AudioContext")?window.hasOwnProperty("webkitAudioContext")&&(window.AudioContext=window.webkitAudioContext):Log.error("Web Audio API is not supported. See http://caniuse.com/audio-api for more info.");var Core=function(){function Envelope(){var args=arguments;return function(startTime,amplifier){var env=[];startTime=startTime||0,amplifier=amplifier||1;for(var i=0;i<args.length;i++){var time,val=args[i][0];Util.isArray(args[i][1])?(time=[startTime+args[i][1][0],startTime+args[i][1][1]],env.push([val*amplifier,time,3])):(time=startTime+args[i][1],env.push([val*amplifier,time,args[i][2]||0]))}return env}}function loadClip(clip,oncomplete,onprogress){if(!oncomplete)return void Log.error("Specify `oncomplete` action.");var xhr=new XMLHttpRequest;xhr.open("GET",clip.url,!0),xhr.responseType="arraybuffer",xhr.onprogress=function(event){onprogress&&onprogress(event,clip)},xhr.onload=function(){try{Core.ctx.decodeAudioData(xhr.response,function(buffer){clip.buffer=buffer,oncomplete(clip)})}catch(error){Info.error("Loading clip failed. (XHR failure)",error.message,clip.url)}},xhr.send()}function checkNumeric(arg,defaultValue){return Util.isNumber(arg)?arg:void 0===arg?defaultValue:void Log.error("Invalid parameter configuration")}function createParam(options){switch(PARAM_TYPES.indexOf(options.type)<0&&Log.error("Invalid Parameter Type."),options.type){case"Generic":return new GenericParam(options);case"Itemized":return new ItemizedParam(options);case"Boolean":return new BooleanParam(options)}}function GenericParam(options){this.init(options)}function ItemizedParam(options){this.init(options)}function BooleanParam(options){this.init(options)}var ctx=new AudioContext,WAP=window.AudioParam.prototype;AudioNode.prototype.to=function(){for(var i=0;i<arguments.length;i++)this.connect(arguments[i]);return arguments[0]},AudioNode.prototype.cut=function(){this.disconnect()},AudioParam.prototype.cancel=WAP.cancelScheduledValues,AudioParam.prototype.set=function(value,time,rampType){switch(rampType){case 0:case void 0:time=time<ctx.currentTime?ctx.currentTime:time,this.setValueAtTime(value,time),time<=ctx.currentTime&&value!==this.value&&(this.value=value);break;case 1:time=time<ctx.currentTime?ctx.currentTime:time,this.linearRampToValueAtTime(value,time);break;case 2:time=time<ctx.currentTime?ctx.currentTime:time,value=0>=value?1e-5:value,this.exponentialRampToValueAtTime(value,time);break;case 3:time[0]=time[0]<ctx.currentTime?ctx.currentTime:time[0],value=0>=value?1e-5:value,this.setTargetAtTime(value,time[0],time[1])}};var PARAM_TYPES=["Generic","Itemized","Boolean"];return GenericParam.prototype={init:function(options){this.type="Generic",this.name=options.name||"Parameter",this.unit=options.unit||"",this.value=this.default=checkNumeric(options.default,0),this.min=checkNumeric(options.min,0),this.max=checkNumeric(options.max,1),this._parent=options._parent,this.$callback=options._parent["$"+options._paramId]},set:function(value,time,rampType){this.value=Util.clamp(value,this.min,this.max),this.$callback&&this.$callback.call(this._parent,this.value,time,rampType)},get:function(){return this.value}},ItemizedParam.prototype={init:function(options){Util.isArray(options.model)||Log.error("Model is missing."),Util.validateModel(options.model)||Log.error("Invalid Model."),this.type="Itemized",this.name=options.name||"Select",this.model=options.model,this.default=options.default||this.model[0].value,this.value=this.default,this._parent=options._parent,this.$callback=options._parent["$"+options._paramId]},set:function(value,time,rampType){Util.findKeyByValue(this.model,value)&&(this.value=value,this.$callback&&this.$callback.call(this._parent,this.value,time,rampType))},get:function(){return this.value},getModel:function(){return this.model}},BooleanParam.prototype={init:function(options){Util.isBoolean(options.default)||Log.error("Invalid value for Boolean Parameter."),this.type="Boolean",this.name=options.name||"Toggle",this.value=this.default=options.default,this._parent=options._parent,this.$callback=options._parent["$"+options._paramId]},set:function(value,time,rampType){Util.isBoolean(value)&&(this.value=value,this.$callback&&this.$callback.call(this._parent,this.value,time,rampType))},get:function(){return this.value}},{ctx:ctx,Gain:function(){return ctx.createGain()},OSC:function(){return ctx.createOscillator()},Delay:function(){return ctx.createDelay()},Filter:function(){return ctx.createBiquadFilter()},Comp:function(){return ctx.createDynamicsCompressor()},Convolver:function(){return ctx.createConvolver()},WaveShaper:function(){return ctx.createWaveShaper()},Source:function(){return ctx.createBufferSource()},Analyzer:function(){return ctx.createAnalyser()},Panner:function(){return ctx.createPanner()},PeriodicWave:function(){return ctx.createPeriodicWave.apply(ctx,arguments)},Splitter:function(){return ctx.createChannelSplitter.apply(ctx,arguments)},Merger:function(){return ctx.createChannelMerger.apply(ctx,arguments)},Buffer:function(){return ctx.createBuffer.apply(ctx,arguments)},Envelope:Envelope,defineParams:function(plugin,paramOptions){for(var key in paramOptions)paramOptions[key]._parent=plugin,paramOptions[key]._paramId=key,plugin.params[key]=createParam(paramOptions[key])},loadClip:loadClip}}(),PlugIn=function(){function PlugInAbstract(){this.params={}}function GeneratorAbstract(){PlugInAbstract.call(this),this._output=Core.Gain(),this._outlet=Core.Gain(),this._output.to(this._outlet),Core.defineParams(this,{output:{type:"Generic",name:"Output","default":1,min:0,max:1,unit:"LinearGain"}})}function ProcessorAbstract(){PlugInAbstract.call(this),this._inlet=Core.Gain(),this._input=Core.Gain(),this._output=Core.Gain(),this._active=Core.Gain(),this._bypass=Core.Gain(),this._outlet=Core.Gain(),this._inlet.to(this._input,this._bypass),this._output.to(this._active).to(this._outlet),this._bypass.to(this._outlet),this._active.gain.value=1,this._bypass.gain.value=0,Core.defineParams(this,{input:{type:"Generic",name:"Input","default":1,min:0,max:1,unit:"LinearGain"},output:{type:"Generic",name:"Output","default":1,min:0,max:1,unit:"LinearGain"},bypass:{type:"Boolean",name:"Bypass","default":!1}})}function AnalyzerAbstract(){PlugInAbstract.call(this),this._inlet=Core.Gain(),this._input=Core.Gain(),this._analyzer=Core.Analyzer(),this._outlet=Core.Gain(),this._inlet.to(this._input).to(this._analyzer),this._inlet.to(this._outlet),Core.defineParams(this,{input:{type:"Generic",name:"Input","default":1,min:0,max:1,unit:"LinearGain"}})}var PLUGIN_TYPES=["Generator","Processor","Analyzer"],registered={Generator:[],Processor:[],Analyzer:[]};return PlugInAbstract.prototype={to:function(plugin){if(plugin._inlet)return this._outlet.to(plugin._inlet),plugin;try{return this._outlet.to(plugin),plugin}catch(error){Log.error("Connection failed. Invalid patching.")}},cut:function(){this._outlet.cut()},set:function(param,arg){if(Util.hasParam(this,param))if(Util.isArray(arg))for(var i=0;i<arg.length;i++)this.params[param].set.apply(this,arg[i]);else this.params[param].set(arg,Core.ctx.currentTime,0);return this},get:function(param){return Util.hasParam(this,param)?this.params[param].get():null},setPreset:function(preset){for(var param in preset)this.params[param].set(preset[param],Core.ctx.currentTime,0)},getPreset:function(){var preset={};for(var param in this.params)preset[param]=this.params[param].get();return preset}},GeneratorAbstract.prototype={$output:function(value,time,rampType){this._output.gain.set(value,time,rampType)}},Util.extend(GeneratorAbstract.prototype,PlugInAbstract.prototype),ProcessorAbstract.prototype={$input:function(value,time,rampType){this._input.gain.set(value,time,rampType)},$output:function(value,time,rampType){this._output.gain.set(value,time,rampType)},$bypass:function(value,time){time=time||Core.ctx.currentTime,value?(this._active.gain.set(0,time,0),this._bypass.gain.set(1,time,0)):(this._active.gain.set(1,time,0),this._bypass.gain.set(0,time,0))}},Util.extend(ProcessorAbstract.prototype,GeneratorAbstract.prototype),AnalyzerAbstract.prototype={$input:function(value,time,xtype){this._input.gain.set(value,time,xtype)}},Util.extend(AnalyzerAbstract.prototype,PlugInAbstract.prototype),{defineType:function(plugin,type){switch(PLUGIN_TYPES.indexOf(type)<0&&Log.error("Invalid Plug-in type."),type){case"Generator":GeneratorAbstract.call(plugin);break;case"Processor":ProcessorAbstract.call(plugin);break;case"Analyzer":AnalyzerAbstract.call(plugin)}},initPreset:function(plugin,preset){var merged=Util.clone(plugin.defaultPreset);Util.extend(merged,preset),plugin.setPreset(merged)},extendPrototype:function(plugin,type){switch(PLUGIN_TYPES.indexOf(type)<0&&Log.error("Invalid Plug-in type."),type){case"Generator":Util.extend(plugin.prototype,GeneratorAbstract.prototype);break;case"Processor":Util.extend(plugin.prototype,ProcessorAbstract.prototype);break;case"Analyzer":Util.extend(plugin.prototype,AnalyzerAbstract.prototype)}},register:function(PlugInClass){var info=PlugInClass.prototype.info;Info.getVersion()>info.api_version&&Log.error(PlugInClass.name,": FATAL. incompatible WAAX version."),registered[info.type].push(PlugInClass.name),window.WX[PlugInClass.name]=function(preset){return new PlugInClass(preset)}},getRegistered:function(type){var plugins=null;if(PLUGIN_TYPES.indexOf(type)>-1)switch(type){case"Generator":plugins=registered.Generator.slice(0);break;case"Processor":plugins=registered.Processor.slice(0);break;case"Analyzer":plugins=registered.Analyzer.slice(0)}return plugins}}}();return function(){Log.info("WAAX",Info.getVersion(),"("+Core.ctx.sampleRate+"Hz)")}(),{Info:Info,Log:Log,WAVEFORMS:[{key:"Sine",value:"sine"},{key:"Square",value:"square"},{key:"Sawtooth",value:"sawtooth"},{key:"Triangle",value:"triangle"}],FILTER_TYPES:[{key:"LP",value:"lowpass"},{key:"HP",value:"highpass"},{key:"BP",value:"bandpass"},{key:"LS",value:"lowshelf"},{key:"HS",value:"highshelf"},{key:"PK",value:"peaking"},{key:"BR",value:"notch"},{key:"AP",value:"allpass"}],isObject:Util.isObject,isFunction:Util.isFunction,isArray:Util.isArray,isNumber:Util.isNumber,isBoolean:Util.isBoolean,hasParam:Util.hasParam,extend:Util.extend,clone:Util.clone,validateModel:Util.validateModel,findKeyByValue:Util.findKeyByValue,findValueByKey:Util.findValueByKey,clamp:Util.clamp,random2f:Util.random2f,random2:Util.random2,mtof:Util.mtof,ftom:Util.ftom,powtodb:Util.powtodb,dbtopow:Util.dbtopow,rmstodb:Util.rmstodb,dbtorms:Util.dbtorms,lintodb:Util.lintodb,dbtolin:Util.dbtolin,veltoamp:Util.veltoamp,context:Core.ctx,get now(){return Core.ctx.currentTime},get srate(){return Core.ctx.sampleRate},Gain:Core.Gain,OSC:Core.OSC,Delay:Core.Delay,Filter:Core.Filter,Comp:Core.Comp,Convolver:Core.Convolver,WaveShaper:Core.WaveShaper,Source:Core.Source,Analyzer:Core.Analyzer,Panner:Core.Panner,PeriodicWave:Core.PeriodicWave,Splitter:Core.Splitter,Merger:Core.Merger,Buffer:Core.Buffer,Envelope:Core.Envelope,defineParams:Core.defineParams,loadClip:Core.loadClip,PlugIn:PlugIn}}(),window.MUI=function(){function MouseResponder(senderID,targetElement,MUICallback){this.senderId=senderID,this.container=targetElement,this.callback=MUICallback,this.ondragged=this.dragged.bind(this),this.onreleased=this.released.bind(this),this._prevTS=0,this.onclicked(targetElement)}function KeyResponder(senderID,targetElement,MUICallback){this.senderId=senderID,this.container=targetElement,this.callback=MUICallback,this.onkeypress=this.keypressed.bind(this),this.onblur=this.finished.bind(this),this.onfocus(targetElement)}return MouseResponder.prototype={getEventData:function(event){var r=this.container.getBoundingClientRect();return{x:event.clientX-r.left,y:event.clientY-r.top,ctrlKey:event.ctrlKey,altKey:event.altKey,shiftKey:event.shiftKey,metaKey:event.metaKey}},onclicked:function(target){target.addEventListener("mousedown",function(event){event.preventDefault(),this._prevTS=event.timeStamp;var p=this.getEventData(event);this.callback(this.senderId,"clicked",p),window.addEventListener("mousemove",this.ondragged,!1),window.addEventListener("mouseup",this.onreleased,!1)}.bind(this),!1)},dragged:function(event){if(event.preventDefault(),!(event.timeStamp-this._prevTS<16.7)){this._prevTS=event.timeStamp;var p=this.getEventData(event);this.callback(this.senderId,"dragged",p)}},released:function(event){event.preventDefault();var p=this.getEventData(event);this.callback(this.senderId,"released",p),window.removeEventListener("mousemove",this.ondragged,!1),window.removeEventListener("mouseup",this.onreleased,!1)}},KeyResponder.prototype={onfocus:function(){this.container.addEventListener("mousedown",function(event){event.preventDefault(),this.callback(this.senderId,"clicked",null),this.container.addEventListener("keypress",this.onkeypress,!1),this.container.addEventListener("blur",this.onblur,!1)}.bind(this),!1)},keypressed:function(event){this.callback(this.senderId,"keypressed",event.keyCode)},finished:function(){this.callback(this.senderId,"finished",null),this.container.removeEventListener("keypress",this.onkeypress,!1),this.container.removeEventListener("blur",this.onblur,!1)}},{clamp:function(value,min,max){return Math.max(Math.min(value,max),min)},clone:function(obj){var cloned={};for(var p in obj)obj.hasOwnProperty(p)&&(cloned[p]=obj[p]);return obj},findValueByKey:function(collection,key){for(var i=0;i<collection.length;i++)if(collection[i].key===key)return collection[i].value;return collection[0].value},findKeyByValue:function(collection,value){for(var i=0;i<collection.length;i++)if(collection[i].value===value)return collection[i].key},MouseResponder:function(senderID,targetElement,MUICallback){return new MouseResponder(senderID,targetElement,MUICallback)},KeyResponder:function(senderID,targetElement,MUICallback){return new KeyResponder(senderID,targetElement,MUICallback)},buildControls:function(plugin,targetId){var targetEl=document.getElementById(targetId);for(var param in plugin.params){var p=plugin.params[param];switch(p.type){case"Generic":var knob=document.createElement("mui-knob");knob.link(plugin,param),targetEl.appendChild(knob);break;case"Itemized":var select=document.createElement("mui-select");select.link(plugin,param),targetEl.appendChild(select);break;case"Boolean":var button=document.createElement("mui-button");button.type="toggle",button.link(plugin,param),targetEl.appendChild(button)}}},removeChildren:function(targetId){for(var targetEl=document.getElementById(targetId);targetEl.firstChild;)targetEl.removeChild(targetEl.firstChild)},$:function(elementId){return document.getElementById(elementId)}}}(WX),window.Timebase=function(WX){function tick2mbt(tick){return{beat:~~(tick/TICKS_PER_BEAT),tick:tick%TICKS_PER_BEAT}}function mbt2tick(mbt){return mbt.beat*TICKS_PER_BEAT+mbt.tick}function Note(){this.pitch=60,this.velo=64,this.start=0,this.end=120,this.next=null}function NoteList(){this.empty()}function Transport(BPM){this.BPM=BPM,this.oldBPM=BPM,this.absOrigin=0,this.absOldNow=0,this.now=0,this.loopStart=0,this.loopEnd=0,this.lookahead=0,this.BIS=0,this.TIS=0,this.playbackQ=[],this.notelists=[],this.views=[],this.RUNNING=!1,this.LOOP=!1,this.USE_METRONOME=!1,this.setBPM(BPM),this._loop()}var TICKS_PER_BEAT=480;return Note.prototype={get:function(){return{pitch:this.pitch,velo:this.velo,start:this.start,end:this.end}},getDuration:function(){return this.end-this.start},movePitch:function(delta){this.pitch+=delta,this.pitch=WX.clamp(this.pitch,0,127)},moveTime:function(delta){var dur=this.end-this.start;this.moveStart(delta),this.end=this.start+dur},moveStart:function(delta){this.start+=delta,this.start=WX.clamp(this.start,0,this.end-1)},moveEnd:function(delta){this.end+=delta,this.end=Math.max(this.end,this.start+1)},set:function(){WX.isObject(arguments[0])?(this.pitch=arguments[0].pitch,this.velo=arguments[0].velo,this.start=arguments[0].start,this.end=arguments[0].end):(this.pitch=arguments[0],this.velo=arguments[1],this.start=arguments[2],this.end=arguments[3])},valueOf:function(){return this.start},toString:function(){return this.pitch+":"+this.velo+":"+this.start+":"+this.end}},NoteList.prototype={add:function(note){if(null===this.head)return this.head=note,this.playhead=this.head,void this.size++;if(note<=this.head)return note.next=this.head,this.head=note,void this.size++;for(var curr=this.head;curr;){if(note>curr){if(!curr.next){curr.next=note;break}if(note<=curr.next){note.next=curr.next,curr.next=note;break}}curr=curr.next}return void this.size++},empty:function(){this.head=null,this.playhead=null,this.size=0},findNoteAtPosition:function(pitch,tick){for(var curr=this.head;curr;){if(curr.pitch===pitch&&curr.start<=tick&&tick<=curr.end)return curr;curr=curr.next}return null},findNotesInArea:function(minPitch,maxPitch,start,end){for(var notesInTimeSpan=this.findNotesInTimeSpan(start,end),notesInArea=[],i=0;i<notesInTimeSpan.length;i++){var p=notesInTimeSpan[i].pitch;minPitch>p||p>maxPitch||notesInArea.push(notesInTimeSpan[i])}return notesInArea},findNotesInTimeSpan:function(start,end){for(var curr=this.head,bucket=[];curr&&curr.start<=end;)start<=curr.start&&bucket.push(curr),curr=curr.next;return bucket.length>0?bucket:0},getSize:function(){return this.size},getArray:function(){for(var curr=this.head,bucket=[];curr;)bucket.push(curr),curr=curr.next;if(bucket.length>0){for(var i=0;i<bucket.length;i++)bucket[i].next=null;return bucket}return null},iterate:function(fn){for(var curr=this.head,index=0;curr;)fn(curr,index++),curr=curr.next},remove:function(note){if(null!==this.head){var removed;if(this.head===note)return removed=this.head,this.head=this.head.next,removed.next=null,this.size--,removed;for(var curr=this.head;curr;){if(curr.next===note)return removed=curr.next,curr.next=curr.next.next,removed.next=null,this.size--,removed;curr=curr.next}return null}},rewind:function(){this.playhead=this.head},setPlayheadAtTick:function(tick){if(this.playhead=this.head,this.playhead)for(;this.playhead.start<tick;)this.playhead=this.playhead.next},scan:function(end){if(this.playhead){for(var bucket=[];this.playhead.start<end;)bucket.push(this.playhead),this.playhead=this.playhead.next;return bucket.length>0?bucket:null}},dump:function(){for(var curr=this.head,bucket=[];curr;)bucket.push(curr.toString()),curr=curr.next;return bucket}},Transport.prototype={tick2sec:function(tick){return tick*this.TIS},sec2tick:function(sec){return sec/this.TIS},getAbsTimeInSec:function(tick){return this.absOrigin+this.tick2sec(tick)},getBPM:function(){return this.BPM},getNowInSec:function(){return this.now},getNow:function(){return this.sec2tick(this.now)},getLoopDurationInSec:function(){return this.loopEnd-this.loopStart},getLoopDuration:function(){return this.sec2tick(this.getLoopDurationInSec())},setBPM:function(BPM){this.BPM=BPM;var factor=this.oldBPM/this.BPM;this.oldBPM=this.BPM,this.BIS=60/this.BPM,this.TIS=this.BIS/TICKS_PER_BEAT,this.lookahead=32*this.TIS,this.now*=factor,this.loopStart*=factor,this.loopEnd*=factor,this.absOrigin=WX.now-this.now},setNowInSec:function(sec){this.now=sec,this.absOrigin=WX.now-this.now;for(var tick=this.sec2tick(this.now),i=0;i<this.notelists.length;i++)this.notelists[i].setPlayheadAtTick(tick)},setNow:function(tick){this.setNowInSec(this.tick2sec(tick))},setLoop:function(start,end){this.loopStart=this.tick2sec(start),this.loopEnd=this.tick2sec(end)},step:function(){if(this.RUNNING){var absNow=WX.now;this.now+=absNow-this.absOldNow,this.absOldNow=absNow,this.scanNotes(),this.flushPlaybackQ(),this.LOOP&&this.loopEnd-(this.now+this.lookahead)<0&&this.setNowInSec(this.loopStart-(this.loopEnd-this.now))}},scanNotes:function(){for(var i=0;i<this.notelists.length;i++){var end=this.sec2tick(this.now+this.lookahead),notes=this.notelists[i].scan(end);notes&&Array.prototype.push.apply(this.playbackQ,notes)}},setScanPosition:function(sec){for(var i=0;i<this.notelists.length;i++)this.notelists[i].setPlayheadAtTick(this.sec2tick(sec))},_loop:function(){this.step(),this.updateView(),requestAnimationFrame(this._loop.bind(this))},isRunning:function(){return this.RUNNING},start:function(){this.playbackQ.length=0,this.setScanPosition(this.now);var absNow=WX.now;this.absOrigin=absNow-this.now,this.absOldNow=absNow,this.RUNNING=!0},pause:function(){this.RUNNING=!1},rewind:function(){this.setNowInSec(0)},addNoteList:function(notelist){this.notelists.push(notelist)},removeNoteList:function(){},flushPlaybackQ:function(){this.playbackQ.length=0},updateView:function(viewdata){for(var i=0;i<this.views.length;i++)this.views[i].update(viewdata[i])}},{Util:{tick2mbt:tick2mbt,mbt2tick:mbt2tick},createNote:function(){var n=new Note;return n.set.apply(n,arguments),n},createNoteList:function(){return new NoteList},Transport:new Transport(120)}}(WX),function(WX){function Fader(preset){WX.PlugIn.defineType(this,"Processor"),this._panner=WX.Panner(),this._input.to(this._panner).to(this._output),this._panner.panningModel="equalpower",WX.defineParams(this,{output:{type:"Generic",name:"Output","default":1,min:0,max:3.9810717055349722,unit:"LinearGain"},mute:{type:"Boolean",name:"Mute","default":!1},pan:{type:"Generic",name:"Pan","default":0,min:-1,max:1},dB:{type:"Generic",name:"dB","default":0,min:-60,max:12,unit:"Decibels"}}),WX.PlugIn.initPreset(this,preset)}Fader.prototype={info:{name:"Fader",version:"0.0.2",api_version:"1.0.0-alpha",author:"Hongchan Choi",type:"Processor",description:"Channel Fader"},defaultPreset:{mute:!1,pan:0,dB:0},$mute:function(value){value?this._outlet.gain.set(0,WX.now,0):this._outlet.gain.set(1,WX.now,0)},$pan:function(value){this._panner.setPosition(value,0,.5)},$dB:function(value,time,rampType){this.params.output.set(WX.dbtolin(value),time,rampType)}},WX.PlugIn.extendPrototype(Fader,"Processor"),WX.PlugIn.register(Fader),WX.Master=WX.Fader(),WX.Master.to(WX.context.destination)}(WX);