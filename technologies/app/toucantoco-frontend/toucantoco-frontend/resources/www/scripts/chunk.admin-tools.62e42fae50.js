(this.webpackJsonp=this.webpackJsonp||[]).push([["admin-tools"],{"/app/node_modules/babel-loader/lib/index.js!/app/app/scripts/instance-settings/instance-settings-ng.js 3d3dc15af640f6fc557155b45bbcd0c2":function(e,t,s){"use strict";s.r(t);var n=s("/app/node_modules/vue/dist/vue.common.js"),a=s.n(n),o=s("/app/node_modules/babel-loader/lib/index.js!/app/node_modules/coffee-loader/index.js!/app/app/scripts/state/index.coffee 5e8d95ee34812478c48e3afaf155bb77"),i=[function(){var e=this.$createElement,t=this._self._c||e;return t("nav",{staticClass:"navbar header header-studio navbar-default navbar-static-top",attrs:{role:"navigation"}},[t("div",{staticClass:"header-left-container"},[t("div",{staticClass:"centered-content"},[t("a",{staticClass:"back-button",attrs:{href:"/"}},[t("i",{staticClass:"fa fa-long-arrow-left"}),t("span",{staticClass:"header-button-text"},[this._v("Back")])])])]),this._v(" "),t("div",{staticClass:"header-middle-container"},[t("div",{staticClass:"centered-content"},[t("img",{staticClass:"brand-studio",attrs:{src:s("/app/node_modules/file-loader/dist/cjs.js??ref--10-0!/app/app/assets/images/logo-toucantoco.png")}}),this._v(" "),t("div",{staticClass:"header-title"})])]),this._v(" "),t("div",{staticClass:"header-right-container"},[t("div",{staticClass:"centered-content"})])])}],r=s("/app/node_modules/file-saver/FileSaver.js"),d=s("/app/node_modules/lodash/lodash.js"),l=s("/app/node_modules/babel-loader/lib/index.js!/app/node_modules/coffee-loader/index.js!/app/app/scripts/api/index.coffee"),c=s("/app/node_modules/babel-loader/lib/index.js!/app/node_modules/coffee-loader/index.js!/app/app/scripts/studio/utils/cson.coffee"),p=s.n(c);function u(e,t){var s=Object.keys(e);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(e);t&&(n=n.filter(function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable})),s.push.apply(s,n)}return s}function f(e,t,s){return t in e?Object.defineProperty(e,t,{value:s,enumerable:!0,configurable:!0,writable:!0}):e[t]=s,e}var g={components:{UploadCard:s("/app/node_modules/babel-loader/lib/index.js!/app/app/scripts/small-app/conceptor-tools/upload-card/index.js ea5481a13f47f0972c74064fb4c8ab95").default},data:function(){return{buttons:["downloadButton"],instanceSettings:null,instanceSettingsFileName:"instance_settings",storeLogoFileName:"icon_store"}},computed:{authProviders:function(){var e=Object(d.get)(this.instanceSettings,"settings.auth_providers",[]);return e.map(function(e){return function(e){for(var t=1;t<arguments.length;t++){var s=null!=arguments[t]?arguments[t]:{};t%2?u(s,!0).forEach(function(t){f(e,t,s[t])}):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(s)):u(s).forEach(function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(s,t))})}return e}({fileName:e.id||e.type},e)})},meta:function(){return{getAssetLocationUrl:this.getAssetLocationUrl,isStagingFileAvailable:!1,isProductionFileAvailable:!0}}},created:function(){var e=this;l.a.instanceSettings.getInstanceSettings().then(function(t){return e.instanceSettings=t})},methods:{downloadAssetFile:function(){var e=this;l.a.assets.get(null,this.storeLogoFileName).then(function(t){var s=/[^\/]+$/.exec(t.type);return Object(r.saveAs)(t,"".concat(e.storeLogoFileName,".").concat(s))})},downloadAuthProviderFile:function(e){l.a.instanceSettings.getAuthProviderRules(e).then(function(t){var s="".concat(e,".py"),n=new Blob([t],{type:"text/plain;charset=utf-8"});return Object(r.saveAs)(n,s)})},downloadInstanceSettingsFile:function(){var e=this;l.a.instanceSettings.getInstanceSettings().then(function(t){var s=p.a.stringify(t.settings),n="".concat(e.instanceSettingsFileName,".cson"),a=new Blob([s],{type:"text/cson;charset=utf-8"});return Object(r.saveAs)(a,n)})},getAssetLocationUrl:function(e){return l.a.assets.getAssetElementLocation(null,e)},readContent:function(e,t){var s=p.a.parseAndHandleError(t.target.result),n=s.body,a=s.error,o=s.rawError;if(a){var i="Failed to transform cson to object. ".concat(o.toString());this.setUploadCardErrorMessage(e,i)}else{var r=n;this.saveInstanceSettings(r,e)}},saveInstanceSettings:function(e,t){var s=this;l.a.instanceSettings.saveInstanceSettings(e).then(function(){s.setUploadCardConfirmationMessage(t,"Settings saved!")}).catch(function(e){var n=Object(d.get)(e,"message"),a=Object(d.get)(e,"details");s.setUploadCardErrorMessage(t,n,a)})},setUploadCardErrorMessage:function(e,t,s){e.isUploaded=!1,e.$set(e,"feedback",{error:!0,message:t||"Something went wrong",content:s})},setUploadCardConfirmationMessage:function(e,t){e.isUploaded=!0,e.$set(e,"feedback",{error:!1,message:t})},uploadAuthProviderFile:function(e,t){var s=this;e&&1!==e.length||(t.$set(t,"feedback",{error:!1}),l.a.instanceSettings.saveAuthProviderRules(t.name,e[0]).then(function(){s.setUploadCardConfirmationMessage(t,"Rules saved!")}).catch(function(e){s.setUploadCardErrorMessage(t,e)}))},uploadAssetFile:function(e,t){var s=this;e&&1!==e.length||l.a.assets.saveAsset(null,this.storeLogoFileName,e[0]).then(function(){s.setUploadCardConfirmationMessage(t,"Asset saved!")}).catch(function(e){s.setUploadCardErrorMessage(t,e)})},uploadInstanceSettingsFile:function(e,t){if(!e||1===e.length){var s=new FileReader;return s.onload=this.readContent.bind(this,t),s.readAsText(e[0])}}}},v=(s("/app/node_modules/vue-loader/lib/loaders/pitcher.js??ref--4!/app/node_modules/mini-css-extract-plugin/dist/loader.js!/app/node_modules/css-loader/dist/cjs.js??ref--5-1!/app/node_modules/resolve-url-loader/index.js??ref--5-2!/app/node_modules/postcss-loader/src/index.js??ref--5-3!/app/node_modules/sass-loader/dist/cjs.js??ref--5-4!/app/node_modules/vue-loader/lib/index.js??vue-loader-options!/app/app/scripts/instance-settings/InstanceSettings.vue?vue&type=style&index=0&id=1f1041c8&scoped=true&lang=scss&"),s("/app/node_modules/vue-loader/lib/runtime/componentNormalizer.js")),m=Object(v.a)(g,function(){var e=this,t=e.$createElement,s=e._self._c||t;return s("div",{staticClass:"instance-settings"},[e._m(0),e._v(" "),s("div",{staticClass:"instance-settings-body"},[s("div",{staticClass:"template-container template-container--light"},[s("h1",{staticClass:"h1--darken"},[e._v("Upload settings")]),e._v(" "),s("section",{staticClass:"conceptor-tools__editor-config conceptor-tools__editor-config--margin"},[s("div",{attrs:{id:"instance-settings"}},[s("div",{staticClass:"conceptor-tools__blocks-container"},[s("UploadCard",{attrs:{buttons:e.buttons,"download-file":e.downloadInstanceSettingsFile,meta:e.meta,name:e.instanceSettingsFileName,"studio-section":"settings","upload-file":e.uploadInstanceSettingsFile}})],1)])])]),e._v(" "),s("div",{staticClass:"template-container"},[s("h1",[e._v("Upload store logo")]),e._v(" "),s("section",{staticClass:"conceptor-tools__editor-config conceptor-tools__editor-config--margin"},[s("div",{attrs:{id:"instance-assets"}},[s("div",{staticClass:"conceptor-tools__blocks-container"},[s("UploadCard",{attrs:{buttons:e.buttons,"download-file":e.downloadAssetFile,meta:e.meta,name:e.storeLogoFileName,"studio-section":"assets","upload-file":e.uploadAssetFile}})],1)])])]),e._v(" "),s("div",{staticClass:"template-container template-container--light"},[s("h1",{staticClass:"h1--darken"},[e._v("Upload authentication providers rules")]),e._v(" "),s("section",{staticClass:"conceptor-tools__editor-config conceptor-tools__editor-config--margin"},[s("div",{attrs:{id:"instance-auth-providers-rules"}},[s("div",{staticClass:"conceptor-tools__blocks-container"},e._l(e.authProviders,function(t,n){return s("UploadCard",{key:n,attrs:{buttons:e.buttons,"download-file":function(){return e.downloadAuthProviderFile(t.fileName)},meta:e.meta,name:t.fileName,"studio-section":"settings","upload-file":e.uploadAuthProviderFile}})}),1)])])])])])},i,!1,null,"1f1041c8",null).exports;angular.module("tucana.settings").directive("instanceSettingsNg",function(){return{restrict:"E",template:'<div id="instance-settings-ng"></div>',link:function(e,t){var s=new a.a({el:t[0].querySelector("#instance-settings-ng"),store:o.default,name:"InstanceSettingsNg",components:{InstanceSettings:m},render:function(e){return e("instance-settings")}});e.$on("$destroy",function(){return s.$destroy()})}}})},"/app/node_modules/babel-loader/lib/index.js!/app/app/scripts/instance-settings/module.js":function(e,t,s){"use strict";s.r(t),t.default=angular.module("tucana.settings",["ng","tucana.api","tucana.store","tucana.directives"]).name,s("/app/node_modules/babel-loader/lib/index.js!/app/app/scripts/instance-settings/instance-settings-ng.js 3d3dc15af640f6fc557155b45bbcd0c2")},"/app/node_modules/mini-css-extract-plugin/dist/loader.js!/app/node_modules/css-loader/dist/cjs.js??ref--5-1!/app/node_modules/vue-loader/lib/loaders/stylePostLoader.js!/app/node_modules/resolve-url-loader/index.js??ref--5-2!/app/node_modules/postcss-loader/src/index.js??ref--5-3!/app/node_modules/sass-loader/dist/cjs.js??ref--5-4!/app/node_modules/vue-loader/lib/index.js??vue-loader-options!/app/app/scripts/instance-settings/InstanceSettings.vue?vue&type=style&index=0&id=1f1041c8&scoped=true&lang=scss&":function(e,t,s){},"/app/node_modules/vue-loader/lib/loaders/pitcher.js??ref--4!/app/node_modules/mini-css-extract-plugin/dist/loader.js!/app/node_modules/css-loader/dist/cjs.js??ref--5-1!/app/node_modules/resolve-url-loader/index.js??ref--5-2!/app/node_modules/postcss-loader/src/index.js??ref--5-3!/app/node_modules/sass-loader/dist/cjs.js??ref--5-4!/app/node_modules/vue-loader/lib/index.js??vue-loader-options!/app/app/scripts/instance-settings/InstanceSettings.vue?vue&type=style&index=0&id=1f1041c8&scoped=true&lang=scss&":function(e,t,s){"use strict";var n=s("/app/node_modules/mini-css-extract-plugin/dist/loader.js!/app/node_modules/css-loader/dist/cjs.js??ref--5-1!/app/node_modules/vue-loader/lib/loaders/stylePostLoader.js!/app/node_modules/resolve-url-loader/index.js??ref--5-2!/app/node_modules/postcss-loader/src/index.js??ref--5-3!/app/node_modules/sass-loader/dist/cjs.js??ref--5-4!/app/node_modules/vue-loader/lib/index.js??vue-loader-options!/app/app/scripts/instance-settings/InstanceSettings.vue?vue&type=style&index=0&id=1f1041c8&scoped=true&lang=scss&");s.n(n).a}}]);