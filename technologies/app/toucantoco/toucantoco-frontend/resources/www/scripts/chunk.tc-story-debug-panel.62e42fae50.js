(this.webpackJsonp=this.webpackJsonp||[]).push([["tc-story-debug-panel"],{"/app/node_modules/babel-loader/lib/index.js!/app/node_modules/coffee-loader/index.js!/app/app/scripts/slide/debug-panel/debug-panel.coffee fd3aef3e86c22c16c189ec804b44cc75":function(e,t,a){"use strict";a.r(t);var s,i,n=a("/app/node_modules/lodash/lodash.js"),l=a.n(n),r=a("/app/node_modules/v-tooltip/dist/v-tooltip.esm.js"),o=a("/app/node_modules/babel-loader/lib/index.js!/app/node_modules/coffee-loader/index.js!/app/app/scripts/api/index.coffee"),d=a("/app/node_modules/babel-loader/lib/index.js!/app/node_modules/coffee-loader/index.js!/app/app/scripts/state/index.coffee 5e8d95ee34812478c48e3afaf155bb77"),u=a("/app/node_modules/vue-template-loader/lib/template-loader.js??ref--1-oneOf-1-0!/app/node_modules/pug-plain-loader/index.js!/app/app/scripts/slide/debug-panel/section/debug-panel-section.vue.pug"),p=a.n(u);s=a("/app/node_modules/babel-loader/lib/index.js!/app/node_modules/coffee-loader/index.js!/app/app/scripts/studio/table-viewer/table-viewer.coffee"),i=a("/app/node_modules/babel-loader/lib/index.js!/app/node_modules/coffee-loader/index.js!/app/app/scripts/studio/tc-json-formatter/tc-json-formatter.coffee");var c,f=p()({name:"debug-panel-section",props:{dataset:{default:{},type:Object}},directives:{tooltip:r.a},components:{TableViewer:s,TcJsonFormatter:i,DataPipelineSheet:function(){return Promise.all([a.e("vendors~data-pipeline"),a.e("data-pipeline")]).then(a.bind(null,"/app/node_modules/babel-loader/lib/index.js!/app/node_modules/coffee-loader/index.js!/app/app/scripts/studio/data-pipeline-sheet/index.coffee fc19bf9b73cd1e2228a2e16b5305099e"))}},data:function(){return{currentTab:"dataset",editableConfig:"",explanationReports:[],isConfigTemplated:!0,isDataFiltered:!0,isDataPipelineOpened:!1,isDatasetOpen:!0,isEditQueryMode:!1,requesterErrors:[]}},computed:{displayedConfig:function(){var e;return e=this.isConfigTemplated?this.dataset.templatedConfig:this.dataset.config,JSON.stringify(e,null,2)},displayedData:function(){var e;return e=this.isDataFiltered?this.dataset.filteredData:this.dataset.unfilteredData,e||[]},filteredActionClass:function(){return{"debug-panel-dataset__action--active":this.isDataFiltered}},filters:function(){return l.a.map(this.dataset.currentFilters,function(e,t){return{column:e,value:t}})},resultActionClass:function(){return{"debug-panel-dataset__action--active":this.isConfigTemplated}},rowsCount:function(){return this.displayedData.length},shouldDisplayDetails:function(){var e;return(null!=(e=this.filters)?e.length:void 0)&&!this.getTabIsOpened("performance")},slideId:function(){return this.$store.getters.currentSlideId},templateActionClass:function(){return{"debug-panel-dataset__action--active":!this.isConfigTemplated}},unfilteredActionClass:function(){return{"debug-panel-dataset__action--active":!this.isDataFiltered}}},created:function(){var e;if(null!=(e=d.default.getters.currentSlide)?e.errors:void 0)return this.requesterErrors=d.default.getters.currentSlide.errors},methods:{closeDataPipeline:function(){return this.isDataPipelineOpened=!1},getTabClass:function(e){return{"debug-panel__tab--active":this.getTabIsOpened(e)}},getTabIsOpened:function(e){return e===this.currentTab},openDataPipeline:function(){return this.isDataPipelineOpened=!0},openTab:function(e){return e!==this.currentTab&&"performance"===e&&this.updatePerformanceTab(),this.currentTab=e},selectConfigType:function(e){return this.isConfigTemplated="template"!==e},selectDataType:function(e){return this.isDataFiltered="filtered"===e},runModifiedQuery:function(){return this.$emit("queryUpdated",JSON.parse(this.editableConfig))},toggleEditQueryMode:function(){if(this.isEditQueryMode=!this.isEditQueryMode,this.editableConfig="",this.isEditQueryMode)return this.editableConfig=this.displayedConfig},updatePerformanceTab:function(){var e,t;return e=this.isEditQueryMode?JSON.parse(this.editableConfig):this.dataset.templatedConfig,o.a.smallApp.data.explain(d.default.getters.smallAppId,{stage:d.default.getters.stage},null!=e?e.data:void 0).then((t=this,function(e){return t.explanationReports=e}))}}}),_=a("/app/node_modules/vue-template-loader/lib/template-loader.js??ref--1-oneOf-1-0!/app/node_modules/pug-plain-loader/index.js!/app/app/scripts/slide/debug-panel/debug-panel.vue.pug");c=a.n(_)()({name:"debug-panel",props:{datasets:{default:{},type:Object},explainQuery:{default:function(){return Promise.resolve()},type:Function},updateData:{default:function(){return Promise.resolve()},type:Function}},components:{DebugPanelSection:f},data:function(){return{isActive:!1,isDragged:!1,ratio:.5}},computed:{elementClass:function(){return{"debug-panel--active":this.isActive}},elementStyle:function(){return{right:this.offset,width:this.width}},offset:function(){return this.isActive?"0%":"-"+this.width},width:function(){return 100*l.a.clamp(this.ratio,.5,.75)+"%"}},methods:{startDrag:function(){var e,t,a,s;if((s=this).isActive)return e=s.$el.parentNode.getBoundingClientRect().width,t=function(t){return s.ratio=s.ratio-t.movementX/e,s.isDragged=!0},a=function(){return s.isDragged=!1,window.removeEventListener("mousemove",t),window.removeEventListener("mouseup",a)},window.addEventListener("mousemove",t),window.addEventListener("mouseup",a)},toggle:function(){return this.isDragged?this.isDragged=!1:this.isActive=!this.isActive},updateQuery:function(e){return this.$emit("queryUpdated",e)}}});t.default=c},"/app/node_modules/babel-loader/lib/index.js!/app/node_modules/coffee-loader/index.js!/app/app/scripts/studio/table-viewer/table-viewer.coffee":function(e,t,a){var s,i;i=a("/app/node_modules/lodash/lodash.js"),s=a("/app/node_modules/vue-template-loader/lib/template-loader.js!/app/app/scripts/studio/table-viewer/table-viewer.html")({computed:{columns:function(){var e,t;return(null!=(e=this.tableData)?e[0]:void 0)?i.chain(null!=(t=this.tableData)?t[0]:void 0).keys().filter(function(e){return!i.startsWith(e,"__")}).value():[]},uniqueValues:function(){var e,t,a,s,n;for(n={},t=0,a=(s=this.columns).length;t<a;t++)n[e=s[t]]=i.chain(this.tableData).map(function(t){return t[e]}).uniq().value();return n},maxNumberUniqueValues:function(){return i.chain(this.uniqueValues).map(function(e){return null!=e?e.length:void 0}).max().value()}},data:function(){return{showValues:!0}},name:"table-viewer",props:["tableData"]}),e.exports=s},"/app/node_modules/vue-template-loader/lib/template-loader.js!/app/app/scripts/studio/table-viewer/table-viewer.html":function(e,t){var a=function(){var e=this,t=e.$createElement,a=e._self._c||t;return a("div",{staticClass:"table-viewer"},[a("div",{staticClass:"table-viewer__action",on:{click:function(t){e.showValues=!e.showValues}}},[a("span",{directives:[{name:"show",rawName:"v-show",value:!e.showValues,expression:"!showValues"}]},[e._v("Show values")]),e._v(" "),a("span",{directives:[{name:"show",rawName:"v-show",value:e.showValues,expression:"showValues"}]},[e._v("Show uniques")])]),e._v(" "),e.tableData.length>0?a("table",[a("tr",e._l(e.columns,function(t){return a("th",[e._v(e._s(t))])}),0),e._v(" "),e._l(e.tableData,function(t,s){return e.showValues?a("tr",e._l(e.columns,function(s,i){return a("td",[e._v(e._s(t[s]))])}),0):e._e()}),e._v(" "),e._l(e.maxNumberUniqueValues,function(t){return e.showValues?e._e():a("tr",e._l(e.columns,function(s){return a("td",[e._v("\n        "+e._s(e.uniqueValues[s][t-1])+"\n      ")])}),0)})],2):e._e()])},s=[];e.exports=function(e){var t="function"==typeof e?e.options:e;return t.render=a,t.staticRenderFns=s,e}},"/app/node_modules/vue-template-loader/lib/template-loader.js??ref--1-oneOf-1-0!/app/node_modules/pug-plain-loader/index.js!/app/app/scripts/slide/debug-panel/debug-panel.vue.pug":function(e,t){var a=function(){var e=this,t=e.$createElement,a=e._self._c||t;return a("div",{staticClass:"debug-panel",class:e.elementClass,style:e.elementStyle},[e._l(e.datasets,function(t,s){return a("debug-panel-section",{key:s,attrs:{dataset:t},on:{queryUpdated:function(t){return e.updateQuery(t)}}})}),a("div",{staticClass:"debug-panel__button",on:{mousedown:function(t){return e.startDrag()},mouseup:function(t){return e.toggle()}}},[a("i",{staticClass:"fa fa-code"}),a("i",{staticClass:"fa fa-arrows"})])],2)},s=[];e.exports=function(e){var t="function"==typeof e?e.options:e;return t.render=a,t.staticRenderFns=s,e}},"/app/node_modules/vue-template-loader/lib/template-loader.js??ref--1-oneOf-1-0!/app/node_modules/pug-plain-loader/index.js!/app/app/scripts/slide/debug-panel/section/debug-panel-section.vue.pug":function(e,t){var a=function(){var e=this,t=e.$createElement,a=e._self._c||t;return a("div",{staticClass:"debug-panel__section"},[a("div",{staticClass:"debug-panel__header"},[a("div",{staticClass:"debug-panel__tab",class:e.getTabClass("dataset"),on:{click:function(t){return e.openTab("dataset")}}},[e._v("Dataset")]),a("div",{staticClass:"debug-panel__tab",class:e.getTabClass("parameters"),on:{click:function(t){return e.openTab("parameters")}}},[e._v("Parameters")]),a("div",{staticClass:"debug-panel__tab",class:e.getTabClass("performance"),on:{click:function(t){return e.openTab("performance")}}},[e._v("Performance")])]),a("div",{staticClass:"debug-panel__body"},[a("div",{directives:[{name:"tooltip",rawName:"v-tooltip",value:"Click to see the data pipeline",expression:"'Click to see the data pipeline'"}],staticClass:"debug-panel__data-pipeline",on:{click:function(t){return e.openDataPipeline()}}},[a("i",{staticClass:"fa fa-gears"}),e._v("Data Pipeline")]),e.isDataPipelineOpened?a("data-pipeline-sheet",{attrs:{slideId:e.slideId},on:{closed:function(t){return e.closeDataPipeline()}}}):e._e(),e.dataset.currentFilterErrors?a("div",{staticClass:"debug-panel__errors"},e._l(e.dataset.currentFilterErrors,function(t,s){return a("div",{key:s},[e._v("Filter on"),a("span",[e._v(e._s(t.column))]),e._v("impossible, column may not exist !")])}),0):e._e(),e.requesterErrors.length?a("div",{staticClass:"debug-panel__errors"},e._l(e.requesterErrors,function(t,s){return a("div",{key:s},[e._v(e._s(t.message)+", check"),t.content.filter?a("span",[e._v(e._s(t.content.filter))]):e._e()])}),0):e._e(),e.shouldDisplayDetails?a("div",{staticClass:"debug-panel__details"},e._l(e.filters,function(t,s){return a("div",{key:s,staticClass:"debug-panel__detail"},[a("i",{staticClass:"fa fa-filter"}),e._v(e._s(t.column)+" filtered on "+e._s(t.value))])}),0):e._e(),e.getTabIsOpened("dataset")?a("div",{staticClass:"debug-panel-dataset"},[a("div",{staticClass:"debug-panel-dataset__legend"},[a("div",{staticClass:"debug-panel-dataset__title"},[e._v("Dataset "+e._s(e.dataset.id)),a("span",{staticClass:"debug-panel-dataset__info"},[e._v("("+e._s(e.rowsCount)+" rows)")])]),a("div",{staticClass:"debug-panel-dataset__actions"},[a("div",{staticClass:"debug-panel-dataset__action",class:e.unfilteredActionClass,on:{click:function(t){return e.selectDataType("all")}}},[e._v("All")]),a("div",{staticClass:"debug-panel-dataset__action",class:e.filteredActionClass,on:{click:function(t){return e.selectDataType("filtered")}}},[e._v("Filtered")])])]),a("table-viewer",{attrs:{"table-data":e.displayedData}})],1):e._e(),e.getTabIsOpened("parameters")?a("div",{staticClass:"debug-panel-dataset"},[a("div",{staticClass:"debug-panel-dataset__legend"},[a("div",{staticClass:"debug-panel-dataset__title"},[e._v("Dataset "+e._s(e.dataset.id))]),a("div",{staticClass:"debug-panel-dataset__actions"},[a("div",{staticClass:"debug-panel-dataset__action",class:e.templateActionClass,on:{click:function(t){return e.selectConfigType("template")}}},[e._v("Template")]),a("div",{staticClass:"debug-panel-dataset__action",class:e.resultActionClass,on:{click:function(t){return e.selectConfigType("result")}}},[e._v("Result")])])]),a("div",{staticClass:"debug-panel-dataset__code-edit-actions"},[e.isEditQueryMode?e._e():a("div",{staticClass:"debug-panel-dataset__code-edit-action",on:{click:function(t){return e.toggleEditQueryMode()}}},[a("i",{staticClass:"fa fa-pencil"}),e._v("Edit & test")]),e.isEditQueryMode?a("div",[e._v("Now editing")]):e._e(),e.isEditQueryMode?a("div",{staticClass:"debug-panel-dataset__code-edit-action",on:{click:function(t){return e.runModifiedQuery()}}},[a("i",{staticClass:"fa fa-rocket"}),e._v("Run query")]):e._e()]),e.isEditQueryMode?e._e():a("div",{staticClass:"debug-panel-dataset__config"},[a("pre",{staticClass:"debug-panel-dataset__code"},[e._v(e._s(e.displayedConfig))])]),e.isEditQueryMode?a("div",{staticClass:"debug-panel-dataset__config"},[a("textarea",{directives:[{name:"model",rawName:"v-model",value:e.editableConfig,expression:"editableConfig"}],staticClass:"debug-panel-dataset__code",attrs:{wrap:"off"},domProps:{value:e.editableConfig},on:{input:function(t){t.target.composing||(e.editableConfig=t.target.value)}}})]):e._e()]):e._e(),e.getTabIsOpened("performance")?a("div",{staticClass:"debug-panel-dataset debug-panel-dataset--performance"},e._l(e.explanationReports,function(t,s){return a("div",{key:s,staticClass:"debug-panel__performance-report-block"},[a("div",[e._v("Summary:")]),a("tc-json-formatter",{attrs:{"json-data":t.summary}}),a("div",[e._v("Details:")]),a("tc-json-formatter",{attrs:{"default-open":0,"json-data":t.details}})],1)}),0):e._e()],1)])},s=[];e.exports=function(e){var t="function"==typeof e?e.options:e;return t.render=a,t.staticRenderFns=s,e}}}]);