(this.webpackJsonp=this.webpackJsonp||[]).push([["code-editor"],{"/app/node_modules/babel-loader/lib/index.js!/app/node_modules/coffee-loader/index.js!/app/app/scripts/studio/utils/tc-code-editor/index.coffee":function(e,t,n){"use strict";n.r(t),function(e){var o,i,r,s=n("/app/node_modules/codemirror/lib/codemirror.js"),c=n.n(s),d=n("/app/node_modules/marked/lib/marked.js"),a=n.n(d),u=(n("/app/node_modules/cm-show-invisibles/legacy/show-invisibles.js"),n("/app/node_modules/codemirror/addon/comment/comment.js"),n("/app/node_modules/codemirror/addon/dialog/dialog.js"),n("/app/node_modules/codemirror/addon/display/rulers.js"),n("/app/node_modules/codemirror/addon/hint/show-hint.js"),n("/app/node_modules/codemirror/addon/search/match-highlighter.js"),n("/app/node_modules/codemirror/addon/search/search.js"),n("/app/node_modules/codemirror/addon/search/searchcursor.js"),n("/app/node_modules/codemirror/addon/selection/active-line.js"),n("/app/node_modules/codemirror/keymap/sublime.js"),n("/app/node_modules/codemirror/mode/css/css.js"),n("/app/node_modules/codemirror/mode/coffeescript/coffeescript.js"),n("/app/node_modules/codemirror/addon/fold/brace-fold.js"),n("/app/node_modules/codemirror/addon/fold/comment-fold.js"),n("/app/node_modules/codemirror/addon/fold/foldcode.js"),n("/app/node_modules/codemirror/addon/fold/foldgutter.js"),n("/app/node_modules/codemirror/addon/fold/indent-fold.js"),n("/app/node_modules/babel-loader/lib/index.js!/app/app/scripts/utils/components/tc-modal/index.js")),l=n("/app/node_modules/babel-loader/lib/index.js!/app/node_modules/coffee-loader/index.js!/app/app/scripts/studio/utils/tc-code-editor/lang.coffee"),p=n("/app/node_modules/babel-loader/lib/index.js!/app/node_modules/coffee-loader/index.js!/app/app/scripts/studio/utils/tc-code-editor/utils.coffee"),f=n("/app/node_modules/highlight.js/lib/highlight.js"),h=n.n(f),m=n("/app/node_modules/highlight.js/lib/languages/coffeescript.js"),g=n.n(m),b=[].slice;r=n("/app/node_modules/vue-template-loader/lib/template-loader.js??ref--1-oneOf-1-0!/app/node_modules/pug-plain-loader/index.js!/app/app/scripts/studio/utils/tc-code-editor/template.vue.pug"),h.a.registerLanguage("cson",g.a),(i=new a.a.Renderer).codespan=function(e){return'<code class="codespan">'+e+"</code>"},i.link=function(e,t,n){return'<a target="_blank" href="'+e+'" title="'+t+'">'+n+"</a>"},a.a.setOptions({highlight:function(e){return h.a.highlight("cson",e).value},renderer:i,gfm:!0,tables:!0,breaks:!0}),o=r({components:{TcModal:u.default},props:{lang:{type:String,default:function(){return l.a.COFFEE}},code:{type:String,default:""},autofocus:{type:Boolean,default:function(){return!1}},errorLocationLines:{type:Array,default:function(){return[]}},lineNumbers:{type:Boolean,default:function(){return!0}},suggestions:{type:Object,default:function(){return{}}}},data:function(){return{codeMirror:void 0,postprocessFunctionName:null}},computed:{postprocessDocumentation:function(){var e;if(this.postprocessFunctionName)return e=this.suggestions.postprocessFunctions[this.postprocessFunctionName].doc,a()(e)}},mounted:function(){var t,n,o,i,r;if(r=this,n={Tab:function(e){var t;if(!e.somethingSelected()||!((t=e.getSelection("\n")).length>0&&t.indexOf("\n")>-1||t.length===e.getLine(e.getCursor().line).length))return e.options.indentWithTabs?e.execCommand("insertTab"):e.execCommand("insertSoftTab");e.indentSelection("add")},"Shift-Tab":function(e){return e.indentSelection("subtract")},"Cmd-Enter":t=function(e){return r.$emit("submit",e.getValue())},"Ctrl-Enter":t,"Cmd-I":i=function(e){return e.setOption("showInvisibles",!e.getOption("showInvisibles"))},"Ctrl-I":i,"Shift-Cmd-/":function(e){return e.toggleComment()},"Shitft-Ctrl-/":function(e){return e.toggleComment()}},this.codeMirror=new c.a(this.$el,{value:this.code,mode:this.lang,autofocus:this.autofocus,closeOnBlur:!1,foldGutter:!0,foldOptions:{widget:"..."},styleActiveLine:!0,lineNumbers:this.lineNumbers,lineWrapping:!0,gutters:["CodeMirror-linenumbers","CodeMirror-foldgutter"],tabSize:2,keyMap:"sublime",rulers:function(){var e,t;for(t=[],o=e=1;e<=30;o=++e)t.push({column:2*o,color:"#EEE",lineStyle:"dotted",width:"2px"});return t}(),viewportMargin:Infinity,extraKeys:n}),this.codeMirror.on("changes",function(e){return function(t){var n;return e.$emit("change",t.getValue()),n=t.getCursor().line,e.highlightTemplateVariablesInLine(t.getLine(n),n)}}(this)),this.codeMirror.on("cursorActivity",function(t){return function(n){if(!e.isEmpty(t.suggestions))return n.showHint({alignWithWord:!1,completeSingle:!1,hint:function(){return t.getAllHints()}})}}(this)),null!=this.codeMirror)return this.waitUntilSize(),this.highlightAllTemplateVariables()},watch:{errorLocationLines:function(t,n){var o;if(e.isEmpty(n)||e.forEach(n,(o=this,function(e){return o.codeMirror.doc.removeLineClass(e,"wrap","CodeMirror-line--error")})),!e.isEmpty(t))return e.forEach(t,function(e){return function(t){return e.codeMirror.doc.addLineClass(t,"wrap","CodeMirror-line--error")}}(this))}},methods:{closePostprocessDocumentation:function(){return this.postprocessFunctionName=null,this.codeMirror.focus()},getAllHints:function(){var e,t,n,o,i,r,s,c,d,a,u,l,f,h,m,g;if(i=this.codeMirror.getCursor(),u=i.line,r=i.ch,a=(d=this.codeMirror.getLine(i.line)).substring(0,r),Object(p.j)(a))return m=(l=Object(p.c)(d,r,this.suggestions.domains))[0],s=l[1],c=l[2],{from:{line:u,ch:m},to:{line:u,ch:s},list:c};if(Object(p.k)(a))return m=(f=Object(p.e)(d,r))[0],s=f[1],g=f[2],{from:{line:u,ch:m},to:{line:u,ch:s},list:g};if(Object(p.i)(a))return{list:c=Object(p.f)(d,r,this.suggestions.templateVariables).map(function(e){return e.from={line:u,ch:e.start},e.to={line:u,ch:e.end},e.displayText&&(e.render=function(t,n,o){var i,r;return i=o.displayText.split(" "),e=i[0],r=(r=2<=i.length?b.call(i,1):[]).join(" "),t.innerHTML=e+' <span class="tc-code-editor__hint--templated-value">'+r+"</span>"}),e})};if(Object(p.g)(a)){if(e=(h=Object(p.b)(d,r))[0],n=h[1],t=h[2],o=e.substring(0,r-n),"pos"===e.substring(0,3))return c=[{text:"postprocess: [\n"+" ".repeat(n+this.codeMirror.options.indentUnit),displayText:"postprocess"}],{from:{line:u,ch:n},to:{line:u,ch:d.length},list:c};if(Object(p.h)(this.codeMirror)&&o)return c=this.getPostprocessFunctionsHints(o,n),{from:{line:u,ch:n},to:{line:u,ch:t},list:c}}},getPostprocessFunctionsHints:function(t,n){var o;return Object(p.d)(t,e.keys(this.suggestions.postprocessFunctions)).map((o=this,function(t){var i,r;return i=o.suggestions.postprocessFunctions[t].parameters,o.suggestions.postprocessFunctions[t].doc,r=i.map(function(t){return t.name+": "+(e.isUndefined(t.default)?"":JSON.stringify(t.default))}),{text:e.union([t+":"],r).join("\n"+" ".repeat(n+o.codeMirror.options.indentUnit)),render:function(e,n,i){var r,s;return s=document.createTextNode(t),e.appendChild(s),(r=document.createElement("i")).className="fa fa-question-circle-o",r.onclick=function(e){return o.postprocessFunctionName=t,e.stopPropagation()},e.appendChild(r)}}}))},highlightAllTemplateVariables:function(){var t,n;return e.forEach(function(){t=[];for(var e=0,n=this.codeMirror.lastLine();0<=n?e<=n:e>=n;0<=n?e++:e--)t.push(e);return t}.apply(this),(n=this,function(e){return n.highlightTemplateVariablesInLine(n.codeMirror.getLine(e),e)}))},highlightTemplateVariablesInLine:function(t,n){var o,i,r,s,c,d,a,u,l;for(a=[],r=0,s=(c=Object(p.a)(t)).length;r<s;r++)l=(d=c[r])[0],u=d[1],i=d[2],this.codeMirror.findMarks({line:n,ch:u},{line:n,ch:i}).map(function(e){return e.clear()}),o=e.get(this.suggestions.templateVariables,l),a.push(this.codeMirror.markText({line:n,ch:u},{line:n,ch:i},{className:"tc-code-editor__text--highlighted",attributes:{tooltip:"current value: "+JSON.stringify(o)}}));return a},waitUntilSize:function(){return 0!==this.$el.clientWidth&&0!==this.$el.clientHeight?this.codeMirror.refresh():requestAnimationFrame((e=this,function(){return e.waitUntilSize()}));var e},updateCode:function(){if(!e.isEqual(this.code,this.codeMirror.getValue()))return this.codeMirror.setValue(this.code)},refresh:function(){return this.$nextTick().then((e=this,function(){var t;return null!=(t=e.codeMirror)?t.refresh():void 0}));var e}}}),t.default=o}.call(this,n("/app/node_modules/lodash/lodash.js"))},"/app/node_modules/babel-loader/lib/index.js!/app/node_modules/coffee-loader/index.js!/app/app/scripts/studio/utils/tc-code-editor/lang.coffee":function(e,t,n){"use strict";t.a={COFFEE:"coffeescript",CSS:"css"}},"/app/node_modules/babel-loader/lib/index.js!/app/node_modules/coffee-loader/index.js!/app/app/scripts/studio/utils/tc-code-editor/utils.coffee":function(e,t,n){"use strict";(function(e){n.d(t,"b",function(){return i}),n.d(t,"d",function(){return r}),n.d(t,"j",function(){return s}),n.d(t,"c",function(){return c}),n.d(t,"k",function(){return a}),n.d(t,"e",function(){return u}),n.d(t,"i",function(){return l}),n.d(t,"f",function(){return f}),n.d(t,"a",function(){return h}),n.d(t,"h",function(){return m}),n.d(t,"g",function(){return g});var o=[].indexOf||function(e){for(var t=0,n=this.length;t<n;t++)if(t in this&&this[t]===e)return t;return-1},i=function(e,t){var n,o,i;return n=(o=(i=e.substring(0,t).match(/(\w*)$/)).index)+i[1].length+e.substring(t).match(/^(\w*)/)[1].length,[e.slice(o,n),o,n]},r=function(t,n){var o;return(o=e.filter(n,function(n){return e.includes(n,t)})).length<1&&(o=n),e.sortBy(o)},s=function(e){return/domain\s*:\s*["']\w*$/.test(e)},c=function(e,t,n){var o,s,c,d,a,u;return o=(u=i(e,t))[0],c=u[1],s=u[2],d=o.substring(0,t-c),a=e.substring(c-1,c),[c,s+1,r(d,n).map(function(e){return{displayText:e,text:e+a}})]},d=function(e){var t;return((null!=(t=e.match(/['"]/g))?t.length:void 0)||0)%2!=0},a=function(e){return/<%?=?$/.test(e)&&d(e)},u=function(e,t){var n,o,i,r;return o=e.substring(0,t).match(/[<%=\s]*$/),n=e.substring(t).match(/^[<%=\s]*/),r=i=t,o&&(i=(r=o.index)+o[0].length),n&&(i+=n[0].length),[r,i,["<%= "]]},l=function(e){var t,n;return((null!=(t=e.match(/<%=/g))?t.length:void 0)||0)===((null!=(n=e.match(/%>/g))?n.length:void 0)||0)+1&&d(e)},p=function(e,t){var n,o,i;for(i=/^[\w\.]*$/,o=n=t;n<e.length&&i.test(e.substring(o,n+1));)n+=1;for(;o>0&&i.test(e.substring(o-1,n));)o-=1;return[e.substring(o,n),o,n]},f=function t(n,s,c){var d,a,u,l,f,h,m,g,b,v,j,_,x,y,C,M;for(x=i(n,s),l=x[0],h=x[1],f=x[2],m=l.substring(0,s-h),d=(y=p(n,s))[0],u=y[1],a=y[2],v=d.substring(0,s-u).split("."),j=u,M=e.cloneDeep(c),g=0,_=(C=v.slice(0,-1)).length;g<_;g++){if(b=C[g],!(o.call(e.keys(M),b)>=0))return t(n,j,c);M=M[b],j+=b.length+1}return"."===n.substring(f,f+1)&&(f+=1),r(m,e.keys(M)).map(function(t){var n,o;return n={text:t,start:h,end:l===t?f:a},o=M[t],e.isObject(o)?n.text+=".":n.displayText=n.text+" ("+JSON.stringify(o)+")",n})},h=function(e){var t,n,o,i,r,s,c;for(t=[],i=0;i<e.length;)c=(r=p(e,i))[0],s=r[1],n=r[2],o=e.substring(0,s),c&&l(o)&&t.push([c,s,n]),i=n+1;return t},m=function(t){var n,o,r,s,c,d,a,u,l,p,f,h,m,g,b,v;if(p=void 0,b=void 0,(o=(s=t.getCursor()).line)<1)return!1;for(a=c=f=o-1;f<=0?c<=0:c>=0;a=f<=0?++c:--c)if(u=t.getLine(a).match(/^(\s*)postprocess\s*:\s*\[\s*$/),e.isUndefined(p)&&u){p=a,b=u[1];break}if(e.isUndefined(p))return!1;for(a=d=h=p,m=o;h<=m?d<=m:d>=m;a=h<=m?++d:--d)if(t.getLine(a)===b+"]")return!1;return(g=i(t.getLine(o),s.ch))[0],r=g[1],g[2],l=r===b.length+t.options.tabSize,v=r===b.length+2*t.options.tabSize,n=t.getLine(o-1)===" ".repeat(b.length+t.options.tabSize)+"{",l||n&&v},g=function(e){return/^\s*\w*$/.test(e)}}).call(this,n("/app/node_modules/lodash/lodash.js"))},"/app/node_modules/vue-template-loader/lib/template-loader.js??ref--1-oneOf-1-0!/app/node_modules/pug-plain-loader/index.js!/app/app/scripts/studio/utils/tc-code-editor/template.vue.pug":function(e,t){var n=function(){var e=this,t=e.$createElement,n=e._self._c||t;return n("div",{staticClass:"tc-code-editor"},[e.postprocessFunctionName?n("tc-modal",{attrs:{"body-style":{width:"800px"}},on:{closed:function(t){return e.closePostprocessDocumentation()}}},[n("div",{staticClass:"tc-modal__header"},[n("div",{staticClass:"tc-modal__title"},[e._v(e._s(e.postprocessFunctionName))])]),n("div",{staticClass:"tc-modal__section"},[n("div",{staticClass:"tc-modal__documentation",domProps:{innerHTML:e._s(e.postprocessDocumentation)}})])]):e._e()],1)},o=[];e.exports=function(e){var t="function"==typeof e?e.options:e;return t.render=n,t.staticRenderFns=o,e}}}]);