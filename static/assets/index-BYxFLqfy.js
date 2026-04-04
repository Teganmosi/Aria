(function(){const u=document.createElement("link").relList;if(u&&u.supports&&u.supports("modulepreload"))return;for(const m of document.querySelectorAll('link[rel="modulepreload"]'))c(m);new MutationObserver(m=>{for(const p of m)if(p.type==="childList")for(const h of p.addedNodes)h.tagName==="LINK"&&h.rel==="modulepreload"&&c(h)}).observe(document,{childList:!0,subtree:!0});function d(m){const p={};return m.integrity&&(p.integrity=m.integrity),m.referrerPolicy&&(p.referrerPolicy=m.referrerPolicy),m.crossOrigin==="use-credentials"?p.credentials="include":m.crossOrigin==="anonymous"?p.credentials="omit":p.credentials="same-origin",p}function c(m){if(m.ep)return;m.ep=!0;const p=d(m);fetch(m.href,p)}})();function Zm(o){return o&&o.__esModule&&Object.prototype.hasOwnProperty.call(o,"default")?o.default:o}var Vs={exports:{}},Vl={};var xm;function K0(){if(xm)return Vl;xm=1;var o=Symbol.for("react.transitional.element"),u=Symbol.for("react.fragment");function d(c,m,p){var h=null;if(p!==void 0&&(h=""+p),m.key!==void 0&&(h=""+m.key),"key"in m){p={};for(var w in m)w!=="key"&&(p[w]=m[w])}else p=m;return m=p.ref,{$$typeof:o,type:c,key:h,ref:m!==void 0?m:null,props:p}}return Vl.Fragment=u,Vl.jsx=d,Vl.jsxs=d,Vl}var jm;function W0(){return jm||(jm=1,Vs.exports=K0()),Vs.exports}var r=W0(),Xs={exports:{}},ce={};var Sm;function F0(){if(Sm)return ce;Sm=1;var o=Symbol.for("react.transitional.element"),u=Symbol.for("react.portal"),d=Symbol.for("react.fragment"),c=Symbol.for("react.strict_mode"),m=Symbol.for("react.profiler"),p=Symbol.for("react.consumer"),h=Symbol.for("react.context"),w=Symbol.for("react.forward_ref"),v=Symbol.for("react.suspense"),b=Symbol.for("react.memo"),z=Symbol.for("react.lazy"),S=Symbol.for("react.activity"),O=Symbol.iterator;function q(j){return j===null||typeof j!="object"?null:(j=O&&j[O]||j["@@iterator"],typeof j=="function"?j:null)}var Y={isMounted:function(){return!1},enqueueForceUpdate:function(){},enqueueReplaceState:function(){},enqueueSetState:function(){}},M=Object.assign,_={};function Z(j,U,Q){this.props=j,this.context=U,this.refs=_,this.updater=Q||Y}Z.prototype.isReactComponent={},Z.prototype.setState=function(j,U){if(typeof j!="object"&&typeof j!="function"&&j!=null)throw Error("takes an object of state variables to update or a function which returns an object of state variables.");this.updater.enqueueSetState(this,j,U,"setState")},Z.prototype.forceUpdate=function(j){this.updater.enqueueForceUpdate(this,j,"forceUpdate")};function P(){}P.prototype=Z.prototype;function L(j,U,Q){this.props=j,this.context=U,this.refs=_,this.updater=Q||Y}var te=L.prototype=new P;te.constructor=L,M(te,Z.prototype),te.isPureReactComponent=!0;var X=Array.isArray;function W(){}var B={H:null,A:null,T:null,S:null},J=Object.prototype.hasOwnProperty;function ae(j,U,Q){var K=Q.ref;return{$$typeof:o,type:j,key:U,ref:K!==void 0?K:null,props:Q}}function xe(j,U){return ae(j.type,U,j.props)}function Se(j){return typeof j=="object"&&j!==null&&j.$$typeof===o}function F(j){var U={"=":"=0",":":"=2"};return"$"+j.replace(/[=:]/g,function(Q){return U[Q]})}var re=/\/+/g;function me(j,U){return typeof j=="object"&&j!==null&&j.key!=null?F(""+j.key):U.toString(36)}function ue(j){switch(j.status){case"fulfilled":return j.value;case"rejected":throw j.reason;default:switch(typeof j.status=="string"?j.then(W,W):(j.status="pending",j.then(function(U){j.status==="pending"&&(j.status="fulfilled",j.value=U)},function(U){j.status==="pending"&&(j.status="rejected",j.reason=U)})),j.status){case"fulfilled":return j.value;case"rejected":throw j.reason}}throw j}function C(j,U,Q,K,se){var V=typeof j;(V==="undefined"||V==="boolean")&&(j=null);var ne=!1;if(j===null)ne=!0;else switch(V){case"bigint":case"string":case"number":ne=!0;break;case"object":switch(j.$$typeof){case o:case u:ne=!0;break;case z:return ne=j._init,C(ne(j._payload),U,Q,K,se)}}if(ne)return se=se(j),ne=K===""?"."+me(j,0):K,X(se)?(Q="",ne!=null&&(Q=ne.replace(re,"$&/")+"/"),C(se,U,Q,"",function(Wn){return Wn})):se!=null&&(Se(se)&&(se=xe(se,Q+(se.key==null||j&&j.key===se.key?"":(""+se.key).replace(re,"$&/")+"/")+ne)),U.push(se)),1;ne=0;var je=K===""?".":K+":";if(X(j))for(var Re=0;Re<j.length;Re++)K=j[Re],V=je+me(K,Re),ne+=C(K,U,Q,V,se);else if(Re=q(j),typeof Re=="function")for(j=Re.call(j),Re=0;!(K=j.next()).done;)K=K.value,V=je+me(K,Re++),ne+=C(K,U,Q,V,se);else if(V==="object"){if(typeof j.then=="function")return C(ue(j),U,Q,K,se);throw U=String(j),Error("Objects are not valid as a React child (found: "+(U==="[object Object]"?"object with keys {"+Object.keys(j).join(", ")+"}":U)+"). If you meant to render a collection of children, use an array instead.")}return ne}function G(j,U,Q){if(j==null)return j;var K=[],se=0;return C(j,K,"","",function(V){return U.call(Q,V,se++)}),K}function ee(j){if(j._status===-1){var U=j._result;U=U(),U.then(function(Q){(j._status===0||j._status===-1)&&(j._status=1,j._result=Q)},function(Q){(j._status===0||j._status===-1)&&(j._status=2,j._result=Q)}),j._status===-1&&(j._status=0,j._result=U)}if(j._status===1)return j._result.default;throw j._result}var he=typeof reportError=="function"?reportError:function(j){if(typeof window=="object"&&typeof window.ErrorEvent=="function"){var U=new window.ErrorEvent("error",{bubbles:!0,cancelable:!0,message:typeof j=="object"&&j!==null&&typeof j.message=="string"?String(j.message):String(j),error:j});if(!window.dispatchEvent(U))return}else if(typeof process=="object"&&typeof process.emit=="function"){process.emit("uncaughtException",j);return}console.error(j)},ze={map:G,forEach:function(j,U,Q){G(j,function(){U.apply(this,arguments)},Q)},count:function(j){var U=0;return G(j,function(){U++}),U},toArray:function(j){return G(j,function(U){return U})||[]},only:function(j){if(!Se(j))throw Error("React.Children.only expected to receive a single React element child.");return j}};return ce.Activity=S,ce.Children=ze,ce.Component=Z,ce.Fragment=d,ce.Profiler=m,ce.PureComponent=L,ce.StrictMode=c,ce.Suspense=v,ce.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE=B,ce.__COMPILER_RUNTIME={__proto__:null,c:function(j){return B.H.useMemoCache(j)}},ce.cache=function(j){return function(){return j.apply(null,arguments)}},ce.cacheSignal=function(){return null},ce.cloneElement=function(j,U,Q){if(j==null)throw Error("The argument must be a React element, but you passed "+j+".");var K=M({},j.props),se=j.key;if(U!=null)for(V in U.key!==void 0&&(se=""+U.key),U)!J.call(U,V)||V==="key"||V==="__self"||V==="__source"||V==="ref"&&U.ref===void 0||(K[V]=U[V]);var V=arguments.length-2;if(V===1)K.children=Q;else if(1<V){for(var ne=Array(V),je=0;je<V;je++)ne[je]=arguments[je+2];K.children=ne}return ae(j.type,se,K)},ce.createContext=function(j){return j={$$typeof:h,_currentValue:j,_currentValue2:j,_threadCount:0,Provider:null,Consumer:null},j.Provider=j,j.Consumer={$$typeof:p,_context:j},j},ce.createElement=function(j,U,Q){var K,se={},V=null;if(U!=null)for(K in U.key!==void 0&&(V=""+U.key),U)J.call(U,K)&&K!=="key"&&K!=="__self"&&K!=="__source"&&(se[K]=U[K]);var ne=arguments.length-2;if(ne===1)se.children=Q;else if(1<ne){for(var je=Array(ne),Re=0;Re<ne;Re++)je[Re]=arguments[Re+2];se.children=je}if(j&&j.defaultProps)for(K in ne=j.defaultProps,ne)se[K]===void 0&&(se[K]=ne[K]);return ae(j,V,se)},ce.createRef=function(){return{current:null}},ce.forwardRef=function(j){return{$$typeof:w,render:j}},ce.isValidElement=Se,ce.lazy=function(j){return{$$typeof:z,_payload:{_status:-1,_result:j},_init:ee}},ce.memo=function(j,U){return{$$typeof:b,type:j,compare:U===void 0?null:U}},ce.startTransition=function(j){var U=B.T,Q={};B.T=Q;try{var K=j(),se=B.S;se!==null&&se(Q,K),typeof K=="object"&&K!==null&&typeof K.then=="function"&&K.then(W,he)}catch(V){he(V)}finally{U!==null&&Q.types!==null&&(U.types=Q.types),B.T=U}},ce.unstable_useCacheRefresh=function(){return B.H.useCacheRefresh()},ce.use=function(j){return B.H.use(j)},ce.useActionState=function(j,U,Q){return B.H.useActionState(j,U,Q)},ce.useCallback=function(j,U){return B.H.useCallback(j,U)},ce.useContext=function(j){return B.H.useContext(j)},ce.useDebugValue=function(){},ce.useDeferredValue=function(j,U){return B.H.useDeferredValue(j,U)},ce.useEffect=function(j,U){return B.H.useEffect(j,U)},ce.useEffectEvent=function(j){return B.H.useEffectEvent(j)},ce.useId=function(){return B.H.useId()},ce.useImperativeHandle=function(j,U,Q){return B.H.useImperativeHandle(j,U,Q)},ce.useInsertionEffect=function(j,U){return B.H.useInsertionEffect(j,U)},ce.useLayoutEffect=function(j,U){return B.H.useLayoutEffect(j,U)},ce.useMemo=function(j,U){return B.H.useMemo(j,U)},ce.useOptimistic=function(j,U){return B.H.useOptimistic(j,U)},ce.useReducer=function(j,U,Q){return B.H.useReducer(j,U,Q)},ce.useRef=function(j){return B.H.useRef(j)},ce.useState=function(j){return B.H.useState(j)},ce.useSyncExternalStore=function(j,U,Q){return B.H.useSyncExternalStore(j,U,Q)},ce.useTransition=function(){return B.H.useTransition()},ce.version="19.2.4",ce}var wm;function sc(){return wm||(wm=1,Xs.exports=F0()),Xs.exports}var g=sc();const I0=Zm(g);var Qs={exports:{}},Xl={},Zs={exports:{}},$s={};var Nm;function P0(){return Nm||(Nm=1,(function(o){function u(C,G){var ee=C.length;C.push(G);e:for(;0<ee;){var he=ee-1>>>1,ze=C[he];if(0<m(ze,G))C[he]=G,C[ee]=ze,ee=he;else break e}}function d(C){return C.length===0?null:C[0]}function c(C){if(C.length===0)return null;var G=C[0],ee=C.pop();if(ee!==G){C[0]=ee;e:for(var he=0,ze=C.length,j=ze>>>1;he<j;){var U=2*(he+1)-1,Q=C[U],K=U+1,se=C[K];if(0>m(Q,ee))K<ze&&0>m(se,Q)?(C[he]=se,C[K]=ee,he=K):(C[he]=Q,C[U]=ee,he=U);else if(K<ze&&0>m(se,ee))C[he]=se,C[K]=ee,he=K;else break e}}return G}function m(C,G){var ee=C.sortIndex-G.sortIndex;return ee!==0?ee:C.id-G.id}if(o.unstable_now=void 0,typeof performance=="object"&&typeof performance.now=="function"){var p=performance;o.unstable_now=function(){return p.now()}}else{var h=Date,w=h.now();o.unstable_now=function(){return h.now()-w}}var v=[],b=[],z=1,S=null,O=3,q=!1,Y=!1,M=!1,_=!1,Z=typeof setTimeout=="function"?setTimeout:null,P=typeof clearTimeout=="function"?clearTimeout:null,L=typeof setImmediate<"u"?setImmediate:null;function te(C){for(var G=d(b);G!==null;){if(G.callback===null)c(b);else if(G.startTime<=C)c(b),G.sortIndex=G.expirationTime,u(v,G);else break;G=d(b)}}function X(C){if(M=!1,te(C),!Y)if(d(v)!==null)Y=!0,W||(W=!0,F());else{var G=d(b);G!==null&&ue(X,G.startTime-C)}}var W=!1,B=-1,J=5,ae=-1;function xe(){return _?!0:!(o.unstable_now()-ae<J)}function Se(){if(_=!1,W){var C=o.unstable_now();ae=C;var G=!0;try{e:{Y=!1,M&&(M=!1,P(B),B=-1),q=!0;var ee=O;try{t:{for(te(C),S=d(v);S!==null&&!(S.expirationTime>C&&xe());){var he=S.callback;if(typeof he=="function"){S.callback=null,O=S.priorityLevel;var ze=he(S.expirationTime<=C);if(C=o.unstable_now(),typeof ze=="function"){S.callback=ze,te(C),G=!0;break t}S===d(v)&&c(v),te(C)}else c(v);S=d(v)}if(S!==null)G=!0;else{var j=d(b);j!==null&&ue(X,j.startTime-C),G=!1}}break e}finally{S=null,O=ee,q=!1}G=void 0}}finally{G?F():W=!1}}}var F;if(typeof L=="function")F=function(){L(Se)};else if(typeof MessageChannel<"u"){var re=new MessageChannel,me=re.port2;re.port1.onmessage=Se,F=function(){me.postMessage(null)}}else F=function(){Z(Se,0)};function ue(C,G){B=Z(function(){C(o.unstable_now())},G)}o.unstable_IdlePriority=5,o.unstable_ImmediatePriority=1,o.unstable_LowPriority=4,o.unstable_NormalPriority=3,o.unstable_Profiling=null,o.unstable_UserBlockingPriority=2,o.unstable_cancelCallback=function(C){C.callback=null},o.unstable_forceFrameRate=function(C){0>C||125<C?console.error("forceFrameRate takes a positive int between 0 and 125, forcing frame rates higher than 125 fps is not supported"):J=0<C?Math.floor(1e3/C):5},o.unstable_getCurrentPriorityLevel=function(){return O},o.unstable_next=function(C){switch(O){case 1:case 2:case 3:var G=3;break;default:G=O}var ee=O;O=G;try{return C()}finally{O=ee}},o.unstable_requestPaint=function(){_=!0},o.unstable_runWithPriority=function(C,G){switch(C){case 1:case 2:case 3:case 4:case 5:break;default:C=3}var ee=O;O=C;try{return G()}finally{O=ee}},o.unstable_scheduleCallback=function(C,G,ee){var he=o.unstable_now();switch(typeof ee=="object"&&ee!==null?(ee=ee.delay,ee=typeof ee=="number"&&0<ee?he+ee:he):ee=he,C){case 1:var ze=-1;break;case 2:ze=250;break;case 5:ze=1073741823;break;case 4:ze=1e4;break;default:ze=5e3}return ze=ee+ze,C={id:z++,callback:G,priorityLevel:C,startTime:ee,expirationTime:ze,sortIndex:-1},ee>he?(C.sortIndex=ee,u(b,C),d(v)===null&&C===d(b)&&(M?(P(B),B=-1):M=!0,ue(X,ee-he))):(C.sortIndex=ze,u(v,C),Y||q||(Y=!0,W||(W=!0,F()))),C},o.unstable_shouldYield=xe,o.unstable_wrapCallback=function(C){var G=O;return function(){var ee=O;O=G;try{return C.apply(this,arguments)}finally{O=ee}}}})($s)),$s}var zm;function eg(){return zm||(zm=1,Zs.exports=P0()),Zs.exports}var Js={exports:{}},lt={};var Em;function tg(){if(Em)return lt;Em=1;var o=sc();function u(v){var b="https://react.dev/errors/"+v;if(1<arguments.length){b+="?args[]="+encodeURIComponent(arguments[1]);for(var z=2;z<arguments.length;z++)b+="&args[]="+encodeURIComponent(arguments[z])}return"Minified React error #"+v+"; visit "+b+" for the full message or use the non-minified dev environment for full errors and additional helpful warnings."}function d(){}var c={d:{f:d,r:function(){throw Error(u(522))},D:d,C:d,L:d,m:d,X:d,S:d,M:d},p:0,findDOMNode:null},m=Symbol.for("react.portal");function p(v,b,z){var S=3<arguments.length&&arguments[3]!==void 0?arguments[3]:null;return{$$typeof:m,key:S==null?null:""+S,children:v,containerInfo:b,implementation:z}}var h=o.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE;function w(v,b){if(v==="font")return"";if(typeof b=="string")return b==="use-credentials"?b:""}return lt.__DOM_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE=c,lt.createPortal=function(v,b){var z=2<arguments.length&&arguments[2]!==void 0?arguments[2]:null;if(!b||b.nodeType!==1&&b.nodeType!==9&&b.nodeType!==11)throw Error(u(299));return p(v,b,null,z)},lt.flushSync=function(v){var b=h.T,z=c.p;try{if(h.T=null,c.p=2,v)return v()}finally{h.T=b,c.p=z,c.d.f()}},lt.preconnect=function(v,b){typeof v=="string"&&(b?(b=b.crossOrigin,b=typeof b=="string"?b==="use-credentials"?b:"":void 0):b=null,c.d.C(v,b))},lt.prefetchDNS=function(v){typeof v=="string"&&c.d.D(v)},lt.preinit=function(v,b){if(typeof v=="string"&&b&&typeof b.as=="string"){var z=b.as,S=w(z,b.crossOrigin),O=typeof b.integrity=="string"?b.integrity:void 0,q=typeof b.fetchPriority=="string"?b.fetchPriority:void 0;z==="style"?c.d.S(v,typeof b.precedence=="string"?b.precedence:void 0,{crossOrigin:S,integrity:O,fetchPriority:q}):z==="script"&&c.d.X(v,{crossOrigin:S,integrity:O,fetchPriority:q,nonce:typeof b.nonce=="string"?b.nonce:void 0})}},lt.preinitModule=function(v,b){if(typeof v=="string")if(typeof b=="object"&&b!==null){if(b.as==null||b.as==="script"){var z=w(b.as,b.crossOrigin);c.d.M(v,{crossOrigin:z,integrity:typeof b.integrity=="string"?b.integrity:void 0,nonce:typeof b.nonce=="string"?b.nonce:void 0})}}else b==null&&c.d.M(v)},lt.preload=function(v,b){if(typeof v=="string"&&typeof b=="object"&&b!==null&&typeof b.as=="string"){var z=b.as,S=w(z,b.crossOrigin);c.d.L(v,z,{crossOrigin:S,integrity:typeof b.integrity=="string"?b.integrity:void 0,nonce:typeof b.nonce=="string"?b.nonce:void 0,type:typeof b.type=="string"?b.type:void 0,fetchPriority:typeof b.fetchPriority=="string"?b.fetchPriority:void 0,referrerPolicy:typeof b.referrerPolicy=="string"?b.referrerPolicy:void 0,imageSrcSet:typeof b.imageSrcSet=="string"?b.imageSrcSet:void 0,imageSizes:typeof b.imageSizes=="string"?b.imageSizes:void 0,media:typeof b.media=="string"?b.media:void 0})}},lt.preloadModule=function(v,b){if(typeof v=="string")if(b){var z=w(b.as,b.crossOrigin);c.d.m(v,{as:typeof b.as=="string"&&b.as!=="script"?b.as:void 0,crossOrigin:z,integrity:typeof b.integrity=="string"?b.integrity:void 0})}else c.d.m(v)},lt.requestFormReset=function(v){c.d.r(v)},lt.unstable_batchedUpdates=function(v,b){return v(b)},lt.useFormState=function(v,b,z){return h.H.useFormState(v,b,z)},lt.useFormStatus=function(){return h.H.useHostTransitionStatus()},lt.version="19.2.4",lt}var Am;function ag(){if(Am)return Js.exports;Am=1;function o(){if(!(typeof __REACT_DEVTOOLS_GLOBAL_HOOK__>"u"||typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE!="function"))try{__REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE(o)}catch(u){console.error(u)}}return o(),Js.exports=tg(),Js.exports}var Tm;function ng(){if(Tm)return Xl;Tm=1;var o=eg(),u=sc(),d=ag();function c(e){var t="https://react.dev/errors/"+e;if(1<arguments.length){t+="?args[]="+encodeURIComponent(arguments[1]);for(var a=2;a<arguments.length;a++)t+="&args[]="+encodeURIComponent(arguments[a])}return"Minified React error #"+e+"; visit "+t+" for the full message or use the non-minified dev environment for full errors and additional helpful warnings."}function m(e){return!(!e||e.nodeType!==1&&e.nodeType!==9&&e.nodeType!==11)}function p(e){var t=e,a=e;if(e.alternate)for(;t.return;)t=t.return;else{e=t;do t=e,(t.flags&4098)!==0&&(a=t.return),e=t.return;while(e)}return t.tag===3?a:null}function h(e){if(e.tag===13){var t=e.memoizedState;if(t===null&&(e=e.alternate,e!==null&&(t=e.memoizedState)),t!==null)return t.dehydrated}return null}function w(e){if(e.tag===31){var t=e.memoizedState;if(t===null&&(e=e.alternate,e!==null&&(t=e.memoizedState)),t!==null)return t.dehydrated}return null}function v(e){if(p(e)!==e)throw Error(c(188))}function b(e){var t=e.alternate;if(!t){if(t=p(e),t===null)throw Error(c(188));return t!==e?null:e}for(var a=e,n=t;;){var l=a.return;if(l===null)break;var i=l.alternate;if(i===null){if(n=l.return,n!==null){a=n;continue}break}if(l.child===i.child){for(i=l.child;i;){if(i===a)return v(l),e;if(i===n)return v(l),t;i=i.sibling}throw Error(c(188))}if(a.return!==n.return)a=l,n=i;else{for(var s=!1,f=l.child;f;){if(f===a){s=!0,a=l,n=i;break}if(f===n){s=!0,n=l,a=i;break}f=f.sibling}if(!s){for(f=i.child;f;){if(f===a){s=!0,a=i,n=l;break}if(f===n){s=!0,n=i,a=l;break}f=f.sibling}if(!s)throw Error(c(189))}}if(a.alternate!==n)throw Error(c(190))}if(a.tag!==3)throw Error(c(188));return a.stateNode.current===a?e:t}function z(e){var t=e.tag;if(t===5||t===26||t===27||t===6)return e;for(e=e.child;e!==null;){if(t=z(e),t!==null)return t;e=e.sibling}return null}var S=Object.assign,O=Symbol.for("react.element"),q=Symbol.for("react.transitional.element"),Y=Symbol.for("react.portal"),M=Symbol.for("react.fragment"),_=Symbol.for("react.strict_mode"),Z=Symbol.for("react.profiler"),P=Symbol.for("react.consumer"),L=Symbol.for("react.context"),te=Symbol.for("react.forward_ref"),X=Symbol.for("react.suspense"),W=Symbol.for("react.suspense_list"),B=Symbol.for("react.memo"),J=Symbol.for("react.lazy"),ae=Symbol.for("react.activity"),xe=Symbol.for("react.memo_cache_sentinel"),Se=Symbol.iterator;function F(e){return e===null||typeof e!="object"?null:(e=Se&&e[Se]||e["@@iterator"],typeof e=="function"?e:null)}var re=Symbol.for("react.client.reference");function me(e){if(e==null)return null;if(typeof e=="function")return e.$$typeof===re?null:e.displayName||e.name||null;if(typeof e=="string")return e;switch(e){case M:return"Fragment";case Z:return"Profiler";case _:return"StrictMode";case X:return"Suspense";case W:return"SuspenseList";case ae:return"Activity"}if(typeof e=="object")switch(e.$$typeof){case Y:return"Portal";case L:return e.displayName||"Context";case P:return(e._context.displayName||"Context")+".Consumer";case te:var t=e.render;return e=e.displayName,e||(e=t.displayName||t.name||"",e=e!==""?"ForwardRef("+e+")":"ForwardRef"),e;case B:return t=e.displayName||null,t!==null?t:me(e.type)||"Memo";case J:t=e._payload,e=e._init;try{return me(e(t))}catch{}}return null}var ue=Array.isArray,C=u.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE,G=d.__DOM_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE,ee={pending:!1,data:null,method:null,action:null},he=[],ze=-1;function j(e){return{current:e}}function U(e){0>ze||(e.current=he[ze],he[ze]=null,ze--)}function Q(e,t){ze++,he[ze]=e.current,e.current=t}var K=j(null),se=j(null),V=j(null),ne=j(null);function je(e,t){switch(Q(V,t),Q(se,e),Q(K,null),t.nodeType){case 9:case 11:e=(e=t.documentElement)&&(e=e.namespaceURI)?Vf(e):0;break;default:if(e=t.tagName,t=t.namespaceURI)t=Vf(t),e=Xf(t,e);else switch(e){case"svg":e=1;break;case"math":e=2;break;default:e=0}}U(K),Q(K,e)}function Re(){U(K),U(se),U(V)}function Wn(e){e.memoizedState!==null&&Q(ne,e);var t=K.current,a=Xf(t,e.type);t!==a&&(Q(se,e),Q(K,a))}function Wl(e){se.current===e&&(U(K),U(se)),ne.current===e&&(U(ne),ql._currentValue=ee)}var Nr,yc;function La(e){if(Nr===void 0)try{throw Error()}catch(a){var t=a.stack.trim().match(/\n( *(at )?)/);Nr=t&&t[1]||"",yc=-1<a.stack.indexOf(`
    at`)?" (<anonymous>)":-1<a.stack.indexOf("@")?"@unknown:0:0":""}return`
`+Nr+e+yc}var zr=!1;function Er(e,t){if(!e||zr)return"";zr=!0;var a=Error.prepareStackTrace;Error.prepareStackTrace=void 0;try{var n={DetermineComponentFrameRoot:function(){try{if(t){var H=function(){throw Error()};if(Object.defineProperty(H.prototype,"props",{set:function(){throw Error()}}),typeof Reflect=="object"&&Reflect.construct){try{Reflect.construct(H,[])}catch(k){var T=k}Reflect.construct(e,[],H)}else{try{H.call()}catch(k){T=k}e.call(H.prototype)}}else{try{throw Error()}catch(k){T=k}(H=e())&&typeof H.catch=="function"&&H.catch(function(){})}}catch(k){if(k&&T&&typeof k.stack=="string")return[k.stack,T.stack]}return[null,null]}};n.DetermineComponentFrameRoot.displayName="DetermineComponentFrameRoot";var l=Object.getOwnPropertyDescriptor(n.DetermineComponentFrameRoot,"name");l&&l.configurable&&Object.defineProperty(n.DetermineComponentFrameRoot,"name",{value:"DetermineComponentFrameRoot"});var i=n.DetermineComponentFrameRoot(),s=i[0],f=i[1];if(s&&f){var y=s.split(`
`),A=f.split(`
`);for(l=n=0;n<y.length&&!y[n].includes("DetermineComponentFrameRoot");)n++;for(;l<A.length&&!A[l].includes("DetermineComponentFrameRoot");)l++;if(n===y.length||l===A.length)for(n=y.length-1,l=A.length-1;1<=n&&0<=l&&y[n]!==A[l];)l--;for(;1<=n&&0<=l;n--,l--)if(y[n]!==A[l]){if(n!==1||l!==1)do if(n--,l--,0>l||y[n]!==A[l]){var R=`
`+y[n].replace(" at new "," at ");return e.displayName&&R.includes("<anonymous>")&&(R=R.replace("<anonymous>",e.displayName)),R}while(1<=n&&0<=l);break}}}finally{zr=!1,Error.prepareStackTrace=a}return(a=e?e.displayName||e.name:"")?La(a):""}function Eh(e,t){switch(e.tag){case 26:case 27:case 5:return La(e.type);case 16:return La("Lazy");case 13:return e.child!==t&&t!==null?La("Suspense Fallback"):La("Suspense");case 19:return La("SuspenseList");case 0:case 15:return Er(e.type,!1);case 11:return Er(e.type.render,!1);case 1:return Er(e.type,!0);case 31:return La("Activity");default:return""}}function vc(e){try{var t="",a=null;do t+=Eh(e,a),a=e,e=e.return;while(e);return t}catch(n){return`
Error generating stack: `+n.message+`
`+n.stack}}var Ar=Object.prototype.hasOwnProperty,Tr=o.unstable_scheduleCallback,kr=o.unstable_cancelCallback,Ah=o.unstable_shouldYield,Th=o.unstable_requestPaint,ht=o.unstable_now,kh=o.unstable_getCurrentPriorityLevel,xc=o.unstable_ImmediatePriority,jc=o.unstable_UserBlockingPriority,Fl=o.unstable_NormalPriority,Ch=o.unstable_LowPriority,Sc=o.unstable_IdlePriority,Mh=o.log,_h=o.unstable_setDisableYieldValue,Fn=null,pt=null;function fa(e){if(typeof Mh=="function"&&_h(e),pt&&typeof pt.setStrictMode=="function")try{pt.setStrictMode(Fn,e)}catch{}}var gt=Math.clz32?Math.clz32:Dh,Rh=Math.log,Oh=Math.LN2;function Dh(e){return e>>>=0,e===0?32:31-(Rh(e)/Oh|0)|0}var Il=256,Pl=262144,ei=4194304;function Ya(e){var t=e&42;if(t!==0)return t;switch(e&-e){case 1:return 1;case 2:return 2;case 4:return 4;case 8:return 8;case 16:return 16;case 32:return 32;case 64:return 64;case 128:return 128;case 256:case 512:case 1024:case 2048:case 4096:case 8192:case 16384:case 32768:case 65536:case 131072:return e&261888;case 262144:case 524288:case 1048576:case 2097152:return e&3932160;case 4194304:case 8388608:case 16777216:case 33554432:return e&62914560;case 67108864:return 67108864;case 134217728:return 134217728;case 268435456:return 268435456;case 536870912:return 536870912;case 1073741824:return 0;default:return e}}function ti(e,t,a){var n=e.pendingLanes;if(n===0)return 0;var l=0,i=e.suspendedLanes,s=e.pingedLanes;e=e.warmLanes;var f=n&134217727;return f!==0?(n=f&~i,n!==0?l=Ya(n):(s&=f,s!==0?l=Ya(s):a||(a=f&~e,a!==0&&(l=Ya(a))))):(f=n&~i,f!==0?l=Ya(f):s!==0?l=Ya(s):a||(a=n&~e,a!==0&&(l=Ya(a)))),l===0?0:t!==0&&t!==l&&(t&i)===0&&(i=l&-l,a=t&-t,i>=a||i===32&&(a&4194048)!==0)?t:l}function In(e,t){return(e.pendingLanes&~(e.suspendedLanes&~e.pingedLanes)&t)===0}function Uh(e,t){switch(e){case 1:case 2:case 4:case 8:case 64:return t+250;case 16:case 32:case 128:case 256:case 512:case 1024:case 2048:case 4096:case 8192:case 16384:case 32768:case 65536:case 131072:case 262144:case 524288:case 1048576:case 2097152:return t+5e3;case 4194304:case 8388608:case 16777216:case 33554432:return-1;case 67108864:case 134217728:case 268435456:case 536870912:case 1073741824:return-1;default:return-1}}function wc(){var e=ei;return ei<<=1,(ei&62914560)===0&&(ei=4194304),e}function Cr(e){for(var t=[],a=0;31>a;a++)t.push(e);return t}function Pn(e,t){e.pendingLanes|=t,t!==268435456&&(e.suspendedLanes=0,e.pingedLanes=0,e.warmLanes=0)}function Hh(e,t,a,n,l,i){var s=e.pendingLanes;e.pendingLanes=a,e.suspendedLanes=0,e.pingedLanes=0,e.warmLanes=0,e.expiredLanes&=a,e.entangledLanes&=a,e.errorRecoveryDisabledLanes&=a,e.shellSuspendCounter=0;var f=e.entanglements,y=e.expirationTimes,A=e.hiddenUpdates;for(a=s&~a;0<a;){var R=31-gt(a),H=1<<R;f[R]=0,y[R]=-1;var T=A[R];if(T!==null)for(A[R]=null,R=0;R<T.length;R++){var k=T[R];k!==null&&(k.lane&=-536870913)}a&=~H}n!==0&&Nc(e,n,0),i!==0&&l===0&&e.tag!==0&&(e.suspendedLanes|=i&~(s&~t))}function Nc(e,t,a){e.pendingLanes|=t,e.suspendedLanes&=~t;var n=31-gt(t);e.entangledLanes|=t,e.entanglements[n]=e.entanglements[n]|1073741824|a&261930}function zc(e,t){var a=e.entangledLanes|=t;for(e=e.entanglements;a;){var n=31-gt(a),l=1<<n;l&t|e[n]&t&&(e[n]|=t),a&=~l}}function Ec(e,t){var a=t&-t;return a=(a&42)!==0?1:Mr(a),(a&(e.suspendedLanes|t))!==0?0:a}function Mr(e){switch(e){case 2:e=1;break;case 8:e=4;break;case 32:e=16;break;case 256:case 512:case 1024:case 2048:case 4096:case 8192:case 16384:case 32768:case 65536:case 131072:case 262144:case 524288:case 1048576:case 2097152:case 4194304:case 8388608:case 16777216:case 33554432:e=128;break;case 268435456:e=134217728;break;default:e=0}return e}function _r(e){return e&=-e,2<e?8<e?(e&134217727)!==0?32:268435456:8:2}function Ac(){var e=G.p;return e!==0?e:(e=window.event,e===void 0?32:mm(e.type))}function Tc(e,t){var a=G.p;try{return G.p=e,t()}finally{G.p=a}}var ma=Math.random().toString(36).slice(2),Pe="__reactFiber$"+ma,rt="__reactProps$"+ma,cn="__reactContainer$"+ma,Rr="__reactEvents$"+ma,Bh="__reactListeners$"+ma,qh="__reactHandles$"+ma,kc="__reactResources$"+ma,el="__reactMarker$"+ma;function Or(e){delete e[Pe],delete e[rt],delete e[Rr],delete e[Bh],delete e[qh]}function un(e){var t=e[Pe];if(t)return t;for(var a=e.parentNode;a;){if(t=a[cn]||a[Pe]){if(a=t.alternate,t.child!==null||a!==null&&a.child!==null)for(e=Ff(e);e!==null;){if(a=e[Pe])return a;e=Ff(e)}return t}e=a,a=e.parentNode}return null}function dn(e){if(e=e[Pe]||e[cn]){var t=e.tag;if(t===5||t===6||t===13||t===31||t===26||t===27||t===3)return e}return null}function tl(e){var t=e.tag;if(t===5||t===26||t===27||t===6)return e.stateNode;throw Error(c(33))}function fn(e){var t=e[kc];return t||(t=e[kc]={hoistableStyles:new Map,hoistableScripts:new Map}),t}function We(e){e[el]=!0}var Cc=new Set,Mc={};function Ga(e,t){mn(e,t),mn(e+"Capture",t)}function mn(e,t){for(Mc[e]=t,e=0;e<t.length;e++)Cc.add(t[e])}var Lh=RegExp("^[:A-Z_a-z\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u02FF\\u0370-\\u037D\\u037F-\\u1FFF\\u200C-\\u200D\\u2070-\\u218F\\u2C00-\\u2FEF\\u3001-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFFD][:A-Z_a-z\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u02FF\\u0370-\\u037D\\u037F-\\u1FFF\\u200C-\\u200D\\u2070-\\u218F\\u2C00-\\u2FEF\\u3001-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFFD\\-.0-9\\u00B7\\u0300-\\u036F\\u203F-\\u2040]*$"),_c={},Rc={};function Yh(e){return Ar.call(Rc,e)?!0:Ar.call(_c,e)?!1:Lh.test(e)?Rc[e]=!0:(_c[e]=!0,!1)}function ai(e,t,a){if(Yh(t))if(a===null)e.removeAttribute(t);else{switch(typeof a){case"undefined":case"function":case"symbol":e.removeAttribute(t);return;case"boolean":var n=t.toLowerCase().slice(0,5);if(n!=="data-"&&n!=="aria-"){e.removeAttribute(t);return}}e.setAttribute(t,""+a)}}function ni(e,t,a){if(a===null)e.removeAttribute(t);else{switch(typeof a){case"undefined":case"function":case"symbol":case"boolean":e.removeAttribute(t);return}e.setAttribute(t,""+a)}}function Zt(e,t,a,n){if(n===null)e.removeAttribute(a);else{switch(typeof n){case"undefined":case"function":case"symbol":case"boolean":e.removeAttribute(a);return}e.setAttributeNS(t,a,""+n)}}function zt(e){switch(typeof e){case"bigint":case"boolean":case"number":case"string":case"undefined":return e;case"object":return e;default:return""}}function Oc(e){var t=e.type;return(e=e.nodeName)&&e.toLowerCase()==="input"&&(t==="checkbox"||t==="radio")}function Gh(e,t,a){var n=Object.getOwnPropertyDescriptor(e.constructor.prototype,t);if(!e.hasOwnProperty(t)&&typeof n<"u"&&typeof n.get=="function"&&typeof n.set=="function"){var l=n.get,i=n.set;return Object.defineProperty(e,t,{configurable:!0,get:function(){return l.call(this)},set:function(s){a=""+s,i.call(this,s)}}),Object.defineProperty(e,t,{enumerable:n.enumerable}),{getValue:function(){return a},setValue:function(s){a=""+s},stopTracking:function(){e._valueTracker=null,delete e[t]}}}}function Dr(e){if(!e._valueTracker){var t=Oc(e)?"checked":"value";e._valueTracker=Gh(e,t,""+e[t])}}function Dc(e){if(!e)return!1;var t=e._valueTracker;if(!t)return!0;var a=t.getValue(),n="";return e&&(n=Oc(e)?e.checked?"true":"false":e.value),e=n,e!==a?(t.setValue(e),!0):!1}function li(e){if(e=e||(typeof document<"u"?document:void 0),typeof e>"u")return null;try{return e.activeElement||e.body}catch{return e.body}}var Vh=/[\n"\\]/g;function Et(e){return e.replace(Vh,function(t){return"\\"+t.charCodeAt(0).toString(16)+" "})}function Ur(e,t,a,n,l,i,s,f){e.name="",s!=null&&typeof s!="function"&&typeof s!="symbol"&&typeof s!="boolean"?e.type=s:e.removeAttribute("type"),t!=null?s==="number"?(t===0&&e.value===""||e.value!=t)&&(e.value=""+zt(t)):e.value!==""+zt(t)&&(e.value=""+zt(t)):s!=="submit"&&s!=="reset"||e.removeAttribute("value"),t!=null?Hr(e,s,zt(t)):a!=null?Hr(e,s,zt(a)):n!=null&&e.removeAttribute("value"),l==null&&i!=null&&(e.defaultChecked=!!i),l!=null&&(e.checked=l&&typeof l!="function"&&typeof l!="symbol"),f!=null&&typeof f!="function"&&typeof f!="symbol"&&typeof f!="boolean"?e.name=""+zt(f):e.removeAttribute("name")}function Uc(e,t,a,n,l,i,s,f){if(i!=null&&typeof i!="function"&&typeof i!="symbol"&&typeof i!="boolean"&&(e.type=i),t!=null||a!=null){if(!(i!=="submit"&&i!=="reset"||t!=null)){Dr(e);return}a=a!=null?""+zt(a):"",t=t!=null?""+zt(t):a,f||t===e.value||(e.value=t),e.defaultValue=t}n=n??l,n=typeof n!="function"&&typeof n!="symbol"&&!!n,e.checked=f?e.checked:!!n,e.defaultChecked=!!n,s!=null&&typeof s!="function"&&typeof s!="symbol"&&typeof s!="boolean"&&(e.name=s),Dr(e)}function Hr(e,t,a){t==="number"&&li(e.ownerDocument)===e||e.defaultValue===""+a||(e.defaultValue=""+a)}function hn(e,t,a,n){if(e=e.options,t){t={};for(var l=0;l<a.length;l++)t["$"+a[l]]=!0;for(a=0;a<e.length;a++)l=t.hasOwnProperty("$"+e[a].value),e[a].selected!==l&&(e[a].selected=l),l&&n&&(e[a].defaultSelected=!0)}else{for(a=""+zt(a),t=null,l=0;l<e.length;l++){if(e[l].value===a){e[l].selected=!0,n&&(e[l].defaultSelected=!0);return}t!==null||e[l].disabled||(t=e[l])}t!==null&&(t.selected=!0)}}function Hc(e,t,a){if(t!=null&&(t=""+zt(t),t!==e.value&&(e.value=t),a==null)){e.defaultValue!==t&&(e.defaultValue=t);return}e.defaultValue=a!=null?""+zt(a):""}function Bc(e,t,a,n){if(t==null){if(n!=null){if(a!=null)throw Error(c(92));if(ue(n)){if(1<n.length)throw Error(c(93));n=n[0]}a=n}a==null&&(a=""),t=a}a=zt(t),e.defaultValue=a,n=e.textContent,n===a&&n!==""&&n!==null&&(e.value=n),Dr(e)}function pn(e,t){if(t){var a=e.firstChild;if(a&&a===e.lastChild&&a.nodeType===3){a.nodeValue=t;return}}e.textContent=t}var Xh=new Set("animationIterationCount aspectRatio borderImageOutset borderImageSlice borderImageWidth boxFlex boxFlexGroup boxOrdinalGroup columnCount columns flex flexGrow flexPositive flexShrink flexNegative flexOrder gridArea gridRow gridRowEnd gridRowSpan gridRowStart gridColumn gridColumnEnd gridColumnSpan gridColumnStart fontWeight lineClamp lineHeight opacity order orphans scale tabSize widows zIndex zoom fillOpacity floodOpacity stopOpacity strokeDasharray strokeDashoffset strokeMiterlimit strokeOpacity strokeWidth MozAnimationIterationCount MozBoxFlex MozBoxFlexGroup MozLineClamp msAnimationIterationCount msFlex msZoom msFlexGrow msFlexNegative msFlexOrder msFlexPositive msFlexShrink msGridColumn msGridColumnSpan msGridRow msGridRowSpan WebkitAnimationIterationCount WebkitBoxFlex WebKitBoxFlexGroup WebkitBoxOrdinalGroup WebkitColumnCount WebkitColumns WebkitFlex WebkitFlexGrow WebkitFlexPositive WebkitFlexShrink WebkitLineClamp".split(" "));function qc(e,t,a){var n=t.indexOf("--")===0;a==null||typeof a=="boolean"||a===""?n?e.setProperty(t,""):t==="float"?e.cssFloat="":e[t]="":n?e.setProperty(t,a):typeof a!="number"||a===0||Xh.has(t)?t==="float"?e.cssFloat=a:e[t]=(""+a).trim():e[t]=a+"px"}function Lc(e,t,a){if(t!=null&&typeof t!="object")throw Error(c(62));if(e=e.style,a!=null){for(var n in a)!a.hasOwnProperty(n)||t!=null&&t.hasOwnProperty(n)||(n.indexOf("--")===0?e.setProperty(n,""):n==="float"?e.cssFloat="":e[n]="");for(var l in t)n=t[l],t.hasOwnProperty(l)&&a[l]!==n&&qc(e,l,n)}else for(var i in t)t.hasOwnProperty(i)&&qc(e,i,t[i])}function Br(e){if(e.indexOf("-")===-1)return!1;switch(e){case"annotation-xml":case"color-profile":case"font-face":case"font-face-src":case"font-face-uri":case"font-face-format":case"font-face-name":case"missing-glyph":return!1;default:return!0}}var Qh=new Map([["acceptCharset","accept-charset"],["htmlFor","for"],["httpEquiv","http-equiv"],["crossOrigin","crossorigin"],["accentHeight","accent-height"],["alignmentBaseline","alignment-baseline"],["arabicForm","arabic-form"],["baselineShift","baseline-shift"],["capHeight","cap-height"],["clipPath","clip-path"],["clipRule","clip-rule"],["colorInterpolation","color-interpolation"],["colorInterpolationFilters","color-interpolation-filters"],["colorProfile","color-profile"],["colorRendering","color-rendering"],["dominantBaseline","dominant-baseline"],["enableBackground","enable-background"],["fillOpacity","fill-opacity"],["fillRule","fill-rule"],["floodColor","flood-color"],["floodOpacity","flood-opacity"],["fontFamily","font-family"],["fontSize","font-size"],["fontSizeAdjust","font-size-adjust"],["fontStretch","font-stretch"],["fontStyle","font-style"],["fontVariant","font-variant"],["fontWeight","font-weight"],["glyphName","glyph-name"],["glyphOrientationHorizontal","glyph-orientation-horizontal"],["glyphOrientationVertical","glyph-orientation-vertical"],["horizAdvX","horiz-adv-x"],["horizOriginX","horiz-origin-x"],["imageRendering","image-rendering"],["letterSpacing","letter-spacing"],["lightingColor","lighting-color"],["markerEnd","marker-end"],["markerMid","marker-mid"],["markerStart","marker-start"],["overlinePosition","overline-position"],["overlineThickness","overline-thickness"],["paintOrder","paint-order"],["panose-1","panose-1"],["pointerEvents","pointer-events"],["renderingIntent","rendering-intent"],["shapeRendering","shape-rendering"],["stopColor","stop-color"],["stopOpacity","stop-opacity"],["strikethroughPosition","strikethrough-position"],["strikethroughThickness","strikethrough-thickness"],["strokeDasharray","stroke-dasharray"],["strokeDashoffset","stroke-dashoffset"],["strokeLinecap","stroke-linecap"],["strokeLinejoin","stroke-linejoin"],["strokeMiterlimit","stroke-miterlimit"],["strokeOpacity","stroke-opacity"],["strokeWidth","stroke-width"],["textAnchor","text-anchor"],["textDecoration","text-decoration"],["textRendering","text-rendering"],["transformOrigin","transform-origin"],["underlinePosition","underline-position"],["underlineThickness","underline-thickness"],["unicodeBidi","unicode-bidi"],["unicodeRange","unicode-range"],["unitsPerEm","units-per-em"],["vAlphabetic","v-alphabetic"],["vHanging","v-hanging"],["vIdeographic","v-ideographic"],["vMathematical","v-mathematical"],["vectorEffect","vector-effect"],["vertAdvY","vert-adv-y"],["vertOriginX","vert-origin-x"],["vertOriginY","vert-origin-y"],["wordSpacing","word-spacing"],["writingMode","writing-mode"],["xmlnsXlink","xmlns:xlink"],["xHeight","x-height"]]),Zh=/^[\u0000-\u001F ]*j[\r\n\t]*a[\r\n\t]*v[\r\n\t]*a[\r\n\t]*s[\r\n\t]*c[\r\n\t]*r[\r\n\t]*i[\r\n\t]*p[\r\n\t]*t[\r\n\t]*:/i;function ii(e){return Zh.test(""+e)?"javascript:throw new Error('React has blocked a javascript: URL as a security precaution.')":e}function $t(){}var qr=null;function Lr(e){return e=e.target||e.srcElement||window,e.correspondingUseElement&&(e=e.correspondingUseElement),e.nodeType===3?e.parentNode:e}var gn=null,bn=null;function Yc(e){var t=dn(e);if(t&&(e=t.stateNode)){var a=e[rt]||null;e:switch(e=t.stateNode,t.type){case"input":if(Ur(e,a.value,a.defaultValue,a.defaultValue,a.checked,a.defaultChecked,a.type,a.name),t=a.name,a.type==="radio"&&t!=null){for(a=e;a.parentNode;)a=a.parentNode;for(a=a.querySelectorAll('input[name="'+Et(""+t)+'"][type="radio"]'),t=0;t<a.length;t++){var n=a[t];if(n!==e&&n.form===e.form){var l=n[rt]||null;if(!l)throw Error(c(90));Ur(n,l.value,l.defaultValue,l.defaultValue,l.checked,l.defaultChecked,l.type,l.name)}}for(t=0;t<a.length;t++)n=a[t],n.form===e.form&&Dc(n)}break e;case"textarea":Hc(e,a.value,a.defaultValue);break e;case"select":t=a.value,t!=null&&hn(e,!!a.multiple,t,!1)}}}var Yr=!1;function Gc(e,t,a){if(Yr)return e(t,a);Yr=!0;try{var n=e(t);return n}finally{if(Yr=!1,(gn!==null||bn!==null)&&(Zi(),gn&&(t=gn,e=bn,bn=gn=null,Yc(t),e)))for(t=0;t<e.length;t++)Yc(e[t])}}function al(e,t){var a=e.stateNode;if(a===null)return null;var n=a[rt]||null;if(n===null)return null;a=n[t];e:switch(t){case"onClick":case"onClickCapture":case"onDoubleClick":case"onDoubleClickCapture":case"onMouseDown":case"onMouseDownCapture":case"onMouseMove":case"onMouseMoveCapture":case"onMouseUp":case"onMouseUpCapture":case"onMouseEnter":(n=!n.disabled)||(e=e.type,n=!(e==="button"||e==="input"||e==="select"||e==="textarea")),e=!n;break e;default:e=!1}if(e)return null;if(a&&typeof a!="function")throw Error(c(231,t,typeof a));return a}var Jt=!(typeof window>"u"||typeof window.document>"u"||typeof window.document.createElement>"u"),Gr=!1;if(Jt)try{var nl={};Object.defineProperty(nl,"passive",{get:function(){Gr=!0}}),window.addEventListener("test",nl,nl),window.removeEventListener("test",nl,nl)}catch{Gr=!1}var ha=null,Vr=null,ri=null;function Vc(){if(ri)return ri;var e,t=Vr,a=t.length,n,l="value"in ha?ha.value:ha.textContent,i=l.length;for(e=0;e<a&&t[e]===l[e];e++);var s=a-e;for(n=1;n<=s&&t[a-n]===l[i-n];n++);return ri=l.slice(e,1<n?1-n:void 0)}function oi(e){var t=e.keyCode;return"charCode"in e?(e=e.charCode,e===0&&t===13&&(e=13)):e=t,e===10&&(e=13),32<=e||e===13?e:0}function si(){return!0}function Xc(){return!1}function ot(e){function t(a,n,l,i,s){this._reactName=a,this._targetInst=l,this.type=n,this.nativeEvent=i,this.target=s,this.currentTarget=null;for(var f in e)e.hasOwnProperty(f)&&(a=e[f],this[f]=a?a(i):i[f]);return this.isDefaultPrevented=(i.defaultPrevented!=null?i.defaultPrevented:i.returnValue===!1)?si:Xc,this.isPropagationStopped=Xc,this}return S(t.prototype,{preventDefault:function(){this.defaultPrevented=!0;var a=this.nativeEvent;a&&(a.preventDefault?a.preventDefault():typeof a.returnValue!="unknown"&&(a.returnValue=!1),this.isDefaultPrevented=si)},stopPropagation:function(){var a=this.nativeEvent;a&&(a.stopPropagation?a.stopPropagation():typeof a.cancelBubble!="unknown"&&(a.cancelBubble=!0),this.isPropagationStopped=si)},persist:function(){},isPersistent:si}),t}var Va={eventPhase:0,bubbles:0,cancelable:0,timeStamp:function(e){return e.timeStamp||Date.now()},defaultPrevented:0,isTrusted:0},ci=ot(Va),ll=S({},Va,{view:0,detail:0}),$h=ot(ll),Xr,Qr,il,ui=S({},ll,{screenX:0,screenY:0,clientX:0,clientY:0,pageX:0,pageY:0,ctrlKey:0,shiftKey:0,altKey:0,metaKey:0,getModifierState:$r,button:0,buttons:0,relatedTarget:function(e){return e.relatedTarget===void 0?e.fromElement===e.srcElement?e.toElement:e.fromElement:e.relatedTarget},movementX:function(e){return"movementX"in e?e.movementX:(e!==il&&(il&&e.type==="mousemove"?(Xr=e.screenX-il.screenX,Qr=e.screenY-il.screenY):Qr=Xr=0,il=e),Xr)},movementY:function(e){return"movementY"in e?e.movementY:Qr}}),Qc=ot(ui),Jh=S({},ui,{dataTransfer:0}),Kh=ot(Jh),Wh=S({},ll,{relatedTarget:0}),Zr=ot(Wh),Fh=S({},Va,{animationName:0,elapsedTime:0,pseudoElement:0}),Ih=ot(Fh),Ph=S({},Va,{clipboardData:function(e){return"clipboardData"in e?e.clipboardData:window.clipboardData}}),ep=ot(Ph),tp=S({},Va,{data:0}),Zc=ot(tp),ap={Esc:"Escape",Spacebar:" ",Left:"ArrowLeft",Up:"ArrowUp",Right:"ArrowRight",Down:"ArrowDown",Del:"Delete",Win:"OS",Menu:"ContextMenu",Apps:"ContextMenu",Scroll:"ScrollLock",MozPrintableKey:"Unidentified"},np={8:"Backspace",9:"Tab",12:"Clear",13:"Enter",16:"Shift",17:"Control",18:"Alt",19:"Pause",20:"CapsLock",27:"Escape",32:" ",33:"PageUp",34:"PageDown",35:"End",36:"Home",37:"ArrowLeft",38:"ArrowUp",39:"ArrowRight",40:"ArrowDown",45:"Insert",46:"Delete",112:"F1",113:"F2",114:"F3",115:"F4",116:"F5",117:"F6",118:"F7",119:"F8",120:"F9",121:"F10",122:"F11",123:"F12",144:"NumLock",145:"ScrollLock",224:"Meta"},lp={Alt:"altKey",Control:"ctrlKey",Meta:"metaKey",Shift:"shiftKey"};function ip(e){var t=this.nativeEvent;return t.getModifierState?t.getModifierState(e):(e=lp[e])?!!t[e]:!1}function $r(){return ip}var rp=S({},ll,{key:function(e){if(e.key){var t=ap[e.key]||e.key;if(t!=="Unidentified")return t}return e.type==="keypress"?(e=oi(e),e===13?"Enter":String.fromCharCode(e)):e.type==="keydown"||e.type==="keyup"?np[e.keyCode]||"Unidentified":""},code:0,location:0,ctrlKey:0,shiftKey:0,altKey:0,metaKey:0,repeat:0,locale:0,getModifierState:$r,charCode:function(e){return e.type==="keypress"?oi(e):0},keyCode:function(e){return e.type==="keydown"||e.type==="keyup"?e.keyCode:0},which:function(e){return e.type==="keypress"?oi(e):e.type==="keydown"||e.type==="keyup"?e.keyCode:0}}),op=ot(rp),sp=S({},ui,{pointerId:0,width:0,height:0,pressure:0,tangentialPressure:0,tiltX:0,tiltY:0,twist:0,pointerType:0,isPrimary:0}),$c=ot(sp),cp=S({},ll,{touches:0,targetTouches:0,changedTouches:0,altKey:0,metaKey:0,ctrlKey:0,shiftKey:0,getModifierState:$r}),up=ot(cp),dp=S({},Va,{propertyName:0,elapsedTime:0,pseudoElement:0}),fp=ot(dp),mp=S({},ui,{deltaX:function(e){return"deltaX"in e?e.deltaX:"wheelDeltaX"in e?-e.wheelDeltaX:0},deltaY:function(e){return"deltaY"in e?e.deltaY:"wheelDeltaY"in e?-e.wheelDeltaY:"wheelDelta"in e?-e.wheelDelta:0},deltaZ:0,deltaMode:0}),hp=ot(mp),pp=S({},Va,{newState:0,oldState:0}),gp=ot(pp),bp=[9,13,27,32],Jr=Jt&&"CompositionEvent"in window,rl=null;Jt&&"documentMode"in document&&(rl=document.documentMode);var yp=Jt&&"TextEvent"in window&&!rl,Jc=Jt&&(!Jr||rl&&8<rl&&11>=rl),Kc=" ",Wc=!1;function Fc(e,t){switch(e){case"keyup":return bp.indexOf(t.keyCode)!==-1;case"keydown":return t.keyCode!==229;case"keypress":case"mousedown":case"focusout":return!0;default:return!1}}function Ic(e){return e=e.detail,typeof e=="object"&&"data"in e?e.data:null}var yn=!1;function vp(e,t){switch(e){case"compositionend":return Ic(t);case"keypress":return t.which!==32?null:(Wc=!0,Kc);case"textInput":return e=t.data,e===Kc&&Wc?null:e;default:return null}}function xp(e,t){if(yn)return e==="compositionend"||!Jr&&Fc(e,t)?(e=Vc(),ri=Vr=ha=null,yn=!1,e):null;switch(e){case"paste":return null;case"keypress":if(!(t.ctrlKey||t.altKey||t.metaKey)||t.ctrlKey&&t.altKey){if(t.char&&1<t.char.length)return t.char;if(t.which)return String.fromCharCode(t.which)}return null;case"compositionend":return Jc&&t.locale!=="ko"?null:t.data;default:return null}}var jp={color:!0,date:!0,datetime:!0,"datetime-local":!0,email:!0,month:!0,number:!0,password:!0,range:!0,search:!0,tel:!0,text:!0,time:!0,url:!0,week:!0};function Pc(e){var t=e&&e.nodeName&&e.nodeName.toLowerCase();return t==="input"?!!jp[e.type]:t==="textarea"}function eu(e,t,a,n){gn?bn?bn.push(n):bn=[n]:gn=n,t=Pi(t,"onChange"),0<t.length&&(a=new ci("onChange","change",null,a,n),e.push({event:a,listeners:t}))}var ol=null,sl=null;function Sp(e){Hf(e,0)}function di(e){var t=tl(e);if(Dc(t))return e}function tu(e,t){if(e==="change")return t}var au=!1;if(Jt){var Kr;if(Jt){var Wr="oninput"in document;if(!Wr){var nu=document.createElement("div");nu.setAttribute("oninput","return;"),Wr=typeof nu.oninput=="function"}Kr=Wr}else Kr=!1;au=Kr&&(!document.documentMode||9<document.documentMode)}function lu(){ol&&(ol.detachEvent("onpropertychange",iu),sl=ol=null)}function iu(e){if(e.propertyName==="value"&&di(sl)){var t=[];eu(t,sl,e,Lr(e)),Gc(Sp,t)}}function wp(e,t,a){e==="focusin"?(lu(),ol=t,sl=a,ol.attachEvent("onpropertychange",iu)):e==="focusout"&&lu()}function Np(e){if(e==="selectionchange"||e==="keyup"||e==="keydown")return di(sl)}function zp(e,t){if(e==="click")return di(t)}function Ep(e,t){if(e==="input"||e==="change")return di(t)}function Ap(e,t){return e===t&&(e!==0||1/e===1/t)||e!==e&&t!==t}var bt=typeof Object.is=="function"?Object.is:Ap;function cl(e,t){if(bt(e,t))return!0;if(typeof e!="object"||e===null||typeof t!="object"||t===null)return!1;var a=Object.keys(e),n=Object.keys(t);if(a.length!==n.length)return!1;for(n=0;n<a.length;n++){var l=a[n];if(!Ar.call(t,l)||!bt(e[l],t[l]))return!1}return!0}function ru(e){for(;e&&e.firstChild;)e=e.firstChild;return e}function ou(e,t){var a=ru(e);e=0;for(var n;a;){if(a.nodeType===3){if(n=e+a.textContent.length,e<=t&&n>=t)return{node:a,offset:t-e};e=n}e:{for(;a;){if(a.nextSibling){a=a.nextSibling;break e}a=a.parentNode}a=void 0}a=ru(a)}}function su(e,t){return e&&t?e===t?!0:e&&e.nodeType===3?!1:t&&t.nodeType===3?su(e,t.parentNode):"contains"in e?e.contains(t):e.compareDocumentPosition?!!(e.compareDocumentPosition(t)&16):!1:!1}function cu(e){e=e!=null&&e.ownerDocument!=null&&e.ownerDocument.defaultView!=null?e.ownerDocument.defaultView:window;for(var t=li(e.document);t instanceof e.HTMLIFrameElement;){try{var a=typeof t.contentWindow.location.href=="string"}catch{a=!1}if(a)e=t.contentWindow;else break;t=li(e.document)}return t}function Fr(e){var t=e&&e.nodeName&&e.nodeName.toLowerCase();return t&&(t==="input"&&(e.type==="text"||e.type==="search"||e.type==="tel"||e.type==="url"||e.type==="password")||t==="textarea"||e.contentEditable==="true")}var Tp=Jt&&"documentMode"in document&&11>=document.documentMode,vn=null,Ir=null,ul=null,Pr=!1;function uu(e,t,a){var n=a.window===a?a.document:a.nodeType===9?a:a.ownerDocument;Pr||vn==null||vn!==li(n)||(n=vn,"selectionStart"in n&&Fr(n)?n={start:n.selectionStart,end:n.selectionEnd}:(n=(n.ownerDocument&&n.ownerDocument.defaultView||window).getSelection(),n={anchorNode:n.anchorNode,anchorOffset:n.anchorOffset,focusNode:n.focusNode,focusOffset:n.focusOffset}),ul&&cl(ul,n)||(ul=n,n=Pi(Ir,"onSelect"),0<n.length&&(t=new ci("onSelect","select",null,t,a),e.push({event:t,listeners:n}),t.target=vn)))}function Xa(e,t){var a={};return a[e.toLowerCase()]=t.toLowerCase(),a["Webkit"+e]="webkit"+t,a["Moz"+e]="moz"+t,a}var xn={animationend:Xa("Animation","AnimationEnd"),animationiteration:Xa("Animation","AnimationIteration"),animationstart:Xa("Animation","AnimationStart"),transitionrun:Xa("Transition","TransitionRun"),transitionstart:Xa("Transition","TransitionStart"),transitioncancel:Xa("Transition","TransitionCancel"),transitionend:Xa("Transition","TransitionEnd")},eo={},du={};Jt&&(du=document.createElement("div").style,"AnimationEvent"in window||(delete xn.animationend.animation,delete xn.animationiteration.animation,delete xn.animationstart.animation),"TransitionEvent"in window||delete xn.transitionend.transition);function Qa(e){if(eo[e])return eo[e];if(!xn[e])return e;var t=xn[e],a;for(a in t)if(t.hasOwnProperty(a)&&a in du)return eo[e]=t[a];return e}var fu=Qa("animationend"),mu=Qa("animationiteration"),hu=Qa("animationstart"),kp=Qa("transitionrun"),Cp=Qa("transitionstart"),Mp=Qa("transitioncancel"),pu=Qa("transitionend"),gu=new Map,to="abort auxClick beforeToggle cancel canPlay canPlayThrough click close contextMenu copy cut drag dragEnd dragEnter dragExit dragLeave dragOver dragStart drop durationChange emptied encrypted ended error gotPointerCapture input invalid keyDown keyPress keyUp load loadedData loadedMetadata loadStart lostPointerCapture mouseDown mouseMove mouseOut mouseOver mouseUp paste pause play playing pointerCancel pointerDown pointerMove pointerOut pointerOver pointerUp progress rateChange reset resize seeked seeking stalled submit suspend timeUpdate touchCancel touchEnd touchStart volumeChange scroll toggle touchMove waiting wheel".split(" ");to.push("scrollEnd");function Dt(e,t){gu.set(e,t),Ga(t,[e])}var fi=typeof reportError=="function"?reportError:function(e){if(typeof window=="object"&&typeof window.ErrorEvent=="function"){var t=new window.ErrorEvent("error",{bubbles:!0,cancelable:!0,message:typeof e=="object"&&e!==null&&typeof e.message=="string"?String(e.message):String(e),error:e});if(!window.dispatchEvent(t))return}else if(typeof process=="object"&&typeof process.emit=="function"){process.emit("uncaughtException",e);return}console.error(e)},At=[],jn=0,ao=0;function mi(){for(var e=jn,t=ao=jn=0;t<e;){var a=At[t];At[t++]=null;var n=At[t];At[t++]=null;var l=At[t];At[t++]=null;var i=At[t];if(At[t++]=null,n!==null&&l!==null){var s=n.pending;s===null?l.next=l:(l.next=s.next,s.next=l),n.pending=l}i!==0&&bu(a,l,i)}}function hi(e,t,a,n){At[jn++]=e,At[jn++]=t,At[jn++]=a,At[jn++]=n,ao|=n,e.lanes|=n,e=e.alternate,e!==null&&(e.lanes|=n)}function no(e,t,a,n){return hi(e,t,a,n),pi(e)}function Za(e,t){return hi(e,null,null,t),pi(e)}function bu(e,t,a){e.lanes|=a;var n=e.alternate;n!==null&&(n.lanes|=a);for(var l=!1,i=e.return;i!==null;)i.childLanes|=a,n=i.alternate,n!==null&&(n.childLanes|=a),i.tag===22&&(e=i.stateNode,e===null||e._visibility&1||(l=!0)),e=i,i=i.return;return e.tag===3?(i=e.stateNode,l&&t!==null&&(l=31-gt(a),e=i.hiddenUpdates,n=e[l],n===null?e[l]=[t]:n.push(t),t.lane=a|536870912),i):null}function pi(e){if(50<_l)throw _l=0,ms=null,Error(c(185));for(var t=e.return;t!==null;)e=t,t=e.return;return e.tag===3?e.stateNode:null}var Sn={};function _p(e,t,a,n){this.tag=e,this.key=a,this.sibling=this.child=this.return=this.stateNode=this.type=this.elementType=null,this.index=0,this.refCleanup=this.ref=null,this.pendingProps=t,this.dependencies=this.memoizedState=this.updateQueue=this.memoizedProps=null,this.mode=n,this.subtreeFlags=this.flags=0,this.deletions=null,this.childLanes=this.lanes=0,this.alternate=null}function yt(e,t,a,n){return new _p(e,t,a,n)}function lo(e){return e=e.prototype,!(!e||!e.isReactComponent)}function Kt(e,t){var a=e.alternate;return a===null?(a=yt(e.tag,t,e.key,e.mode),a.elementType=e.elementType,a.type=e.type,a.stateNode=e.stateNode,a.alternate=e,e.alternate=a):(a.pendingProps=t,a.type=e.type,a.flags=0,a.subtreeFlags=0,a.deletions=null),a.flags=e.flags&65011712,a.childLanes=e.childLanes,a.lanes=e.lanes,a.child=e.child,a.memoizedProps=e.memoizedProps,a.memoizedState=e.memoizedState,a.updateQueue=e.updateQueue,t=e.dependencies,a.dependencies=t===null?null:{lanes:t.lanes,firstContext:t.firstContext},a.sibling=e.sibling,a.index=e.index,a.ref=e.ref,a.refCleanup=e.refCleanup,a}function yu(e,t){e.flags&=65011714;var a=e.alternate;return a===null?(e.childLanes=0,e.lanes=t,e.child=null,e.subtreeFlags=0,e.memoizedProps=null,e.memoizedState=null,e.updateQueue=null,e.dependencies=null,e.stateNode=null):(e.childLanes=a.childLanes,e.lanes=a.lanes,e.child=a.child,e.subtreeFlags=0,e.deletions=null,e.memoizedProps=a.memoizedProps,e.memoizedState=a.memoizedState,e.updateQueue=a.updateQueue,e.type=a.type,t=a.dependencies,e.dependencies=t===null?null:{lanes:t.lanes,firstContext:t.firstContext}),e}function gi(e,t,a,n,l,i){var s=0;if(n=e,typeof e=="function")lo(e)&&(s=1);else if(typeof e=="string")s=H0(e,a,K.current)?26:e==="html"||e==="head"||e==="body"?27:5;else e:switch(e){case ae:return e=yt(31,a,t,l),e.elementType=ae,e.lanes=i,e;case M:return $a(a.children,l,i,t);case _:s=8,l|=24;break;case Z:return e=yt(12,a,t,l|2),e.elementType=Z,e.lanes=i,e;case X:return e=yt(13,a,t,l),e.elementType=X,e.lanes=i,e;case W:return e=yt(19,a,t,l),e.elementType=W,e.lanes=i,e;default:if(typeof e=="object"&&e!==null)switch(e.$$typeof){case L:s=10;break e;case P:s=9;break e;case te:s=11;break e;case B:s=14;break e;case J:s=16,n=null;break e}s=29,a=Error(c(130,e===null?"null":typeof e,"")),n=null}return t=yt(s,a,t,l),t.elementType=e,t.type=n,t.lanes=i,t}function $a(e,t,a,n){return e=yt(7,e,n,t),e.lanes=a,e}function io(e,t,a){return e=yt(6,e,null,t),e.lanes=a,e}function vu(e){var t=yt(18,null,null,0);return t.stateNode=e,t}function ro(e,t,a){return t=yt(4,e.children!==null?e.children:[],e.key,t),t.lanes=a,t.stateNode={containerInfo:e.containerInfo,pendingChildren:null,implementation:e.implementation},t}var xu=new WeakMap;function Tt(e,t){if(typeof e=="object"&&e!==null){var a=xu.get(e);return a!==void 0?a:(t={value:e,source:t,stack:vc(t)},xu.set(e,t),t)}return{value:e,source:t,stack:vc(t)}}var wn=[],Nn=0,bi=null,dl=0,kt=[],Ct=0,pa=null,Lt=1,Yt="";function Wt(e,t){wn[Nn++]=dl,wn[Nn++]=bi,bi=e,dl=t}function ju(e,t,a){kt[Ct++]=Lt,kt[Ct++]=Yt,kt[Ct++]=pa,pa=e;var n=Lt;e=Yt;var l=32-gt(n)-1;n&=~(1<<l),a+=1;var i=32-gt(t)+l;if(30<i){var s=l-l%5;i=(n&(1<<s)-1).toString(32),n>>=s,l-=s,Lt=1<<32-gt(t)+l|a<<l|n,Yt=i+e}else Lt=1<<i|a<<l|n,Yt=e}function oo(e){e.return!==null&&(Wt(e,1),ju(e,1,0))}function so(e){for(;e===bi;)bi=wn[--Nn],wn[Nn]=null,dl=wn[--Nn],wn[Nn]=null;for(;e===pa;)pa=kt[--Ct],kt[Ct]=null,Yt=kt[--Ct],kt[Ct]=null,Lt=kt[--Ct],kt[Ct]=null}function Su(e,t){kt[Ct++]=Lt,kt[Ct++]=Yt,kt[Ct++]=pa,Lt=t.id,Yt=t.overflow,pa=e}var et=null,Oe=null,ve=!1,ga=null,Mt=!1,co=Error(c(519));function ba(e){var t=Error(c(418,1<arguments.length&&arguments[1]!==void 0&&arguments[1]?"text":"HTML",""));throw fl(Tt(t,e)),co}function wu(e){var t=e.stateNode,a=e.type,n=e.memoizedProps;switch(t[Pe]=e,t[rt]=n,a){case"dialog":ge("cancel",t),ge("close",t);break;case"iframe":case"object":case"embed":ge("load",t);break;case"video":case"audio":for(a=0;a<Ol.length;a++)ge(Ol[a],t);break;case"source":ge("error",t);break;case"img":case"image":case"link":ge("error",t),ge("load",t);break;case"details":ge("toggle",t);break;case"input":ge("invalid",t),Uc(t,n.value,n.defaultValue,n.checked,n.defaultChecked,n.type,n.name,!0);break;case"select":ge("invalid",t);break;case"textarea":ge("invalid",t),Bc(t,n.value,n.defaultValue,n.children)}a=n.children,typeof a!="string"&&typeof a!="number"&&typeof a!="bigint"||t.textContent===""+a||n.suppressHydrationWarning===!0||Yf(t.textContent,a)?(n.popover!=null&&(ge("beforetoggle",t),ge("toggle",t)),n.onScroll!=null&&ge("scroll",t),n.onScrollEnd!=null&&ge("scrollend",t),n.onClick!=null&&(t.onclick=$t),t=!0):t=!1,t||ba(e,!0)}function Nu(e){for(et=e.return;et;)switch(et.tag){case 5:case 31:case 13:Mt=!1;return;case 27:case 3:Mt=!0;return;default:et=et.return}}function zn(e){if(e!==et)return!1;if(!ve)return Nu(e),ve=!0,!1;var t=e.tag,a;if((a=t!==3&&t!==27)&&((a=t===5)&&(a=e.type,a=!(a!=="form"&&a!=="button")||Ts(e.type,e.memoizedProps)),a=!a),a&&Oe&&ba(e),Nu(e),t===13){if(e=e.memoizedState,e=e!==null?e.dehydrated:null,!e)throw Error(c(317));Oe=Wf(e)}else if(t===31){if(e=e.memoizedState,e=e!==null?e.dehydrated:null,!e)throw Error(c(317));Oe=Wf(e)}else t===27?(t=Oe,Ma(e.type)?(e=Rs,Rs=null,Oe=e):Oe=t):Oe=et?Rt(e.stateNode.nextSibling):null;return!0}function Ja(){Oe=et=null,ve=!1}function uo(){var e=ga;return e!==null&&(dt===null?dt=e:dt.push.apply(dt,e),ga=null),e}function fl(e){ga===null?ga=[e]:ga.push(e)}var fo=j(null),Ka=null,Ft=null;function ya(e,t,a){Q(fo,t._currentValue),t._currentValue=a}function It(e){e._currentValue=fo.current,U(fo)}function mo(e,t,a){for(;e!==null;){var n=e.alternate;if((e.childLanes&t)!==t?(e.childLanes|=t,n!==null&&(n.childLanes|=t)):n!==null&&(n.childLanes&t)!==t&&(n.childLanes|=t),e===a)break;e=e.return}}function ho(e,t,a,n){var l=e.child;for(l!==null&&(l.return=e);l!==null;){var i=l.dependencies;if(i!==null){var s=l.child;i=i.firstContext;e:for(;i!==null;){var f=i;i=l;for(var y=0;y<t.length;y++)if(f.context===t[y]){i.lanes|=a,f=i.alternate,f!==null&&(f.lanes|=a),mo(i.return,a,e),n||(s=null);break e}i=f.next}}else if(l.tag===18){if(s=l.return,s===null)throw Error(c(341));s.lanes|=a,i=s.alternate,i!==null&&(i.lanes|=a),mo(s,a,e),s=null}else s=l.child;if(s!==null)s.return=l;else for(s=l;s!==null;){if(s===e){s=null;break}if(l=s.sibling,l!==null){l.return=s.return,s=l;break}s=s.return}l=s}}function En(e,t,a,n){e=null;for(var l=t,i=!1;l!==null;){if(!i){if((l.flags&524288)!==0)i=!0;else if((l.flags&262144)!==0)break}if(l.tag===10){var s=l.alternate;if(s===null)throw Error(c(387));if(s=s.memoizedProps,s!==null){var f=l.type;bt(l.pendingProps.value,s.value)||(e!==null?e.push(f):e=[f])}}else if(l===ne.current){if(s=l.alternate,s===null)throw Error(c(387));s.memoizedState.memoizedState!==l.memoizedState.memoizedState&&(e!==null?e.push(ql):e=[ql])}l=l.return}e!==null&&ho(t,e,a,n),t.flags|=262144}function yi(e){for(e=e.firstContext;e!==null;){if(!bt(e.context._currentValue,e.memoizedValue))return!0;e=e.next}return!1}function Wa(e){Ka=e,Ft=null,e=e.dependencies,e!==null&&(e.firstContext=null)}function tt(e){return zu(Ka,e)}function vi(e,t){return Ka===null&&Wa(e),zu(e,t)}function zu(e,t){var a=t._currentValue;if(t={context:t,memoizedValue:a,next:null},Ft===null){if(e===null)throw Error(c(308));Ft=t,e.dependencies={lanes:0,firstContext:t},e.flags|=524288}else Ft=Ft.next=t;return a}var Rp=typeof AbortController<"u"?AbortController:function(){var e=[],t=this.signal={aborted:!1,addEventListener:function(a,n){e.push(n)}};this.abort=function(){t.aborted=!0,e.forEach(function(a){return a()})}},Op=o.unstable_scheduleCallback,Dp=o.unstable_NormalPriority,Qe={$$typeof:L,Consumer:null,Provider:null,_currentValue:null,_currentValue2:null,_threadCount:0};function po(){return{controller:new Rp,data:new Map,refCount:0}}function ml(e){e.refCount--,e.refCount===0&&Op(Dp,function(){e.controller.abort()})}var hl=null,go=0,An=0,Tn=null;function Up(e,t){if(hl===null){var a=hl=[];go=0,An=vs(),Tn={status:"pending",value:void 0,then:function(n){a.push(n)}}}return go++,t.then(Eu,Eu),t}function Eu(){if(--go===0&&hl!==null){Tn!==null&&(Tn.status="fulfilled");var e=hl;hl=null,An=0,Tn=null;for(var t=0;t<e.length;t++)(0,e[t])()}}function Hp(e,t){var a=[],n={status:"pending",value:null,reason:null,then:function(l){a.push(l)}};return e.then(function(){n.status="fulfilled",n.value=t;for(var l=0;l<a.length;l++)(0,a[l])(t)},function(l){for(n.status="rejected",n.reason=l,l=0;l<a.length;l++)(0,a[l])(void 0)}),n}var Au=C.S;C.S=function(e,t){df=ht(),typeof t=="object"&&t!==null&&typeof t.then=="function"&&Up(e,t),Au!==null&&Au(e,t)};var Fa=j(null);function bo(){var e=Fa.current;return e!==null?e:_e.pooledCache}function xi(e,t){t===null?Q(Fa,Fa.current):Q(Fa,t.pool)}function Tu(){var e=bo();return e===null?null:{parent:Qe._currentValue,pool:e}}var kn=Error(c(460)),yo=Error(c(474)),ji=Error(c(542)),Si={then:function(){}};function ku(e){return e=e.status,e==="fulfilled"||e==="rejected"}function Cu(e,t,a){switch(a=e[a],a===void 0?e.push(t):a!==t&&(t.then($t,$t),t=a),t.status){case"fulfilled":return t.value;case"rejected":throw e=t.reason,_u(e),e;default:if(typeof t.status=="string")t.then($t,$t);else{if(e=_e,e!==null&&100<e.shellSuspendCounter)throw Error(c(482));e=t,e.status="pending",e.then(function(n){if(t.status==="pending"){var l=t;l.status="fulfilled",l.value=n}},function(n){if(t.status==="pending"){var l=t;l.status="rejected",l.reason=n}})}switch(t.status){case"fulfilled":return t.value;case"rejected":throw e=t.reason,_u(e),e}throw Pa=t,kn}}function Ia(e){try{var t=e._init;return t(e._payload)}catch(a){throw a!==null&&typeof a=="object"&&typeof a.then=="function"?(Pa=a,kn):a}}var Pa=null;function Mu(){if(Pa===null)throw Error(c(459));var e=Pa;return Pa=null,e}function _u(e){if(e===kn||e===ji)throw Error(c(483))}var Cn=null,pl=0;function wi(e){var t=pl;return pl+=1,Cn===null&&(Cn=[]),Cu(Cn,e,t)}function gl(e,t){t=t.props.ref,e.ref=t!==void 0?t:null}function Ni(e,t){throw t.$$typeof===O?Error(c(525)):(e=Object.prototype.toString.call(t),Error(c(31,e==="[object Object]"?"object with keys {"+Object.keys(t).join(", ")+"}":e)))}function Ru(e){function t(N,x){if(e){var E=N.deletions;E===null?(N.deletions=[x],N.flags|=16):E.push(x)}}function a(N,x){if(!e)return null;for(;x!==null;)t(N,x),x=x.sibling;return null}function n(N){for(var x=new Map;N!==null;)N.key!==null?x.set(N.key,N):x.set(N.index,N),N=N.sibling;return x}function l(N,x){return N=Kt(N,x),N.index=0,N.sibling=null,N}function i(N,x,E){return N.index=E,e?(E=N.alternate,E!==null?(E=E.index,E<x?(N.flags|=67108866,x):E):(N.flags|=67108866,x)):(N.flags|=1048576,x)}function s(N){return e&&N.alternate===null&&(N.flags|=67108866),N}function f(N,x,E,D){return x===null||x.tag!==6?(x=io(E,N.mode,D),x.return=N,x):(x=l(x,E),x.return=N,x)}function y(N,x,E,D){var le=E.type;return le===M?R(N,x,E.props.children,D,E.key):x!==null&&(x.elementType===le||typeof le=="object"&&le!==null&&le.$$typeof===J&&Ia(le)===x.type)?(x=l(x,E.props),gl(x,E),x.return=N,x):(x=gi(E.type,E.key,E.props,null,N.mode,D),gl(x,E),x.return=N,x)}function A(N,x,E,D){return x===null||x.tag!==4||x.stateNode.containerInfo!==E.containerInfo||x.stateNode.implementation!==E.implementation?(x=ro(E,N.mode,D),x.return=N,x):(x=l(x,E.children||[]),x.return=N,x)}function R(N,x,E,D,le){return x===null||x.tag!==7?(x=$a(E,N.mode,D,le),x.return=N,x):(x=l(x,E),x.return=N,x)}function H(N,x,E){if(typeof x=="string"&&x!==""||typeof x=="number"||typeof x=="bigint")return x=io(""+x,N.mode,E),x.return=N,x;if(typeof x=="object"&&x!==null){switch(x.$$typeof){case q:return E=gi(x.type,x.key,x.props,null,N.mode,E),gl(E,x),E.return=N,E;case Y:return x=ro(x,N.mode,E),x.return=N,x;case J:return x=Ia(x),H(N,x,E)}if(ue(x)||F(x))return x=$a(x,N.mode,E,null),x.return=N,x;if(typeof x.then=="function")return H(N,wi(x),E);if(x.$$typeof===L)return H(N,vi(N,x),E);Ni(N,x)}return null}function T(N,x,E,D){var le=x!==null?x.key:null;if(typeof E=="string"&&E!==""||typeof E=="number"||typeof E=="bigint")return le!==null?null:f(N,x,""+E,D);if(typeof E=="object"&&E!==null){switch(E.$$typeof){case q:return E.key===le?y(N,x,E,D):null;case Y:return E.key===le?A(N,x,E,D):null;case J:return E=Ia(E),T(N,x,E,D)}if(ue(E)||F(E))return le!==null?null:R(N,x,E,D,null);if(typeof E.then=="function")return T(N,x,wi(E),D);if(E.$$typeof===L)return T(N,x,vi(N,E),D);Ni(N,E)}return null}function k(N,x,E,D,le){if(typeof D=="string"&&D!==""||typeof D=="number"||typeof D=="bigint")return N=N.get(E)||null,f(x,N,""+D,le);if(typeof D=="object"&&D!==null){switch(D.$$typeof){case q:return N=N.get(D.key===null?E:D.key)||null,y(x,N,D,le);case Y:return N=N.get(D.key===null?E:D.key)||null,A(x,N,D,le);case J:return D=Ia(D),k(N,x,E,D,le)}if(ue(D)||F(D))return N=N.get(E)||null,R(x,N,D,le,null);if(typeof D.then=="function")return k(N,x,E,wi(D),le);if(D.$$typeof===L)return k(N,x,E,vi(x,D),le);Ni(x,D)}return null}function $(N,x,E,D){for(var le=null,we=null,I=x,fe=x=0,ye=null;I!==null&&fe<E.length;fe++){I.index>fe?(ye=I,I=null):ye=I.sibling;var Ne=T(N,I,E[fe],D);if(Ne===null){I===null&&(I=ye);break}e&&I&&Ne.alternate===null&&t(N,I),x=i(Ne,x,fe),we===null?le=Ne:we.sibling=Ne,we=Ne,I=ye}if(fe===E.length)return a(N,I),ve&&Wt(N,fe),le;if(I===null){for(;fe<E.length;fe++)I=H(N,E[fe],D),I!==null&&(x=i(I,x,fe),we===null?le=I:we.sibling=I,we=I);return ve&&Wt(N,fe),le}for(I=n(I);fe<E.length;fe++)ye=k(I,N,fe,E[fe],D),ye!==null&&(e&&ye.alternate!==null&&I.delete(ye.key===null?fe:ye.key),x=i(ye,x,fe),we===null?le=ye:we.sibling=ye,we=ye);return e&&I.forEach(function(Ua){return t(N,Ua)}),ve&&Wt(N,fe),le}function ie(N,x,E,D){if(E==null)throw Error(c(151));for(var le=null,we=null,I=x,fe=x=0,ye=null,Ne=E.next();I!==null&&!Ne.done;fe++,Ne=E.next()){I.index>fe?(ye=I,I=null):ye=I.sibling;var Ua=T(N,I,Ne.value,D);if(Ua===null){I===null&&(I=ye);break}e&&I&&Ua.alternate===null&&t(N,I),x=i(Ua,x,fe),we===null?le=Ua:we.sibling=Ua,we=Ua,I=ye}if(Ne.done)return a(N,I),ve&&Wt(N,fe),le;if(I===null){for(;!Ne.done;fe++,Ne=E.next())Ne=H(N,Ne.value,D),Ne!==null&&(x=i(Ne,x,fe),we===null?le=Ne:we.sibling=Ne,we=Ne);return ve&&Wt(N,fe),le}for(I=n(I);!Ne.done;fe++,Ne=E.next())Ne=k(I,N,fe,Ne.value,D),Ne!==null&&(e&&Ne.alternate!==null&&I.delete(Ne.key===null?fe:Ne.key),x=i(Ne,x,fe),we===null?le=Ne:we.sibling=Ne,we=Ne);return e&&I.forEach(function(J0){return t(N,J0)}),ve&&Wt(N,fe),le}function Me(N,x,E,D){if(typeof E=="object"&&E!==null&&E.type===M&&E.key===null&&(E=E.props.children),typeof E=="object"&&E!==null){switch(E.$$typeof){case q:e:{for(var le=E.key;x!==null;){if(x.key===le){if(le=E.type,le===M){if(x.tag===7){a(N,x.sibling),D=l(x,E.props.children),D.return=N,N=D;break e}}else if(x.elementType===le||typeof le=="object"&&le!==null&&le.$$typeof===J&&Ia(le)===x.type){a(N,x.sibling),D=l(x,E.props),gl(D,E),D.return=N,N=D;break e}a(N,x);break}else t(N,x);x=x.sibling}E.type===M?(D=$a(E.props.children,N.mode,D,E.key),D.return=N,N=D):(D=gi(E.type,E.key,E.props,null,N.mode,D),gl(D,E),D.return=N,N=D)}return s(N);case Y:e:{for(le=E.key;x!==null;){if(x.key===le)if(x.tag===4&&x.stateNode.containerInfo===E.containerInfo&&x.stateNode.implementation===E.implementation){a(N,x.sibling),D=l(x,E.children||[]),D.return=N,N=D;break e}else{a(N,x);break}else t(N,x);x=x.sibling}D=ro(E,N.mode,D),D.return=N,N=D}return s(N);case J:return E=Ia(E),Me(N,x,E,D)}if(ue(E))return $(N,x,E,D);if(F(E)){if(le=F(E),typeof le!="function")throw Error(c(150));return E=le.call(E),ie(N,x,E,D)}if(typeof E.then=="function")return Me(N,x,wi(E),D);if(E.$$typeof===L)return Me(N,x,vi(N,E),D);Ni(N,E)}return typeof E=="string"&&E!==""||typeof E=="number"||typeof E=="bigint"?(E=""+E,x!==null&&x.tag===6?(a(N,x.sibling),D=l(x,E),D.return=N,N=D):(a(N,x),D=io(E,N.mode,D),D.return=N,N=D),s(N)):a(N,x)}return function(N,x,E,D){try{pl=0;var le=Me(N,x,E,D);return Cn=null,le}catch(I){if(I===kn||I===ji)throw I;var we=yt(29,I,null,N.mode);return we.lanes=D,we.return=N,we}}}var en=Ru(!0),Ou=Ru(!1),va=!1;function vo(e){e.updateQueue={baseState:e.memoizedState,firstBaseUpdate:null,lastBaseUpdate:null,shared:{pending:null,lanes:0,hiddenCallbacks:null},callbacks:null}}function xo(e,t){e=e.updateQueue,t.updateQueue===e&&(t.updateQueue={baseState:e.baseState,firstBaseUpdate:e.firstBaseUpdate,lastBaseUpdate:e.lastBaseUpdate,shared:e.shared,callbacks:null})}function xa(e){return{lane:e,tag:0,payload:null,callback:null,next:null}}function ja(e,t,a){var n=e.updateQueue;if(n===null)return null;if(n=n.shared,(Ee&2)!==0){var l=n.pending;return l===null?t.next=t:(t.next=l.next,l.next=t),n.pending=t,t=pi(e),bu(e,null,a),t}return hi(e,n,t,a),pi(e)}function bl(e,t,a){if(t=t.updateQueue,t!==null&&(t=t.shared,(a&4194048)!==0)){var n=t.lanes;n&=e.pendingLanes,a|=n,t.lanes=a,zc(e,a)}}function jo(e,t){var a=e.updateQueue,n=e.alternate;if(n!==null&&(n=n.updateQueue,a===n)){var l=null,i=null;if(a=a.firstBaseUpdate,a!==null){do{var s={lane:a.lane,tag:a.tag,payload:a.payload,callback:null,next:null};i===null?l=i=s:i=i.next=s,a=a.next}while(a!==null);i===null?l=i=t:i=i.next=t}else l=i=t;a={baseState:n.baseState,firstBaseUpdate:l,lastBaseUpdate:i,shared:n.shared,callbacks:n.callbacks},e.updateQueue=a;return}e=a.lastBaseUpdate,e===null?a.firstBaseUpdate=t:e.next=t,a.lastBaseUpdate=t}var So=!1;function yl(){if(So){var e=Tn;if(e!==null)throw e}}function vl(e,t,a,n){So=!1;var l=e.updateQueue;va=!1;var i=l.firstBaseUpdate,s=l.lastBaseUpdate,f=l.shared.pending;if(f!==null){l.shared.pending=null;var y=f,A=y.next;y.next=null,s===null?i=A:s.next=A,s=y;var R=e.alternate;R!==null&&(R=R.updateQueue,f=R.lastBaseUpdate,f!==s&&(f===null?R.firstBaseUpdate=A:f.next=A,R.lastBaseUpdate=y))}if(i!==null){var H=l.baseState;s=0,R=A=y=null,f=i;do{var T=f.lane&-536870913,k=T!==f.lane;if(k?(be&T)===T:(n&T)===T){T!==0&&T===An&&(So=!0),R!==null&&(R=R.next={lane:0,tag:f.tag,payload:f.payload,callback:null,next:null});e:{var $=e,ie=f;T=t;var Me=a;switch(ie.tag){case 1:if($=ie.payload,typeof $=="function"){H=$.call(Me,H,T);break e}H=$;break e;case 3:$.flags=$.flags&-65537|128;case 0:if($=ie.payload,T=typeof $=="function"?$.call(Me,H,T):$,T==null)break e;H=S({},H,T);break e;case 2:va=!0}}T=f.callback,T!==null&&(e.flags|=64,k&&(e.flags|=8192),k=l.callbacks,k===null?l.callbacks=[T]:k.push(T))}else k={lane:T,tag:f.tag,payload:f.payload,callback:f.callback,next:null},R===null?(A=R=k,y=H):R=R.next=k,s|=T;if(f=f.next,f===null){if(f=l.shared.pending,f===null)break;k=f,f=k.next,k.next=null,l.lastBaseUpdate=k,l.shared.pending=null}}while(!0);R===null&&(y=H),l.baseState=y,l.firstBaseUpdate=A,l.lastBaseUpdate=R,i===null&&(l.shared.lanes=0),Ea|=s,e.lanes=s,e.memoizedState=H}}function Du(e,t){if(typeof e!="function")throw Error(c(191,e));e.call(t)}function Uu(e,t){var a=e.callbacks;if(a!==null)for(e.callbacks=null,e=0;e<a.length;e++)Du(a[e],t)}var Mn=j(null),zi=j(0);function Hu(e,t){e=oa,Q(zi,e),Q(Mn,t),oa=e|t.baseLanes}function wo(){Q(zi,oa),Q(Mn,Mn.current)}function No(){oa=zi.current,U(Mn),U(zi)}var vt=j(null),_t=null;function Sa(e){var t=e.alternate;Q(Ge,Ge.current&1),Q(vt,e),_t===null&&(t===null||Mn.current!==null||t.memoizedState!==null)&&(_t=e)}function zo(e){Q(Ge,Ge.current),Q(vt,e),_t===null&&(_t=e)}function Bu(e){e.tag===22?(Q(Ge,Ge.current),Q(vt,e),_t===null&&(_t=e)):wa()}function wa(){Q(Ge,Ge.current),Q(vt,vt.current)}function xt(e){U(vt),_t===e&&(_t=null),U(Ge)}var Ge=j(0);function Ei(e){for(var t=e;t!==null;){if(t.tag===13){var a=t.memoizedState;if(a!==null&&(a=a.dehydrated,a===null||Ms(a)||_s(a)))return t}else if(t.tag===19&&(t.memoizedProps.revealOrder==="forwards"||t.memoizedProps.revealOrder==="backwards"||t.memoizedProps.revealOrder==="unstable_legacy-backwards"||t.memoizedProps.revealOrder==="together")){if((t.flags&128)!==0)return t}else if(t.child!==null){t.child.return=t,t=t.child;continue}if(t===e)break;for(;t.sibling===null;){if(t.return===null||t.return===e)return null;t=t.return}t.sibling.return=t.return,t=t.sibling}return null}var Pt=0,de=null,ke=null,Ze=null,Ai=!1,_n=!1,tn=!1,Ti=0,xl=0,Rn=null,Bp=0;function qe(){throw Error(c(321))}function Eo(e,t){if(t===null)return!1;for(var a=0;a<t.length&&a<e.length;a++)if(!bt(e[a],t[a]))return!1;return!0}function Ao(e,t,a,n,l,i){return Pt=i,de=t,t.memoizedState=null,t.updateQueue=null,t.lanes=0,C.H=e===null||e.memoizedState===null?jd:Go,tn=!1,i=a(n,l),tn=!1,_n&&(i=Lu(t,a,n,l)),qu(e),i}function qu(e){C.H=wl;var t=ke!==null&&ke.next!==null;if(Pt=0,Ze=ke=de=null,Ai=!1,xl=0,Rn=null,t)throw Error(c(300));e===null||$e||(e=e.dependencies,e!==null&&yi(e)&&($e=!0))}function Lu(e,t,a,n){de=e;var l=0;do{if(_n&&(Rn=null),xl=0,_n=!1,25<=l)throw Error(c(301));if(l+=1,Ze=ke=null,e.updateQueue!=null){var i=e.updateQueue;i.lastEffect=null,i.events=null,i.stores=null,i.memoCache!=null&&(i.memoCache.index=0)}C.H=Sd,i=t(a,n)}while(_n);return i}function qp(){var e=C.H,t=e.useState()[0];return t=typeof t.then=="function"?jl(t):t,e=e.useState()[0],(ke!==null?ke.memoizedState:null)!==e&&(de.flags|=1024),t}function To(){var e=Ti!==0;return Ti=0,e}function ko(e,t,a){t.updateQueue=e.updateQueue,t.flags&=-2053,e.lanes&=~a}function Co(e){if(Ai){for(e=e.memoizedState;e!==null;){var t=e.queue;t!==null&&(t.pending=null),e=e.next}Ai=!1}Pt=0,Ze=ke=de=null,_n=!1,xl=Ti=0,Rn=null}function it(){var e={memoizedState:null,baseState:null,baseQueue:null,queue:null,next:null};return Ze===null?de.memoizedState=Ze=e:Ze=Ze.next=e,Ze}function Ve(){if(ke===null){var e=de.alternate;e=e!==null?e.memoizedState:null}else e=ke.next;var t=Ze===null?de.memoizedState:Ze.next;if(t!==null)Ze=t,ke=e;else{if(e===null)throw de.alternate===null?Error(c(467)):Error(c(310));ke=e,e={memoizedState:ke.memoizedState,baseState:ke.baseState,baseQueue:ke.baseQueue,queue:ke.queue,next:null},Ze===null?de.memoizedState=Ze=e:Ze=Ze.next=e}return Ze}function ki(){return{lastEffect:null,events:null,stores:null,memoCache:null}}function jl(e){var t=xl;return xl+=1,Rn===null&&(Rn=[]),e=Cu(Rn,e,t),t=de,(Ze===null?t.memoizedState:Ze.next)===null&&(t=t.alternate,C.H=t===null||t.memoizedState===null?jd:Go),e}function Ci(e){if(e!==null&&typeof e=="object"){if(typeof e.then=="function")return jl(e);if(e.$$typeof===L)return tt(e)}throw Error(c(438,String(e)))}function Mo(e){var t=null,a=de.updateQueue;if(a!==null&&(t=a.memoCache),t==null){var n=de.alternate;n!==null&&(n=n.updateQueue,n!==null&&(n=n.memoCache,n!=null&&(t={data:n.data.map(function(l){return l.slice()}),index:0})))}if(t==null&&(t={data:[],index:0}),a===null&&(a=ki(),de.updateQueue=a),a.memoCache=t,a=t.data[t.index],a===void 0)for(a=t.data[t.index]=Array(e),n=0;n<e;n++)a[n]=xe;return t.index++,a}function ea(e,t){return typeof t=="function"?t(e):t}function Mi(e){var t=Ve();return _o(t,ke,e)}function _o(e,t,a){var n=e.queue;if(n===null)throw Error(c(311));n.lastRenderedReducer=a;var l=e.baseQueue,i=n.pending;if(i!==null){if(l!==null){var s=l.next;l.next=i.next,i.next=s}t.baseQueue=l=i,n.pending=null}if(i=e.baseState,l===null)e.memoizedState=i;else{t=l.next;var f=s=null,y=null,A=t,R=!1;do{var H=A.lane&-536870913;if(H!==A.lane?(be&H)===H:(Pt&H)===H){var T=A.revertLane;if(T===0)y!==null&&(y=y.next={lane:0,revertLane:0,gesture:null,action:A.action,hasEagerState:A.hasEagerState,eagerState:A.eagerState,next:null}),H===An&&(R=!0);else if((Pt&T)===T){A=A.next,T===An&&(R=!0);continue}else H={lane:0,revertLane:A.revertLane,gesture:null,action:A.action,hasEagerState:A.hasEagerState,eagerState:A.eagerState,next:null},y===null?(f=y=H,s=i):y=y.next=H,de.lanes|=T,Ea|=T;H=A.action,tn&&a(i,H),i=A.hasEagerState?A.eagerState:a(i,H)}else T={lane:H,revertLane:A.revertLane,gesture:A.gesture,action:A.action,hasEagerState:A.hasEagerState,eagerState:A.eagerState,next:null},y===null?(f=y=T,s=i):y=y.next=T,de.lanes|=H,Ea|=H;A=A.next}while(A!==null&&A!==t);if(y===null?s=i:y.next=f,!bt(i,e.memoizedState)&&($e=!0,R&&(a=Tn,a!==null)))throw a;e.memoizedState=i,e.baseState=s,e.baseQueue=y,n.lastRenderedState=i}return l===null&&(n.lanes=0),[e.memoizedState,n.dispatch]}function Ro(e){var t=Ve(),a=t.queue;if(a===null)throw Error(c(311));a.lastRenderedReducer=e;var n=a.dispatch,l=a.pending,i=t.memoizedState;if(l!==null){a.pending=null;var s=l=l.next;do i=e(i,s.action),s=s.next;while(s!==l);bt(i,t.memoizedState)||($e=!0),t.memoizedState=i,t.baseQueue===null&&(t.baseState=i),a.lastRenderedState=i}return[i,n]}function Yu(e,t,a){var n=de,l=Ve(),i=ve;if(i){if(a===void 0)throw Error(c(407));a=a()}else a=t();var s=!bt((ke||l).memoizedState,a);if(s&&(l.memoizedState=a,$e=!0),l=l.queue,Uo(Xu.bind(null,n,l,e),[e]),l.getSnapshot!==t||s||Ze!==null&&Ze.memoizedState.tag&1){if(n.flags|=2048,On(9,{destroy:void 0},Vu.bind(null,n,l,a,t),null),_e===null)throw Error(c(349));i||(Pt&127)!==0||Gu(n,t,a)}return a}function Gu(e,t,a){e.flags|=16384,e={getSnapshot:t,value:a},t=de.updateQueue,t===null?(t=ki(),de.updateQueue=t,t.stores=[e]):(a=t.stores,a===null?t.stores=[e]:a.push(e))}function Vu(e,t,a,n){t.value=a,t.getSnapshot=n,Qu(t)&&Zu(e)}function Xu(e,t,a){return a(function(){Qu(t)&&Zu(e)})}function Qu(e){var t=e.getSnapshot;e=e.value;try{var a=t();return!bt(e,a)}catch{return!0}}function Zu(e){var t=Za(e,2);t!==null&&ft(t,e,2)}function Oo(e){var t=it();if(typeof e=="function"){var a=e;if(e=a(),tn){fa(!0);try{a()}finally{fa(!1)}}}return t.memoizedState=t.baseState=e,t.queue={pending:null,lanes:0,dispatch:null,lastRenderedReducer:ea,lastRenderedState:e},t}function $u(e,t,a,n){return e.baseState=a,_o(e,ke,typeof n=="function"?n:ea)}function Lp(e,t,a,n,l){if(Oi(e))throw Error(c(485));if(e=t.action,e!==null){var i={payload:l,action:e,next:null,isTransition:!0,status:"pending",value:null,reason:null,listeners:[],then:function(s){i.listeners.push(s)}};C.T!==null?a(!0):i.isTransition=!1,n(i),a=t.pending,a===null?(i.next=t.pending=i,Ju(t,i)):(i.next=a.next,t.pending=a.next=i)}}function Ju(e,t){var a=t.action,n=t.payload,l=e.state;if(t.isTransition){var i=C.T,s={};C.T=s;try{var f=a(l,n),y=C.S;y!==null&&y(s,f),Ku(e,t,f)}catch(A){Do(e,t,A)}finally{i!==null&&s.types!==null&&(i.types=s.types),C.T=i}}else try{i=a(l,n),Ku(e,t,i)}catch(A){Do(e,t,A)}}function Ku(e,t,a){a!==null&&typeof a=="object"&&typeof a.then=="function"?a.then(function(n){Wu(e,t,n)},function(n){return Do(e,t,n)}):Wu(e,t,a)}function Wu(e,t,a){t.status="fulfilled",t.value=a,Fu(t),e.state=a,t=e.pending,t!==null&&(a=t.next,a===t?e.pending=null:(a=a.next,t.next=a,Ju(e,a)))}function Do(e,t,a){var n=e.pending;if(e.pending=null,n!==null){n=n.next;do t.status="rejected",t.reason=a,Fu(t),t=t.next;while(t!==n)}e.action=null}function Fu(e){e=e.listeners;for(var t=0;t<e.length;t++)(0,e[t])()}function Iu(e,t){return t}function Pu(e,t){if(ve){var a=_e.formState;if(a!==null){e:{var n=de;if(ve){if(Oe){t:{for(var l=Oe,i=Mt;l.nodeType!==8;){if(!i){l=null;break t}if(l=Rt(l.nextSibling),l===null){l=null;break t}}i=l.data,l=i==="F!"||i==="F"?l:null}if(l){Oe=Rt(l.nextSibling),n=l.data==="F!";break e}}ba(n)}n=!1}n&&(t=a[0])}}return a=it(),a.memoizedState=a.baseState=t,n={pending:null,lanes:0,dispatch:null,lastRenderedReducer:Iu,lastRenderedState:t},a.queue=n,a=yd.bind(null,de,n),n.dispatch=a,n=Oo(!1),i=Yo.bind(null,de,!1,n.queue),n=it(),l={state:t,dispatch:null,action:e,pending:null},n.queue=l,a=Lp.bind(null,de,l,i,a),l.dispatch=a,n.memoizedState=e,[t,a,!1]}function ed(e){var t=Ve();return td(t,ke,e)}function td(e,t,a){if(t=_o(e,t,Iu)[0],e=Mi(ea)[0],typeof t=="object"&&t!==null&&typeof t.then=="function")try{var n=jl(t)}catch(s){throw s===kn?ji:s}else n=t;t=Ve();var l=t.queue,i=l.dispatch;return a!==t.memoizedState&&(de.flags|=2048,On(9,{destroy:void 0},Yp.bind(null,l,a),null)),[n,i,e]}function Yp(e,t){e.action=t}function ad(e){var t=Ve(),a=ke;if(a!==null)return td(t,a,e);Ve(),t=t.memoizedState,a=Ve();var n=a.queue.dispatch;return a.memoizedState=e,[t,n,!1]}function On(e,t,a,n){return e={tag:e,create:a,deps:n,inst:t,next:null},t=de.updateQueue,t===null&&(t=ki(),de.updateQueue=t),a=t.lastEffect,a===null?t.lastEffect=e.next=e:(n=a.next,a.next=e,e.next=n,t.lastEffect=e),e}function nd(){return Ve().memoizedState}function _i(e,t,a,n){var l=it();de.flags|=e,l.memoizedState=On(1|t,{destroy:void 0},a,n===void 0?null:n)}function Ri(e,t,a,n){var l=Ve();n=n===void 0?null:n;var i=l.memoizedState.inst;ke!==null&&n!==null&&Eo(n,ke.memoizedState.deps)?l.memoizedState=On(t,i,a,n):(de.flags|=e,l.memoizedState=On(1|t,i,a,n))}function ld(e,t){_i(8390656,8,e,t)}function Uo(e,t){Ri(2048,8,e,t)}function Gp(e){de.flags|=4;var t=de.updateQueue;if(t===null)t=ki(),de.updateQueue=t,t.events=[e];else{var a=t.events;a===null?t.events=[e]:a.push(e)}}function id(e){var t=Ve().memoizedState;return Gp({ref:t,nextImpl:e}),function(){if((Ee&2)!==0)throw Error(c(440));return t.impl.apply(void 0,arguments)}}function rd(e,t){return Ri(4,2,e,t)}function od(e,t){return Ri(4,4,e,t)}function sd(e,t){if(typeof t=="function"){e=e();var a=t(e);return function(){typeof a=="function"?a():t(null)}}if(t!=null)return e=e(),t.current=e,function(){t.current=null}}function cd(e,t,a){a=a!=null?a.concat([e]):null,Ri(4,4,sd.bind(null,t,e),a)}function Ho(){}function ud(e,t){var a=Ve();t=t===void 0?null:t;var n=a.memoizedState;return t!==null&&Eo(t,n[1])?n[0]:(a.memoizedState=[e,t],e)}function dd(e,t){var a=Ve();t=t===void 0?null:t;var n=a.memoizedState;if(t!==null&&Eo(t,n[1]))return n[0];if(n=e(),tn){fa(!0);try{e()}finally{fa(!1)}}return a.memoizedState=[n,t],n}function Bo(e,t,a){return a===void 0||(Pt&1073741824)!==0&&(be&261930)===0?e.memoizedState=t:(e.memoizedState=a,e=mf(),de.lanes|=e,Ea|=e,a)}function fd(e,t,a,n){return bt(a,t)?a:Mn.current!==null?(e=Bo(e,a,n),bt(e,t)||($e=!0),e):(Pt&42)===0||(Pt&1073741824)!==0&&(be&261930)===0?($e=!0,e.memoizedState=a):(e=mf(),de.lanes|=e,Ea|=e,t)}function md(e,t,a,n,l){var i=G.p;G.p=i!==0&&8>i?i:8;var s=C.T,f={};C.T=f,Yo(e,!1,t,a);try{var y=l(),A=C.S;if(A!==null&&A(f,y),y!==null&&typeof y=="object"&&typeof y.then=="function"){var R=Hp(y,n);Sl(e,t,R,wt(e))}else Sl(e,t,n,wt(e))}catch(H){Sl(e,t,{then:function(){},status:"rejected",reason:H},wt())}finally{G.p=i,s!==null&&f.types!==null&&(s.types=f.types),C.T=s}}function Vp(){}function qo(e,t,a,n){if(e.tag!==5)throw Error(c(476));var l=hd(e).queue;md(e,l,t,ee,a===null?Vp:function(){return pd(e),a(n)})}function hd(e){var t=e.memoizedState;if(t!==null)return t;t={memoizedState:ee,baseState:ee,baseQueue:null,queue:{pending:null,lanes:0,dispatch:null,lastRenderedReducer:ea,lastRenderedState:ee},next:null};var a={};return t.next={memoizedState:a,baseState:a,baseQueue:null,queue:{pending:null,lanes:0,dispatch:null,lastRenderedReducer:ea,lastRenderedState:a},next:null},e.memoizedState=t,e=e.alternate,e!==null&&(e.memoizedState=t),t}function pd(e){var t=hd(e);t.next===null&&(t=e.alternate.memoizedState),Sl(e,t.next.queue,{},wt())}function Lo(){return tt(ql)}function gd(){return Ve().memoizedState}function bd(){return Ve().memoizedState}function Xp(e){for(var t=e.return;t!==null;){switch(t.tag){case 24:case 3:var a=wt();e=xa(a);var n=ja(t,e,a);n!==null&&(ft(n,t,a),bl(n,t,a)),t={cache:po()},e.payload=t;return}t=t.return}}function Qp(e,t,a){var n=wt();a={lane:n,revertLane:0,gesture:null,action:a,hasEagerState:!1,eagerState:null,next:null},Oi(e)?vd(t,a):(a=no(e,t,a,n),a!==null&&(ft(a,e,n),xd(a,t,n)))}function yd(e,t,a){var n=wt();Sl(e,t,a,n)}function Sl(e,t,a,n){var l={lane:n,revertLane:0,gesture:null,action:a,hasEagerState:!1,eagerState:null,next:null};if(Oi(e))vd(t,l);else{var i=e.alternate;if(e.lanes===0&&(i===null||i.lanes===0)&&(i=t.lastRenderedReducer,i!==null))try{var s=t.lastRenderedState,f=i(s,a);if(l.hasEagerState=!0,l.eagerState=f,bt(f,s))return hi(e,t,l,0),_e===null&&mi(),!1}catch{}if(a=no(e,t,l,n),a!==null)return ft(a,e,n),xd(a,t,n),!0}return!1}function Yo(e,t,a,n){if(n={lane:2,revertLane:vs(),gesture:null,action:n,hasEagerState:!1,eagerState:null,next:null},Oi(e)){if(t)throw Error(c(479))}else t=no(e,a,n,2),t!==null&&ft(t,e,2)}function Oi(e){var t=e.alternate;return e===de||t!==null&&t===de}function vd(e,t){_n=Ai=!0;var a=e.pending;a===null?t.next=t:(t.next=a.next,a.next=t),e.pending=t}function xd(e,t,a){if((a&4194048)!==0){var n=t.lanes;n&=e.pendingLanes,a|=n,t.lanes=a,zc(e,a)}}var wl={readContext:tt,use:Ci,useCallback:qe,useContext:qe,useEffect:qe,useImperativeHandle:qe,useLayoutEffect:qe,useInsertionEffect:qe,useMemo:qe,useReducer:qe,useRef:qe,useState:qe,useDebugValue:qe,useDeferredValue:qe,useTransition:qe,useSyncExternalStore:qe,useId:qe,useHostTransitionStatus:qe,useFormState:qe,useActionState:qe,useOptimistic:qe,useMemoCache:qe,useCacheRefresh:qe};wl.useEffectEvent=qe;var jd={readContext:tt,use:Ci,useCallback:function(e,t){return it().memoizedState=[e,t===void 0?null:t],e},useContext:tt,useEffect:ld,useImperativeHandle:function(e,t,a){a=a!=null?a.concat([e]):null,_i(4194308,4,sd.bind(null,t,e),a)},useLayoutEffect:function(e,t){return _i(4194308,4,e,t)},useInsertionEffect:function(e,t){_i(4,2,e,t)},useMemo:function(e,t){var a=it();t=t===void 0?null:t;var n=e();if(tn){fa(!0);try{e()}finally{fa(!1)}}return a.memoizedState=[n,t],n},useReducer:function(e,t,a){var n=it();if(a!==void 0){var l=a(t);if(tn){fa(!0);try{a(t)}finally{fa(!1)}}}else l=t;return n.memoizedState=n.baseState=l,e={pending:null,lanes:0,dispatch:null,lastRenderedReducer:e,lastRenderedState:l},n.queue=e,e=e.dispatch=Qp.bind(null,de,e),[n.memoizedState,e]},useRef:function(e){var t=it();return e={current:e},t.memoizedState=e},useState:function(e){e=Oo(e);var t=e.queue,a=yd.bind(null,de,t);return t.dispatch=a,[e.memoizedState,a]},useDebugValue:Ho,useDeferredValue:function(e,t){var a=it();return Bo(a,e,t)},useTransition:function(){var e=Oo(!1);return e=md.bind(null,de,e.queue,!0,!1),it().memoizedState=e,[!1,e]},useSyncExternalStore:function(e,t,a){var n=de,l=it();if(ve){if(a===void 0)throw Error(c(407));a=a()}else{if(a=t(),_e===null)throw Error(c(349));(be&127)!==0||Gu(n,t,a)}l.memoizedState=a;var i={value:a,getSnapshot:t};return l.queue=i,ld(Xu.bind(null,n,i,e),[e]),n.flags|=2048,On(9,{destroy:void 0},Vu.bind(null,n,i,a,t),null),a},useId:function(){var e=it(),t=_e.identifierPrefix;if(ve){var a=Yt,n=Lt;a=(n&~(1<<32-gt(n)-1)).toString(32)+a,t="_"+t+"R_"+a,a=Ti++,0<a&&(t+="H"+a.toString(32)),t+="_"}else a=Bp++,t="_"+t+"r_"+a.toString(32)+"_";return e.memoizedState=t},useHostTransitionStatus:Lo,useFormState:Pu,useActionState:Pu,useOptimistic:function(e){var t=it();t.memoizedState=t.baseState=e;var a={pending:null,lanes:0,dispatch:null,lastRenderedReducer:null,lastRenderedState:null};return t.queue=a,t=Yo.bind(null,de,!0,a),a.dispatch=t,[e,t]},useMemoCache:Mo,useCacheRefresh:function(){return it().memoizedState=Xp.bind(null,de)},useEffectEvent:function(e){var t=it(),a={impl:e};return t.memoizedState=a,function(){if((Ee&2)!==0)throw Error(c(440));return a.impl.apply(void 0,arguments)}}},Go={readContext:tt,use:Ci,useCallback:ud,useContext:tt,useEffect:Uo,useImperativeHandle:cd,useInsertionEffect:rd,useLayoutEffect:od,useMemo:dd,useReducer:Mi,useRef:nd,useState:function(){return Mi(ea)},useDebugValue:Ho,useDeferredValue:function(e,t){var a=Ve();return fd(a,ke.memoizedState,e,t)},useTransition:function(){var e=Mi(ea)[0],t=Ve().memoizedState;return[typeof e=="boolean"?e:jl(e),t]},useSyncExternalStore:Yu,useId:gd,useHostTransitionStatus:Lo,useFormState:ed,useActionState:ed,useOptimistic:function(e,t){var a=Ve();return $u(a,ke,e,t)},useMemoCache:Mo,useCacheRefresh:bd};Go.useEffectEvent=id;var Sd={readContext:tt,use:Ci,useCallback:ud,useContext:tt,useEffect:Uo,useImperativeHandle:cd,useInsertionEffect:rd,useLayoutEffect:od,useMemo:dd,useReducer:Ro,useRef:nd,useState:function(){return Ro(ea)},useDebugValue:Ho,useDeferredValue:function(e,t){var a=Ve();return ke===null?Bo(a,e,t):fd(a,ke.memoizedState,e,t)},useTransition:function(){var e=Ro(ea)[0],t=Ve().memoizedState;return[typeof e=="boolean"?e:jl(e),t]},useSyncExternalStore:Yu,useId:gd,useHostTransitionStatus:Lo,useFormState:ad,useActionState:ad,useOptimistic:function(e,t){var a=Ve();return ke!==null?$u(a,ke,e,t):(a.baseState=e,[e,a.queue.dispatch])},useMemoCache:Mo,useCacheRefresh:bd};Sd.useEffectEvent=id;function Vo(e,t,a,n){t=e.memoizedState,a=a(n,t),a=a==null?t:S({},t,a),e.memoizedState=a,e.lanes===0&&(e.updateQueue.baseState=a)}var Xo={enqueueSetState:function(e,t,a){e=e._reactInternals;var n=wt(),l=xa(n);l.payload=t,a!=null&&(l.callback=a),t=ja(e,l,n),t!==null&&(ft(t,e,n),bl(t,e,n))},enqueueReplaceState:function(e,t,a){e=e._reactInternals;var n=wt(),l=xa(n);l.tag=1,l.payload=t,a!=null&&(l.callback=a),t=ja(e,l,n),t!==null&&(ft(t,e,n),bl(t,e,n))},enqueueForceUpdate:function(e,t){e=e._reactInternals;var a=wt(),n=xa(a);n.tag=2,t!=null&&(n.callback=t),t=ja(e,n,a),t!==null&&(ft(t,e,a),bl(t,e,a))}};function wd(e,t,a,n,l,i,s){return e=e.stateNode,typeof e.shouldComponentUpdate=="function"?e.shouldComponentUpdate(n,i,s):t.prototype&&t.prototype.isPureReactComponent?!cl(a,n)||!cl(l,i):!0}function Nd(e,t,a,n){e=t.state,typeof t.componentWillReceiveProps=="function"&&t.componentWillReceiveProps(a,n),typeof t.UNSAFE_componentWillReceiveProps=="function"&&t.UNSAFE_componentWillReceiveProps(a,n),t.state!==e&&Xo.enqueueReplaceState(t,t.state,null)}function an(e,t){var a=t;if("ref"in t){a={};for(var n in t)n!=="ref"&&(a[n]=t[n])}if(e=e.defaultProps){a===t&&(a=S({},a));for(var l in e)a[l]===void 0&&(a[l]=e[l])}return a}function zd(e){fi(e)}function Ed(e){console.error(e)}function Ad(e){fi(e)}function Di(e,t){try{var a=e.onUncaughtError;a(t.value,{componentStack:t.stack})}catch(n){setTimeout(function(){throw n})}}function Td(e,t,a){try{var n=e.onCaughtError;n(a.value,{componentStack:a.stack,errorBoundary:t.tag===1?t.stateNode:null})}catch(l){setTimeout(function(){throw l})}}function Qo(e,t,a){return a=xa(a),a.tag=3,a.payload={element:null},a.callback=function(){Di(e,t)},a}function kd(e){return e=xa(e),e.tag=3,e}function Cd(e,t,a,n){var l=a.type.getDerivedStateFromError;if(typeof l=="function"){var i=n.value;e.payload=function(){return l(i)},e.callback=function(){Td(t,a,n)}}var s=a.stateNode;s!==null&&typeof s.componentDidCatch=="function"&&(e.callback=function(){Td(t,a,n),typeof l!="function"&&(Aa===null?Aa=new Set([this]):Aa.add(this));var f=n.stack;this.componentDidCatch(n.value,{componentStack:f!==null?f:""})})}function Zp(e,t,a,n,l){if(a.flags|=32768,n!==null&&typeof n=="object"&&typeof n.then=="function"){if(t=a.alternate,t!==null&&En(t,a,l,!0),a=vt.current,a!==null){switch(a.tag){case 31:case 13:return _t===null?$i():a.alternate===null&&Le===0&&(Le=3),a.flags&=-257,a.flags|=65536,a.lanes=l,n===Si?a.flags|=16384:(t=a.updateQueue,t===null?a.updateQueue=new Set([n]):t.add(n),gs(e,n,l)),!1;case 22:return a.flags|=65536,n===Si?a.flags|=16384:(t=a.updateQueue,t===null?(t={transitions:null,markerInstances:null,retryQueue:new Set([n])},a.updateQueue=t):(a=t.retryQueue,a===null?t.retryQueue=new Set([n]):a.add(n)),gs(e,n,l)),!1}throw Error(c(435,a.tag))}return gs(e,n,l),$i(),!1}if(ve)return t=vt.current,t!==null?((t.flags&65536)===0&&(t.flags|=256),t.flags|=65536,t.lanes=l,n!==co&&(e=Error(c(422),{cause:n}),fl(Tt(e,a)))):(n!==co&&(t=Error(c(423),{cause:n}),fl(Tt(t,a))),e=e.current.alternate,e.flags|=65536,l&=-l,e.lanes|=l,n=Tt(n,a),l=Qo(e.stateNode,n,l),jo(e,l),Le!==4&&(Le=2)),!1;var i=Error(c(520),{cause:n});if(i=Tt(i,a),Ml===null?Ml=[i]:Ml.push(i),Le!==4&&(Le=2),t===null)return!0;n=Tt(n,a),a=t;do{switch(a.tag){case 3:return a.flags|=65536,e=l&-l,a.lanes|=e,e=Qo(a.stateNode,n,e),jo(a,e),!1;case 1:if(t=a.type,i=a.stateNode,(a.flags&128)===0&&(typeof t.getDerivedStateFromError=="function"||i!==null&&typeof i.componentDidCatch=="function"&&(Aa===null||!Aa.has(i))))return a.flags|=65536,l&=-l,a.lanes|=l,l=kd(l),Cd(l,e,a,n),jo(a,l),!1}a=a.return}while(a!==null);return!1}var Zo=Error(c(461)),$e=!1;function at(e,t,a,n){t.child=e===null?Ou(t,null,a,n):en(t,e.child,a,n)}function Md(e,t,a,n,l){a=a.render;var i=t.ref;if("ref"in n){var s={};for(var f in n)f!=="ref"&&(s[f]=n[f])}else s=n;return Wa(t),n=Ao(e,t,a,s,i,l),f=To(),e!==null&&!$e?(ko(e,t,l),ta(e,t,l)):(ve&&f&&oo(t),t.flags|=1,at(e,t,n,l),t.child)}function _d(e,t,a,n,l){if(e===null){var i=a.type;return typeof i=="function"&&!lo(i)&&i.defaultProps===void 0&&a.compare===null?(t.tag=15,t.type=i,Rd(e,t,i,n,l)):(e=gi(a.type,null,n,t,t.mode,l),e.ref=t.ref,e.return=t,t.child=e)}if(i=e.child,!es(e,l)){var s=i.memoizedProps;if(a=a.compare,a=a!==null?a:cl,a(s,n)&&e.ref===t.ref)return ta(e,t,l)}return t.flags|=1,e=Kt(i,n),e.ref=t.ref,e.return=t,t.child=e}function Rd(e,t,a,n,l){if(e!==null){var i=e.memoizedProps;if(cl(i,n)&&e.ref===t.ref)if($e=!1,t.pendingProps=n=i,es(e,l))(e.flags&131072)!==0&&($e=!0);else return t.lanes=e.lanes,ta(e,t,l)}return $o(e,t,a,n,l)}function Od(e,t,a,n){var l=n.children,i=e!==null?e.memoizedState:null;if(e===null&&t.stateNode===null&&(t.stateNode={_visibility:1,_pendingMarkers:null,_retryCache:null,_transitions:null}),n.mode==="hidden"){if((t.flags&128)!==0){if(i=i!==null?i.baseLanes|a:a,e!==null){for(n=t.child=e.child,l=0;n!==null;)l=l|n.lanes|n.childLanes,n=n.sibling;n=l&~i}else n=0,t.child=null;return Dd(e,t,i,a,n)}if((a&536870912)!==0)t.memoizedState={baseLanes:0,cachePool:null},e!==null&&xi(t,i!==null?i.cachePool:null),i!==null?Hu(t,i):wo(),Bu(t);else return n=t.lanes=536870912,Dd(e,t,i!==null?i.baseLanes|a:a,a,n)}else i!==null?(xi(t,i.cachePool),Hu(t,i),wa(),t.memoizedState=null):(e!==null&&xi(t,null),wo(),wa());return at(e,t,l,a),t.child}function Nl(e,t){return e!==null&&e.tag===22||t.stateNode!==null||(t.stateNode={_visibility:1,_pendingMarkers:null,_retryCache:null,_transitions:null}),t.sibling}function Dd(e,t,a,n,l){var i=bo();return i=i===null?null:{parent:Qe._currentValue,pool:i},t.memoizedState={baseLanes:a,cachePool:i},e!==null&&xi(t,null),wo(),Bu(t),e!==null&&En(e,t,n,!0),t.childLanes=l,null}function Ui(e,t){return t=Bi({mode:t.mode,children:t.children},e.mode),t.ref=e.ref,e.child=t,t.return=e,t}function Ud(e,t,a){return en(t,e.child,null,a),e=Ui(t,t.pendingProps),e.flags|=2,xt(t),t.memoizedState=null,e}function $p(e,t,a){var n=t.pendingProps,l=(t.flags&128)!==0;if(t.flags&=-129,e===null){if(ve){if(n.mode==="hidden")return e=Ui(t,n),t.lanes=536870912,Nl(null,e);if(zo(t),(e=Oe)?(e=Kf(e,Mt),e=e!==null&&e.data==="&"?e:null,e!==null&&(t.memoizedState={dehydrated:e,treeContext:pa!==null?{id:Lt,overflow:Yt}:null,retryLane:536870912,hydrationErrors:null},a=vu(e),a.return=t,t.child=a,et=t,Oe=null)):e=null,e===null)throw ba(t);return t.lanes=536870912,null}return Ui(t,n)}var i=e.memoizedState;if(i!==null){var s=i.dehydrated;if(zo(t),l)if(t.flags&256)t.flags&=-257,t=Ud(e,t,a);else if(t.memoizedState!==null)t.child=e.child,t.flags|=128,t=null;else throw Error(c(558));else if($e||En(e,t,a,!1),l=(a&e.childLanes)!==0,$e||l){if(n=_e,n!==null&&(s=Ec(n,a),s!==0&&s!==i.retryLane))throw i.retryLane=s,Za(e,s),ft(n,e,s),Zo;$i(),t=Ud(e,t,a)}else e=i.treeContext,Oe=Rt(s.nextSibling),et=t,ve=!0,ga=null,Mt=!1,e!==null&&Su(t,e),t=Ui(t,n),t.flags|=4096;return t}return e=Kt(e.child,{mode:n.mode,children:n.children}),e.ref=t.ref,t.child=e,e.return=t,e}function Hi(e,t){var a=t.ref;if(a===null)e!==null&&e.ref!==null&&(t.flags|=4194816);else{if(typeof a!="function"&&typeof a!="object")throw Error(c(284));(e===null||e.ref!==a)&&(t.flags|=4194816)}}function $o(e,t,a,n,l){return Wa(t),a=Ao(e,t,a,n,void 0,l),n=To(),e!==null&&!$e?(ko(e,t,l),ta(e,t,l)):(ve&&n&&oo(t),t.flags|=1,at(e,t,a,l),t.child)}function Hd(e,t,a,n,l,i){return Wa(t),t.updateQueue=null,a=Lu(t,n,a,l),qu(e),n=To(),e!==null&&!$e?(ko(e,t,i),ta(e,t,i)):(ve&&n&&oo(t),t.flags|=1,at(e,t,a,i),t.child)}function Bd(e,t,a,n,l){if(Wa(t),t.stateNode===null){var i=Sn,s=a.contextType;typeof s=="object"&&s!==null&&(i=tt(s)),i=new a(n,i),t.memoizedState=i.state!==null&&i.state!==void 0?i.state:null,i.updater=Xo,t.stateNode=i,i._reactInternals=t,i=t.stateNode,i.props=n,i.state=t.memoizedState,i.refs={},vo(t),s=a.contextType,i.context=typeof s=="object"&&s!==null?tt(s):Sn,i.state=t.memoizedState,s=a.getDerivedStateFromProps,typeof s=="function"&&(Vo(t,a,s,n),i.state=t.memoizedState),typeof a.getDerivedStateFromProps=="function"||typeof i.getSnapshotBeforeUpdate=="function"||typeof i.UNSAFE_componentWillMount!="function"&&typeof i.componentWillMount!="function"||(s=i.state,typeof i.componentWillMount=="function"&&i.componentWillMount(),typeof i.UNSAFE_componentWillMount=="function"&&i.UNSAFE_componentWillMount(),s!==i.state&&Xo.enqueueReplaceState(i,i.state,null),vl(t,n,i,l),yl(),i.state=t.memoizedState),typeof i.componentDidMount=="function"&&(t.flags|=4194308),n=!0}else if(e===null){i=t.stateNode;var f=t.memoizedProps,y=an(a,f);i.props=y;var A=i.context,R=a.contextType;s=Sn,typeof R=="object"&&R!==null&&(s=tt(R));var H=a.getDerivedStateFromProps;R=typeof H=="function"||typeof i.getSnapshotBeforeUpdate=="function",f=t.pendingProps!==f,R||typeof i.UNSAFE_componentWillReceiveProps!="function"&&typeof i.componentWillReceiveProps!="function"||(f||A!==s)&&Nd(t,i,n,s),va=!1;var T=t.memoizedState;i.state=T,vl(t,n,i,l),yl(),A=t.memoizedState,f||T!==A||va?(typeof H=="function"&&(Vo(t,a,H,n),A=t.memoizedState),(y=va||wd(t,a,y,n,T,A,s))?(R||typeof i.UNSAFE_componentWillMount!="function"&&typeof i.componentWillMount!="function"||(typeof i.componentWillMount=="function"&&i.componentWillMount(),typeof i.UNSAFE_componentWillMount=="function"&&i.UNSAFE_componentWillMount()),typeof i.componentDidMount=="function"&&(t.flags|=4194308)):(typeof i.componentDidMount=="function"&&(t.flags|=4194308),t.memoizedProps=n,t.memoizedState=A),i.props=n,i.state=A,i.context=s,n=y):(typeof i.componentDidMount=="function"&&(t.flags|=4194308),n=!1)}else{i=t.stateNode,xo(e,t),s=t.memoizedProps,R=an(a,s),i.props=R,H=t.pendingProps,T=i.context,A=a.contextType,y=Sn,typeof A=="object"&&A!==null&&(y=tt(A)),f=a.getDerivedStateFromProps,(A=typeof f=="function"||typeof i.getSnapshotBeforeUpdate=="function")||typeof i.UNSAFE_componentWillReceiveProps!="function"&&typeof i.componentWillReceiveProps!="function"||(s!==H||T!==y)&&Nd(t,i,n,y),va=!1,T=t.memoizedState,i.state=T,vl(t,n,i,l),yl();var k=t.memoizedState;s!==H||T!==k||va||e!==null&&e.dependencies!==null&&yi(e.dependencies)?(typeof f=="function"&&(Vo(t,a,f,n),k=t.memoizedState),(R=va||wd(t,a,R,n,T,k,y)||e!==null&&e.dependencies!==null&&yi(e.dependencies))?(A||typeof i.UNSAFE_componentWillUpdate!="function"&&typeof i.componentWillUpdate!="function"||(typeof i.componentWillUpdate=="function"&&i.componentWillUpdate(n,k,y),typeof i.UNSAFE_componentWillUpdate=="function"&&i.UNSAFE_componentWillUpdate(n,k,y)),typeof i.componentDidUpdate=="function"&&(t.flags|=4),typeof i.getSnapshotBeforeUpdate=="function"&&(t.flags|=1024)):(typeof i.componentDidUpdate!="function"||s===e.memoizedProps&&T===e.memoizedState||(t.flags|=4),typeof i.getSnapshotBeforeUpdate!="function"||s===e.memoizedProps&&T===e.memoizedState||(t.flags|=1024),t.memoizedProps=n,t.memoizedState=k),i.props=n,i.state=k,i.context=y,n=R):(typeof i.componentDidUpdate!="function"||s===e.memoizedProps&&T===e.memoizedState||(t.flags|=4),typeof i.getSnapshotBeforeUpdate!="function"||s===e.memoizedProps&&T===e.memoizedState||(t.flags|=1024),n=!1)}return i=n,Hi(e,t),n=(t.flags&128)!==0,i||n?(i=t.stateNode,a=n&&typeof a.getDerivedStateFromError!="function"?null:i.render(),t.flags|=1,e!==null&&n?(t.child=en(t,e.child,null,l),t.child=en(t,null,a,l)):at(e,t,a,l),t.memoizedState=i.state,e=t.child):e=ta(e,t,l),e}function qd(e,t,a,n){return Ja(),t.flags|=256,at(e,t,a,n),t.child}var Jo={dehydrated:null,treeContext:null,retryLane:0,hydrationErrors:null};function Ko(e){return{baseLanes:e,cachePool:Tu()}}function Wo(e,t,a){return e=e!==null?e.childLanes&~a:0,t&&(e|=St),e}function Ld(e,t,a){var n=t.pendingProps,l=!1,i=(t.flags&128)!==0,s;if((s=i)||(s=e!==null&&e.memoizedState===null?!1:(Ge.current&2)!==0),s&&(l=!0,t.flags&=-129),s=(t.flags&32)!==0,t.flags&=-33,e===null){if(ve){if(l?Sa(t):wa(),(e=Oe)?(e=Kf(e,Mt),e=e!==null&&e.data!=="&"?e:null,e!==null&&(t.memoizedState={dehydrated:e,treeContext:pa!==null?{id:Lt,overflow:Yt}:null,retryLane:536870912,hydrationErrors:null},a=vu(e),a.return=t,t.child=a,et=t,Oe=null)):e=null,e===null)throw ba(t);return _s(e)?t.lanes=32:t.lanes=536870912,null}var f=n.children;return n=n.fallback,l?(wa(),l=t.mode,f=Bi({mode:"hidden",children:f},l),n=$a(n,l,a,null),f.return=t,n.return=t,f.sibling=n,t.child=f,n=t.child,n.memoizedState=Ko(a),n.childLanes=Wo(e,s,a),t.memoizedState=Jo,Nl(null,n)):(Sa(t),Fo(t,f))}var y=e.memoizedState;if(y!==null&&(f=y.dehydrated,f!==null)){if(i)t.flags&256?(Sa(t),t.flags&=-257,t=Io(e,t,a)):t.memoizedState!==null?(wa(),t.child=e.child,t.flags|=128,t=null):(wa(),f=n.fallback,l=t.mode,n=Bi({mode:"visible",children:n.children},l),f=$a(f,l,a,null),f.flags|=2,n.return=t,f.return=t,n.sibling=f,t.child=n,en(t,e.child,null,a),n=t.child,n.memoizedState=Ko(a),n.childLanes=Wo(e,s,a),t.memoizedState=Jo,t=Nl(null,n));else if(Sa(t),_s(f)){if(s=f.nextSibling&&f.nextSibling.dataset,s)var A=s.dgst;s=A,n=Error(c(419)),n.stack="",n.digest=s,fl({value:n,source:null,stack:null}),t=Io(e,t,a)}else if($e||En(e,t,a,!1),s=(a&e.childLanes)!==0,$e||s){if(s=_e,s!==null&&(n=Ec(s,a),n!==0&&n!==y.retryLane))throw y.retryLane=n,Za(e,n),ft(s,e,n),Zo;Ms(f)||$i(),t=Io(e,t,a)}else Ms(f)?(t.flags|=192,t.child=e.child,t=null):(e=y.treeContext,Oe=Rt(f.nextSibling),et=t,ve=!0,ga=null,Mt=!1,e!==null&&Su(t,e),t=Fo(t,n.children),t.flags|=4096);return t}return l?(wa(),f=n.fallback,l=t.mode,y=e.child,A=y.sibling,n=Kt(y,{mode:"hidden",children:n.children}),n.subtreeFlags=y.subtreeFlags&65011712,A!==null?f=Kt(A,f):(f=$a(f,l,a,null),f.flags|=2),f.return=t,n.return=t,n.sibling=f,t.child=n,Nl(null,n),n=t.child,f=e.child.memoizedState,f===null?f=Ko(a):(l=f.cachePool,l!==null?(y=Qe._currentValue,l=l.parent!==y?{parent:y,pool:y}:l):l=Tu(),f={baseLanes:f.baseLanes|a,cachePool:l}),n.memoizedState=f,n.childLanes=Wo(e,s,a),t.memoizedState=Jo,Nl(e.child,n)):(Sa(t),a=e.child,e=a.sibling,a=Kt(a,{mode:"visible",children:n.children}),a.return=t,a.sibling=null,e!==null&&(s=t.deletions,s===null?(t.deletions=[e],t.flags|=16):s.push(e)),t.child=a,t.memoizedState=null,a)}function Fo(e,t){return t=Bi({mode:"visible",children:t},e.mode),t.return=e,e.child=t}function Bi(e,t){return e=yt(22,e,null,t),e.lanes=0,e}function Io(e,t,a){return en(t,e.child,null,a),e=Fo(t,t.pendingProps.children),e.flags|=2,t.memoizedState=null,e}function Yd(e,t,a){e.lanes|=t;var n=e.alternate;n!==null&&(n.lanes|=t),mo(e.return,t,a)}function Po(e,t,a,n,l,i){var s=e.memoizedState;s===null?e.memoizedState={isBackwards:t,rendering:null,renderingStartTime:0,last:n,tail:a,tailMode:l,treeForkCount:i}:(s.isBackwards=t,s.rendering=null,s.renderingStartTime=0,s.last=n,s.tail=a,s.tailMode=l,s.treeForkCount=i)}function Gd(e,t,a){var n=t.pendingProps,l=n.revealOrder,i=n.tail;n=n.children;var s=Ge.current,f=(s&2)!==0;if(f?(s=s&1|2,t.flags|=128):s&=1,Q(Ge,s),at(e,t,n,a),n=ve?dl:0,!f&&e!==null&&(e.flags&128)!==0)e:for(e=t.child;e!==null;){if(e.tag===13)e.memoizedState!==null&&Yd(e,a,t);else if(e.tag===19)Yd(e,a,t);else if(e.child!==null){e.child.return=e,e=e.child;continue}if(e===t)break e;for(;e.sibling===null;){if(e.return===null||e.return===t)break e;e=e.return}e.sibling.return=e.return,e=e.sibling}switch(l){case"forwards":for(a=t.child,l=null;a!==null;)e=a.alternate,e!==null&&Ei(e)===null&&(l=a),a=a.sibling;a=l,a===null?(l=t.child,t.child=null):(l=a.sibling,a.sibling=null),Po(t,!1,l,a,i,n);break;case"backwards":case"unstable_legacy-backwards":for(a=null,l=t.child,t.child=null;l!==null;){if(e=l.alternate,e!==null&&Ei(e)===null){t.child=l;break}e=l.sibling,l.sibling=a,a=l,l=e}Po(t,!0,a,null,i,n);break;case"together":Po(t,!1,null,null,void 0,n);break;default:t.memoizedState=null}return t.child}function ta(e,t,a){if(e!==null&&(t.dependencies=e.dependencies),Ea|=t.lanes,(a&t.childLanes)===0)if(e!==null){if(En(e,t,a,!1),(a&t.childLanes)===0)return null}else return null;if(e!==null&&t.child!==e.child)throw Error(c(153));if(t.child!==null){for(e=t.child,a=Kt(e,e.pendingProps),t.child=a,a.return=t;e.sibling!==null;)e=e.sibling,a=a.sibling=Kt(e,e.pendingProps),a.return=t;a.sibling=null}return t.child}function es(e,t){return(e.lanes&t)!==0?!0:(e=e.dependencies,!!(e!==null&&yi(e)))}function Jp(e,t,a){switch(t.tag){case 3:je(t,t.stateNode.containerInfo),ya(t,Qe,e.memoizedState.cache),Ja();break;case 27:case 5:Wn(t);break;case 4:je(t,t.stateNode.containerInfo);break;case 10:ya(t,t.type,t.memoizedProps.value);break;case 31:if(t.memoizedState!==null)return t.flags|=128,zo(t),null;break;case 13:var n=t.memoizedState;if(n!==null)return n.dehydrated!==null?(Sa(t),t.flags|=128,null):(a&t.child.childLanes)!==0?Ld(e,t,a):(Sa(t),e=ta(e,t,a),e!==null?e.sibling:null);Sa(t);break;case 19:var l=(e.flags&128)!==0;if(n=(a&t.childLanes)!==0,n||(En(e,t,a,!1),n=(a&t.childLanes)!==0),l){if(n)return Gd(e,t,a);t.flags|=128}if(l=t.memoizedState,l!==null&&(l.rendering=null,l.tail=null,l.lastEffect=null),Q(Ge,Ge.current),n)break;return null;case 22:return t.lanes=0,Od(e,t,a,t.pendingProps);case 24:ya(t,Qe,e.memoizedState.cache)}return ta(e,t,a)}function Vd(e,t,a){if(e!==null)if(e.memoizedProps!==t.pendingProps)$e=!0;else{if(!es(e,a)&&(t.flags&128)===0)return $e=!1,Jp(e,t,a);$e=(e.flags&131072)!==0}else $e=!1,ve&&(t.flags&1048576)!==0&&ju(t,dl,t.index);switch(t.lanes=0,t.tag){case 16:e:{var n=t.pendingProps;if(e=Ia(t.elementType),t.type=e,typeof e=="function")lo(e)?(n=an(e,n),t.tag=1,t=Bd(null,t,e,n,a)):(t.tag=0,t=$o(null,t,e,n,a));else{if(e!=null){var l=e.$$typeof;if(l===te){t.tag=11,t=Md(null,t,e,n,a);break e}else if(l===B){t.tag=14,t=_d(null,t,e,n,a);break e}}throw t=me(e)||e,Error(c(306,t,""))}}return t;case 0:return $o(e,t,t.type,t.pendingProps,a);case 1:return n=t.type,l=an(n,t.pendingProps),Bd(e,t,n,l,a);case 3:e:{if(je(t,t.stateNode.containerInfo),e===null)throw Error(c(387));n=t.pendingProps;var i=t.memoizedState;l=i.element,xo(e,t),vl(t,n,null,a);var s=t.memoizedState;if(n=s.cache,ya(t,Qe,n),n!==i.cache&&ho(t,[Qe],a,!0),yl(),n=s.element,i.isDehydrated)if(i={element:n,isDehydrated:!1,cache:s.cache},t.updateQueue.baseState=i,t.memoizedState=i,t.flags&256){t=qd(e,t,n,a);break e}else if(n!==l){l=Tt(Error(c(424)),t),fl(l),t=qd(e,t,n,a);break e}else for(e=t.stateNode.containerInfo,e.nodeType===9?e=e.body:e=e.nodeName==="HTML"?e.ownerDocument.body:e,Oe=Rt(e.firstChild),et=t,ve=!0,ga=null,Mt=!0,a=Ou(t,null,n,a),t.child=a;a;)a.flags=a.flags&-3|4096,a=a.sibling;else{if(Ja(),n===l){t=ta(e,t,a);break e}at(e,t,n,a)}t=t.child}return t;case 26:return Hi(e,t),e===null?(a=tm(t.type,null,t.pendingProps,null))?t.memoizedState=a:ve||(a=t.type,e=t.pendingProps,n=er(V.current).createElement(a),n[Pe]=t,n[rt]=e,nt(n,a,e),We(n),t.stateNode=n):t.memoizedState=tm(t.type,e.memoizedProps,t.pendingProps,e.memoizedState),null;case 27:return Wn(t),e===null&&ve&&(n=t.stateNode=If(t.type,t.pendingProps,V.current),et=t,Mt=!0,l=Oe,Ma(t.type)?(Rs=l,Oe=Rt(n.firstChild)):Oe=l),at(e,t,t.pendingProps.children,a),Hi(e,t),e===null&&(t.flags|=4194304),t.child;case 5:return e===null&&ve&&((l=n=Oe)&&(n=N0(n,t.type,t.pendingProps,Mt),n!==null?(t.stateNode=n,et=t,Oe=Rt(n.firstChild),Mt=!1,l=!0):l=!1),l||ba(t)),Wn(t),l=t.type,i=t.pendingProps,s=e!==null?e.memoizedProps:null,n=i.children,Ts(l,i)?n=null:s!==null&&Ts(l,s)&&(t.flags|=32),t.memoizedState!==null&&(l=Ao(e,t,qp,null,null,a),ql._currentValue=l),Hi(e,t),at(e,t,n,a),t.child;case 6:return e===null&&ve&&((e=a=Oe)&&(a=z0(a,t.pendingProps,Mt),a!==null?(t.stateNode=a,et=t,Oe=null,e=!0):e=!1),e||ba(t)),null;case 13:return Ld(e,t,a);case 4:return je(t,t.stateNode.containerInfo),n=t.pendingProps,e===null?t.child=en(t,null,n,a):at(e,t,n,a),t.child;case 11:return Md(e,t,t.type,t.pendingProps,a);case 7:return at(e,t,t.pendingProps,a),t.child;case 8:return at(e,t,t.pendingProps.children,a),t.child;case 12:return at(e,t,t.pendingProps.children,a),t.child;case 10:return n=t.pendingProps,ya(t,t.type,n.value),at(e,t,n.children,a),t.child;case 9:return l=t.type._context,n=t.pendingProps.children,Wa(t),l=tt(l),n=n(l),t.flags|=1,at(e,t,n,a),t.child;case 14:return _d(e,t,t.type,t.pendingProps,a);case 15:return Rd(e,t,t.type,t.pendingProps,a);case 19:return Gd(e,t,a);case 31:return $p(e,t,a);case 22:return Od(e,t,a,t.pendingProps);case 24:return Wa(t),n=tt(Qe),e===null?(l=bo(),l===null&&(l=_e,i=po(),l.pooledCache=i,i.refCount++,i!==null&&(l.pooledCacheLanes|=a),l=i),t.memoizedState={parent:n,cache:l},vo(t),ya(t,Qe,l)):((e.lanes&a)!==0&&(xo(e,t),vl(t,null,null,a),yl()),l=e.memoizedState,i=t.memoizedState,l.parent!==n?(l={parent:n,cache:n},t.memoizedState=l,t.lanes===0&&(t.memoizedState=t.updateQueue.baseState=l),ya(t,Qe,n)):(n=i.cache,ya(t,Qe,n),n!==l.cache&&ho(t,[Qe],a,!0))),at(e,t,t.pendingProps.children,a),t.child;case 29:throw t.pendingProps}throw Error(c(156,t.tag))}function aa(e){e.flags|=4}function ts(e,t,a,n,l){if((t=(e.mode&32)!==0)&&(t=!1),t){if(e.flags|=16777216,(l&335544128)===l)if(e.stateNode.complete)e.flags|=8192;else if(bf())e.flags|=8192;else throw Pa=Si,yo}else e.flags&=-16777217}function Xd(e,t){if(t.type!=="stylesheet"||(t.state.loading&4)!==0)e.flags&=-16777217;else if(e.flags|=16777216,!rm(t))if(bf())e.flags|=8192;else throw Pa=Si,yo}function qi(e,t){t!==null&&(e.flags|=4),e.flags&16384&&(t=e.tag!==22?wc():536870912,e.lanes|=t,Bn|=t)}function zl(e,t){if(!ve)switch(e.tailMode){case"hidden":t=e.tail;for(var a=null;t!==null;)t.alternate!==null&&(a=t),t=t.sibling;a===null?e.tail=null:a.sibling=null;break;case"collapsed":a=e.tail;for(var n=null;a!==null;)a.alternate!==null&&(n=a),a=a.sibling;n===null?t||e.tail===null?e.tail=null:e.tail.sibling=null:n.sibling=null}}function De(e){var t=e.alternate!==null&&e.alternate.child===e.child,a=0,n=0;if(t)for(var l=e.child;l!==null;)a|=l.lanes|l.childLanes,n|=l.subtreeFlags&65011712,n|=l.flags&65011712,l.return=e,l=l.sibling;else for(l=e.child;l!==null;)a|=l.lanes|l.childLanes,n|=l.subtreeFlags,n|=l.flags,l.return=e,l=l.sibling;return e.subtreeFlags|=n,e.childLanes=a,t}function Kp(e,t,a){var n=t.pendingProps;switch(so(t),t.tag){case 16:case 15:case 0:case 11:case 7:case 8:case 12:case 9:case 14:return De(t),null;case 1:return De(t),null;case 3:return a=t.stateNode,n=null,e!==null&&(n=e.memoizedState.cache),t.memoizedState.cache!==n&&(t.flags|=2048),It(Qe),Re(),a.pendingContext&&(a.context=a.pendingContext,a.pendingContext=null),(e===null||e.child===null)&&(zn(t)?aa(t):e===null||e.memoizedState.isDehydrated&&(t.flags&256)===0||(t.flags|=1024,uo())),De(t),null;case 26:var l=t.type,i=t.memoizedState;return e===null?(aa(t),i!==null?(De(t),Xd(t,i)):(De(t),ts(t,l,null,n,a))):i?i!==e.memoizedState?(aa(t),De(t),Xd(t,i)):(De(t),t.flags&=-16777217):(e=e.memoizedProps,e!==n&&aa(t),De(t),ts(t,l,e,n,a)),null;case 27:if(Wl(t),a=V.current,l=t.type,e!==null&&t.stateNode!=null)e.memoizedProps!==n&&aa(t);else{if(!n){if(t.stateNode===null)throw Error(c(166));return De(t),null}e=K.current,zn(t)?wu(t):(e=If(l,n,a),t.stateNode=e,aa(t))}return De(t),null;case 5:if(Wl(t),l=t.type,e!==null&&t.stateNode!=null)e.memoizedProps!==n&&aa(t);else{if(!n){if(t.stateNode===null)throw Error(c(166));return De(t),null}if(i=K.current,zn(t))wu(t);else{var s=er(V.current);switch(i){case 1:i=s.createElementNS("http://www.w3.org/2000/svg",l);break;case 2:i=s.createElementNS("http://www.w3.org/1998/Math/MathML",l);break;default:switch(l){case"svg":i=s.createElementNS("http://www.w3.org/2000/svg",l);break;case"math":i=s.createElementNS("http://www.w3.org/1998/Math/MathML",l);break;case"script":i=s.createElement("div"),i.innerHTML="<script><\/script>",i=i.removeChild(i.firstChild);break;case"select":i=typeof n.is=="string"?s.createElement("select",{is:n.is}):s.createElement("select"),n.multiple?i.multiple=!0:n.size&&(i.size=n.size);break;default:i=typeof n.is=="string"?s.createElement(l,{is:n.is}):s.createElement(l)}}i[Pe]=t,i[rt]=n;e:for(s=t.child;s!==null;){if(s.tag===5||s.tag===6)i.appendChild(s.stateNode);else if(s.tag!==4&&s.tag!==27&&s.child!==null){s.child.return=s,s=s.child;continue}if(s===t)break e;for(;s.sibling===null;){if(s.return===null||s.return===t)break e;s=s.return}s.sibling.return=s.return,s=s.sibling}t.stateNode=i;e:switch(nt(i,l,n),l){case"button":case"input":case"select":case"textarea":n=!!n.autoFocus;break e;case"img":n=!0;break e;default:n=!1}n&&aa(t)}}return De(t),ts(t,t.type,e===null?null:e.memoizedProps,t.pendingProps,a),null;case 6:if(e&&t.stateNode!=null)e.memoizedProps!==n&&aa(t);else{if(typeof n!="string"&&t.stateNode===null)throw Error(c(166));if(e=V.current,zn(t)){if(e=t.stateNode,a=t.memoizedProps,n=null,l=et,l!==null)switch(l.tag){case 27:case 5:n=l.memoizedProps}e[Pe]=t,e=!!(e.nodeValue===a||n!==null&&n.suppressHydrationWarning===!0||Yf(e.nodeValue,a)),e||ba(t,!0)}else e=er(e).createTextNode(n),e[Pe]=t,t.stateNode=e}return De(t),null;case 31:if(a=t.memoizedState,e===null||e.memoizedState!==null){if(n=zn(t),a!==null){if(e===null){if(!n)throw Error(c(318));if(e=t.memoizedState,e=e!==null?e.dehydrated:null,!e)throw Error(c(557));e[Pe]=t}else Ja(),(t.flags&128)===0&&(t.memoizedState=null),t.flags|=4;De(t),e=!1}else a=uo(),e!==null&&e.memoizedState!==null&&(e.memoizedState.hydrationErrors=a),e=!0;if(!e)return t.flags&256?(xt(t),t):(xt(t),null);if((t.flags&128)!==0)throw Error(c(558))}return De(t),null;case 13:if(n=t.memoizedState,e===null||e.memoizedState!==null&&e.memoizedState.dehydrated!==null){if(l=zn(t),n!==null&&n.dehydrated!==null){if(e===null){if(!l)throw Error(c(318));if(l=t.memoizedState,l=l!==null?l.dehydrated:null,!l)throw Error(c(317));l[Pe]=t}else Ja(),(t.flags&128)===0&&(t.memoizedState=null),t.flags|=4;De(t),l=!1}else l=uo(),e!==null&&e.memoizedState!==null&&(e.memoizedState.hydrationErrors=l),l=!0;if(!l)return t.flags&256?(xt(t),t):(xt(t),null)}return xt(t),(t.flags&128)!==0?(t.lanes=a,t):(a=n!==null,e=e!==null&&e.memoizedState!==null,a&&(n=t.child,l=null,n.alternate!==null&&n.alternate.memoizedState!==null&&n.alternate.memoizedState.cachePool!==null&&(l=n.alternate.memoizedState.cachePool.pool),i=null,n.memoizedState!==null&&n.memoizedState.cachePool!==null&&(i=n.memoizedState.cachePool.pool),i!==l&&(n.flags|=2048)),a!==e&&a&&(t.child.flags|=8192),qi(t,t.updateQueue),De(t),null);case 4:return Re(),e===null&&ws(t.stateNode.containerInfo),De(t),null;case 10:return It(t.type),De(t),null;case 19:if(U(Ge),n=t.memoizedState,n===null)return De(t),null;if(l=(t.flags&128)!==0,i=n.rendering,i===null)if(l)zl(n,!1);else{if(Le!==0||e!==null&&(e.flags&128)!==0)for(e=t.child;e!==null;){if(i=Ei(e),i!==null){for(t.flags|=128,zl(n,!1),e=i.updateQueue,t.updateQueue=e,qi(t,e),t.subtreeFlags=0,e=a,a=t.child;a!==null;)yu(a,e),a=a.sibling;return Q(Ge,Ge.current&1|2),ve&&Wt(t,n.treeForkCount),t.child}e=e.sibling}n.tail!==null&&ht()>Xi&&(t.flags|=128,l=!0,zl(n,!1),t.lanes=4194304)}else{if(!l)if(e=Ei(i),e!==null){if(t.flags|=128,l=!0,e=e.updateQueue,t.updateQueue=e,qi(t,e),zl(n,!0),n.tail===null&&n.tailMode==="hidden"&&!i.alternate&&!ve)return De(t),null}else 2*ht()-n.renderingStartTime>Xi&&a!==536870912&&(t.flags|=128,l=!0,zl(n,!1),t.lanes=4194304);n.isBackwards?(i.sibling=t.child,t.child=i):(e=n.last,e!==null?e.sibling=i:t.child=i,n.last=i)}return n.tail!==null?(e=n.tail,n.rendering=e,n.tail=e.sibling,n.renderingStartTime=ht(),e.sibling=null,a=Ge.current,Q(Ge,l?a&1|2:a&1),ve&&Wt(t,n.treeForkCount),e):(De(t),null);case 22:case 23:return xt(t),No(),n=t.memoizedState!==null,e!==null?e.memoizedState!==null!==n&&(t.flags|=8192):n&&(t.flags|=8192),n?(a&536870912)!==0&&(t.flags&128)===0&&(De(t),t.subtreeFlags&6&&(t.flags|=8192)):De(t),a=t.updateQueue,a!==null&&qi(t,a.retryQueue),a=null,e!==null&&e.memoizedState!==null&&e.memoizedState.cachePool!==null&&(a=e.memoizedState.cachePool.pool),n=null,t.memoizedState!==null&&t.memoizedState.cachePool!==null&&(n=t.memoizedState.cachePool.pool),n!==a&&(t.flags|=2048),e!==null&&U(Fa),null;case 24:return a=null,e!==null&&(a=e.memoizedState.cache),t.memoizedState.cache!==a&&(t.flags|=2048),It(Qe),De(t),null;case 25:return null;case 30:return null}throw Error(c(156,t.tag))}function Wp(e,t){switch(so(t),t.tag){case 1:return e=t.flags,e&65536?(t.flags=e&-65537|128,t):null;case 3:return It(Qe),Re(),e=t.flags,(e&65536)!==0&&(e&128)===0?(t.flags=e&-65537|128,t):null;case 26:case 27:case 5:return Wl(t),null;case 31:if(t.memoizedState!==null){if(xt(t),t.alternate===null)throw Error(c(340));Ja()}return e=t.flags,e&65536?(t.flags=e&-65537|128,t):null;case 13:if(xt(t),e=t.memoizedState,e!==null&&e.dehydrated!==null){if(t.alternate===null)throw Error(c(340));Ja()}return e=t.flags,e&65536?(t.flags=e&-65537|128,t):null;case 19:return U(Ge),null;case 4:return Re(),null;case 10:return It(t.type),null;case 22:case 23:return xt(t),No(),e!==null&&U(Fa),e=t.flags,e&65536?(t.flags=e&-65537|128,t):null;case 24:return It(Qe),null;case 25:return null;default:return null}}function Qd(e,t){switch(so(t),t.tag){case 3:It(Qe),Re();break;case 26:case 27:case 5:Wl(t);break;case 4:Re();break;case 31:t.memoizedState!==null&&xt(t);break;case 13:xt(t);break;case 19:U(Ge);break;case 10:It(t.type);break;case 22:case 23:xt(t),No(),e!==null&&U(Fa);break;case 24:It(Qe)}}function El(e,t){try{var a=t.updateQueue,n=a!==null?a.lastEffect:null;if(n!==null){var l=n.next;a=l;do{if((a.tag&e)===e){n=void 0;var i=a.create,s=a.inst;n=i(),s.destroy=n}a=a.next}while(a!==l)}}catch(f){Te(t,t.return,f)}}function Na(e,t,a){try{var n=t.updateQueue,l=n!==null?n.lastEffect:null;if(l!==null){var i=l.next;n=i;do{if((n.tag&e)===e){var s=n.inst,f=s.destroy;if(f!==void 0){s.destroy=void 0,l=t;var y=a,A=f;try{A()}catch(R){Te(l,y,R)}}}n=n.next}while(n!==i)}}catch(R){Te(t,t.return,R)}}function Zd(e){var t=e.updateQueue;if(t!==null){var a=e.stateNode;try{Uu(t,a)}catch(n){Te(e,e.return,n)}}}function $d(e,t,a){a.props=an(e.type,e.memoizedProps),a.state=e.memoizedState;try{a.componentWillUnmount()}catch(n){Te(e,t,n)}}function Al(e,t){try{var a=e.ref;if(a!==null){switch(e.tag){case 26:case 27:case 5:var n=e.stateNode;break;case 30:n=e.stateNode;break;default:n=e.stateNode}typeof a=="function"?e.refCleanup=a(n):a.current=n}}catch(l){Te(e,t,l)}}function Gt(e,t){var a=e.ref,n=e.refCleanup;if(a!==null)if(typeof n=="function")try{n()}catch(l){Te(e,t,l)}finally{e.refCleanup=null,e=e.alternate,e!=null&&(e.refCleanup=null)}else if(typeof a=="function")try{a(null)}catch(l){Te(e,t,l)}else a.current=null}function Jd(e){var t=e.type,a=e.memoizedProps,n=e.stateNode;try{e:switch(t){case"button":case"input":case"select":case"textarea":a.autoFocus&&n.focus();break e;case"img":a.src?n.src=a.src:a.srcSet&&(n.srcset=a.srcSet)}}catch(l){Te(e,e.return,l)}}function as(e,t,a){try{var n=e.stateNode;y0(n,e.type,a,t),n[rt]=t}catch(l){Te(e,e.return,l)}}function Kd(e){return e.tag===5||e.tag===3||e.tag===26||e.tag===27&&Ma(e.type)||e.tag===4}function ns(e){e:for(;;){for(;e.sibling===null;){if(e.return===null||Kd(e.return))return null;e=e.return}for(e.sibling.return=e.return,e=e.sibling;e.tag!==5&&e.tag!==6&&e.tag!==18;){if(e.tag===27&&Ma(e.type)||e.flags&2||e.child===null||e.tag===4)continue e;e.child.return=e,e=e.child}if(!(e.flags&2))return e.stateNode}}function ls(e,t,a){var n=e.tag;if(n===5||n===6)e=e.stateNode,t?(a.nodeType===9?a.body:a.nodeName==="HTML"?a.ownerDocument.body:a).insertBefore(e,t):(t=a.nodeType===9?a.body:a.nodeName==="HTML"?a.ownerDocument.body:a,t.appendChild(e),a=a._reactRootContainer,a!=null||t.onclick!==null||(t.onclick=$t));else if(n!==4&&(n===27&&Ma(e.type)&&(a=e.stateNode,t=null),e=e.child,e!==null))for(ls(e,t,a),e=e.sibling;e!==null;)ls(e,t,a),e=e.sibling}function Li(e,t,a){var n=e.tag;if(n===5||n===6)e=e.stateNode,t?a.insertBefore(e,t):a.appendChild(e);else if(n!==4&&(n===27&&Ma(e.type)&&(a=e.stateNode),e=e.child,e!==null))for(Li(e,t,a),e=e.sibling;e!==null;)Li(e,t,a),e=e.sibling}function Wd(e){var t=e.stateNode,a=e.memoizedProps;try{for(var n=e.type,l=t.attributes;l.length;)t.removeAttributeNode(l[0]);nt(t,n,a),t[Pe]=e,t[rt]=a}catch(i){Te(e,e.return,i)}}var na=!1,Je=!1,is=!1,Fd=typeof WeakSet=="function"?WeakSet:Set,Fe=null;function Fp(e,t){if(e=e.containerInfo,Es=or,e=cu(e),Fr(e)){if("selectionStart"in e)var a={start:e.selectionStart,end:e.selectionEnd};else e:{a=(a=e.ownerDocument)&&a.defaultView||window;var n=a.getSelection&&a.getSelection();if(n&&n.rangeCount!==0){a=n.anchorNode;var l=n.anchorOffset,i=n.focusNode;n=n.focusOffset;try{a.nodeType,i.nodeType}catch{a=null;break e}var s=0,f=-1,y=-1,A=0,R=0,H=e,T=null;t:for(;;){for(var k;H!==a||l!==0&&H.nodeType!==3||(f=s+l),H!==i||n!==0&&H.nodeType!==3||(y=s+n),H.nodeType===3&&(s+=H.nodeValue.length),(k=H.firstChild)!==null;)T=H,H=k;for(;;){if(H===e)break t;if(T===a&&++A===l&&(f=s),T===i&&++R===n&&(y=s),(k=H.nextSibling)!==null)break;H=T,T=H.parentNode}H=k}a=f===-1||y===-1?null:{start:f,end:y}}else a=null}a=a||{start:0,end:0}}else a=null;for(As={focusedElem:e,selectionRange:a},or=!1,Fe=t;Fe!==null;)if(t=Fe,e=t.child,(t.subtreeFlags&1028)!==0&&e!==null)e.return=t,Fe=e;else for(;Fe!==null;){switch(t=Fe,i=t.alternate,e=t.flags,t.tag){case 0:if((e&4)!==0&&(e=t.updateQueue,e=e!==null?e.events:null,e!==null))for(a=0;a<e.length;a++)l=e[a],l.ref.impl=l.nextImpl;break;case 11:case 15:break;case 1:if((e&1024)!==0&&i!==null){e=void 0,a=t,l=i.memoizedProps,i=i.memoizedState,n=a.stateNode;try{var $=an(a.type,l);e=n.getSnapshotBeforeUpdate($,i),n.__reactInternalSnapshotBeforeUpdate=e}catch(ie){Te(a,a.return,ie)}}break;case 3:if((e&1024)!==0){if(e=t.stateNode.containerInfo,a=e.nodeType,a===9)Cs(e);else if(a===1)switch(e.nodeName){case"HEAD":case"HTML":case"BODY":Cs(e);break;default:e.textContent=""}}break;case 5:case 26:case 27:case 6:case 4:case 17:break;default:if((e&1024)!==0)throw Error(c(163))}if(e=t.sibling,e!==null){e.return=t.return,Fe=e;break}Fe=t.return}}function Id(e,t,a){var n=a.flags;switch(a.tag){case 0:case 11:case 15:ia(e,a),n&4&&El(5,a);break;case 1:if(ia(e,a),n&4)if(e=a.stateNode,t===null)try{e.componentDidMount()}catch(s){Te(a,a.return,s)}else{var l=an(a.type,t.memoizedProps);t=t.memoizedState;try{e.componentDidUpdate(l,t,e.__reactInternalSnapshotBeforeUpdate)}catch(s){Te(a,a.return,s)}}n&64&&Zd(a),n&512&&Al(a,a.return);break;case 3:if(ia(e,a),n&64&&(e=a.updateQueue,e!==null)){if(t=null,a.child!==null)switch(a.child.tag){case 27:case 5:t=a.child.stateNode;break;case 1:t=a.child.stateNode}try{Uu(e,t)}catch(s){Te(a,a.return,s)}}break;case 27:t===null&&n&4&&Wd(a);case 26:case 5:ia(e,a),t===null&&n&4&&Jd(a),n&512&&Al(a,a.return);break;case 12:ia(e,a);break;case 31:ia(e,a),n&4&&tf(e,a);break;case 13:ia(e,a),n&4&&af(e,a),n&64&&(e=a.memoizedState,e!==null&&(e=e.dehydrated,e!==null&&(a=r0.bind(null,a),E0(e,a))));break;case 22:if(n=a.memoizedState!==null||na,!n){t=t!==null&&t.memoizedState!==null||Je,l=na;var i=Je;na=n,(Je=t)&&!i?ra(e,a,(a.subtreeFlags&8772)!==0):ia(e,a),na=l,Je=i}break;case 30:break;default:ia(e,a)}}function Pd(e){var t=e.alternate;t!==null&&(e.alternate=null,Pd(t)),e.child=null,e.deletions=null,e.sibling=null,e.tag===5&&(t=e.stateNode,t!==null&&Or(t)),e.stateNode=null,e.return=null,e.dependencies=null,e.memoizedProps=null,e.memoizedState=null,e.pendingProps=null,e.stateNode=null,e.updateQueue=null}var Ue=null,st=!1;function la(e,t,a){for(a=a.child;a!==null;)ef(e,t,a),a=a.sibling}function ef(e,t,a){if(pt&&typeof pt.onCommitFiberUnmount=="function")try{pt.onCommitFiberUnmount(Fn,a)}catch{}switch(a.tag){case 26:Je||Gt(a,t),la(e,t,a),a.memoizedState?a.memoizedState.count--:a.stateNode&&(a=a.stateNode,a.parentNode.removeChild(a));break;case 27:Je||Gt(a,t);var n=Ue,l=st;Ma(a.type)&&(Ue=a.stateNode,st=!1),la(e,t,a),Ul(a.stateNode),Ue=n,st=l;break;case 5:Je||Gt(a,t);case 6:if(n=Ue,l=st,Ue=null,la(e,t,a),Ue=n,st=l,Ue!==null)if(st)try{(Ue.nodeType===9?Ue.body:Ue.nodeName==="HTML"?Ue.ownerDocument.body:Ue).removeChild(a.stateNode)}catch(i){Te(a,t,i)}else try{Ue.removeChild(a.stateNode)}catch(i){Te(a,t,i)}break;case 18:Ue!==null&&(st?(e=Ue,$f(e.nodeType===9?e.body:e.nodeName==="HTML"?e.ownerDocument.body:e,a.stateNode),Zn(e)):$f(Ue,a.stateNode));break;case 4:n=Ue,l=st,Ue=a.stateNode.containerInfo,st=!0,la(e,t,a),Ue=n,st=l;break;case 0:case 11:case 14:case 15:Na(2,a,t),Je||Na(4,a,t),la(e,t,a);break;case 1:Je||(Gt(a,t),n=a.stateNode,typeof n.componentWillUnmount=="function"&&$d(a,t,n)),la(e,t,a);break;case 21:la(e,t,a);break;case 22:Je=(n=Je)||a.memoizedState!==null,la(e,t,a),Je=n;break;default:la(e,t,a)}}function tf(e,t){if(t.memoizedState===null&&(e=t.alternate,e!==null&&(e=e.memoizedState,e!==null))){e=e.dehydrated;try{Zn(e)}catch(a){Te(t,t.return,a)}}}function af(e,t){if(t.memoizedState===null&&(e=t.alternate,e!==null&&(e=e.memoizedState,e!==null&&(e=e.dehydrated,e!==null))))try{Zn(e)}catch(a){Te(t,t.return,a)}}function Ip(e){switch(e.tag){case 31:case 13:case 19:var t=e.stateNode;return t===null&&(t=e.stateNode=new Fd),t;case 22:return e=e.stateNode,t=e._retryCache,t===null&&(t=e._retryCache=new Fd),t;default:throw Error(c(435,e.tag))}}function Yi(e,t){var a=Ip(e);t.forEach(function(n){if(!a.has(n)){a.add(n);var l=o0.bind(null,e,n);n.then(l,l)}})}function ct(e,t){var a=t.deletions;if(a!==null)for(var n=0;n<a.length;n++){var l=a[n],i=e,s=t,f=s;e:for(;f!==null;){switch(f.tag){case 27:if(Ma(f.type)){Ue=f.stateNode,st=!1;break e}break;case 5:Ue=f.stateNode,st=!1;break e;case 3:case 4:Ue=f.stateNode.containerInfo,st=!0;break e}f=f.return}if(Ue===null)throw Error(c(160));ef(i,s,l),Ue=null,st=!1,i=l.alternate,i!==null&&(i.return=null),l.return=null}if(t.subtreeFlags&13886)for(t=t.child;t!==null;)nf(t,e),t=t.sibling}var Ut=null;function nf(e,t){var a=e.alternate,n=e.flags;switch(e.tag){case 0:case 11:case 14:case 15:ct(t,e),ut(e),n&4&&(Na(3,e,e.return),El(3,e),Na(5,e,e.return));break;case 1:ct(t,e),ut(e),n&512&&(Je||a===null||Gt(a,a.return)),n&64&&na&&(e=e.updateQueue,e!==null&&(n=e.callbacks,n!==null&&(a=e.shared.hiddenCallbacks,e.shared.hiddenCallbacks=a===null?n:a.concat(n))));break;case 26:var l=Ut;if(ct(t,e),ut(e),n&512&&(Je||a===null||Gt(a,a.return)),n&4){var i=a!==null?a.memoizedState:null;if(n=e.memoizedState,a===null)if(n===null)if(e.stateNode===null){e:{n=e.type,a=e.memoizedProps,l=l.ownerDocument||l;t:switch(n){case"title":i=l.getElementsByTagName("title")[0],(!i||i[el]||i[Pe]||i.namespaceURI==="http://www.w3.org/2000/svg"||i.hasAttribute("itemprop"))&&(i=l.createElement(n),l.head.insertBefore(i,l.querySelector("head > title"))),nt(i,n,a),i[Pe]=e,We(i),n=i;break e;case"link":var s=lm("link","href",l).get(n+(a.href||""));if(s){for(var f=0;f<s.length;f++)if(i=s[f],i.getAttribute("href")===(a.href==null||a.href===""?null:a.href)&&i.getAttribute("rel")===(a.rel==null?null:a.rel)&&i.getAttribute("title")===(a.title==null?null:a.title)&&i.getAttribute("crossorigin")===(a.crossOrigin==null?null:a.crossOrigin)){s.splice(f,1);break t}}i=l.createElement(n),nt(i,n,a),l.head.appendChild(i);break;case"meta":if(s=lm("meta","content",l).get(n+(a.content||""))){for(f=0;f<s.length;f++)if(i=s[f],i.getAttribute("content")===(a.content==null?null:""+a.content)&&i.getAttribute("name")===(a.name==null?null:a.name)&&i.getAttribute("property")===(a.property==null?null:a.property)&&i.getAttribute("http-equiv")===(a.httpEquiv==null?null:a.httpEquiv)&&i.getAttribute("charset")===(a.charSet==null?null:a.charSet)){s.splice(f,1);break t}}i=l.createElement(n),nt(i,n,a),l.head.appendChild(i);break;default:throw Error(c(468,n))}i[Pe]=e,We(i),n=i}e.stateNode=n}else im(l,e.type,e.stateNode);else e.stateNode=nm(l,n,e.memoizedProps);else i!==n?(i===null?a.stateNode!==null&&(a=a.stateNode,a.parentNode.removeChild(a)):i.count--,n===null?im(l,e.type,e.stateNode):nm(l,n,e.memoizedProps)):n===null&&e.stateNode!==null&&as(e,e.memoizedProps,a.memoizedProps)}break;case 27:ct(t,e),ut(e),n&512&&(Je||a===null||Gt(a,a.return)),a!==null&&n&4&&as(e,e.memoizedProps,a.memoizedProps);break;case 5:if(ct(t,e),ut(e),n&512&&(Je||a===null||Gt(a,a.return)),e.flags&32){l=e.stateNode;try{pn(l,"")}catch($){Te(e,e.return,$)}}n&4&&e.stateNode!=null&&(l=e.memoizedProps,as(e,l,a!==null?a.memoizedProps:l)),n&1024&&(is=!0);break;case 6:if(ct(t,e),ut(e),n&4){if(e.stateNode===null)throw Error(c(162));n=e.memoizedProps,a=e.stateNode;try{a.nodeValue=n}catch($){Te(e,e.return,$)}}break;case 3:if(nr=null,l=Ut,Ut=tr(t.containerInfo),ct(t,e),Ut=l,ut(e),n&4&&a!==null&&a.memoizedState.isDehydrated)try{Zn(t.containerInfo)}catch($){Te(e,e.return,$)}is&&(is=!1,lf(e));break;case 4:n=Ut,Ut=tr(e.stateNode.containerInfo),ct(t,e),ut(e),Ut=n;break;case 12:ct(t,e),ut(e);break;case 31:ct(t,e),ut(e),n&4&&(n=e.updateQueue,n!==null&&(e.updateQueue=null,Yi(e,n)));break;case 13:ct(t,e),ut(e),e.child.flags&8192&&e.memoizedState!==null!=(a!==null&&a.memoizedState!==null)&&(Vi=ht()),n&4&&(n=e.updateQueue,n!==null&&(e.updateQueue=null,Yi(e,n)));break;case 22:l=e.memoizedState!==null;var y=a!==null&&a.memoizedState!==null,A=na,R=Je;if(na=A||l,Je=R||y,ct(t,e),Je=R,na=A,ut(e),n&8192)e:for(t=e.stateNode,t._visibility=l?t._visibility&-2:t._visibility|1,l&&(a===null||y||na||Je||nn(e)),a=null,t=e;;){if(t.tag===5||t.tag===26){if(a===null){y=a=t;try{if(i=y.stateNode,l)s=i.style,typeof s.setProperty=="function"?s.setProperty("display","none","important"):s.display="none";else{f=y.stateNode;var H=y.memoizedProps.style,T=H!=null&&H.hasOwnProperty("display")?H.display:null;f.style.display=T==null||typeof T=="boolean"?"":(""+T).trim()}}catch($){Te(y,y.return,$)}}}else if(t.tag===6){if(a===null){y=t;try{y.stateNode.nodeValue=l?"":y.memoizedProps}catch($){Te(y,y.return,$)}}}else if(t.tag===18){if(a===null){y=t;try{var k=y.stateNode;l?Jf(k,!0):Jf(y.stateNode,!1)}catch($){Te(y,y.return,$)}}}else if((t.tag!==22&&t.tag!==23||t.memoizedState===null||t===e)&&t.child!==null){t.child.return=t,t=t.child;continue}if(t===e)break e;for(;t.sibling===null;){if(t.return===null||t.return===e)break e;a===t&&(a=null),t=t.return}a===t&&(a=null),t.sibling.return=t.return,t=t.sibling}n&4&&(n=e.updateQueue,n!==null&&(a=n.retryQueue,a!==null&&(n.retryQueue=null,Yi(e,a))));break;case 19:ct(t,e),ut(e),n&4&&(n=e.updateQueue,n!==null&&(e.updateQueue=null,Yi(e,n)));break;case 30:break;case 21:break;default:ct(t,e),ut(e)}}function ut(e){var t=e.flags;if(t&2){try{for(var a,n=e.return;n!==null;){if(Kd(n)){a=n;break}n=n.return}if(a==null)throw Error(c(160));switch(a.tag){case 27:var l=a.stateNode,i=ns(e);Li(e,i,l);break;case 5:var s=a.stateNode;a.flags&32&&(pn(s,""),a.flags&=-33);var f=ns(e);Li(e,f,s);break;case 3:case 4:var y=a.stateNode.containerInfo,A=ns(e);ls(e,A,y);break;default:throw Error(c(161))}}catch(R){Te(e,e.return,R)}e.flags&=-3}t&4096&&(e.flags&=-4097)}function lf(e){if(e.subtreeFlags&1024)for(e=e.child;e!==null;){var t=e;lf(t),t.tag===5&&t.flags&1024&&t.stateNode.reset(),e=e.sibling}}function ia(e,t){if(t.subtreeFlags&8772)for(t=t.child;t!==null;)Id(e,t.alternate,t),t=t.sibling}function nn(e){for(e=e.child;e!==null;){var t=e;switch(t.tag){case 0:case 11:case 14:case 15:Na(4,t,t.return),nn(t);break;case 1:Gt(t,t.return);var a=t.stateNode;typeof a.componentWillUnmount=="function"&&$d(t,t.return,a),nn(t);break;case 27:Ul(t.stateNode);case 26:case 5:Gt(t,t.return),nn(t);break;case 22:t.memoizedState===null&&nn(t);break;case 30:nn(t);break;default:nn(t)}e=e.sibling}}function ra(e,t,a){for(a=a&&(t.subtreeFlags&8772)!==0,t=t.child;t!==null;){var n=t.alternate,l=e,i=t,s=i.flags;switch(i.tag){case 0:case 11:case 15:ra(l,i,a),El(4,i);break;case 1:if(ra(l,i,a),n=i,l=n.stateNode,typeof l.componentDidMount=="function")try{l.componentDidMount()}catch(A){Te(n,n.return,A)}if(n=i,l=n.updateQueue,l!==null){var f=n.stateNode;try{var y=l.shared.hiddenCallbacks;if(y!==null)for(l.shared.hiddenCallbacks=null,l=0;l<y.length;l++)Du(y[l],f)}catch(A){Te(n,n.return,A)}}a&&s&64&&Zd(i),Al(i,i.return);break;case 27:Wd(i);case 26:case 5:ra(l,i,a),a&&n===null&&s&4&&Jd(i),Al(i,i.return);break;case 12:ra(l,i,a);break;case 31:ra(l,i,a),a&&s&4&&tf(l,i);break;case 13:ra(l,i,a),a&&s&4&&af(l,i);break;case 22:i.memoizedState===null&&ra(l,i,a),Al(i,i.return);break;case 30:break;default:ra(l,i,a)}t=t.sibling}}function rs(e,t){var a=null;e!==null&&e.memoizedState!==null&&e.memoizedState.cachePool!==null&&(a=e.memoizedState.cachePool.pool),e=null,t.memoizedState!==null&&t.memoizedState.cachePool!==null&&(e=t.memoizedState.cachePool.pool),e!==a&&(e!=null&&e.refCount++,a!=null&&ml(a))}function os(e,t){e=null,t.alternate!==null&&(e=t.alternate.memoizedState.cache),t=t.memoizedState.cache,t!==e&&(t.refCount++,e!=null&&ml(e))}function Ht(e,t,a,n){if(t.subtreeFlags&10256)for(t=t.child;t!==null;)rf(e,t,a,n),t=t.sibling}function rf(e,t,a,n){var l=t.flags;switch(t.tag){case 0:case 11:case 15:Ht(e,t,a,n),l&2048&&El(9,t);break;case 1:Ht(e,t,a,n);break;case 3:Ht(e,t,a,n),l&2048&&(e=null,t.alternate!==null&&(e=t.alternate.memoizedState.cache),t=t.memoizedState.cache,t!==e&&(t.refCount++,e!=null&&ml(e)));break;case 12:if(l&2048){Ht(e,t,a,n),e=t.stateNode;try{var i=t.memoizedProps,s=i.id,f=i.onPostCommit;typeof f=="function"&&f(s,t.alternate===null?"mount":"update",e.passiveEffectDuration,-0)}catch(y){Te(t,t.return,y)}}else Ht(e,t,a,n);break;case 31:Ht(e,t,a,n);break;case 13:Ht(e,t,a,n);break;case 23:break;case 22:i=t.stateNode,s=t.alternate,t.memoizedState!==null?i._visibility&2?Ht(e,t,a,n):Tl(e,t):i._visibility&2?Ht(e,t,a,n):(i._visibility|=2,Dn(e,t,a,n,(t.subtreeFlags&10256)!==0||!1)),l&2048&&rs(s,t);break;case 24:Ht(e,t,a,n),l&2048&&os(t.alternate,t);break;default:Ht(e,t,a,n)}}function Dn(e,t,a,n,l){for(l=l&&((t.subtreeFlags&10256)!==0||!1),t=t.child;t!==null;){var i=e,s=t,f=a,y=n,A=s.flags;switch(s.tag){case 0:case 11:case 15:Dn(i,s,f,y,l),El(8,s);break;case 23:break;case 22:var R=s.stateNode;s.memoizedState!==null?R._visibility&2?Dn(i,s,f,y,l):Tl(i,s):(R._visibility|=2,Dn(i,s,f,y,l)),l&&A&2048&&rs(s.alternate,s);break;case 24:Dn(i,s,f,y,l),l&&A&2048&&os(s.alternate,s);break;default:Dn(i,s,f,y,l)}t=t.sibling}}function Tl(e,t){if(t.subtreeFlags&10256)for(t=t.child;t!==null;){var a=e,n=t,l=n.flags;switch(n.tag){case 22:Tl(a,n),l&2048&&rs(n.alternate,n);break;case 24:Tl(a,n),l&2048&&os(n.alternate,n);break;default:Tl(a,n)}t=t.sibling}}var kl=8192;function Un(e,t,a){if(e.subtreeFlags&kl)for(e=e.child;e!==null;)of(e,t,a),e=e.sibling}function of(e,t,a){switch(e.tag){case 26:Un(e,t,a),e.flags&kl&&e.memoizedState!==null&&B0(a,Ut,e.memoizedState,e.memoizedProps);break;case 5:Un(e,t,a);break;case 3:case 4:var n=Ut;Ut=tr(e.stateNode.containerInfo),Un(e,t,a),Ut=n;break;case 22:e.memoizedState===null&&(n=e.alternate,n!==null&&n.memoizedState!==null?(n=kl,kl=16777216,Un(e,t,a),kl=n):Un(e,t,a));break;default:Un(e,t,a)}}function sf(e){var t=e.alternate;if(t!==null&&(e=t.child,e!==null)){t.child=null;do t=e.sibling,e.sibling=null,e=t;while(e!==null)}}function Cl(e){var t=e.deletions;if((e.flags&16)!==0){if(t!==null)for(var a=0;a<t.length;a++){var n=t[a];Fe=n,uf(n,e)}sf(e)}if(e.subtreeFlags&10256)for(e=e.child;e!==null;)cf(e),e=e.sibling}function cf(e){switch(e.tag){case 0:case 11:case 15:Cl(e),e.flags&2048&&Na(9,e,e.return);break;case 3:Cl(e);break;case 12:Cl(e);break;case 22:var t=e.stateNode;e.memoizedState!==null&&t._visibility&2&&(e.return===null||e.return.tag!==13)?(t._visibility&=-3,Gi(e)):Cl(e);break;default:Cl(e)}}function Gi(e){var t=e.deletions;if((e.flags&16)!==0){if(t!==null)for(var a=0;a<t.length;a++){var n=t[a];Fe=n,uf(n,e)}sf(e)}for(e=e.child;e!==null;){switch(t=e,t.tag){case 0:case 11:case 15:Na(8,t,t.return),Gi(t);break;case 22:a=t.stateNode,a._visibility&2&&(a._visibility&=-3,Gi(t));break;default:Gi(t)}e=e.sibling}}function uf(e,t){for(;Fe!==null;){var a=Fe;switch(a.tag){case 0:case 11:case 15:Na(8,a,t);break;case 23:case 22:if(a.memoizedState!==null&&a.memoizedState.cachePool!==null){var n=a.memoizedState.cachePool.pool;n!=null&&n.refCount++}break;case 24:ml(a.memoizedState.cache)}if(n=a.child,n!==null)n.return=a,Fe=n;else e:for(a=e;Fe!==null;){n=Fe;var l=n.sibling,i=n.return;if(Pd(n),n===a){Fe=null;break e}if(l!==null){l.return=i,Fe=l;break e}Fe=i}}}var Pp={getCacheForType:function(e){var t=tt(Qe),a=t.data.get(e);return a===void 0&&(a=e(),t.data.set(e,a)),a},cacheSignal:function(){return tt(Qe).controller.signal}},e0=typeof WeakMap=="function"?WeakMap:Map,Ee=0,_e=null,pe=null,be=0,Ae=0,jt=null,za=!1,Hn=!1,ss=!1,oa=0,Le=0,Ea=0,ln=0,cs=0,St=0,Bn=0,Ml=null,dt=null,us=!1,Vi=0,df=0,Xi=1/0,Qi=null,Aa=null,Ke=0,Ta=null,qn=null,sa=0,ds=0,fs=null,ff=null,_l=0,ms=null;function wt(){return(Ee&2)!==0&&be!==0?be&-be:C.T!==null?vs():Ac()}function mf(){if(St===0)if((be&536870912)===0||ve){var e=Pl;Pl<<=1,(Pl&3932160)===0&&(Pl=262144),St=e}else St=536870912;return e=vt.current,e!==null&&(e.flags|=32),St}function ft(e,t,a){(e===_e&&(Ae===2||Ae===9)||e.cancelPendingCommit!==null)&&(Ln(e,0),ka(e,be,St,!1)),Pn(e,a),((Ee&2)===0||e!==_e)&&(e===_e&&((Ee&2)===0&&(ln|=a),Le===4&&ka(e,be,St,!1)),Vt(e))}function hf(e,t,a){if((Ee&6)!==0)throw Error(c(327));var n=!a&&(t&127)===0&&(t&e.expiredLanes)===0||In(e,t),l=n?n0(e,t):ps(e,t,!0),i=n;do{if(l===0){Hn&&!n&&ka(e,t,0,!1);break}else{if(a=e.current.alternate,i&&!t0(a)){l=ps(e,t,!1),i=!1;continue}if(l===2){if(i=t,e.errorRecoveryDisabledLanes&i)var s=0;else s=e.pendingLanes&-536870913,s=s!==0?s:s&536870912?536870912:0;if(s!==0){t=s;e:{var f=e;l=Ml;var y=f.current.memoizedState.isDehydrated;if(y&&(Ln(f,s).flags|=256),s=ps(f,s,!1),s!==2){if(ss&&!y){f.errorRecoveryDisabledLanes|=i,ln|=i,l=4;break e}i=dt,dt=l,i!==null&&(dt===null?dt=i:dt.push.apply(dt,i))}l=s}if(i=!1,l!==2)continue}}if(l===1){Ln(e,0),ka(e,t,0,!0);break}e:{switch(n=e,i=l,i){case 0:case 1:throw Error(c(345));case 4:if((t&4194048)!==t)break;case 6:ka(n,t,St,!za);break e;case 2:dt=null;break;case 3:case 5:break;default:throw Error(c(329))}if((t&62914560)===t&&(l=Vi+300-ht(),10<l)){if(ka(n,t,St,!za),ti(n,0,!0)!==0)break e;sa=t,n.timeoutHandle=Qf(pf.bind(null,n,a,dt,Qi,us,t,St,ln,Bn,za,i,"Throttled",-0,0),l);break e}pf(n,a,dt,Qi,us,t,St,ln,Bn,za,i,null,-0,0)}}break}while(!0);Vt(e)}function pf(e,t,a,n,l,i,s,f,y,A,R,H,T,k){if(e.timeoutHandle=-1,H=t.subtreeFlags,H&8192||(H&16785408)===16785408){H={stylesheets:null,count:0,imgCount:0,imgBytes:0,suspenseyImages:[],waitingForImages:!0,waitingForViewTransition:!1,unsuspend:$t},of(t,i,H);var $=(i&62914560)===i?Vi-ht():(i&4194048)===i?df-ht():0;if($=q0(H,$),$!==null){sa=i,e.cancelPendingCommit=$(wf.bind(null,e,t,i,a,n,l,s,f,y,R,H,null,T,k)),ka(e,i,s,!A);return}}wf(e,t,i,a,n,l,s,f,y)}function t0(e){for(var t=e;;){var a=t.tag;if((a===0||a===11||a===15)&&t.flags&16384&&(a=t.updateQueue,a!==null&&(a=a.stores,a!==null)))for(var n=0;n<a.length;n++){var l=a[n],i=l.getSnapshot;l=l.value;try{if(!bt(i(),l))return!1}catch{return!1}}if(a=t.child,t.subtreeFlags&16384&&a!==null)a.return=t,t=a;else{if(t===e)break;for(;t.sibling===null;){if(t.return===null||t.return===e)return!0;t=t.return}t.sibling.return=t.return,t=t.sibling}}return!0}function ka(e,t,a,n){t&=~cs,t&=~ln,e.suspendedLanes|=t,e.pingedLanes&=~t,n&&(e.warmLanes|=t),n=e.expirationTimes;for(var l=t;0<l;){var i=31-gt(l),s=1<<i;n[i]=-1,l&=~s}a!==0&&Nc(e,a,t)}function Zi(){return(Ee&6)===0?(Rl(0),!1):!0}function hs(){if(pe!==null){if(Ae===0)var e=pe.return;else e=pe,Ft=Ka=null,Co(e),Cn=null,pl=0,e=pe;for(;e!==null;)Qd(e.alternate,e),e=e.return;pe=null}}function Ln(e,t){var a=e.timeoutHandle;a!==-1&&(e.timeoutHandle=-1,j0(a)),a=e.cancelPendingCommit,a!==null&&(e.cancelPendingCommit=null,a()),sa=0,hs(),_e=e,pe=a=Kt(e.current,null),be=t,Ae=0,jt=null,za=!1,Hn=In(e,t),ss=!1,Bn=St=cs=ln=Ea=Le=0,dt=Ml=null,us=!1,(t&8)!==0&&(t|=t&32);var n=e.entangledLanes;if(n!==0)for(e=e.entanglements,n&=t;0<n;){var l=31-gt(n),i=1<<l;t|=e[l],n&=~i}return oa=t,mi(),a}function gf(e,t){de=null,C.H=wl,t===kn||t===ji?(t=Mu(),Ae=3):t===yo?(t=Mu(),Ae=4):Ae=t===Zo?8:t!==null&&typeof t=="object"&&typeof t.then=="function"?6:1,jt=t,pe===null&&(Le=1,Di(e,Tt(t,e.current)))}function bf(){var e=vt.current;return e===null?!0:(be&4194048)===be?_t===null:(be&62914560)===be||(be&536870912)!==0?e===_t:!1}function yf(){var e=C.H;return C.H=wl,e===null?wl:e}function vf(){var e=C.A;return C.A=Pp,e}function $i(){Le=4,za||(be&4194048)!==be&&vt.current!==null||(Hn=!0),(Ea&134217727)===0&&(ln&134217727)===0||_e===null||ka(_e,be,St,!1)}function ps(e,t,a){var n=Ee;Ee|=2;var l=yf(),i=vf();(_e!==e||be!==t)&&(Qi=null,Ln(e,t)),t=!1;var s=Le;e:do try{if(Ae!==0&&pe!==null){var f=pe,y=jt;switch(Ae){case 8:hs(),s=6;break e;case 3:case 2:case 9:case 6:vt.current===null&&(t=!0);var A=Ae;if(Ae=0,jt=null,Yn(e,f,y,A),a&&Hn){s=0;break e}break;default:A=Ae,Ae=0,jt=null,Yn(e,f,y,A)}}a0(),s=Le;break}catch(R){gf(e,R)}while(!0);return t&&e.shellSuspendCounter++,Ft=Ka=null,Ee=n,C.H=l,C.A=i,pe===null&&(_e=null,be=0,mi()),s}function a0(){for(;pe!==null;)xf(pe)}function n0(e,t){var a=Ee;Ee|=2;var n=yf(),l=vf();_e!==e||be!==t?(Qi=null,Xi=ht()+500,Ln(e,t)):Hn=In(e,t);e:do try{if(Ae!==0&&pe!==null){t=pe;var i=jt;t:switch(Ae){case 1:Ae=0,jt=null,Yn(e,t,i,1);break;case 2:case 9:if(ku(i)){Ae=0,jt=null,jf(t);break}t=function(){Ae!==2&&Ae!==9||_e!==e||(Ae=7),Vt(e)},i.then(t,t);break e;case 3:Ae=7;break e;case 4:Ae=5;break e;case 7:ku(i)?(Ae=0,jt=null,jf(t)):(Ae=0,jt=null,Yn(e,t,i,7));break;case 5:var s=null;switch(pe.tag){case 26:s=pe.memoizedState;case 5:case 27:var f=pe;if(s?rm(s):f.stateNode.complete){Ae=0,jt=null;var y=f.sibling;if(y!==null)pe=y;else{var A=f.return;A!==null?(pe=A,Ji(A)):pe=null}break t}}Ae=0,jt=null,Yn(e,t,i,5);break;case 6:Ae=0,jt=null,Yn(e,t,i,6);break;case 8:hs(),Le=6;break e;default:throw Error(c(462))}}l0();break}catch(R){gf(e,R)}while(!0);return Ft=Ka=null,C.H=n,C.A=l,Ee=a,pe!==null?0:(_e=null,be=0,mi(),Le)}function l0(){for(;pe!==null&&!Ah();)xf(pe)}function xf(e){var t=Vd(e.alternate,e,oa);e.memoizedProps=e.pendingProps,t===null?Ji(e):pe=t}function jf(e){var t=e,a=t.alternate;switch(t.tag){case 15:case 0:t=Hd(a,t,t.pendingProps,t.type,void 0,be);break;case 11:t=Hd(a,t,t.pendingProps,t.type.render,t.ref,be);break;case 5:Co(t);default:Qd(a,t),t=pe=yu(t,oa),t=Vd(a,t,oa)}e.memoizedProps=e.pendingProps,t===null?Ji(e):pe=t}function Yn(e,t,a,n){Ft=Ka=null,Co(t),Cn=null,pl=0;var l=t.return;try{if(Zp(e,l,t,a,be)){Le=1,Di(e,Tt(a,e.current)),pe=null;return}}catch(i){if(l!==null)throw pe=l,i;Le=1,Di(e,Tt(a,e.current)),pe=null;return}t.flags&32768?(ve||n===1?e=!0:Hn||(be&536870912)!==0?e=!1:(za=e=!0,(n===2||n===9||n===3||n===6)&&(n=vt.current,n!==null&&n.tag===13&&(n.flags|=16384))),Sf(t,e)):Ji(t)}function Ji(e){var t=e;do{if((t.flags&32768)!==0){Sf(t,za);return}e=t.return;var a=Kp(t.alternate,t,oa);if(a!==null){pe=a;return}if(t=t.sibling,t!==null){pe=t;return}pe=t=e}while(t!==null);Le===0&&(Le=5)}function Sf(e,t){do{var a=Wp(e.alternate,e);if(a!==null){a.flags&=32767,pe=a;return}if(a=e.return,a!==null&&(a.flags|=32768,a.subtreeFlags=0,a.deletions=null),!t&&(e=e.sibling,e!==null)){pe=e;return}pe=e=a}while(e!==null);Le=6,pe=null}function wf(e,t,a,n,l,i,s,f,y){e.cancelPendingCommit=null;do Ki();while(Ke!==0);if((Ee&6)!==0)throw Error(c(327));if(t!==null){if(t===e.current)throw Error(c(177));if(i=t.lanes|t.childLanes,i|=ao,Hh(e,a,i,s,f,y),e===_e&&(pe=_e=null,be=0),qn=t,Ta=e,sa=a,ds=i,fs=l,ff=n,(t.subtreeFlags&10256)!==0||(t.flags&10256)!==0?(e.callbackNode=null,e.callbackPriority=0,s0(Fl,function(){return Tf(),null})):(e.callbackNode=null,e.callbackPriority=0),n=(t.flags&13878)!==0,(t.subtreeFlags&13878)!==0||n){n=C.T,C.T=null,l=G.p,G.p=2,s=Ee,Ee|=4;try{Fp(e,t,a)}finally{Ee=s,G.p=l,C.T=n}}Ke=1,Nf(),zf(),Ef()}}function Nf(){if(Ke===1){Ke=0;var e=Ta,t=qn,a=(t.flags&13878)!==0;if((t.subtreeFlags&13878)!==0||a){a=C.T,C.T=null;var n=G.p;G.p=2;var l=Ee;Ee|=4;try{nf(t,e);var i=As,s=cu(e.containerInfo),f=i.focusedElem,y=i.selectionRange;if(s!==f&&f&&f.ownerDocument&&su(f.ownerDocument.documentElement,f)){if(y!==null&&Fr(f)){var A=y.start,R=y.end;if(R===void 0&&(R=A),"selectionStart"in f)f.selectionStart=A,f.selectionEnd=Math.min(R,f.value.length);else{var H=f.ownerDocument||document,T=H&&H.defaultView||window;if(T.getSelection){var k=T.getSelection(),$=f.textContent.length,ie=Math.min(y.start,$),Me=y.end===void 0?ie:Math.min(y.end,$);!k.extend&&ie>Me&&(s=Me,Me=ie,ie=s);var N=ou(f,ie),x=ou(f,Me);if(N&&x&&(k.rangeCount!==1||k.anchorNode!==N.node||k.anchorOffset!==N.offset||k.focusNode!==x.node||k.focusOffset!==x.offset)){var E=H.createRange();E.setStart(N.node,N.offset),k.removeAllRanges(),ie>Me?(k.addRange(E),k.extend(x.node,x.offset)):(E.setEnd(x.node,x.offset),k.addRange(E))}}}}for(H=[],k=f;k=k.parentNode;)k.nodeType===1&&H.push({element:k,left:k.scrollLeft,top:k.scrollTop});for(typeof f.focus=="function"&&f.focus(),f=0;f<H.length;f++){var D=H[f];D.element.scrollLeft=D.left,D.element.scrollTop=D.top}}or=!!Es,As=Es=null}finally{Ee=l,G.p=n,C.T=a}}e.current=t,Ke=2}}function zf(){if(Ke===2){Ke=0;var e=Ta,t=qn,a=(t.flags&8772)!==0;if((t.subtreeFlags&8772)!==0||a){a=C.T,C.T=null;var n=G.p;G.p=2;var l=Ee;Ee|=4;try{Id(e,t.alternate,t)}finally{Ee=l,G.p=n,C.T=a}}Ke=3}}function Ef(){if(Ke===4||Ke===3){Ke=0,Th();var e=Ta,t=qn,a=sa,n=ff;(t.subtreeFlags&10256)!==0||(t.flags&10256)!==0?Ke=5:(Ke=0,qn=Ta=null,Af(e,e.pendingLanes));var l=e.pendingLanes;if(l===0&&(Aa=null),_r(a),t=t.stateNode,pt&&typeof pt.onCommitFiberRoot=="function")try{pt.onCommitFiberRoot(Fn,t,void 0,(t.current.flags&128)===128)}catch{}if(n!==null){t=C.T,l=G.p,G.p=2,C.T=null;try{for(var i=e.onRecoverableError,s=0;s<n.length;s++){var f=n[s];i(f.value,{componentStack:f.stack})}}finally{C.T=t,G.p=l}}(sa&3)!==0&&Ki(),Vt(e),l=e.pendingLanes,(a&261930)!==0&&(l&42)!==0?e===ms?_l++:(_l=0,ms=e):_l=0,Rl(0)}}function Af(e,t){(e.pooledCacheLanes&=t)===0&&(t=e.pooledCache,t!=null&&(e.pooledCache=null,ml(t)))}function Ki(){return Nf(),zf(),Ef(),Tf()}function Tf(){if(Ke!==5)return!1;var e=Ta,t=ds;ds=0;var a=_r(sa),n=C.T,l=G.p;try{G.p=32>a?32:a,C.T=null,a=fs,fs=null;var i=Ta,s=sa;if(Ke=0,qn=Ta=null,sa=0,(Ee&6)!==0)throw Error(c(331));var f=Ee;if(Ee|=4,cf(i.current),rf(i,i.current,s,a),Ee=f,Rl(0,!1),pt&&typeof pt.onPostCommitFiberRoot=="function")try{pt.onPostCommitFiberRoot(Fn,i)}catch{}return!0}finally{G.p=l,C.T=n,Af(e,t)}}function kf(e,t,a){t=Tt(a,t),t=Qo(e.stateNode,t,2),e=ja(e,t,2),e!==null&&(Pn(e,2),Vt(e))}function Te(e,t,a){if(e.tag===3)kf(e,e,a);else for(;t!==null;){if(t.tag===3){kf(t,e,a);break}else if(t.tag===1){var n=t.stateNode;if(typeof t.type.getDerivedStateFromError=="function"||typeof n.componentDidCatch=="function"&&(Aa===null||!Aa.has(n))){e=Tt(a,e),a=kd(2),n=ja(t,a,2),n!==null&&(Cd(a,n,t,e),Pn(n,2),Vt(n));break}}t=t.return}}function gs(e,t,a){var n=e.pingCache;if(n===null){n=e.pingCache=new e0;var l=new Set;n.set(t,l)}else l=n.get(t),l===void 0&&(l=new Set,n.set(t,l));l.has(a)||(ss=!0,l.add(a),e=i0.bind(null,e,t,a),t.then(e,e))}function i0(e,t,a){var n=e.pingCache;n!==null&&n.delete(t),e.pingedLanes|=e.suspendedLanes&a,e.warmLanes&=~a,_e===e&&(be&a)===a&&(Le===4||Le===3&&(be&62914560)===be&&300>ht()-Vi?(Ee&2)===0&&Ln(e,0):cs|=a,Bn===be&&(Bn=0)),Vt(e)}function Cf(e,t){t===0&&(t=wc()),e=Za(e,t),e!==null&&(Pn(e,t),Vt(e))}function r0(e){var t=e.memoizedState,a=0;t!==null&&(a=t.retryLane),Cf(e,a)}function o0(e,t){var a=0;switch(e.tag){case 31:case 13:var n=e.stateNode,l=e.memoizedState;l!==null&&(a=l.retryLane);break;case 19:n=e.stateNode;break;case 22:n=e.stateNode._retryCache;break;default:throw Error(c(314))}n!==null&&n.delete(t),Cf(e,a)}function s0(e,t){return Tr(e,t)}var Wi=null,Gn=null,bs=!1,Fi=!1,ys=!1,Ca=0;function Vt(e){e!==Gn&&e.next===null&&(Gn===null?Wi=Gn=e:Gn=Gn.next=e),Fi=!0,bs||(bs=!0,u0())}function Rl(e,t){if(!ys&&Fi){ys=!0;do for(var a=!1,n=Wi;n!==null;){if(e!==0){var l=n.pendingLanes;if(l===0)var i=0;else{var s=n.suspendedLanes,f=n.pingedLanes;i=(1<<31-gt(42|e)+1)-1,i&=l&~(s&~f),i=i&201326741?i&201326741|1:i?i|2:0}i!==0&&(a=!0,Of(n,i))}else i=be,i=ti(n,n===_e?i:0,n.cancelPendingCommit!==null||n.timeoutHandle!==-1),(i&3)===0||In(n,i)||(a=!0,Of(n,i));n=n.next}while(a);ys=!1}}function c0(){Mf()}function Mf(){Fi=bs=!1;var e=0;Ca!==0&&x0()&&(e=Ca);for(var t=ht(),a=null,n=Wi;n!==null;){var l=n.next,i=_f(n,t);i===0?(n.next=null,a===null?Wi=l:a.next=l,l===null&&(Gn=a)):(a=n,(e!==0||(i&3)!==0)&&(Fi=!0)),n=l}Ke!==0&&Ke!==5||Rl(e),Ca!==0&&(Ca=0)}function _f(e,t){for(var a=e.suspendedLanes,n=e.pingedLanes,l=e.expirationTimes,i=e.pendingLanes&-62914561;0<i;){var s=31-gt(i),f=1<<s,y=l[s];y===-1?((f&a)===0||(f&n)!==0)&&(l[s]=Uh(f,t)):y<=t&&(e.expiredLanes|=f),i&=~f}if(t=_e,a=be,a=ti(e,e===t?a:0,e.cancelPendingCommit!==null||e.timeoutHandle!==-1),n=e.callbackNode,a===0||e===t&&(Ae===2||Ae===9)||e.cancelPendingCommit!==null)return n!==null&&n!==null&&kr(n),e.callbackNode=null,e.callbackPriority=0;if((a&3)===0||In(e,a)){if(t=a&-a,t===e.callbackPriority)return t;switch(n!==null&&kr(n),_r(a)){case 2:case 8:a=jc;break;case 32:a=Fl;break;case 268435456:a=Sc;break;default:a=Fl}return n=Rf.bind(null,e),a=Tr(a,n),e.callbackPriority=t,e.callbackNode=a,t}return n!==null&&n!==null&&kr(n),e.callbackPriority=2,e.callbackNode=null,2}function Rf(e,t){if(Ke!==0&&Ke!==5)return e.callbackNode=null,e.callbackPriority=0,null;var a=e.callbackNode;if(Ki()&&e.callbackNode!==a)return null;var n=be;return n=ti(e,e===_e?n:0,e.cancelPendingCommit!==null||e.timeoutHandle!==-1),n===0?null:(hf(e,n,t),_f(e,ht()),e.callbackNode!=null&&e.callbackNode===a?Rf.bind(null,e):null)}function Of(e,t){if(Ki())return null;hf(e,t,!0)}function u0(){S0(function(){(Ee&6)!==0?Tr(xc,c0):Mf()})}function vs(){if(Ca===0){var e=An;e===0&&(e=Il,Il<<=1,(Il&261888)===0&&(Il=256)),Ca=e}return Ca}function Df(e){return e==null||typeof e=="symbol"||typeof e=="boolean"?null:typeof e=="function"?e:ii(""+e)}function Uf(e,t){var a=t.ownerDocument.createElement("input");return a.name=t.name,a.value=t.value,e.id&&a.setAttribute("form",e.id),t.parentNode.insertBefore(a,t),e=new FormData(e),a.parentNode.removeChild(a),e}function d0(e,t,a,n,l){if(t==="submit"&&a&&a.stateNode===l){var i=Df((l[rt]||null).action),s=n.submitter;s&&(t=(t=s[rt]||null)?Df(t.formAction):s.getAttribute("formAction"),t!==null&&(i=t,s=null));var f=new ci("action","action",null,n,l);e.push({event:f,listeners:[{instance:null,listener:function(){if(n.defaultPrevented){if(Ca!==0){var y=s?Uf(l,s):new FormData(l);qo(a,{pending:!0,data:y,method:l.method,action:i},null,y)}}else typeof i=="function"&&(f.preventDefault(),y=s?Uf(l,s):new FormData(l),qo(a,{pending:!0,data:y,method:l.method,action:i},i,y))},currentTarget:l}]})}}for(var xs=0;xs<to.length;xs++){var js=to[xs],f0=js.toLowerCase(),m0=js[0].toUpperCase()+js.slice(1);Dt(f0,"on"+m0)}Dt(fu,"onAnimationEnd"),Dt(mu,"onAnimationIteration"),Dt(hu,"onAnimationStart"),Dt("dblclick","onDoubleClick"),Dt("focusin","onFocus"),Dt("focusout","onBlur"),Dt(kp,"onTransitionRun"),Dt(Cp,"onTransitionStart"),Dt(Mp,"onTransitionCancel"),Dt(pu,"onTransitionEnd"),mn("onMouseEnter",["mouseout","mouseover"]),mn("onMouseLeave",["mouseout","mouseover"]),mn("onPointerEnter",["pointerout","pointerover"]),mn("onPointerLeave",["pointerout","pointerover"]),Ga("onChange","change click focusin focusout input keydown keyup selectionchange".split(" ")),Ga("onSelect","focusout contextmenu dragend focusin keydown keyup mousedown mouseup selectionchange".split(" ")),Ga("onBeforeInput",["compositionend","keypress","textInput","paste"]),Ga("onCompositionEnd","compositionend focusout keydown keypress keyup mousedown".split(" ")),Ga("onCompositionStart","compositionstart focusout keydown keypress keyup mousedown".split(" ")),Ga("onCompositionUpdate","compositionupdate focusout keydown keypress keyup mousedown".split(" "));var Ol="abort canplay canplaythrough durationchange emptied encrypted ended error loadeddata loadedmetadata loadstart pause play playing progress ratechange resize seeked seeking stalled suspend timeupdate volumechange waiting".split(" "),h0=new Set("beforetoggle cancel close invalid load scroll scrollend toggle".split(" ").concat(Ol));function Hf(e,t){t=(t&4)!==0;for(var a=0;a<e.length;a++){var n=e[a],l=n.event;n=n.listeners;e:{var i=void 0;if(t)for(var s=n.length-1;0<=s;s--){var f=n[s],y=f.instance,A=f.currentTarget;if(f=f.listener,y!==i&&l.isPropagationStopped())break e;i=f,l.currentTarget=A;try{i(l)}catch(R){fi(R)}l.currentTarget=null,i=y}else for(s=0;s<n.length;s++){if(f=n[s],y=f.instance,A=f.currentTarget,f=f.listener,y!==i&&l.isPropagationStopped())break e;i=f,l.currentTarget=A;try{i(l)}catch(R){fi(R)}l.currentTarget=null,i=y}}}}function ge(e,t){var a=t[Rr];a===void 0&&(a=t[Rr]=new Set);var n=e+"__bubble";a.has(n)||(Bf(t,e,2,!1),a.add(n))}function Ss(e,t,a){var n=0;t&&(n|=4),Bf(a,e,n,t)}var Ii="_reactListening"+Math.random().toString(36).slice(2);function ws(e){if(!e[Ii]){e[Ii]=!0,Cc.forEach(function(a){a!=="selectionchange"&&(h0.has(a)||Ss(a,!1,e),Ss(a,!0,e))});var t=e.nodeType===9?e:e.ownerDocument;t===null||t[Ii]||(t[Ii]=!0,Ss("selectionchange",!1,t))}}function Bf(e,t,a,n){switch(mm(t)){case 2:var l=G0;break;case 8:l=V0;break;default:l=Bs}a=l.bind(null,t,a,e),l=void 0,!Gr||t!=="touchstart"&&t!=="touchmove"&&t!=="wheel"||(l=!0),n?l!==void 0?e.addEventListener(t,a,{capture:!0,passive:l}):e.addEventListener(t,a,!0):l!==void 0?e.addEventListener(t,a,{passive:l}):e.addEventListener(t,a,!1)}function Ns(e,t,a,n,l){var i=n;if((t&1)===0&&(t&2)===0&&n!==null)e:for(;;){if(n===null)return;var s=n.tag;if(s===3||s===4){var f=n.stateNode.containerInfo;if(f===l)break;if(s===4)for(s=n.return;s!==null;){var y=s.tag;if((y===3||y===4)&&s.stateNode.containerInfo===l)return;s=s.return}for(;f!==null;){if(s=un(f),s===null)return;if(y=s.tag,y===5||y===6||y===26||y===27){n=i=s;continue e}f=f.parentNode}}n=n.return}Gc(function(){var A=i,R=Lr(a),H=[];e:{var T=gu.get(e);if(T!==void 0){var k=ci,$=e;switch(e){case"keypress":if(oi(a)===0)break e;case"keydown":case"keyup":k=op;break;case"focusin":$="focus",k=Zr;break;case"focusout":$="blur",k=Zr;break;case"beforeblur":case"afterblur":k=Zr;break;case"click":if(a.button===2)break e;case"auxclick":case"dblclick":case"mousedown":case"mousemove":case"mouseup":case"mouseout":case"mouseover":case"contextmenu":k=Qc;break;case"drag":case"dragend":case"dragenter":case"dragexit":case"dragleave":case"dragover":case"dragstart":case"drop":k=Kh;break;case"touchcancel":case"touchend":case"touchmove":case"touchstart":k=up;break;case fu:case mu:case hu:k=Ih;break;case pu:k=fp;break;case"scroll":case"scrollend":k=$h;break;case"wheel":k=hp;break;case"copy":case"cut":case"paste":k=ep;break;case"gotpointercapture":case"lostpointercapture":case"pointercancel":case"pointerdown":case"pointermove":case"pointerout":case"pointerover":case"pointerup":k=$c;break;case"toggle":case"beforetoggle":k=gp}var ie=(t&4)!==0,Me=!ie&&(e==="scroll"||e==="scrollend"),N=ie?T!==null?T+"Capture":null:T;ie=[];for(var x=A,E;x!==null;){var D=x;if(E=D.stateNode,D=D.tag,D!==5&&D!==26&&D!==27||E===null||N===null||(D=al(x,N),D!=null&&ie.push(Dl(x,D,E))),Me)break;x=x.return}0<ie.length&&(T=new k(T,$,null,a,R),H.push({event:T,listeners:ie}))}}if((t&7)===0){e:{if(T=e==="mouseover"||e==="pointerover",k=e==="mouseout"||e==="pointerout",T&&a!==qr&&($=a.relatedTarget||a.fromElement)&&(un($)||$[cn]))break e;if((k||T)&&(T=R.window===R?R:(T=R.ownerDocument)?T.defaultView||T.parentWindow:window,k?($=a.relatedTarget||a.toElement,k=A,$=$?un($):null,$!==null&&(Me=p($),ie=$.tag,$!==Me||ie!==5&&ie!==27&&ie!==6)&&($=null)):(k=null,$=A),k!==$)){if(ie=Qc,D="onMouseLeave",N="onMouseEnter",x="mouse",(e==="pointerout"||e==="pointerover")&&(ie=$c,D="onPointerLeave",N="onPointerEnter",x="pointer"),Me=k==null?T:tl(k),E=$==null?T:tl($),T=new ie(D,x+"leave",k,a,R),T.target=Me,T.relatedTarget=E,D=null,un(R)===A&&(ie=new ie(N,x+"enter",$,a,R),ie.target=E,ie.relatedTarget=Me,D=ie),Me=D,k&&$)t:{for(ie=p0,N=k,x=$,E=0,D=N;D;D=ie(D))E++;D=0;for(var le=x;le;le=ie(le))D++;for(;0<E-D;)N=ie(N),E--;for(;0<D-E;)x=ie(x),D--;for(;E--;){if(N===x||x!==null&&N===x.alternate){ie=N;break t}N=ie(N),x=ie(x)}ie=null}else ie=null;k!==null&&qf(H,T,k,ie,!1),$!==null&&Me!==null&&qf(H,Me,$,ie,!0)}}e:{if(T=A?tl(A):window,k=T.nodeName&&T.nodeName.toLowerCase(),k==="select"||k==="input"&&T.type==="file")var we=tu;else if(Pc(T))if(au)we=Ep;else{we=Np;var I=wp}else k=T.nodeName,!k||k.toLowerCase()!=="input"||T.type!=="checkbox"&&T.type!=="radio"?A&&Br(A.elementType)&&(we=tu):we=zp;if(we&&(we=we(e,A))){eu(H,we,a,R);break e}I&&I(e,T,A),e==="focusout"&&A&&T.type==="number"&&A.memoizedProps.value!=null&&Hr(T,"number",T.value)}switch(I=A?tl(A):window,e){case"focusin":(Pc(I)||I.contentEditable==="true")&&(vn=I,Ir=A,ul=null);break;case"focusout":ul=Ir=vn=null;break;case"mousedown":Pr=!0;break;case"contextmenu":case"mouseup":case"dragend":Pr=!1,uu(H,a,R);break;case"selectionchange":if(Tp)break;case"keydown":case"keyup":uu(H,a,R)}var fe;if(Jr)e:{switch(e){case"compositionstart":var ye="onCompositionStart";break e;case"compositionend":ye="onCompositionEnd";break e;case"compositionupdate":ye="onCompositionUpdate";break e}ye=void 0}else yn?Fc(e,a)&&(ye="onCompositionEnd"):e==="keydown"&&a.keyCode===229&&(ye="onCompositionStart");ye&&(Jc&&a.locale!=="ko"&&(yn||ye!=="onCompositionStart"?ye==="onCompositionEnd"&&yn&&(fe=Vc()):(ha=R,Vr="value"in ha?ha.value:ha.textContent,yn=!0)),I=Pi(A,ye),0<I.length&&(ye=new Zc(ye,e,null,a,R),H.push({event:ye,listeners:I}),fe?ye.data=fe:(fe=Ic(a),fe!==null&&(ye.data=fe)))),(fe=yp?vp(e,a):xp(e,a))&&(ye=Pi(A,"onBeforeInput"),0<ye.length&&(I=new Zc("onBeforeInput","beforeinput",null,a,R),H.push({event:I,listeners:ye}),I.data=fe)),d0(H,e,A,a,R)}Hf(H,t)})}function Dl(e,t,a){return{instance:e,listener:t,currentTarget:a}}function Pi(e,t){for(var a=t+"Capture",n=[];e!==null;){var l=e,i=l.stateNode;if(l=l.tag,l!==5&&l!==26&&l!==27||i===null||(l=al(e,a),l!=null&&n.unshift(Dl(e,l,i)),l=al(e,t),l!=null&&n.push(Dl(e,l,i))),e.tag===3)return n;e=e.return}return[]}function p0(e){if(e===null)return null;do e=e.return;while(e&&e.tag!==5&&e.tag!==27);return e||null}function qf(e,t,a,n,l){for(var i=t._reactName,s=[];a!==null&&a!==n;){var f=a,y=f.alternate,A=f.stateNode;if(f=f.tag,y!==null&&y===n)break;f!==5&&f!==26&&f!==27||A===null||(y=A,l?(A=al(a,i),A!=null&&s.unshift(Dl(a,A,y))):l||(A=al(a,i),A!=null&&s.push(Dl(a,A,y)))),a=a.return}s.length!==0&&e.push({event:t,listeners:s})}var g0=/\r\n?/g,b0=/\u0000|\uFFFD/g;function Lf(e){return(typeof e=="string"?e:""+e).replace(g0,`
`).replace(b0,"")}function Yf(e,t){return t=Lf(t),Lf(e)===t}function Ce(e,t,a,n,l,i){switch(a){case"children":typeof n=="string"?t==="body"||t==="textarea"&&n===""||pn(e,n):(typeof n=="number"||typeof n=="bigint")&&t!=="body"&&pn(e,""+n);break;case"className":ni(e,"class",n);break;case"tabIndex":ni(e,"tabindex",n);break;case"dir":case"role":case"viewBox":case"width":case"height":ni(e,a,n);break;case"style":Lc(e,n,i);break;case"data":if(t!=="object"){ni(e,"data",n);break}case"src":case"href":if(n===""&&(t!=="a"||a!=="href")){e.removeAttribute(a);break}if(n==null||typeof n=="function"||typeof n=="symbol"||typeof n=="boolean"){e.removeAttribute(a);break}n=ii(""+n),e.setAttribute(a,n);break;case"action":case"formAction":if(typeof n=="function"){e.setAttribute(a,"javascript:throw new Error('A React form was unexpectedly submitted. If you called form.submit() manually, consider using form.requestSubmit() instead. If you\\'re trying to use event.stopPropagation() in a submit event handler, consider also calling event.preventDefault().')");break}else typeof i=="function"&&(a==="formAction"?(t!=="input"&&Ce(e,t,"name",l.name,l,null),Ce(e,t,"formEncType",l.formEncType,l,null),Ce(e,t,"formMethod",l.formMethod,l,null),Ce(e,t,"formTarget",l.formTarget,l,null)):(Ce(e,t,"encType",l.encType,l,null),Ce(e,t,"method",l.method,l,null),Ce(e,t,"target",l.target,l,null)));if(n==null||typeof n=="symbol"||typeof n=="boolean"){e.removeAttribute(a);break}n=ii(""+n),e.setAttribute(a,n);break;case"onClick":n!=null&&(e.onclick=$t);break;case"onScroll":n!=null&&ge("scroll",e);break;case"onScrollEnd":n!=null&&ge("scrollend",e);break;case"dangerouslySetInnerHTML":if(n!=null){if(typeof n!="object"||!("__html"in n))throw Error(c(61));if(a=n.__html,a!=null){if(l.children!=null)throw Error(c(60));e.innerHTML=a}}break;case"multiple":e.multiple=n&&typeof n!="function"&&typeof n!="symbol";break;case"muted":e.muted=n&&typeof n!="function"&&typeof n!="symbol";break;case"suppressContentEditableWarning":case"suppressHydrationWarning":case"defaultValue":case"defaultChecked":case"innerHTML":case"ref":break;case"autoFocus":break;case"xlinkHref":if(n==null||typeof n=="function"||typeof n=="boolean"||typeof n=="symbol"){e.removeAttribute("xlink:href");break}a=ii(""+n),e.setAttributeNS("http://www.w3.org/1999/xlink","xlink:href",a);break;case"contentEditable":case"spellCheck":case"draggable":case"value":case"autoReverse":case"externalResourcesRequired":case"focusable":case"preserveAlpha":n!=null&&typeof n!="function"&&typeof n!="symbol"?e.setAttribute(a,""+n):e.removeAttribute(a);break;case"inert":case"allowFullScreen":case"async":case"autoPlay":case"controls":case"default":case"defer":case"disabled":case"disablePictureInPicture":case"disableRemotePlayback":case"formNoValidate":case"hidden":case"loop":case"noModule":case"noValidate":case"open":case"playsInline":case"readOnly":case"required":case"reversed":case"scoped":case"seamless":case"itemScope":n&&typeof n!="function"&&typeof n!="symbol"?e.setAttribute(a,""):e.removeAttribute(a);break;case"capture":case"download":n===!0?e.setAttribute(a,""):n!==!1&&n!=null&&typeof n!="function"&&typeof n!="symbol"?e.setAttribute(a,n):e.removeAttribute(a);break;case"cols":case"rows":case"size":case"span":n!=null&&typeof n!="function"&&typeof n!="symbol"&&!isNaN(n)&&1<=n?e.setAttribute(a,n):e.removeAttribute(a);break;case"rowSpan":case"start":n==null||typeof n=="function"||typeof n=="symbol"||isNaN(n)?e.removeAttribute(a):e.setAttribute(a,n);break;case"popover":ge("beforetoggle",e),ge("toggle",e),ai(e,"popover",n);break;case"xlinkActuate":Zt(e,"http://www.w3.org/1999/xlink","xlink:actuate",n);break;case"xlinkArcrole":Zt(e,"http://www.w3.org/1999/xlink","xlink:arcrole",n);break;case"xlinkRole":Zt(e,"http://www.w3.org/1999/xlink","xlink:role",n);break;case"xlinkShow":Zt(e,"http://www.w3.org/1999/xlink","xlink:show",n);break;case"xlinkTitle":Zt(e,"http://www.w3.org/1999/xlink","xlink:title",n);break;case"xlinkType":Zt(e,"http://www.w3.org/1999/xlink","xlink:type",n);break;case"xmlBase":Zt(e,"http://www.w3.org/XML/1998/namespace","xml:base",n);break;case"xmlLang":Zt(e,"http://www.w3.org/XML/1998/namespace","xml:lang",n);break;case"xmlSpace":Zt(e,"http://www.w3.org/XML/1998/namespace","xml:space",n);break;case"is":ai(e,"is",n);break;case"innerText":case"textContent":break;default:(!(2<a.length)||a[0]!=="o"&&a[0]!=="O"||a[1]!=="n"&&a[1]!=="N")&&(a=Qh.get(a)||a,ai(e,a,n))}}function zs(e,t,a,n,l,i){switch(a){case"style":Lc(e,n,i);break;case"dangerouslySetInnerHTML":if(n!=null){if(typeof n!="object"||!("__html"in n))throw Error(c(61));if(a=n.__html,a!=null){if(l.children!=null)throw Error(c(60));e.innerHTML=a}}break;case"children":typeof n=="string"?pn(e,n):(typeof n=="number"||typeof n=="bigint")&&pn(e,""+n);break;case"onScroll":n!=null&&ge("scroll",e);break;case"onScrollEnd":n!=null&&ge("scrollend",e);break;case"onClick":n!=null&&(e.onclick=$t);break;case"suppressContentEditableWarning":case"suppressHydrationWarning":case"innerHTML":case"ref":break;case"innerText":case"textContent":break;default:if(!Mc.hasOwnProperty(a))e:{if(a[0]==="o"&&a[1]==="n"&&(l=a.endsWith("Capture"),t=a.slice(2,l?a.length-7:void 0),i=e[rt]||null,i=i!=null?i[a]:null,typeof i=="function"&&e.removeEventListener(t,i,l),typeof n=="function")){typeof i!="function"&&i!==null&&(a in e?e[a]=null:e.hasAttribute(a)&&e.removeAttribute(a)),e.addEventListener(t,n,l);break e}a in e?e[a]=n:n===!0?e.setAttribute(a,""):ai(e,a,n)}}}function nt(e,t,a){switch(t){case"div":case"span":case"svg":case"path":case"a":case"g":case"p":case"li":break;case"img":ge("error",e),ge("load",e);var n=!1,l=!1,i;for(i in a)if(a.hasOwnProperty(i)){var s=a[i];if(s!=null)switch(i){case"src":n=!0;break;case"srcSet":l=!0;break;case"children":case"dangerouslySetInnerHTML":throw Error(c(137,t));default:Ce(e,t,i,s,a,null)}}l&&Ce(e,t,"srcSet",a.srcSet,a,null),n&&Ce(e,t,"src",a.src,a,null);return;case"input":ge("invalid",e);var f=i=s=l=null,y=null,A=null;for(n in a)if(a.hasOwnProperty(n)){var R=a[n];if(R!=null)switch(n){case"name":l=R;break;case"type":s=R;break;case"checked":y=R;break;case"defaultChecked":A=R;break;case"value":i=R;break;case"defaultValue":f=R;break;case"children":case"dangerouslySetInnerHTML":if(R!=null)throw Error(c(137,t));break;default:Ce(e,t,n,R,a,null)}}Uc(e,i,f,y,A,s,l,!1);return;case"select":ge("invalid",e),n=s=i=null;for(l in a)if(a.hasOwnProperty(l)&&(f=a[l],f!=null))switch(l){case"value":i=f;break;case"defaultValue":s=f;break;case"multiple":n=f;default:Ce(e,t,l,f,a,null)}t=i,a=s,e.multiple=!!n,t!=null?hn(e,!!n,t,!1):a!=null&&hn(e,!!n,a,!0);return;case"textarea":ge("invalid",e),i=l=n=null;for(s in a)if(a.hasOwnProperty(s)&&(f=a[s],f!=null))switch(s){case"value":n=f;break;case"defaultValue":l=f;break;case"children":i=f;break;case"dangerouslySetInnerHTML":if(f!=null)throw Error(c(91));break;default:Ce(e,t,s,f,a,null)}Bc(e,n,l,i);return;case"option":for(y in a)a.hasOwnProperty(y)&&(n=a[y],n!=null)&&(y==="selected"?e.selected=n&&typeof n!="function"&&typeof n!="symbol":Ce(e,t,y,n,a,null));return;case"dialog":ge("beforetoggle",e),ge("toggle",e),ge("cancel",e),ge("close",e);break;case"iframe":case"object":ge("load",e);break;case"video":case"audio":for(n=0;n<Ol.length;n++)ge(Ol[n],e);break;case"image":ge("error",e),ge("load",e);break;case"details":ge("toggle",e);break;case"embed":case"source":case"link":ge("error",e),ge("load",e);case"area":case"base":case"br":case"col":case"hr":case"keygen":case"meta":case"param":case"track":case"wbr":case"menuitem":for(A in a)if(a.hasOwnProperty(A)&&(n=a[A],n!=null))switch(A){case"children":case"dangerouslySetInnerHTML":throw Error(c(137,t));default:Ce(e,t,A,n,a,null)}return;default:if(Br(t)){for(R in a)a.hasOwnProperty(R)&&(n=a[R],n!==void 0&&zs(e,t,R,n,a,void 0));return}}for(f in a)a.hasOwnProperty(f)&&(n=a[f],n!=null&&Ce(e,t,f,n,a,null))}function y0(e,t,a,n){switch(t){case"div":case"span":case"svg":case"path":case"a":case"g":case"p":case"li":break;case"input":var l=null,i=null,s=null,f=null,y=null,A=null,R=null;for(k in a){var H=a[k];if(a.hasOwnProperty(k)&&H!=null)switch(k){case"checked":break;case"value":break;case"defaultValue":y=H;default:n.hasOwnProperty(k)||Ce(e,t,k,null,n,H)}}for(var T in n){var k=n[T];if(H=a[T],n.hasOwnProperty(T)&&(k!=null||H!=null))switch(T){case"type":i=k;break;case"name":l=k;break;case"checked":A=k;break;case"defaultChecked":R=k;break;case"value":s=k;break;case"defaultValue":f=k;break;case"children":case"dangerouslySetInnerHTML":if(k!=null)throw Error(c(137,t));break;default:k!==H&&Ce(e,t,T,k,n,H)}}Ur(e,s,f,y,A,R,i,l);return;case"select":k=s=f=T=null;for(i in a)if(y=a[i],a.hasOwnProperty(i)&&y!=null)switch(i){case"value":break;case"multiple":k=y;default:n.hasOwnProperty(i)||Ce(e,t,i,null,n,y)}for(l in n)if(i=n[l],y=a[l],n.hasOwnProperty(l)&&(i!=null||y!=null))switch(l){case"value":T=i;break;case"defaultValue":f=i;break;case"multiple":s=i;default:i!==y&&Ce(e,t,l,i,n,y)}t=f,a=s,n=k,T!=null?hn(e,!!a,T,!1):!!n!=!!a&&(t!=null?hn(e,!!a,t,!0):hn(e,!!a,a?[]:"",!1));return;case"textarea":k=T=null;for(f in a)if(l=a[f],a.hasOwnProperty(f)&&l!=null&&!n.hasOwnProperty(f))switch(f){case"value":break;case"children":break;default:Ce(e,t,f,null,n,l)}for(s in n)if(l=n[s],i=a[s],n.hasOwnProperty(s)&&(l!=null||i!=null))switch(s){case"value":T=l;break;case"defaultValue":k=l;break;case"children":break;case"dangerouslySetInnerHTML":if(l!=null)throw Error(c(91));break;default:l!==i&&Ce(e,t,s,l,n,i)}Hc(e,T,k);return;case"option":for(var $ in a)T=a[$],a.hasOwnProperty($)&&T!=null&&!n.hasOwnProperty($)&&($==="selected"?e.selected=!1:Ce(e,t,$,null,n,T));for(y in n)T=n[y],k=a[y],n.hasOwnProperty(y)&&T!==k&&(T!=null||k!=null)&&(y==="selected"?e.selected=T&&typeof T!="function"&&typeof T!="symbol":Ce(e,t,y,T,n,k));return;case"img":case"link":case"area":case"base":case"br":case"col":case"embed":case"hr":case"keygen":case"meta":case"param":case"source":case"track":case"wbr":case"menuitem":for(var ie in a)T=a[ie],a.hasOwnProperty(ie)&&T!=null&&!n.hasOwnProperty(ie)&&Ce(e,t,ie,null,n,T);for(A in n)if(T=n[A],k=a[A],n.hasOwnProperty(A)&&T!==k&&(T!=null||k!=null))switch(A){case"children":case"dangerouslySetInnerHTML":if(T!=null)throw Error(c(137,t));break;default:Ce(e,t,A,T,n,k)}return;default:if(Br(t)){for(var Me in a)T=a[Me],a.hasOwnProperty(Me)&&T!==void 0&&!n.hasOwnProperty(Me)&&zs(e,t,Me,void 0,n,T);for(R in n)T=n[R],k=a[R],!n.hasOwnProperty(R)||T===k||T===void 0&&k===void 0||zs(e,t,R,T,n,k);return}}for(var N in a)T=a[N],a.hasOwnProperty(N)&&T!=null&&!n.hasOwnProperty(N)&&Ce(e,t,N,null,n,T);for(H in n)T=n[H],k=a[H],!n.hasOwnProperty(H)||T===k||T==null&&k==null||Ce(e,t,H,T,n,k)}function Gf(e){switch(e){case"css":case"script":case"font":case"img":case"image":case"input":case"link":return!0;default:return!1}}function v0(){if(typeof performance.getEntriesByType=="function"){for(var e=0,t=0,a=performance.getEntriesByType("resource"),n=0;n<a.length;n++){var l=a[n],i=l.transferSize,s=l.initiatorType,f=l.duration;if(i&&f&&Gf(s)){for(s=0,f=l.responseEnd,n+=1;n<a.length;n++){var y=a[n],A=y.startTime;if(A>f)break;var R=y.transferSize,H=y.initiatorType;R&&Gf(H)&&(y=y.responseEnd,s+=R*(y<f?1:(f-A)/(y-A)))}if(--n,t+=8*(i+s)/(l.duration/1e3),e++,10<e)break}}if(0<e)return t/e/1e6}return navigator.connection&&(e=navigator.connection.downlink,typeof e=="number")?e:5}var Es=null,As=null;function er(e){return e.nodeType===9?e:e.ownerDocument}function Vf(e){switch(e){case"http://www.w3.org/2000/svg":return 1;case"http://www.w3.org/1998/Math/MathML":return 2;default:return 0}}function Xf(e,t){if(e===0)switch(t){case"svg":return 1;case"math":return 2;default:return 0}return e===1&&t==="foreignObject"?0:e}function Ts(e,t){return e==="textarea"||e==="noscript"||typeof t.children=="string"||typeof t.children=="number"||typeof t.children=="bigint"||typeof t.dangerouslySetInnerHTML=="object"&&t.dangerouslySetInnerHTML!==null&&t.dangerouslySetInnerHTML.__html!=null}var ks=null;function x0(){var e=window.event;return e&&e.type==="popstate"?e===ks?!1:(ks=e,!0):(ks=null,!1)}var Qf=typeof setTimeout=="function"?setTimeout:void 0,j0=typeof clearTimeout=="function"?clearTimeout:void 0,Zf=typeof Promise=="function"?Promise:void 0,S0=typeof queueMicrotask=="function"?queueMicrotask:typeof Zf<"u"?function(e){return Zf.resolve(null).then(e).catch(w0)}:Qf;function w0(e){setTimeout(function(){throw e})}function Ma(e){return e==="head"}function $f(e,t){var a=t,n=0;do{var l=a.nextSibling;if(e.removeChild(a),l&&l.nodeType===8)if(a=l.data,a==="/$"||a==="/&"){if(n===0){e.removeChild(l),Zn(t);return}n--}else if(a==="$"||a==="$?"||a==="$~"||a==="$!"||a==="&")n++;else if(a==="html")Ul(e.ownerDocument.documentElement);else if(a==="head"){a=e.ownerDocument.head,Ul(a);for(var i=a.firstChild;i;){var s=i.nextSibling,f=i.nodeName;i[el]||f==="SCRIPT"||f==="STYLE"||f==="LINK"&&i.rel.toLowerCase()==="stylesheet"||a.removeChild(i),i=s}}else a==="body"&&Ul(e.ownerDocument.body);a=l}while(a);Zn(t)}function Jf(e,t){var a=e;e=0;do{var n=a.nextSibling;if(a.nodeType===1?t?(a._stashedDisplay=a.style.display,a.style.display="none"):(a.style.display=a._stashedDisplay||"",a.getAttribute("style")===""&&a.removeAttribute("style")):a.nodeType===3&&(t?(a._stashedText=a.nodeValue,a.nodeValue=""):a.nodeValue=a._stashedText||""),n&&n.nodeType===8)if(a=n.data,a==="/$"){if(e===0)break;e--}else a!=="$"&&a!=="$?"&&a!=="$~"&&a!=="$!"||e++;a=n}while(a)}function Cs(e){var t=e.firstChild;for(t&&t.nodeType===10&&(t=t.nextSibling);t;){var a=t;switch(t=t.nextSibling,a.nodeName){case"HTML":case"HEAD":case"BODY":Cs(a),Or(a);continue;case"SCRIPT":case"STYLE":continue;case"LINK":if(a.rel.toLowerCase()==="stylesheet")continue}e.removeChild(a)}}function N0(e,t,a,n){for(;e.nodeType===1;){var l=a;if(e.nodeName.toLowerCase()!==t.toLowerCase()){if(!n&&(e.nodeName!=="INPUT"||e.type!=="hidden"))break}else if(n){if(!e[el])switch(t){case"meta":if(!e.hasAttribute("itemprop"))break;return e;case"link":if(i=e.getAttribute("rel"),i==="stylesheet"&&e.hasAttribute("data-precedence"))break;if(i!==l.rel||e.getAttribute("href")!==(l.href==null||l.href===""?null:l.href)||e.getAttribute("crossorigin")!==(l.crossOrigin==null?null:l.crossOrigin)||e.getAttribute("title")!==(l.title==null?null:l.title))break;return e;case"style":if(e.hasAttribute("data-precedence"))break;return e;case"script":if(i=e.getAttribute("src"),(i!==(l.src==null?null:l.src)||e.getAttribute("type")!==(l.type==null?null:l.type)||e.getAttribute("crossorigin")!==(l.crossOrigin==null?null:l.crossOrigin))&&i&&e.hasAttribute("async")&&!e.hasAttribute("itemprop"))break;return e;default:return e}}else if(t==="input"&&e.type==="hidden"){var i=l.name==null?null:""+l.name;if(l.type==="hidden"&&e.getAttribute("name")===i)return e}else return e;if(e=Rt(e.nextSibling),e===null)break}return null}function z0(e,t,a){if(t==="")return null;for(;e.nodeType!==3;)if((e.nodeType!==1||e.nodeName!=="INPUT"||e.type!=="hidden")&&!a||(e=Rt(e.nextSibling),e===null))return null;return e}function Kf(e,t){for(;e.nodeType!==8;)if((e.nodeType!==1||e.nodeName!=="INPUT"||e.type!=="hidden")&&!t||(e=Rt(e.nextSibling),e===null))return null;return e}function Ms(e){return e.data==="$?"||e.data==="$~"}function _s(e){return e.data==="$!"||e.data==="$?"&&e.ownerDocument.readyState!=="loading"}function E0(e,t){var a=e.ownerDocument;if(e.data==="$~")e._reactRetry=t;else if(e.data!=="$?"||a.readyState!=="loading")t();else{var n=function(){t(),a.removeEventListener("DOMContentLoaded",n)};a.addEventListener("DOMContentLoaded",n),e._reactRetry=n}}function Rt(e){for(;e!=null;e=e.nextSibling){var t=e.nodeType;if(t===1||t===3)break;if(t===8){if(t=e.data,t==="$"||t==="$!"||t==="$?"||t==="$~"||t==="&"||t==="F!"||t==="F")break;if(t==="/$"||t==="/&")return null}}return e}var Rs=null;function Wf(e){e=e.nextSibling;for(var t=0;e;){if(e.nodeType===8){var a=e.data;if(a==="/$"||a==="/&"){if(t===0)return Rt(e.nextSibling);t--}else a!=="$"&&a!=="$!"&&a!=="$?"&&a!=="$~"&&a!=="&"||t++}e=e.nextSibling}return null}function Ff(e){e=e.previousSibling;for(var t=0;e;){if(e.nodeType===8){var a=e.data;if(a==="$"||a==="$!"||a==="$?"||a==="$~"||a==="&"){if(t===0)return e;t--}else a!=="/$"&&a!=="/&"||t++}e=e.previousSibling}return null}function If(e,t,a){switch(t=er(a),e){case"html":if(e=t.documentElement,!e)throw Error(c(452));return e;case"head":if(e=t.head,!e)throw Error(c(453));return e;case"body":if(e=t.body,!e)throw Error(c(454));return e;default:throw Error(c(451))}}function Ul(e){for(var t=e.attributes;t.length;)e.removeAttributeNode(t[0]);Or(e)}var Ot=new Map,Pf=new Set;function tr(e){return typeof e.getRootNode=="function"?e.getRootNode():e.nodeType===9?e:e.ownerDocument}var ca=G.d;G.d={f:A0,r:T0,D:k0,C:C0,L:M0,m:_0,X:O0,S:R0,M:D0};function A0(){var e=ca.f(),t=Zi();return e||t}function T0(e){var t=dn(e);t!==null&&t.tag===5&&t.type==="form"?pd(t):ca.r(e)}var Vn=typeof document>"u"?null:document;function em(e,t,a){var n=Vn;if(n&&typeof t=="string"&&t){var l=Et(t);l='link[rel="'+e+'"][href="'+l+'"]',typeof a=="string"&&(l+='[crossorigin="'+a+'"]'),Pf.has(l)||(Pf.add(l),e={rel:e,crossOrigin:a,href:t},n.querySelector(l)===null&&(t=n.createElement("link"),nt(t,"link",e),We(t),n.head.appendChild(t)))}}function k0(e){ca.D(e),em("dns-prefetch",e,null)}function C0(e,t){ca.C(e,t),em("preconnect",e,t)}function M0(e,t,a){ca.L(e,t,a);var n=Vn;if(n&&e&&t){var l='link[rel="preload"][as="'+Et(t)+'"]';t==="image"&&a&&a.imageSrcSet?(l+='[imagesrcset="'+Et(a.imageSrcSet)+'"]',typeof a.imageSizes=="string"&&(l+='[imagesizes="'+Et(a.imageSizes)+'"]')):l+='[href="'+Et(e)+'"]';var i=l;switch(t){case"style":i=Xn(e);break;case"script":i=Qn(e)}Ot.has(i)||(e=S({rel:"preload",href:t==="image"&&a&&a.imageSrcSet?void 0:e,as:t},a),Ot.set(i,e),n.querySelector(l)!==null||t==="style"&&n.querySelector(Hl(i))||t==="script"&&n.querySelector(Bl(i))||(t=n.createElement("link"),nt(t,"link",e),We(t),n.head.appendChild(t)))}}function _0(e,t){ca.m(e,t);var a=Vn;if(a&&e){var n=t&&typeof t.as=="string"?t.as:"script",l='link[rel="modulepreload"][as="'+Et(n)+'"][href="'+Et(e)+'"]',i=l;switch(n){case"audioworklet":case"paintworklet":case"serviceworker":case"sharedworker":case"worker":case"script":i=Qn(e)}if(!Ot.has(i)&&(e=S({rel:"modulepreload",href:e},t),Ot.set(i,e),a.querySelector(l)===null)){switch(n){case"audioworklet":case"paintworklet":case"serviceworker":case"sharedworker":case"worker":case"script":if(a.querySelector(Bl(i)))return}n=a.createElement("link"),nt(n,"link",e),We(n),a.head.appendChild(n)}}}function R0(e,t,a){ca.S(e,t,a);var n=Vn;if(n&&e){var l=fn(n).hoistableStyles,i=Xn(e);t=t||"default";var s=l.get(i);if(!s){var f={loading:0,preload:null};if(s=n.querySelector(Hl(i)))f.loading=5;else{e=S({rel:"stylesheet",href:e,"data-precedence":t},a),(a=Ot.get(i))&&Os(e,a);var y=s=n.createElement("link");We(y),nt(y,"link",e),y._p=new Promise(function(A,R){y.onload=A,y.onerror=R}),y.addEventListener("load",function(){f.loading|=1}),y.addEventListener("error",function(){f.loading|=2}),f.loading|=4,ar(s,t,n)}s={type:"stylesheet",instance:s,count:1,state:f},l.set(i,s)}}}function O0(e,t){ca.X(e,t);var a=Vn;if(a&&e){var n=fn(a).hoistableScripts,l=Qn(e),i=n.get(l);i||(i=a.querySelector(Bl(l)),i||(e=S({src:e,async:!0},t),(t=Ot.get(l))&&Ds(e,t),i=a.createElement("script"),We(i),nt(i,"link",e),a.head.appendChild(i)),i={type:"script",instance:i,count:1,state:null},n.set(l,i))}}function D0(e,t){ca.M(e,t);var a=Vn;if(a&&e){var n=fn(a).hoistableScripts,l=Qn(e),i=n.get(l);i||(i=a.querySelector(Bl(l)),i||(e=S({src:e,async:!0,type:"module"},t),(t=Ot.get(l))&&Ds(e,t),i=a.createElement("script"),We(i),nt(i,"link",e),a.head.appendChild(i)),i={type:"script",instance:i,count:1,state:null},n.set(l,i))}}function tm(e,t,a,n){var l=(l=V.current)?tr(l):null;if(!l)throw Error(c(446));switch(e){case"meta":case"title":return null;case"style":return typeof a.precedence=="string"&&typeof a.href=="string"?(t=Xn(a.href),a=fn(l).hoistableStyles,n=a.get(t),n||(n={type:"style",instance:null,count:0,state:null},a.set(t,n)),n):{type:"void",instance:null,count:0,state:null};case"link":if(a.rel==="stylesheet"&&typeof a.href=="string"&&typeof a.precedence=="string"){e=Xn(a.href);var i=fn(l).hoistableStyles,s=i.get(e);if(s||(l=l.ownerDocument||l,s={type:"stylesheet",instance:null,count:0,state:{loading:0,preload:null}},i.set(e,s),(i=l.querySelector(Hl(e)))&&!i._p&&(s.instance=i,s.state.loading=5),Ot.has(e)||(a={rel:"preload",as:"style",href:a.href,crossOrigin:a.crossOrigin,integrity:a.integrity,media:a.media,hrefLang:a.hrefLang,referrerPolicy:a.referrerPolicy},Ot.set(e,a),i||U0(l,e,a,s.state))),t&&n===null)throw Error(c(528,""));return s}if(t&&n!==null)throw Error(c(529,""));return null;case"script":return t=a.async,a=a.src,typeof a=="string"&&t&&typeof t!="function"&&typeof t!="symbol"?(t=Qn(a),a=fn(l).hoistableScripts,n=a.get(t),n||(n={type:"script",instance:null,count:0,state:null},a.set(t,n)),n):{type:"void",instance:null,count:0,state:null};default:throw Error(c(444,e))}}function Xn(e){return'href="'+Et(e)+'"'}function Hl(e){return'link[rel="stylesheet"]['+e+"]"}function am(e){return S({},e,{"data-precedence":e.precedence,precedence:null})}function U0(e,t,a,n){e.querySelector('link[rel="preload"][as="style"]['+t+"]")?n.loading=1:(t=e.createElement("link"),n.preload=t,t.addEventListener("load",function(){return n.loading|=1}),t.addEventListener("error",function(){return n.loading|=2}),nt(t,"link",a),We(t),e.head.appendChild(t))}function Qn(e){return'[src="'+Et(e)+'"]'}function Bl(e){return"script[async]"+e}function nm(e,t,a){if(t.count++,t.instance===null)switch(t.type){case"style":var n=e.querySelector('style[data-href~="'+Et(a.href)+'"]');if(n)return t.instance=n,We(n),n;var l=S({},a,{"data-href":a.href,"data-precedence":a.precedence,href:null,precedence:null});return n=(e.ownerDocument||e).createElement("style"),We(n),nt(n,"style",l),ar(n,a.precedence,e),t.instance=n;case"stylesheet":l=Xn(a.href);var i=e.querySelector(Hl(l));if(i)return t.state.loading|=4,t.instance=i,We(i),i;n=am(a),(l=Ot.get(l))&&Os(n,l),i=(e.ownerDocument||e).createElement("link"),We(i);var s=i;return s._p=new Promise(function(f,y){s.onload=f,s.onerror=y}),nt(i,"link",n),t.state.loading|=4,ar(i,a.precedence,e),t.instance=i;case"script":return i=Qn(a.src),(l=e.querySelector(Bl(i)))?(t.instance=l,We(l),l):(n=a,(l=Ot.get(i))&&(n=S({},a),Ds(n,l)),e=e.ownerDocument||e,l=e.createElement("script"),We(l),nt(l,"link",n),e.head.appendChild(l),t.instance=l);case"void":return null;default:throw Error(c(443,t.type))}else t.type==="stylesheet"&&(t.state.loading&4)===0&&(n=t.instance,t.state.loading|=4,ar(n,a.precedence,e));return t.instance}function ar(e,t,a){for(var n=a.querySelectorAll('link[rel="stylesheet"][data-precedence],style[data-precedence]'),l=n.length?n[n.length-1]:null,i=l,s=0;s<n.length;s++){var f=n[s];if(f.dataset.precedence===t)i=f;else if(i!==l)break}i?i.parentNode.insertBefore(e,i.nextSibling):(t=a.nodeType===9?a.head:a,t.insertBefore(e,t.firstChild))}function Os(e,t){e.crossOrigin==null&&(e.crossOrigin=t.crossOrigin),e.referrerPolicy==null&&(e.referrerPolicy=t.referrerPolicy),e.title==null&&(e.title=t.title)}function Ds(e,t){e.crossOrigin==null&&(e.crossOrigin=t.crossOrigin),e.referrerPolicy==null&&(e.referrerPolicy=t.referrerPolicy),e.integrity==null&&(e.integrity=t.integrity)}var nr=null;function lm(e,t,a){if(nr===null){var n=new Map,l=nr=new Map;l.set(a,n)}else l=nr,n=l.get(a),n||(n=new Map,l.set(a,n));if(n.has(e))return n;for(n.set(e,null),a=a.getElementsByTagName(e),l=0;l<a.length;l++){var i=a[l];if(!(i[el]||i[Pe]||e==="link"&&i.getAttribute("rel")==="stylesheet")&&i.namespaceURI!=="http://www.w3.org/2000/svg"){var s=i.getAttribute(t)||"";s=e+s;var f=n.get(s);f?f.push(i):n.set(s,[i])}}return n}function im(e,t,a){e=e.ownerDocument||e,e.head.insertBefore(a,t==="title"?e.querySelector("head > title"):null)}function H0(e,t,a){if(a===1||t.itemProp!=null)return!1;switch(e){case"meta":case"title":return!0;case"style":if(typeof t.precedence!="string"||typeof t.href!="string"||t.href==="")break;return!0;case"link":if(typeof t.rel!="string"||typeof t.href!="string"||t.href===""||t.onLoad||t.onError)break;return t.rel==="stylesheet"?(e=t.disabled,typeof t.precedence=="string"&&e==null):!0;case"script":if(t.async&&typeof t.async!="function"&&typeof t.async!="symbol"&&!t.onLoad&&!t.onError&&t.src&&typeof t.src=="string")return!0}return!1}function rm(e){return!(e.type==="stylesheet"&&(e.state.loading&3)===0)}function B0(e,t,a,n){if(a.type==="stylesheet"&&(typeof n.media!="string"||matchMedia(n.media).matches!==!1)&&(a.state.loading&4)===0){if(a.instance===null){var l=Xn(n.href),i=t.querySelector(Hl(l));if(i){t=i._p,t!==null&&typeof t=="object"&&typeof t.then=="function"&&(e.count++,e=lr.bind(e),t.then(e,e)),a.state.loading|=4,a.instance=i,We(i);return}i=t.ownerDocument||t,n=am(n),(l=Ot.get(l))&&Os(n,l),i=i.createElement("link"),We(i);var s=i;s._p=new Promise(function(f,y){s.onload=f,s.onerror=y}),nt(i,"link",n),a.instance=i}e.stylesheets===null&&(e.stylesheets=new Map),e.stylesheets.set(a,t),(t=a.state.preload)&&(a.state.loading&3)===0&&(e.count++,a=lr.bind(e),t.addEventListener("load",a),t.addEventListener("error",a))}}var Us=0;function q0(e,t){return e.stylesheets&&e.count===0&&rr(e,e.stylesheets),0<e.count||0<e.imgCount?function(a){var n=setTimeout(function(){if(e.stylesheets&&rr(e,e.stylesheets),e.unsuspend){var i=e.unsuspend;e.unsuspend=null,i()}},6e4+t);0<e.imgBytes&&Us===0&&(Us=62500*v0());var l=setTimeout(function(){if(e.waitingForImages=!1,e.count===0&&(e.stylesheets&&rr(e,e.stylesheets),e.unsuspend)){var i=e.unsuspend;e.unsuspend=null,i()}},(e.imgBytes>Us?50:800)+t);return e.unsuspend=a,function(){e.unsuspend=null,clearTimeout(n),clearTimeout(l)}}:null}function lr(){if(this.count--,this.count===0&&(this.imgCount===0||!this.waitingForImages)){if(this.stylesheets)rr(this,this.stylesheets);else if(this.unsuspend){var e=this.unsuspend;this.unsuspend=null,e()}}}var ir=null;function rr(e,t){e.stylesheets=null,e.unsuspend!==null&&(e.count++,ir=new Map,t.forEach(L0,e),ir=null,lr.call(e))}function L0(e,t){if(!(t.state.loading&4)){var a=ir.get(e);if(a)var n=a.get(null);else{a=new Map,ir.set(e,a);for(var l=e.querySelectorAll("link[data-precedence],style[data-precedence]"),i=0;i<l.length;i++){var s=l[i];(s.nodeName==="LINK"||s.getAttribute("media")!=="not all")&&(a.set(s.dataset.precedence,s),n=s)}n&&a.set(null,n)}l=t.instance,s=l.getAttribute("data-precedence"),i=a.get(s)||n,i===n&&a.set(null,l),a.set(s,l),this.count++,n=lr.bind(this),l.addEventListener("load",n),l.addEventListener("error",n),i?i.parentNode.insertBefore(l,i.nextSibling):(e=e.nodeType===9?e.head:e,e.insertBefore(l,e.firstChild)),t.state.loading|=4}}var ql={$$typeof:L,Provider:null,Consumer:null,_currentValue:ee,_currentValue2:ee,_threadCount:0};function Y0(e,t,a,n,l,i,s,f,y){this.tag=1,this.containerInfo=e,this.pingCache=this.current=this.pendingChildren=null,this.timeoutHandle=-1,this.callbackNode=this.next=this.pendingContext=this.context=this.cancelPendingCommit=null,this.callbackPriority=0,this.expirationTimes=Cr(-1),this.entangledLanes=this.shellSuspendCounter=this.errorRecoveryDisabledLanes=this.expiredLanes=this.warmLanes=this.pingedLanes=this.suspendedLanes=this.pendingLanes=0,this.entanglements=Cr(0),this.hiddenUpdates=Cr(null),this.identifierPrefix=n,this.onUncaughtError=l,this.onCaughtError=i,this.onRecoverableError=s,this.pooledCache=null,this.pooledCacheLanes=0,this.formState=y,this.incompleteTransitions=new Map}function om(e,t,a,n,l,i,s,f,y,A,R,H){return e=new Y0(e,t,a,s,y,A,R,H,f),t=1,i===!0&&(t|=24),i=yt(3,null,null,t),e.current=i,i.stateNode=e,t=po(),t.refCount++,e.pooledCache=t,t.refCount++,i.memoizedState={element:n,isDehydrated:a,cache:t},vo(i),e}function sm(e){return e?(e=Sn,e):Sn}function cm(e,t,a,n,l,i){l=sm(l),n.context===null?n.context=l:n.pendingContext=l,n=xa(t),n.payload={element:a},i=i===void 0?null:i,i!==null&&(n.callback=i),a=ja(e,n,t),a!==null&&(ft(a,e,t),bl(a,e,t))}function um(e,t){if(e=e.memoizedState,e!==null&&e.dehydrated!==null){var a=e.retryLane;e.retryLane=a!==0&&a<t?a:t}}function Hs(e,t){um(e,t),(e=e.alternate)&&um(e,t)}function dm(e){if(e.tag===13||e.tag===31){var t=Za(e,67108864);t!==null&&ft(t,e,67108864),Hs(e,67108864)}}function fm(e){if(e.tag===13||e.tag===31){var t=wt();t=Mr(t);var a=Za(e,t);a!==null&&ft(a,e,t),Hs(e,t)}}var or=!0;function G0(e,t,a,n){var l=C.T;C.T=null;var i=G.p;try{G.p=2,Bs(e,t,a,n)}finally{G.p=i,C.T=l}}function V0(e,t,a,n){var l=C.T;C.T=null;var i=G.p;try{G.p=8,Bs(e,t,a,n)}finally{G.p=i,C.T=l}}function Bs(e,t,a,n){if(or){var l=qs(n);if(l===null)Ns(e,t,n,sr,a),hm(e,n);else if(Q0(l,e,t,a,n))n.stopPropagation();else if(hm(e,n),t&4&&-1<X0.indexOf(e)){for(;l!==null;){var i=dn(l);if(i!==null)switch(i.tag){case 3:if(i=i.stateNode,i.current.memoizedState.isDehydrated){var s=Ya(i.pendingLanes);if(s!==0){var f=i;for(f.pendingLanes|=2,f.entangledLanes|=2;s;){var y=1<<31-gt(s);f.entanglements[1]|=y,s&=~y}Vt(i),(Ee&6)===0&&(Xi=ht()+500,Rl(0))}}break;case 31:case 13:f=Za(i,2),f!==null&&ft(f,i,2),Zi(),Hs(i,2)}if(i=qs(n),i===null&&Ns(e,t,n,sr,a),i===l)break;l=i}l!==null&&n.stopPropagation()}else Ns(e,t,n,null,a)}}function qs(e){return e=Lr(e),Ls(e)}var sr=null;function Ls(e){if(sr=null,e=un(e),e!==null){var t=p(e);if(t===null)e=null;else{var a=t.tag;if(a===13){if(e=h(t),e!==null)return e;e=null}else if(a===31){if(e=w(t),e!==null)return e;e=null}else if(a===3){if(t.stateNode.current.memoizedState.isDehydrated)return t.tag===3?t.stateNode.containerInfo:null;e=null}else t!==e&&(e=null)}}return sr=e,null}function mm(e){switch(e){case"beforetoggle":case"cancel":case"click":case"close":case"contextmenu":case"copy":case"cut":case"auxclick":case"dblclick":case"dragend":case"dragstart":case"drop":case"focusin":case"focusout":case"input":case"invalid":case"keydown":case"keypress":case"keyup":case"mousedown":case"mouseup":case"paste":case"pause":case"play":case"pointercancel":case"pointerdown":case"pointerup":case"ratechange":case"reset":case"resize":case"seeked":case"submit":case"toggle":case"touchcancel":case"touchend":case"touchstart":case"volumechange":case"change":case"selectionchange":case"textInput":case"compositionstart":case"compositionend":case"compositionupdate":case"beforeblur":case"afterblur":case"beforeinput":case"blur":case"fullscreenchange":case"focus":case"hashchange":case"popstate":case"select":case"selectstart":return 2;case"drag":case"dragenter":case"dragexit":case"dragleave":case"dragover":case"mousemove":case"mouseout":case"mouseover":case"pointermove":case"pointerout":case"pointerover":case"scroll":case"touchmove":case"wheel":case"mouseenter":case"mouseleave":case"pointerenter":case"pointerleave":return 8;case"message":switch(kh()){case xc:return 2;case jc:return 8;case Fl:case Ch:return 32;case Sc:return 268435456;default:return 32}default:return 32}}var Ys=!1,_a=null,Ra=null,Oa=null,Ll=new Map,Yl=new Map,Da=[],X0="mousedown mouseup touchcancel touchend touchstart auxclick dblclick pointercancel pointerdown pointerup dragend dragstart drop compositionend compositionstart keydown keypress keyup input textInput copy cut paste click change contextmenu reset".split(" ");function hm(e,t){switch(e){case"focusin":case"focusout":_a=null;break;case"dragenter":case"dragleave":Ra=null;break;case"mouseover":case"mouseout":Oa=null;break;case"pointerover":case"pointerout":Ll.delete(t.pointerId);break;case"gotpointercapture":case"lostpointercapture":Yl.delete(t.pointerId)}}function Gl(e,t,a,n,l,i){return e===null||e.nativeEvent!==i?(e={blockedOn:t,domEventName:a,eventSystemFlags:n,nativeEvent:i,targetContainers:[l]},t!==null&&(t=dn(t),t!==null&&dm(t)),e):(e.eventSystemFlags|=n,t=e.targetContainers,l!==null&&t.indexOf(l)===-1&&t.push(l),e)}function Q0(e,t,a,n,l){switch(t){case"focusin":return _a=Gl(_a,e,t,a,n,l),!0;case"dragenter":return Ra=Gl(Ra,e,t,a,n,l),!0;case"mouseover":return Oa=Gl(Oa,e,t,a,n,l),!0;case"pointerover":var i=l.pointerId;return Ll.set(i,Gl(Ll.get(i)||null,e,t,a,n,l)),!0;case"gotpointercapture":return i=l.pointerId,Yl.set(i,Gl(Yl.get(i)||null,e,t,a,n,l)),!0}return!1}function pm(e){var t=un(e.target);if(t!==null){var a=p(t);if(a!==null){if(t=a.tag,t===13){if(t=h(a),t!==null){e.blockedOn=t,Tc(e.priority,function(){fm(a)});return}}else if(t===31){if(t=w(a),t!==null){e.blockedOn=t,Tc(e.priority,function(){fm(a)});return}}else if(t===3&&a.stateNode.current.memoizedState.isDehydrated){e.blockedOn=a.tag===3?a.stateNode.containerInfo:null;return}}}e.blockedOn=null}function cr(e){if(e.blockedOn!==null)return!1;for(var t=e.targetContainers;0<t.length;){var a=qs(e.nativeEvent);if(a===null){a=e.nativeEvent;var n=new a.constructor(a.type,a);qr=n,a.target.dispatchEvent(n),qr=null}else return t=dn(a),t!==null&&dm(t),e.blockedOn=a,!1;t.shift()}return!0}function gm(e,t,a){cr(e)&&a.delete(t)}function Z0(){Ys=!1,_a!==null&&cr(_a)&&(_a=null),Ra!==null&&cr(Ra)&&(Ra=null),Oa!==null&&cr(Oa)&&(Oa=null),Ll.forEach(gm),Yl.forEach(gm)}function ur(e,t){e.blockedOn===t&&(e.blockedOn=null,Ys||(Ys=!0,o.unstable_scheduleCallback(o.unstable_NormalPriority,Z0)))}var dr=null;function bm(e){dr!==e&&(dr=e,o.unstable_scheduleCallback(o.unstable_NormalPriority,function(){dr===e&&(dr=null);for(var t=0;t<e.length;t+=3){var a=e[t],n=e[t+1],l=e[t+2];if(typeof n!="function"){if(Ls(n||a)===null)continue;break}var i=dn(a);i!==null&&(e.splice(t,3),t-=3,qo(i,{pending:!0,data:l,method:a.method,action:n},n,l))}}))}function Zn(e){function t(y){return ur(y,e)}_a!==null&&ur(_a,e),Ra!==null&&ur(Ra,e),Oa!==null&&ur(Oa,e),Ll.forEach(t),Yl.forEach(t);for(var a=0;a<Da.length;a++){var n=Da[a];n.blockedOn===e&&(n.blockedOn=null)}for(;0<Da.length&&(a=Da[0],a.blockedOn===null);)pm(a),a.blockedOn===null&&Da.shift();if(a=(e.ownerDocument||e).$$reactFormReplay,a!=null)for(n=0;n<a.length;n+=3){var l=a[n],i=a[n+1],s=l[rt]||null;if(typeof i=="function")s||bm(a);else if(s){var f=null;if(i&&i.hasAttribute("formAction")){if(l=i,s=i[rt]||null)f=s.formAction;else if(Ls(l)!==null)continue}else f=s.action;typeof f=="function"?a[n+1]=f:(a.splice(n,3),n-=3),bm(a)}}}function ym(){function e(i){i.canIntercept&&i.info==="react-transition"&&i.intercept({handler:function(){return new Promise(function(s){return l=s})},focusReset:"manual",scroll:"manual"})}function t(){l!==null&&(l(),l=null),n||setTimeout(a,20)}function a(){if(!n&&!navigation.transition){var i=navigation.currentEntry;i&&i.url!=null&&navigation.navigate(i.url,{state:i.getState(),info:"react-transition",history:"replace"})}}if(typeof navigation=="object"){var n=!1,l=null;return navigation.addEventListener("navigate",e),navigation.addEventListener("navigatesuccess",t),navigation.addEventListener("navigateerror",t),setTimeout(a,100),function(){n=!0,navigation.removeEventListener("navigate",e),navigation.removeEventListener("navigatesuccess",t),navigation.removeEventListener("navigateerror",t),l!==null&&(l(),l=null)}}}function Gs(e){this._internalRoot=e}fr.prototype.render=Gs.prototype.render=function(e){var t=this._internalRoot;if(t===null)throw Error(c(409));var a=t.current,n=wt();cm(a,n,e,t,null,null)},fr.prototype.unmount=Gs.prototype.unmount=function(){var e=this._internalRoot;if(e!==null){this._internalRoot=null;var t=e.containerInfo;cm(e.current,2,null,e,null,null),Zi(),t[cn]=null}};function fr(e){this._internalRoot=e}fr.prototype.unstable_scheduleHydration=function(e){if(e){var t=Ac();e={blockedOn:null,target:e,priority:t};for(var a=0;a<Da.length&&t!==0&&t<Da[a].priority;a++);Da.splice(a,0,e),a===0&&pm(e)}};var vm=u.version;if(vm!=="19.2.4")throw Error(c(527,vm,"19.2.4"));G.findDOMNode=function(e){var t=e._reactInternals;if(t===void 0)throw typeof e.render=="function"?Error(c(188)):(e=Object.keys(e).join(","),Error(c(268,e)));return e=b(t),e=e!==null?z(e):null,e=e===null?null:e.stateNode,e};var $0={bundleType:0,version:"19.2.4",rendererPackageName:"react-dom",currentDispatcherRef:C,reconcilerVersion:"19.2.4"};if(typeof __REACT_DEVTOOLS_GLOBAL_HOOK__<"u"){var mr=__REACT_DEVTOOLS_GLOBAL_HOOK__;if(!mr.isDisabled&&mr.supportsFiber)try{Fn=mr.inject($0),pt=mr}catch{}}return Xl.createRoot=function(e,t){if(!m(e))throw Error(c(299));var a=!1,n="",l=zd,i=Ed,s=Ad;return t!=null&&(t.unstable_strictMode===!0&&(a=!0),t.identifierPrefix!==void 0&&(n=t.identifierPrefix),t.onUncaughtError!==void 0&&(l=t.onUncaughtError),t.onCaughtError!==void 0&&(i=t.onCaughtError),t.onRecoverableError!==void 0&&(s=t.onRecoverableError)),t=om(e,1,!1,null,null,a,n,null,l,i,s,ym),e[cn]=t.current,ws(e),new Gs(t)},Xl.hydrateRoot=function(e,t,a){if(!m(e))throw Error(c(299));var n=!1,l="",i=zd,s=Ed,f=Ad,y=null;return a!=null&&(a.unstable_strictMode===!0&&(n=!0),a.identifierPrefix!==void 0&&(l=a.identifierPrefix),a.onUncaughtError!==void 0&&(i=a.onUncaughtError),a.onCaughtError!==void 0&&(s=a.onCaughtError),a.onRecoverableError!==void 0&&(f=a.onRecoverableError),a.formState!==void 0&&(y=a.formState)),t=om(e,1,!0,t,a??null,n,l,y,i,s,f,ym),t.context=sm(null),a=t.current,n=wt(),n=Mr(n),l=xa(n),l.callback=null,ja(a,l,n),a=n,t.current.lanes=a,Pn(t,a),Vt(t),e[cn]=t.current,ws(e),new fr(t)},Xl.version="19.2.4",Xl}var km;function lg(){if(km)return Qs.exports;km=1;function o(){if(!(typeof __REACT_DEVTOOLS_GLOBAL_HOOK__>"u"||typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE!="function"))try{__REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE(o)}catch(u){console.error(u)}}return o(),Qs.exports=ng(),Qs.exports}var ig=lg();const rg=Zm(ig);var Cm="popstate";function Mm(o){return typeof o=="object"&&o!=null&&"pathname"in o&&"search"in o&&"hash"in o&&"state"in o&&"key"in o}function og(o={}){function u(c,m){let p=m.state?.masked,{pathname:h,search:w,hash:v}=p||c.location;return tc("",{pathname:h,search:w,hash:v},m.state&&m.state.usr||null,m.state&&m.state.key||"default",p?{pathname:c.location.pathname,search:c.location.search,hash:c.location.hash}:void 0)}function d(c,m){return typeof m=="string"?m:Zl(m)}return cg(u,d,null,o)}function Be(o,u){if(o===!1||o===null||typeof o>"u")throw new Error(u)}function Bt(o,u){if(!o){typeof console<"u"&&console.warn(u);try{throw new Error(u)}catch{}}}function sg(){return Math.random().toString(36).substring(2,10)}function _m(o,u){return{usr:o.state,key:o.key,idx:u,masked:o.unstable_mask?{pathname:o.pathname,search:o.search,hash:o.hash}:void 0}}function tc(o,u,d=null,c,m){return{pathname:typeof o=="string"?o:o.pathname,search:"",hash:"",...typeof u=="string"?$n(u):u,state:d,key:u&&u.key||c||sg(),unstable_mask:m}}function Zl({pathname:o="/",search:u="",hash:d=""}){return u&&u!=="?"&&(o+=u.charAt(0)==="?"?u:"?"+u),d&&d!=="#"&&(o+=d.charAt(0)==="#"?d:"#"+d),o}function $n(o){let u={};if(o){let d=o.indexOf("#");d>=0&&(u.hash=o.substring(d),o=o.substring(0,d));let c=o.indexOf("?");c>=0&&(u.search=o.substring(c),o=o.substring(0,c)),o&&(u.pathname=o)}return u}function cg(o,u,d,c={}){let{window:m=document.defaultView,v5Compat:p=!1}=c,h=m.history,w="POP",v=null,b=z();b==null&&(b=0,h.replaceState({...h.state,idx:b},""));function z(){return(h.state||{idx:null}).idx}function S(){w="POP";let _=z(),Z=_==null?null:_-b;b=_,v&&v({action:w,location:M.location,delta:Z})}function O(_,Z){w="PUSH";let P=Mm(_)?_:tc(M.location,_,Z);b=z()+1;let L=_m(P,b),te=M.createHref(P.unstable_mask||P);try{h.pushState(L,"",te)}catch(X){if(X instanceof DOMException&&X.name==="DataCloneError")throw X;m.location.assign(te)}p&&v&&v({action:w,location:M.location,delta:1})}function q(_,Z){w="REPLACE";let P=Mm(_)?_:tc(M.location,_,Z);b=z();let L=_m(P,b),te=M.createHref(P.unstable_mask||P);h.replaceState(L,"",te),p&&v&&v({action:w,location:M.location,delta:0})}function Y(_){return ug(_)}let M={get action(){return w},get location(){return o(m,h)},listen(_){if(v)throw new Error("A history only accepts one active listener");return m.addEventListener(Cm,S),v=_,()=>{m.removeEventListener(Cm,S),v=null}},createHref(_){return u(m,_)},createURL:Y,encodeLocation(_){let Z=Y(_);return{pathname:Z.pathname,search:Z.search,hash:Z.hash}},push:O,replace:q,go(_){return h.go(_)}};return M}function ug(o,u=!1){let d="http://localhost";typeof window<"u"&&(d=window.location.origin!=="null"?window.location.origin:window.location.href),Be(d,"No window.location.(origin|href) available to create URL");let c=typeof o=="string"?o:Zl(o);return c=c.replace(/ $/,"%20"),!u&&c.startsWith("//")&&(c=d+c),new URL(c,d)}function $m(o,u,d="/"){return dg(o,u,d,!1)}function dg(o,u,d,c){let m=typeof u=="string"?$n(u):u,p=ua(m.pathname||"/",d);if(p==null)return null;let h=Jm(o);fg(h);let w=null;for(let v=0;w==null&&v<h.length;++v){let b=wg(p);w=jg(h[v],b,c)}return w}function Jm(o,u=[],d=[],c="",m=!1){let p=(h,w,v=m,b)=>{let z={relativePath:b===void 0?h.path||"":b,caseSensitive:h.caseSensitive===!0,childrenIndex:w,route:h};if(z.relativePath.startsWith("/")){if(!z.relativePath.startsWith(c)&&v)return;Be(z.relativePath.startsWith(c),`Absolute route path "${z.relativePath}" nested under path "${c}" is not valid. An absolute child route path must start with the combined path of all its parent routes.`),z.relativePath=z.relativePath.slice(c.length)}let S=Xt([c,z.relativePath]),O=d.concat(z);h.children&&h.children.length>0&&(Be(h.index!==!0,`Index routes must not have child routes. Please remove all child routes from route path "${S}".`),Jm(h.children,u,O,S,v)),!(h.path==null&&!h.index)&&u.push({path:S,score:vg(S,h.index),routesMeta:O})};return o.forEach((h,w)=>{if(h.path===""||!h.path?.includes("?"))p(h,w);else for(let v of Km(h.path))p(h,w,!0,v)}),u}function Km(o){let u=o.split("/");if(u.length===0)return[];let[d,...c]=u,m=d.endsWith("?"),p=d.replace(/\?$/,"");if(c.length===0)return m?[p,""]:[p];let h=Km(c.join("/")),w=[];return w.push(...h.map(v=>v===""?p:[p,v].join("/"))),m&&w.push(...h),w.map(v=>o.startsWith("/")&&v===""?"/":v)}function fg(o){o.sort((u,d)=>u.score!==d.score?d.score-u.score:xg(u.routesMeta.map(c=>c.childrenIndex),d.routesMeta.map(c=>c.childrenIndex)))}var mg=/^:[\w-]+$/,hg=3,pg=2,gg=1,bg=10,yg=-2,Rm=o=>o==="*";function vg(o,u){let d=o.split("/"),c=d.length;return d.some(Rm)&&(c+=yg),u&&(c+=pg),d.filter(m=>!Rm(m)).reduce((m,p)=>m+(mg.test(p)?hg:p===""?gg:bg),c)}function xg(o,u){return o.length===u.length&&o.slice(0,-1).every((c,m)=>c===u[m])?o[o.length-1]-u[u.length-1]:0}function jg(o,u,d=!1){let{routesMeta:c}=o,m={},p="/",h=[];for(let w=0;w<c.length;++w){let v=c[w],b=w===c.length-1,z=p==="/"?u:u.slice(p.length)||"/",S=yr({path:v.relativePath,caseSensitive:v.caseSensitive,end:b},z),O=v.route;if(!S&&b&&d&&!c[c.length-1].route.index&&(S=yr({path:v.relativePath,caseSensitive:v.caseSensitive,end:!1},z)),!S)return null;Object.assign(m,S.params),h.push({params:m,pathname:Xt([p,S.pathname]),pathnameBase:Ag(Xt([p,S.pathnameBase])),route:O}),S.pathnameBase!=="/"&&(p=Xt([p,S.pathnameBase]))}return h}function yr(o,u){typeof o=="string"&&(o={path:o,caseSensitive:!1,end:!0});let[d,c]=Sg(o.path,o.caseSensitive,o.end),m=u.match(d);if(!m)return null;let p=m[0],h=p.replace(/(.)\/+$/,"$1"),w=m.slice(1);return{params:c.reduce((b,{paramName:z,isOptional:S},O)=>{if(z==="*"){let Y=w[O]||"";h=p.slice(0,p.length-Y.length).replace(/(.)\/+$/,"$1")}const q=w[O];return S&&!q?b[z]=void 0:b[z]=(q||"").replace(/%2F/g,"/"),b},{}),pathname:p,pathnameBase:h,pattern:o}}function Sg(o,u=!1,d=!0){Bt(o==="*"||!o.endsWith("*")||o.endsWith("/*"),`Route path "${o}" will be treated as if it were "${o.replace(/\*$/,"/*")}" because the \`*\` character must always follow a \`/\` in the pattern. To get rid of this warning, please change the route path to "${o.replace(/\*$/,"/*")}".`);let c=[],m="^"+o.replace(/\/*\*?$/,"").replace(/^\/*/,"/").replace(/[\\.*+^${}|()[\]]/g,"\\$&").replace(/\/:([\w-]+)(\?)?/g,(h,w,v,b,z)=>{if(c.push({paramName:w,isOptional:v!=null}),v){let S=z.charAt(b+h.length);return S&&S!=="/"?"/([^\\/]*)":"(?:/([^\\/]*))?"}return"/([^\\/]+)"}).replace(/\/([\w-]+)\?(\/|$)/g,"(/$1)?$2");return o.endsWith("*")?(c.push({paramName:"*"}),m+=o==="*"||o==="/*"?"(.*)$":"(?:\\/(.+)|\\/*)$"):d?m+="\\/*$":o!==""&&o!=="/"&&(m+="(?:(?=\\/|$))"),[new RegExp(m,u?void 0:"i"),c]}function wg(o){try{return o.split("/").map(u=>decodeURIComponent(u).replace(/\//g,"%2F")).join("/")}catch(u){return Bt(!1,`The URL path "${o}" could not be decoded because it is a malformed URL segment. This is probably due to a bad percent encoding (${u}).`),o}}function ua(o,u){if(u==="/")return o;if(!o.toLowerCase().startsWith(u.toLowerCase()))return null;let d=u.endsWith("/")?u.length-1:u.length,c=o.charAt(d);return c&&c!=="/"?null:o.slice(d)||"/"}var Ng=/^(?:[a-z][a-z0-9+.-]*:|\/\/)/i;function zg(o,u="/"){let{pathname:d,search:c="",hash:m=""}=typeof o=="string"?$n(o):o,p;return d?(d=d.replace(/\/\/+/g,"/"),d.startsWith("/")?p=Om(d.substring(1),"/"):p=Om(d,u)):p=u,{pathname:p,search:Tg(c),hash:kg(m)}}function Om(o,u){let d=u.replace(/\/+$/,"").split("/");return o.split("/").forEach(m=>{m===".."?d.length>1&&d.pop():m!=="."&&d.push(m)}),d.length>1?d.join("/"):"/"}function Ks(o,u,d,c){return`Cannot include a '${o}' character in a manually specified \`to.${u}\` field [${JSON.stringify(c)}].  Please separate it out to the \`to.${d}\` field. Alternatively you may provide the full path as a string in <Link to="..."> and the router will parse it for you.`}function Eg(o){return o.filter((u,d)=>d===0||u.route.path&&u.route.path.length>0)}function cc(o){let u=Eg(o);return u.map((d,c)=>c===u.length-1?d.pathname:d.pathnameBase)}function jr(o,u,d,c=!1){let m;typeof o=="string"?m=$n(o):(m={...o},Be(!m.pathname||!m.pathname.includes("?"),Ks("?","pathname","search",m)),Be(!m.pathname||!m.pathname.includes("#"),Ks("#","pathname","hash",m)),Be(!m.search||!m.search.includes("#"),Ks("#","search","hash",m)));let p=o===""||m.pathname==="",h=p?"/":m.pathname,w;if(h==null)w=d;else{let S=u.length-1;if(!c&&h.startsWith("..")){let O=h.split("/");for(;O[0]==="..";)O.shift(),S-=1;m.pathname=O.join("/")}w=S>=0?u[S]:"/"}let v=zg(m,w),b=h&&h!=="/"&&h.endsWith("/"),z=(p||h===".")&&d.endsWith("/");return!v.pathname.endsWith("/")&&(b||z)&&(v.pathname+="/"),v}var Xt=o=>o.join("/").replace(/\/\/+/g,"/"),Ag=o=>o.replace(/\/+$/,"").replace(/^\/*/,"/"),Tg=o=>!o||o==="?"?"":o.startsWith("?")?o:"?"+o,kg=o=>!o||o==="#"?"":o.startsWith("#")?o:"#"+o,Cg=class{constructor(o,u,d,c=!1){this.status=o,this.statusText=u||"",this.internal=c,d instanceof Error?(this.data=d.toString(),this.error=d):this.data=d}};function Mg(o){return o!=null&&typeof o.status=="number"&&typeof o.statusText=="string"&&typeof o.internal=="boolean"&&"data"in o}function _g(o){return o.map(u=>u.route.path).filter(Boolean).join("/").replace(/\/\/*/g,"/")||"/"}var Wm=typeof window<"u"&&typeof window.document<"u"&&typeof window.document.createElement<"u";function Fm(o,u){let d=o;if(typeof d!="string"||!Ng.test(d))return{absoluteURL:void 0,isExternal:!1,to:d};let c=d,m=!1;if(Wm)try{let p=new URL(window.location.href),h=d.startsWith("//")?new URL(p.protocol+d):new URL(d),w=ua(h.pathname,u);h.origin===p.origin&&w!=null?d=w+h.search+h.hash:m=!0}catch{Bt(!1,`<Link to="${d}"> contains an invalid URL which will probably break when clicked - please update to a valid URL path.`)}return{absoluteURL:c,isExternal:m,to:d}}Object.getOwnPropertyNames(Object.prototype).sort().join("\0");var Im=["POST","PUT","PATCH","DELETE"];new Set(Im);var Rg=["GET",...Im];new Set(Rg);var Jn=g.createContext(null);Jn.displayName="DataRouter";var Sr=g.createContext(null);Sr.displayName="DataRouterState";var Og=g.createContext(!1),Pm=g.createContext({isTransitioning:!1});Pm.displayName="ViewTransition";var Dg=g.createContext(new Map);Dg.displayName="Fetchers";var Ug=g.createContext(null);Ug.displayName="Await";var Nt=g.createContext(null);Nt.displayName="Navigation";var Jl=g.createContext(null);Jl.displayName="Location";var qt=g.createContext({outlet:null,matches:[],isDataRoute:!1});qt.displayName="Route";var uc=g.createContext(null);uc.displayName="RouteError";var eh="REACT_ROUTER_ERROR",Hg="REDIRECT",Bg="ROUTE_ERROR_RESPONSE";function qg(o){if(o.startsWith(`${eh}:${Hg}:{`))try{let u=JSON.parse(o.slice(28));if(typeof u=="object"&&u&&typeof u.status=="number"&&typeof u.statusText=="string"&&typeof u.location=="string"&&typeof u.reloadDocument=="boolean"&&typeof u.replace=="boolean")return u}catch{}}function Lg(o){if(o.startsWith(`${eh}:${Bg}:{`))try{let u=JSON.parse(o.slice(40));if(typeof u=="object"&&u&&typeof u.status=="number"&&typeof u.statusText=="string")return new Cg(u.status,u.statusText,u.data)}catch{}}function Yg(o,{relative:u}={}){Be(Kn(),"useHref() may be used only in the context of a <Router> component.");let{basename:d,navigator:c}=g.useContext(Nt),{hash:m,pathname:p,search:h}=Kl(o,{relative:u}),w=p;return d!=="/"&&(w=p==="/"?d:Xt([d,p])),c.createHref({pathname:w,search:h,hash:m})}function Kn(){return g.useContext(Jl)!=null}function da(){return Be(Kn(),"useLocation() may be used only in the context of a <Router> component."),g.useContext(Jl).location}var th="You should call navigate() in a React.useEffect(), not when your component is first rendered.";function ah(o){g.useContext(Nt).static||g.useLayoutEffect(o)}function qa(){let{isDataRoute:o}=g.useContext(qt);return o?a1():Gg()}function Gg(){Be(Kn(),"useNavigate() may be used only in the context of a <Router> component.");let o=g.useContext(Jn),{basename:u,navigator:d}=g.useContext(Nt),{matches:c}=g.useContext(qt),{pathname:m}=da(),p=JSON.stringify(cc(c)),h=g.useRef(!1);return ah(()=>{h.current=!0}),g.useCallback((v,b={})=>{if(Bt(h.current,th),!h.current)return;if(typeof v=="number"){d.go(v);return}let z=jr(v,JSON.parse(p),m,b.relative==="path");o==null&&u!=="/"&&(z.pathname=z.pathname==="/"?u:Xt([u,z.pathname])),(b.replace?d.replace:d.push)(z,b.state,b)},[u,d,p,m,o])}var Vg=g.createContext(null);function Xg(o){let u=g.useContext(qt).outlet;return g.useMemo(()=>u&&g.createElement(Vg.Provider,{value:o},u),[u,o])}function Kl(o,{relative:u}={}){let{matches:d}=g.useContext(qt),{pathname:c}=da(),m=JSON.stringify(cc(d));return g.useMemo(()=>jr(o,JSON.parse(m),c,u==="path"),[o,m,c,u])}function Qg(o,u){return nh(o,u)}function nh(o,u,d){Be(Kn(),"useRoutes() may be used only in the context of a <Router> component.");let{navigator:c}=g.useContext(Nt),{matches:m}=g.useContext(qt),p=m[m.length-1],h=p?p.params:{},w=p?p.pathname:"/",v=p?p.pathnameBase:"/",b=p&&p.route;{let _=b&&b.path||"";ih(w,!b||_.endsWith("*")||_.endsWith("*?"),`You rendered descendant <Routes> (or called \`useRoutes()\`) at "${w}" (under <Route path="${_}">) but the parent route path has no trailing "*". This means if you navigate deeper, the parent won't match anymore and therefore the child routes will never render.

Please change the parent <Route path="${_}"> to <Route path="${_==="/"?"*":`${_}/*`}">.`)}let z=da(),S;if(u){let _=typeof u=="string"?$n(u):u;Be(v==="/"||_.pathname?.startsWith(v),`When overriding the location using \`<Routes location>\` or \`useRoutes(routes, location)\`, the location pathname must begin with the portion of the URL pathname that was matched by all parent routes. The current pathname base is "${v}" but pathname "${_.pathname}" was given in the \`location\` prop.`),S=_}else S=z;let O=S.pathname||"/",q=O;if(v!=="/"){let _=v.replace(/^\//,"").split("/");q="/"+O.replace(/^\//,"").split("/").slice(_.length).join("/")}let Y=$m(o,{pathname:q});Bt(b||Y!=null,`No routes matched location "${S.pathname}${S.search}${S.hash}" `),Bt(Y==null||Y[Y.length-1].route.element!==void 0||Y[Y.length-1].route.Component!==void 0||Y[Y.length-1].route.lazy!==void 0,`Matched leaf route at location "${S.pathname}${S.search}${S.hash}" does not have an element or Component. This means it will render an <Outlet /> with a null value by default resulting in an "empty" page.`);let M=Wg(Y&&Y.map(_=>Object.assign({},_,{params:Object.assign({},h,_.params),pathname:Xt([v,c.encodeLocation?c.encodeLocation(_.pathname.replace(/\?/g,"%3F").replace(/#/g,"%23")).pathname:_.pathname]),pathnameBase:_.pathnameBase==="/"?v:Xt([v,c.encodeLocation?c.encodeLocation(_.pathnameBase.replace(/\?/g,"%3F").replace(/#/g,"%23")).pathname:_.pathnameBase])})),m,d);return u&&M?g.createElement(Jl.Provider,{value:{location:{pathname:"/",search:"",hash:"",state:null,key:"default",unstable_mask:void 0,...S},navigationType:"POP"}},M):M}function Zg(){let o=t1(),u=Mg(o)?`${o.status} ${o.statusText}`:o instanceof Error?o.message:JSON.stringify(o),d=o instanceof Error?o.stack:null,c="rgba(200,200,200, 0.5)",m={padding:"0.5rem",backgroundColor:c},p={padding:"2px 4px",backgroundColor:c},h=null;return console.error("Error handled by React Router default ErrorBoundary:",o),h=g.createElement(g.Fragment,null,g.createElement("p",null,"💿 Hey developer 👋"),g.createElement("p",null,"You can provide a way better UX than this when your app throws errors by providing your own ",g.createElement("code",{style:p},"ErrorBoundary")," or"," ",g.createElement("code",{style:p},"errorElement")," prop on your route.")),g.createElement(g.Fragment,null,g.createElement("h2",null,"Unexpected Application Error!"),g.createElement("h3",{style:{fontStyle:"italic"}},u),d?g.createElement("pre",{style:m},d):null,h)}var $g=g.createElement(Zg,null),lh=class extends g.Component{constructor(o){super(o),this.state={location:o.location,revalidation:o.revalidation,error:o.error}}static getDerivedStateFromError(o){return{error:o}}static getDerivedStateFromProps(o,u){return u.location!==o.location||u.revalidation!=="idle"&&o.revalidation==="idle"?{error:o.error,location:o.location,revalidation:o.revalidation}:{error:o.error!==void 0?o.error:u.error,location:u.location,revalidation:o.revalidation||u.revalidation}}componentDidCatch(o,u){this.props.onError?this.props.onError(o,u):console.error("React Router caught the following error during render",o)}render(){let o=this.state.error;if(this.context&&typeof o=="object"&&o&&"digest"in o&&typeof o.digest=="string"){const d=Lg(o.digest);d&&(o=d)}let u=o!==void 0?g.createElement(qt.Provider,{value:this.props.routeContext},g.createElement(uc.Provider,{value:o,children:this.props.component})):this.props.children;return this.context?g.createElement(Jg,{error:o},u):u}};lh.contextType=Og;var Ws=new WeakMap;function Jg({children:o,error:u}){let{basename:d}=g.useContext(Nt);if(typeof u=="object"&&u&&"digest"in u&&typeof u.digest=="string"){let c=qg(u.digest);if(c){let m=Ws.get(u);if(m)throw m;let p=Fm(c.location,d);if(Wm&&!Ws.get(u))if(p.isExternal||c.reloadDocument)window.location.href=p.absoluteURL||p.to;else{const h=Promise.resolve().then(()=>window.__reactRouterDataRouter.navigate(p.to,{replace:c.replace}));throw Ws.set(u,h),h}return g.createElement("meta",{httpEquiv:"refresh",content:`0;url=${p.absoluteURL||p.to}`})}}return o}function Kg({routeContext:o,match:u,children:d}){let c=g.useContext(Jn);return c&&c.static&&c.staticContext&&(u.route.errorElement||u.route.ErrorBoundary)&&(c.staticContext._deepestRenderedBoundaryId=u.route.id),g.createElement(qt.Provider,{value:o},d)}function Wg(o,u=[],d){let c=d?.state;if(o==null){if(!c)return null;if(c.errors)o=c.matches;else if(u.length===0&&!c.initialized&&c.matches.length>0)o=c.matches;else return null}let m=o,p=c?.errors;if(p!=null){let z=m.findIndex(S=>S.route.id&&p?.[S.route.id]!==void 0);Be(z>=0,`Could not find a matching route for errors on route IDs: ${Object.keys(p).join(",")}`),m=m.slice(0,Math.min(m.length,z+1))}let h=!1,w=-1;if(d&&c){h=c.renderFallback;for(let z=0;z<m.length;z++){let S=m[z];if((S.route.HydrateFallback||S.route.hydrateFallbackElement)&&(w=z),S.route.id){let{loaderData:O,errors:q}=c,Y=S.route.loader&&!O.hasOwnProperty(S.route.id)&&(!q||q[S.route.id]===void 0);if(S.route.lazy||Y){d.isStatic&&(h=!0),w>=0?m=m.slice(0,w+1):m=[m[0]];break}}}}let v=d?.onError,b=c&&v?(z,S)=>{v(z,{location:c.location,params:c.matches?.[0]?.params??{},unstable_pattern:_g(c.matches),errorInfo:S})}:void 0;return m.reduceRight((z,S,O)=>{let q,Y=!1,M=null,_=null;c&&(q=p&&S.route.id?p[S.route.id]:void 0,M=S.route.errorElement||$g,h&&(w<0&&O===0?(ih("route-fallback",!1,"No `HydrateFallback` element provided to render during initial hydration"),Y=!0,_=null):w===O&&(Y=!0,_=S.route.hydrateFallbackElement||null)));let Z=u.concat(m.slice(0,O+1)),P=()=>{let L;return q?L=M:Y?L=_:S.route.Component?L=g.createElement(S.route.Component,null):S.route.element?L=S.route.element:L=z,g.createElement(Kg,{match:S,routeContext:{outlet:z,matches:Z,isDataRoute:c!=null},children:L})};return c&&(S.route.ErrorBoundary||S.route.errorElement||O===0)?g.createElement(lh,{location:c.location,revalidation:c.revalidation,component:M,error:q,children:P(),routeContext:{outlet:null,matches:Z,isDataRoute:!0},onError:b}):P()},null)}function dc(o){return`${o} must be used within a data router.  See https://reactrouter.com/en/main/routers/picking-a-router.`}function Fg(o){let u=g.useContext(Jn);return Be(u,dc(o)),u}function Ig(o){let u=g.useContext(Sr);return Be(u,dc(o)),u}function Pg(o){let u=g.useContext(qt);return Be(u,dc(o)),u}function fc(o){let u=Pg(o),d=u.matches[u.matches.length-1];return Be(d.route.id,`${o} can only be used on routes that contain a unique "id"`),d.route.id}function e1(){return fc("useRouteId")}function t1(){let o=g.useContext(uc),u=Ig("useRouteError"),d=fc("useRouteError");return o!==void 0?o:u.errors?.[d]}function a1(){let{router:o}=Fg("useNavigate"),u=fc("useNavigate"),d=g.useRef(!1);return ah(()=>{d.current=!0}),g.useCallback(async(m,p={})=>{Bt(d.current,th),d.current&&(typeof m=="number"?await o.navigate(m):await o.navigate(m,{fromRouteId:u,...p}))},[o,u])}var Dm={};function ih(o,u,d){!u&&!Dm[o]&&(Dm[o]=!0,Bt(!1,d))}g.memo(n1);function n1({routes:o,future:u,state:d,isStatic:c,onError:m}){return nh(o,void 0,{state:d,isStatic:c,onError:m})}function vr({to:o,replace:u,state:d,relative:c}){Be(Kn(),"<Navigate> may be used only in the context of a <Router> component.");let{static:m}=g.useContext(Nt);Bt(!m,"<Navigate> must not be used on the initial render in a <StaticRouter>. This is a no-op, but you should modify your code so the <Navigate> is only ever rendered in response to some user interaction or state change.");let{matches:p}=g.useContext(qt),{pathname:h}=da(),w=qa(),v=jr(o,cc(p),h,c==="path"),b=JSON.stringify(v);return g.useEffect(()=>{w(JSON.parse(b),{replace:u,state:d,relative:c})},[w,b,c,u,d]),null}function l1(o){return Xg(o.context)}function mt(o){Be(!1,"A <Route> is only ever to be used as the child of <Routes> element, never rendered directly. Please wrap your <Route> in a <Routes>.")}function i1({basename:o="/",children:u=null,location:d,navigationType:c="POP",navigator:m,static:p=!1,unstable_useTransitions:h}){Be(!Kn(),"You cannot render a <Router> inside another <Router>. You should never have more than one in your app.");let w=o.replace(/^\/*/,"/"),v=g.useMemo(()=>({basename:w,navigator:m,static:p,unstable_useTransitions:h,future:{}}),[w,m,p,h]);typeof d=="string"&&(d=$n(d));let{pathname:b="/",search:z="",hash:S="",state:O=null,key:q="default",unstable_mask:Y}=d,M=g.useMemo(()=>{let _=ua(b,w);return _==null?null:{location:{pathname:_,search:z,hash:S,state:O,key:q,unstable_mask:Y},navigationType:c}},[w,b,z,S,O,q,c,Y]);return Bt(M!=null,`<Router basename="${w}"> is not able to match the URL "${b}${z}${S}" because it does not start with the basename, so the <Router> won't render anything.`),M==null?null:g.createElement(Nt.Provider,{value:v},g.createElement(Jl.Provider,{children:u,value:M}))}function r1({children:o,location:u}){return Qg(ac(o),u)}function ac(o,u=[]){let d=[];return g.Children.forEach(o,(c,m)=>{if(!g.isValidElement(c))return;let p=[...u,m];if(c.type===g.Fragment){d.push.apply(d,ac(c.props.children,p));return}Be(c.type===mt,`[${typeof c.type=="string"?c.type:c.type.name}] is not a <Route> component. All component children of <Routes> must be a <Route> or <React.Fragment>`),Be(!c.props.index||!c.props.children,"An index route cannot have child routes.");let h={id:c.props.id||p.join("-"),caseSensitive:c.props.caseSensitive,element:c.props.element,Component:c.props.Component,index:c.props.index,path:c.props.path,middleware:c.props.middleware,loader:c.props.loader,action:c.props.action,hydrateFallbackElement:c.props.hydrateFallbackElement,HydrateFallback:c.props.HydrateFallback,errorElement:c.props.errorElement,ErrorBoundary:c.props.ErrorBoundary,hasErrorBoundary:c.props.hasErrorBoundary===!0||c.props.ErrorBoundary!=null||c.props.errorElement!=null,shouldRevalidate:c.props.shouldRevalidate,handle:c.props.handle,lazy:c.props.lazy};c.props.children&&(h.children=ac(c.props.children,p)),d.push(h)}),d}var gr="get",br="application/x-www-form-urlencoded";function wr(o){return typeof HTMLElement<"u"&&o instanceof HTMLElement}function o1(o){return wr(o)&&o.tagName.toLowerCase()==="button"}function s1(o){return wr(o)&&o.tagName.toLowerCase()==="form"}function c1(o){return wr(o)&&o.tagName.toLowerCase()==="input"}function u1(o){return!!(o.metaKey||o.altKey||o.ctrlKey||o.shiftKey)}function d1(o,u){return o.button===0&&(!u||u==="_self")&&!u1(o)}var hr=null;function f1(){if(hr===null)try{new FormData(document.createElement("form"),0),hr=!1}catch{hr=!0}return hr}var m1=new Set(["application/x-www-form-urlencoded","multipart/form-data","text/plain"]);function Fs(o){return o!=null&&!m1.has(o)?(Bt(!1,`"${o}" is not a valid \`encType\` for \`<Form>\`/\`<fetcher.Form>\` and will default to "${br}"`),null):o}function h1(o,u){let d,c,m,p,h;if(s1(o)){let w=o.getAttribute("action");c=w?ua(w,u):null,d=o.getAttribute("method")||gr,m=Fs(o.getAttribute("enctype"))||br,p=new FormData(o)}else if(o1(o)||c1(o)&&(o.type==="submit"||o.type==="image")){let w=o.form;if(w==null)throw new Error('Cannot submit a <button> or <input type="submit"> without a <form>');let v=o.getAttribute("formaction")||w.getAttribute("action");if(c=v?ua(v,u):null,d=o.getAttribute("formmethod")||w.getAttribute("method")||gr,m=Fs(o.getAttribute("formenctype"))||Fs(w.getAttribute("enctype"))||br,p=new FormData(w,o),!f1()){let{name:b,type:z,value:S}=o;if(z==="image"){let O=b?`${b}.`:"";p.append(`${O}x`,"0"),p.append(`${O}y`,"0")}else b&&p.append(b,S)}}else{if(wr(o))throw new Error('Cannot submit element that is not <form>, <button>, or <input type="submit|image">');d=gr,c=null,m=br,h=o}return p&&m==="text/plain"&&(h=p,p=void 0),{action:c,method:d.toLowerCase(),encType:m,formData:p,body:h}}Object.getOwnPropertyNames(Object.prototype).sort().join("\0");function mc(o,u){if(o===!1||o===null||typeof o>"u")throw new Error(u)}function p1(o,u,d,c){let m=typeof o=="string"?new URL(o,typeof window>"u"?"server://singlefetch/":window.location.origin):o;return d?m.pathname.endsWith("/")?m.pathname=`${m.pathname}_.${c}`:m.pathname=`${m.pathname}.${c}`:m.pathname==="/"?m.pathname=`_root.${c}`:u&&ua(m.pathname,u)==="/"?m.pathname=`${u.replace(/\/$/,"")}/_root.${c}`:m.pathname=`${m.pathname.replace(/\/$/,"")}.${c}`,m}async function g1(o,u){if(o.id in u)return u[o.id];try{let d=await import(o.module);return u[o.id]=d,d}catch(d){return console.error(`Error loading route module \`${o.module}\`, reloading page...`),console.error(d),window.__reactRouterContext&&window.__reactRouterContext.isSpaMode,window.location.reload(),new Promise(()=>{})}}function b1(o){return o==null?!1:o.href==null?o.rel==="preload"&&typeof o.imageSrcSet=="string"&&typeof o.imageSizes=="string":typeof o.rel=="string"&&typeof o.href=="string"}async function y1(o,u,d){let c=await Promise.all(o.map(async m=>{let p=u.routes[m.route.id];if(p){let h=await g1(p,d);return h.links?h.links():[]}return[]}));return S1(c.flat(1).filter(b1).filter(m=>m.rel==="stylesheet"||m.rel==="preload").map(m=>m.rel==="stylesheet"?{...m,rel:"prefetch",as:"style"}:{...m,rel:"prefetch"}))}function Um(o,u,d,c,m,p){let h=(v,b)=>d[b]?v.route.id!==d[b].route.id:!0,w=(v,b)=>d[b].pathname!==v.pathname||d[b].route.path?.endsWith("*")&&d[b].params["*"]!==v.params["*"];return p==="assets"?u.filter((v,b)=>h(v,b)||w(v,b)):p==="data"?u.filter((v,b)=>{let z=c.routes[v.route.id];if(!z||!z.hasLoader)return!1;if(h(v,b)||w(v,b))return!0;if(v.route.shouldRevalidate){let S=v.route.shouldRevalidate({currentUrl:new URL(m.pathname+m.search+m.hash,window.origin),currentParams:d[0]?.params||{},nextUrl:new URL(o,window.origin),nextParams:v.params,defaultShouldRevalidate:!0});if(typeof S=="boolean")return S}return!0}):[]}function v1(o,u,{includeHydrateFallback:d}={}){return x1(o.map(c=>{let m=u.routes[c.route.id];if(!m)return[];let p=[m.module];return m.clientActionModule&&(p=p.concat(m.clientActionModule)),m.clientLoaderModule&&(p=p.concat(m.clientLoaderModule)),d&&m.hydrateFallbackModule&&(p=p.concat(m.hydrateFallbackModule)),m.imports&&(p=p.concat(m.imports)),p}).flat(1))}function x1(o){return[...new Set(o)]}function j1(o){let u={},d=Object.keys(o).sort();for(let c of d)u[c]=o[c];return u}function S1(o,u){let d=new Set;return new Set(u),o.reduce((c,m)=>{let p=JSON.stringify(j1(m));return d.has(p)||(d.add(p),c.push({key:p,link:m})),c},[])}function rh(){let o=g.useContext(Jn);return mc(o,"You must render this element inside a <DataRouterContext.Provider> element"),o}function w1(){let o=g.useContext(Sr);return mc(o,"You must render this element inside a <DataRouterStateContext.Provider> element"),o}var hc=g.createContext(void 0);hc.displayName="FrameworkContext";function oh(){let o=g.useContext(hc);return mc(o,"You must render this element inside a <HydratedRouter> element"),o}function N1(o,u){let d=g.useContext(hc),[c,m]=g.useState(!1),[p,h]=g.useState(!1),{onFocus:w,onBlur:v,onMouseEnter:b,onMouseLeave:z,onTouchStart:S}=u,O=g.useRef(null);g.useEffect(()=>{if(o==="render"&&h(!0),o==="viewport"){let M=Z=>{Z.forEach(P=>{h(P.isIntersecting)})},_=new IntersectionObserver(M,{threshold:.5});return O.current&&_.observe(O.current),()=>{_.disconnect()}}},[o]),g.useEffect(()=>{if(c){let M=setTimeout(()=>{h(!0)},100);return()=>{clearTimeout(M)}}},[c]);let q=()=>{m(!0)},Y=()=>{m(!1),h(!1)};return d?o!=="intent"?[p,O,{}]:[p,O,{onFocus:Ql(w,q),onBlur:Ql(v,Y),onMouseEnter:Ql(b,q),onMouseLeave:Ql(z,Y),onTouchStart:Ql(S,q)}]:[!1,O,{}]}function Ql(o,u){return d=>{o&&o(d),d.defaultPrevented||u(d)}}function z1({page:o,...u}){let{router:d}=rh(),c=g.useMemo(()=>$m(d.routes,o,d.basename),[d.routes,o,d.basename]);return c?g.createElement(A1,{page:o,matches:c,...u}):null}function E1(o){let{manifest:u,routeModules:d}=oh(),[c,m]=g.useState([]);return g.useEffect(()=>{let p=!1;return y1(o,u,d).then(h=>{p||m(h)}),()=>{p=!0}},[o,u,d]),c}function A1({page:o,matches:u,...d}){let c=da(),{future:m,manifest:p,routeModules:h}=oh(),{basename:w}=rh(),{loaderData:v,matches:b}=w1(),z=g.useMemo(()=>Um(o,u,b,p,c,"data"),[o,u,b,p,c]),S=g.useMemo(()=>Um(o,u,b,p,c,"assets"),[o,u,b,p,c]),O=g.useMemo(()=>{if(o===c.pathname+c.search+c.hash)return[];let M=new Set,_=!1;if(u.forEach(P=>{let L=p.routes[P.route.id];!L||!L.hasLoader||(!z.some(te=>te.route.id===P.route.id)&&P.route.id in v&&h[P.route.id]?.shouldRevalidate||L.hasClientLoader?_=!0:M.add(P.route.id))}),M.size===0)return[];let Z=p1(o,w,m.unstable_trailingSlashAwareDataRequests,"data");return _&&M.size>0&&Z.searchParams.set("_routes",u.filter(P=>M.has(P.route.id)).map(P=>P.route.id).join(",")),[Z.pathname+Z.search]},[w,m.unstable_trailingSlashAwareDataRequests,v,c,p,z,u,o,h]),q=g.useMemo(()=>v1(S,p),[S,p]),Y=E1(S);return g.createElement(g.Fragment,null,O.map(M=>g.createElement("link",{key:M,rel:"prefetch",as:"fetch",href:M,...d})),q.map(M=>g.createElement("link",{key:M,rel:"modulepreload",href:M,...d})),Y.map(({key:M,link:_})=>g.createElement("link",{key:M,nonce:d.nonce,..._,crossOrigin:_.crossOrigin??d.crossOrigin})))}function T1(...o){return u=>{o.forEach(d=>{typeof d=="function"?d(u):d!=null&&(d.current=u)})}}var k1=typeof window<"u"&&typeof window.document<"u"&&typeof window.document.createElement<"u";try{k1&&(window.__reactRouterVersion="7.13.1")}catch{}function C1({basename:o,children:u,unstable_useTransitions:d,window:c}){let m=g.useRef();m.current==null&&(m.current=og({window:c,v5Compat:!0}));let p=m.current,[h,w]=g.useState({action:p.action,location:p.location}),v=g.useCallback(b=>{d===!1?w(b):g.startTransition(()=>w(b))},[d]);return g.useLayoutEffect(()=>p.listen(v),[p,v]),g.createElement(i1,{basename:o,children:u,location:h.location,navigationType:h.action,navigator:p,unstable_useTransitions:d})}var sh=/^(?:[a-z][a-z0-9+.-]*:|\/\/)/i,Ha=g.forwardRef(function({onClick:u,discover:d="render",prefetch:c="none",relative:m,reloadDocument:p,replace:h,unstable_mask:w,state:v,target:b,to:z,preventScrollReset:S,viewTransition:O,unstable_defaultShouldRevalidate:q,...Y},M){let{basename:_,navigator:Z,unstable_useTransitions:P}=g.useContext(Nt),L=typeof z=="string"&&sh.test(z),te=Fm(z,_);z=te.to;let X=Yg(z,{relative:m}),W=da(),B=null;if(w){let ue=jr(w,[],W.unstable_mask?W.unstable_mask.pathname:"/",!0);_!=="/"&&(ue.pathname=ue.pathname==="/"?_:Xt([_,ue.pathname])),B=Z.createHref(ue)}let[J,ae,xe]=N1(c,Y),Se=R1(z,{replace:h,unstable_mask:w,state:v,target:b,preventScrollReset:S,relative:m,viewTransition:O,unstable_defaultShouldRevalidate:q,unstable_useTransitions:P});function F(ue){u&&u(ue),ue.defaultPrevented||Se(ue)}let re=!(te.isExternal||p),me=g.createElement("a",{...Y,...xe,href:(re?B:void 0)||te.absoluteURL||X,onClick:re?F:u,ref:T1(M,ae),target:b,"data-discover":!L&&d==="render"?"true":void 0});return J&&!L?g.createElement(g.Fragment,null,me,g.createElement(z1,{page:X})):me});Ha.displayName="Link";var nc=g.forwardRef(function({"aria-current":u="page",caseSensitive:d=!1,className:c="",end:m=!1,style:p,to:h,viewTransition:w,children:v,...b},z){let S=Kl(h,{relative:b.relative}),O=da(),q=g.useContext(Sr),{navigator:Y,basename:M}=g.useContext(Nt),_=q!=null&&B1(S)&&w===!0,Z=Y.encodeLocation?Y.encodeLocation(S).pathname:S.pathname,P=O.pathname,L=q&&q.navigation&&q.navigation.location?q.navigation.location.pathname:null;d||(P=P.toLowerCase(),L=L?L.toLowerCase():null,Z=Z.toLowerCase()),L&&M&&(L=ua(L,M)||L);const te=Z!=="/"&&Z.endsWith("/")?Z.length-1:Z.length;let X=P===Z||!m&&P.startsWith(Z)&&P.charAt(te)==="/",W=L!=null&&(L===Z||!m&&L.startsWith(Z)&&L.charAt(Z.length)==="/"),B={isActive:X,isPending:W,isTransitioning:_},J=X?u:void 0,ae;typeof c=="function"?ae=c(B):ae=[c,X?"active":null,W?"pending":null,_?"transitioning":null].filter(Boolean).join(" ");let xe=typeof p=="function"?p(B):p;return g.createElement(Ha,{...b,"aria-current":J,className:ae,ref:z,style:xe,to:h,viewTransition:w},typeof v=="function"?v(B):v)});nc.displayName="NavLink";var M1=g.forwardRef(({discover:o="render",fetcherKey:u,navigate:d,reloadDocument:c,replace:m,state:p,method:h=gr,action:w,onSubmit:v,relative:b,preventScrollReset:z,viewTransition:S,unstable_defaultShouldRevalidate:O,...q},Y)=>{let{unstable_useTransitions:M}=g.useContext(Nt),_=U1(),Z=H1(w,{relative:b}),P=h.toLowerCase()==="get"?"get":"post",L=typeof w=="string"&&sh.test(w),te=X=>{if(v&&v(X),X.defaultPrevented)return;X.preventDefault();let W=X.nativeEvent.submitter,B=W?.getAttribute("formmethod")||h,J=()=>_(W||X.currentTarget,{fetcherKey:u,method:B,navigate:d,replace:m,state:p,relative:b,preventScrollReset:z,viewTransition:S,unstable_defaultShouldRevalidate:O});M&&d!==!1?g.startTransition(()=>J()):J()};return g.createElement("form",{ref:Y,method:P,action:Z,onSubmit:c?v:te,...q,"data-discover":!L&&o==="render"?"true":void 0})});M1.displayName="Form";function _1(o){return`${o} must be used within a data router.  See https://reactrouter.com/en/main/routers/picking-a-router.`}function ch(o){let u=g.useContext(Jn);return Be(u,_1(o)),u}function R1(o,{target:u,replace:d,unstable_mask:c,state:m,preventScrollReset:p,relative:h,viewTransition:w,unstable_defaultShouldRevalidate:v,unstable_useTransitions:b}={}){let z=qa(),S=da(),O=Kl(o,{relative:h});return g.useCallback(q=>{if(d1(q,u)){q.preventDefault();let Y=d!==void 0?d:Zl(S)===Zl(O),M=()=>z(o,{replace:Y,unstable_mask:c,state:m,preventScrollReset:p,relative:h,viewTransition:w,unstable_defaultShouldRevalidate:v});b?g.startTransition(()=>M()):M()}},[S,z,O,d,c,m,u,o,p,h,w,v,b])}var O1=0,D1=()=>`__${String(++O1)}__`;function U1(){let{router:o}=ch("useSubmit"),{basename:u}=g.useContext(Nt),d=e1(),c=o.fetch,m=o.navigate;return g.useCallback(async(p,h={})=>{let{action:w,method:v,encType:b,formData:z,body:S}=h1(p,u);if(h.navigate===!1){let O=h.fetcherKey||D1();await c(O,d,h.action||w,{unstable_defaultShouldRevalidate:h.unstable_defaultShouldRevalidate,preventScrollReset:h.preventScrollReset,formData:z,body:S,formMethod:h.method||v,formEncType:h.encType||b,flushSync:h.flushSync})}else await m(h.action||w,{unstable_defaultShouldRevalidate:h.unstable_defaultShouldRevalidate,preventScrollReset:h.preventScrollReset,formData:z,body:S,formMethod:h.method||v,formEncType:h.encType||b,replace:h.replace,state:h.state,fromRouteId:d,flushSync:h.flushSync,viewTransition:h.viewTransition})},[c,m,u,d])}function H1(o,{relative:u}={}){let{basename:d}=g.useContext(Nt),c=g.useContext(qt);Be(c,"useFormAction must be used inside a RouteContext");let[m]=c.matches.slice(-1),p={...Kl(o||".",{relative:u})},h=da();if(o==null){p.search=h.search;let w=new URLSearchParams(p.search),v=w.getAll("index");if(v.some(z=>z==="")){w.delete("index"),v.filter(S=>S).forEach(S=>w.append("index",S));let z=w.toString();p.search=z?`?${z}`:""}}return(!o||o===".")&&m.route.index&&(p.search=p.search?p.search.replace(/^\?/,"?index&"):"?index"),d!=="/"&&(p.pathname=p.pathname==="/"?d:Xt([d,p.pathname])),Zl(p)}function B1(o,{relative:u}={}){let d=g.useContext(Pm);Be(d!=null,"`useViewTransitionState` must be used within `react-router-dom`'s `RouterProvider`.  Did you accidentally import `RouterProvider` from `react-router`?");let{basename:c}=ch("useViewTransitionState"),m=Kl(o,{relative:u});if(!d.isTransitioning)return!1;let p=ua(d.currentLocation.pathname,c)||d.currentLocation.pathname,h=ua(d.nextLocation.pathname,c)||d.nextLocation.pathname;return yr(m.pathname,h)!=null||yr(m.pathname,p)!=null}const uh=g.createContext(null),sn=()=>{const o=g.useContext(uh);if(!o)throw new Error("useAuth must be used within an AuthProvider");return o};const dh=(...o)=>o.filter((u,d,c)=>!!u&&u.trim()!==""&&c.indexOf(u)===d).join(" ").trim();const q1=o=>o.replace(/([a-z0-9])([A-Z])/g,"$1-$2").toLowerCase();const L1=o=>o.replace(/^([A-Z])|[\s-_]+(\w)/g,(u,d,c)=>c?c.toUpperCase():d.toLowerCase());const Hm=o=>{const u=L1(o);return u.charAt(0).toUpperCase()+u.slice(1)};var Y1={xmlns:"http://www.w3.org/2000/svg",width:24,height:24,viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:2,strokeLinecap:"round",strokeLinejoin:"round"};const G1=o=>{for(const u in o)if(u.startsWith("aria-")||u==="role"||u==="title")return!0;return!1};const V1=g.forwardRef(({color:o="currentColor",size:u=24,strokeWidth:d=2,absoluteStrokeWidth:c,className:m="",children:p,iconNode:h,...w},v)=>g.createElement("svg",{ref:v,...Y1,width:u,height:u,stroke:o,strokeWidth:c?Number(d)*24/Number(u):d,className:dh("lucide",m),...!p&&!G1(w)&&{"aria-hidden":"true"},...w},[...h.map(([b,z])=>g.createElement(b,z)),...Array.isArray(p)?p:[p]]));const oe=(o,u)=>{const d=g.forwardRef(({className:c,...m},p)=>g.createElement(V1,{ref:p,iconNode:u,className:dh(`lucide-${q1(Hm(o))}`,`lucide-${o}`,c),...m}));return d.displayName=Hm(o),d};const X1=[["path",{d:"m12 19-7-7 7-7",key:"1l729n"}],["path",{d:"M19 12H5",key:"x3x0zl"}]],Q1=oe("arrow-left",X1);const Z1=[["path",{d:"M5 12h14",key:"1ays0h"}],["path",{d:"m12 5 7 7-7 7",key:"xquz4c"}]],on=oe("arrow-right",Z1);const $1=[["path",{d:"M12 7v14",key:"1akyts"}],["path",{d:"M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z",key:"ruj8y"}]],Qt=oe("book-open",$1);const J1=[["path",{d:"M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H19a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H6.5a1 1 0 0 1 0-5H20",key:"k3hazp"}],["path",{d:"M8 11h8",key:"vwpz6n"}],["path",{d:"M8 7h6",key:"1f0q6e"}]],K1=oe("book-text",J1);const W1=[["path",{d:"M17 3a2 2 0 0 1 2 2v15a1 1 0 0 1-1.496.868l-4.512-2.578a2 2 0 0 0-1.984 0l-4.512 2.578A1 1 0 0 1 5 20V5a2 2 0 0 1 2-2z",key:"oz39mx"}]],F1=oe("bookmark",W1);const I1=[["path",{d:"M20 6 9 17l-5-5",key:"1gmf2c"}]],pc=oe("check",I1);const P1=[["path",{d:"m6 9 6 6 6-6",key:"qrunsl"}]],fh=oe("chevron-down",P1);const eb=[["path",{d:"m15 18-6-6 6-6",key:"1wnfg3"}]],tb=oe("chevron-left",eb);const ab=[["path",{d:"m9 18 6-6-6-6",key:"mthhwq"}]],nb=oe("chevron-right",ab);const lb=[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}]],ib=oe("circle",lb);const rb=[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["path",{d:"M12 6v6l4 2",key:"mmk7yg"}]],mh=oe("clock",rb);const ob=[["rect",{width:"14",height:"14",x:"8",y:"8",rx:"2",ry:"2",key:"17jyea"}],["path",{d:"M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2",key:"zix9uf"}]],sb=oe("copy",ob);const cb=[["circle",{cx:"12",cy:"12",r:"1",key:"41hilf"}],["circle",{cx:"12",cy:"5",r:"1",key:"gxeob9"}],["circle",{cx:"12",cy:"19",r:"1",key:"lyex9k"}]],ub=oe("ellipsis-vertical",cb);const db=[["path",{d:"M10.733 5.076a10.744 10.744 0 0 1 11.205 6.575 1 1 0 0 1 0 .696 10.747 10.747 0 0 1-1.444 2.49",key:"ct8e1f"}],["path",{d:"M14.084 14.158a3 3 0 0 1-4.242-4.242",key:"151rxh"}],["path",{d:"M17.479 17.499a10.75 10.75 0 0 1-15.417-5.151 1 1 0 0 1 0-.696 10.75 10.75 0 0 1 4.446-5.143",key:"13bj9a"}],["path",{d:"m2 2 20 20",key:"1ooewy"}]],hh=oe("eye-off",db);const fb=[["path",{d:"M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0",key:"1nclc0"}],["circle",{cx:"12",cy:"12",r:"3",key:"1v7zrd"}]],ph=oe("eye",fb);const mb=[["path",{d:"M12 3q1 4 4 6.5t3 5.5a1 1 0 0 1-14 0 5 5 0 0 1 1-3 1 1 0 0 0 5 0c0-2-1.5-3-1.5-5q0-2 2.5-4",key:"1slcih"}]],hb=oe("flame",mb);const pb=[["path",{d:"M19.414 14.414C21 12.828 22 11.5 22 9.5a5.5 5.5 0 0 0-9.591-3.676.6.6 0 0 1-.818.001A5.5 5.5 0 0 0 2 9.5c0 2.3 1.5 4 3 5.5l5.535 5.362a2 2 0 0 0 2.879.052 2.12 2.12 0 0 0-.004-3 2.124 2.124 0 1 0 3-3 2.124 2.124 0 0 0 3.004 0 2 2 0 0 0 0-2.828l-1.881-1.882a2.41 2.41 0 0 0-3.409 0l-1.71 1.71a2 2 0 0 1-2.828 0 2 2 0 0 1 0-2.828l2.823-2.762",key:"17lmqv"}]],gh=oe("heart-handshake",pb);const gb=[["path",{d:"M2 9.5a5.5 5.5 0 0 1 9.591-3.676.56.56 0 0 0 .818 0A5.49 5.49 0 0 1 22 9.5c0 2.29-1.5 4-3 5.5l-5.492 5.313a2 2 0 0 1-3 .019L5 15c-1.5-1.5-3-3.2-3-5.5",key:"mvr1a0"}]],Ba=oe("heart",gb);const bb=[["path",{d:"M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8",key:"5wwlr5"}],["path",{d:"M3 10a2 2 0 0 1 .709-1.528l7-6a2 2 0 0 1 2.582 0l7 6A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z",key:"r6nss1"}]],bh=oe("house",bb);const yb=[["path",{d:"M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5",key:"1gvzjb"}],["path",{d:"M9 18h6",key:"x1upvd"}],["path",{d:"M10 22h4",key:"ceow96"}]],vb=oe("lightbulb",yb);const xb=[["path",{d:"M21 12a9 9 0 1 1-6.219-8.56",key:"13zald"}]],Bm=oe("loader-circle",xb);const jb=[["rect",{width:"18",height:"11",x:"3",y:"11",rx:"2",ry:"2",key:"1w4ew1"}],["path",{d:"M7 11V7a5 5 0 0 1 10 0v4",key:"fwvmzm"}]],lc=oe("lock",jb);const Sb=[["path",{d:"m16 17 5-5-5-5",key:"1bji2h"}],["path",{d:"M21 12H9",key:"dn1m92"}],["path",{d:"M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4",key:"1uf3rs"}]],yh=oe("log-out",Sb);const wb=[["path",{d:"m22 7-8.991 5.727a2 2 0 0 1-2.009 0L2 7",key:"132q7q"}],["rect",{x:"2",y:"4",width:"20",height:"16",rx:"2",key:"izxlao"}]],vh=oe("mail",wb);const Nb=[["path",{d:"M4 5h16",key:"1tepv9"}],["path",{d:"M4 12h16",key:"1lakjw"}],["path",{d:"M4 19h16",key:"1djgab"}]],zb=oe("menu",Nb);const Eb=[["path",{d:"M2.992 16.342a2 2 0 0 1 .094 1.167l-1.065 3.29a1 1 0 0 0 1.236 1.168l3.413-.998a2 2 0 0 1 1.099.092 10 10 0 1 0-4.777-4.719",key:"1sd12s"}]],gc=oe("message-circle",Eb);const Ab=[["path",{d:"M22 17a2 2 0 0 1-2 2H6.828a2 2 0 0 0-1.414.586l-2.202 2.202A.71.71 0 0 1 2 21.286V5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2z",key:"18887p"}]],xr=oe("message-square",Ab);const Tb=[["path",{d:"M12 19v3",key:"npa21l"}],["path",{d:"M15 9.34V5a3 3 0 0 0-5.68-1.33",key:"1gzdoj"}],["path",{d:"M16.95 16.95A7 7 0 0 1 5 12v-2",key:"cqa7eg"}],["path",{d:"M18.89 13.23A7 7 0 0 0 19 12v-2",key:"16hl24"}],["path",{d:"m2 2 20 20",key:"1ooewy"}],["path",{d:"M9 9v3a3 3 0 0 0 5.12 2.12",key:"r2i35w"}]],kb=oe("mic-off",Tb);const Cb=[["path",{d:"M12 19v3",key:"npa21l"}],["path",{d:"M19 10v2a7 7 0 0 1-14 0v-2",key:"1vc78b"}],["rect",{x:"9",y:"2",width:"6",height:"13",rx:"3",key:"s6n7sd"}]],xh=oe("mic",Cb);const Mb=[["path",{d:"M10.1 13.9a14 14 0 0 0 3.732 2.668 1 1 0 0 0 1.213-.303l.355-.465A2 2 0 0 1 17 15h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2 18 18 0 0 1-12.728-5.272",key:"1wngk7"}],["path",{d:"M22 2 2 22",key:"y4kqgn"}],["path",{d:"M4.76 13.582A18 18 0 0 1 2 4a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v3a2 2 0 0 1-.8 1.6l-.468.351a1 1 0 0 0-.292 1.233 14 14 0 0 0 .244.473",key:"10hv5p"}]],qm=oe("phone-off",Mb);const _b=[["path",{d:"M13.832 16.568a1 1 0 0 0 1.213-.303l.355-.465A2 2 0 0 1 17 15h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2A18 18 0 0 1 2 4a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v3a2 2 0 0 1-.8 1.6l-.468.351a1 1 0 0 0-.292 1.233 14 14 0 0 0 6.392 6.384",key:"9njp5v"}]],jh=oe("phone",_b);const Rb=[["path",{d:"M5 5a2 2 0 0 1 3.008-1.728l11.997 6.998a2 2 0 0 1 .003 3.458l-12 7A2 2 0 0 1 5 19z",key:"10ikf1"}]],Sh=oe("play",Rb);const Ob=[["path",{d:"M5 12h14",key:"1ays0h"}],["path",{d:"M12 5v14",key:"s699le"}]],Db=oe("plus",Ob);const Ub=[["path",{d:"M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8",key:"v9h5vc"}],["path",{d:"M21 3v5h-5",key:"1q7to0"}],["path",{d:"M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16",key:"3uifl3"}],["path",{d:"M8 16H3v5",key:"1cv678"}]],Hb=oe("refresh-cw",Ub);const Bb=[["path",{d:"M19 17V5a2 2 0 0 0-2-2H4",key:"zz82l3"}],["path",{d:"M8 21h12a2 2 0 0 0 2-2v-1a1 1 0 0 0-1-1H11a1 1 0 0 0-1 1v1a2 2 0 1 1-4 0V5a2 2 0 1 0-4 0v2a1 1 0 0 0 1 1h3",key:"1ph1d7"}]],Lm=oe("scroll",Bb);const qb=[["path",{d:"m21 21-4.34-4.34",key:"14j7rj"}],["circle",{cx:"11",cy:"11",r:"8",key:"4ej97u"}]],ic=oe("search",qb);const Lb=[["path",{d:"M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11z",key:"1ffxy3"}],["path",{d:"m21.854 2.147-10.94 10.939",key:"12cjpa"}]],Yb=oe("send",Lb);const Gb=[["path",{d:"M9.671 4.136a2.34 2.34 0 0 1 4.659 0 2.34 2.34 0 0 0 3.319 1.915 2.34 2.34 0 0 1 2.33 4.033 2.34 2.34 0 0 0 0 3.831 2.34 2.34 0 0 1-2.33 4.033 2.34 2.34 0 0 0-3.319 1.915 2.34 2.34 0 0 1-4.659 0 2.34 2.34 0 0 0-3.32-1.915 2.34 2.34 0 0 1-2.33-4.033 2.34 2.34 0 0 0 0-3.831A2.34 2.34 0 0 1 6.35 6.051a2.34 2.34 0 0 0 3.319-1.915",key:"1i5ecw"}],["circle",{cx:"12",cy:"12",r:"3",key:"1v7zrd"}]],Vb=oe("settings",Gb);const Xb=[["circle",{cx:"18",cy:"5",r:"3",key:"gq8acd"}],["circle",{cx:"6",cy:"12",r:"3",key:"w7nqdw"}],["circle",{cx:"18",cy:"19",r:"3",key:"1xt0gg"}],["line",{x1:"8.59",x2:"15.42",y1:"13.51",y2:"17.49",key:"47mynk"}],["line",{x1:"15.41",x2:"8.59",y1:"6.51",y2:"10.49",key:"1n3mei"}]],Qb=oe("share-2",Xb);const Zb=[["path",{d:"M11.017 2.814a1 1 0 0 1 1.966 0l1.051 5.558a2 2 0 0 0 1.594 1.594l5.558 1.051a1 1 0 0 1 0 1.966l-5.558 1.051a2 2 0 0 0-1.594 1.594l-1.051 5.558a1 1 0 0 1-1.966 0l-1.051-5.558a2 2 0 0 0-1.594-1.594l-5.558-1.051a1 1 0 0 1 0-1.966l5.558-1.051a2 2 0 0 0 1.594-1.594z",key:"1s2grr"}],["path",{d:"M20 2v4",key:"1rf3ol"}],["path",{d:"M22 4h-4",key:"gwowj6"}],["circle",{cx:"4",cy:"20",r:"2",key:"6kqj1y"}]],Ye=oe("sparkles",Zb);const $b=[["circle",{cx:"12",cy:"12",r:"4",key:"4exip2"}],["path",{d:"M12 2v2",key:"tus03m"}],["path",{d:"M12 20v2",key:"1lh1kg"}],["path",{d:"m4.93 4.93 1.41 1.41",key:"149t6j"}],["path",{d:"m17.66 17.66 1.41 1.41",key:"ptbguv"}],["path",{d:"M2 12h2",key:"1t8f8n"}],["path",{d:"M20 12h2",key:"1q8mjw"}],["path",{d:"m6.34 17.66-1.41 1.41",key:"1m8zz5"}],["path",{d:"m19.07 4.93-1.41 1.41",key:"1shlcs"}]],$l=oe("sun",$b);const Jb=[["path",{d:"m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3",key:"wmoenq"}],["path",{d:"M12 9v4",key:"juzpu7"}],["path",{d:"M12 17h.01",key:"p32p05"}]],Kb=oe("triangle-alert",Jb);const Wb=[["path",{d:"M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2",key:"975kel"}],["circle",{cx:"12",cy:"7",r:"4",key:"17ys0d"}]],wh=oe("user",Wb);const Fb=[["path",{d:"M11 4.702a.705.705 0 0 0-1.203-.498L6.413 7.587A1.4 1.4 0 0 1 5.416 8H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2.416a1.4 1.4 0 0 1 .997.413l3.383 3.384A.705.705 0 0 0 11 19.298z",key:"uqj9uw"}],["path",{d:"M16 9a5 5 0 0 1 0 6",key:"1q6k2b"}],["path",{d:"M19.364 18.364a9 9 0 0 0 0-12.728",key:"ijwkga"}]],bc=oe("volume-2",Fb);const Ib=[["path",{d:"M11 4.702a.705.705 0 0 0-1.203-.498L6.413 7.587A1.4 1.4 0 0 1 5.416 8H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2.416a1.4 1.4 0 0 1 .997.413l3.383 3.384A.705.705 0 0 0 11 19.298z",key:"uqj9uw"}],["line",{x1:"22",x2:"16",y1:"9",y2:"15",key:"1ewh16"}],["line",{x1:"16",x2:"22",y1:"9",y2:"15",key:"5ykzw1"}]],Pb=oe("volume-x",Ib);const ey=[["path",{d:"M18 6 6 18",key:"1bl5f8"}],["path",{d:"m6 6 12 12",key:"d8bk6v"}]],rc=oe("x",ey);class ty extends g.Component{constructor(u){super(u),this.state={hasError:!1,error:null,errorInfo:null}}static getDerivedStateFromError(){return{hasError:!0}}componentDidCatch(u,d){console.error("ErrorBoundary caught an error:",u,d),this.setState({error:u,errorInfo:d})}handleReset=()=>{this.setState({hasError:!1,error:null,errorInfo:null})};render(){return this.state.hasError?r.jsxs("div",{className:"error-boundary",children:[r.jsxs("div",{className:"error-content",children:[r.jsx("div",{className:"error-icon",children:r.jsx(Kb,{size:48})}),r.jsx("h1",{children:"Something went wrong"}),r.jsx("p",{children:"We apologize for the inconvenience. Please try again."}),this.props.showReset&&r.jsxs("div",{className:"error-actions",children:[r.jsxs("button",{onClick:this.handleReset,className:"btn-reset",children:[r.jsx(Hb,{size:18}),"Try Again"]}),r.jsxs(Ha,{to:"/app/home",className:"btn-home",children:[r.jsx(bh,{size:18}),"Go Home"]})]}),!1]}),r.jsx("style",{children:`
            .error-boundary {
              display: flex;
              align-items: center;
              justify-content: center;
              min-height: 100vh;
              padding: 2rem;
              background: linear-gradient(135deg, #0f0f14 0%, #1a1a2e 100%);
            }
            
            .error-content {
              text-align: center;
              max-width: 500px;
            }
            
            .error-icon {
              width: 80px;
              height: 80px;
              margin: 0 auto 1.5rem;
              background: rgba(239, 68, 68, 0.15);
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              color: #ef4444;
            }
            
            .error-content h1 {
              font-size: 1.75rem;
              font-weight: 700;
              color: #f5f5f5;
              margin: 0 0 0.75rem;
            }
            
            .error-content p {
              color: #888;
              margin: 0 0 2rem;
              line-height: 1.6;
            }
            
            .error-actions {
              display: flex;
              gap: 1rem;
              justify-content: center;
              flex-wrap: wrap;
            }
            
            .btn-reset, .btn-home {
              display: inline-flex;
              align-items: center;
              gap: 0.5rem;
              padding: 0.75rem 1.5rem;
              border-radius: 12px;
              font-weight: 600;
              font-size: 0.95rem;
              text-decoration: none;
              cursor: pointer;
              transition: all 0.2s;
              border: none;
            }
            
            .btn-reset {
              background: linear-gradient(135deg, #6366f1, #4f46e5);
              color: white;
            }
            
            .btn-reset:hover {
              background: linear-gradient(135deg, #818cf8, #6366f1);
              transform: translateY(-2px);
            }
            
            .btn-home {
              background: rgba(255, 255, 255, 0.1);
              color: #f5f5f5;
              border: 1px solid rgba(255, 255, 255, 0.15);
            }
            
            .btn-home:hover {
              background: rgba(255, 255, 255, 0.15);
              transform: translateY(-2px);
            }
            
            .error-details {
              margin-top: 2rem;
              text-align: left;
              background: rgba(0, 0, 0, 0.3);
              border-radius: 12px;
              padding: 1rem;
              color: #888;
              font-size: 0.8rem;
            }
            
            .error-details summary {
              cursor: pointer;
              font-weight: 600;
              margin-bottom: 0.5rem;
            }
            
            .error-details pre {
              overflow-x: auto;
              padding: 0.5rem;
              background: rgba(0, 0, 0, 0.5);
              border-radius: 8px;
              font-size: 0.75rem;
            }
          `})]}):this.props.children}}const ay=()=>{const[o,u]=g.useState({x:0,y:0});return g.useEffect(()=>{const d=c=>{u({x:(c.clientX/window.innerWidth-.5)*20,y:(c.clientY/window.innerHeight-.5)*20})};return window.addEventListener("mousemove",d),()=>window.removeEventListener("mousemove",d)},[]),r.jsxs("div",{className:"bg-container",children:[r.jsx("div",{className:"orb orb-1",style:{transform:`translate(${o.x*.5}px, ${o.y*.5}px)`}}),r.jsx("div",{className:"orb orb-2",style:{transform:`translate(${-o.x*.3}px, ${-o.y*.3}px)`}}),r.jsx("div",{className:"grid-overlay"})]})},ny=()=>{const o=qa(),[u,d]=g.useState(""),[c,m]=g.useState(null),[p,h]=g.useState(!1);g.useEffect(()=>(document.body.style.backgroundColor="#0a0a0f",()=>{document.body.style.backgroundColor=""}),[]);const w=[{icon:r.jsx(gc,{size:24}),title:"AI Spiritual Guide",description:"Chat with an AI companion about faith, scripture, and life's questions."},{icon:r.jsx(Qt,{size:24}),title:"Digital Bible",description:"Access the complete Bible with searchable verses and AI-powered insights."},{icon:r.jsx(Ba,{size:24}),title:"Emotional Support",description:"Find comfort and encouragement during difficult times with compassionate AI."},{icon:r.jsx(Ye,{size:24}),title:"Daily Devotion",description:"Start your day with personalized prayers and scripture reflections."}],v=[{question:"How does Aria work?",answer:"Aria uses advanced AI to have natural conversations about faith and scripture. It combines technology with biblical wisdom to provide personalized guidance."},{question:"Is my data private?",answer:"Yes. Your conversations are encrypted and we never share your personal data. You can delete your data at any time."},{question:"Is there a free plan?",answer:"Yes! Our free tier includes 5 AI conversations per day and basic Bible search. No credit card required."}],b=z=>{z.preventDefault(),u&&(h(!0),d(""))};return r.jsxs("div",{className:"landing-page",children:[r.jsx(ay,{}),r.jsx("nav",{className:"nav",children:r.jsxs("div",{className:"nav-container",children:[r.jsxs("div",{className:"nav-brand",onClick:()=>o("/"),children:[r.jsx("div",{className:"brand-icon",children:r.jsx(Ye,{size:20})}),r.jsx("span",{className:"brand-name",children:"Aria"})]}),r.jsxs("div",{className:"nav-links",children:[r.jsx("a",{href:"#features",children:"Features"}),r.jsx("a",{href:"#faq",children:"FAQ"})]}),r.jsxs("div",{className:"nav-actions",children:[r.jsx("button",{className:"btn btn-ghost",onClick:()=>o("/login"),children:"Sign In"}),r.jsx("button",{className:"btn btn-primary",onClick:()=>o("/register"),children:"Get Started"})]})]})}),r.jsx("section",{className:"hero",children:r.jsxs("div",{className:"hero-content",children:[r.jsxs("div",{className:"hero-badge",children:[r.jsx(Ye,{size:14}),r.jsx("span",{children:"Your AI Spiritual Companion"})]}),r.jsxs("h1",{className:"hero-title",children:["Where Faith Meets"," ",r.jsx("span",{className:"gradient-text",children:"Artificial Intelligence"})]}),r.jsx("p",{className:"hero-subtitle",children:"Experience your faith in a new dimension. Have meaningful conversations, study scripture with AI insights, and find spiritual guidance whenever you need it."}),r.jsxs("div",{className:"hero-ctas",children:[r.jsxs("button",{className:"btn btn-primary btn-lg",onClick:()=>o("/register"),children:["Start Free ",r.jsx(on,{size:18})]}),r.jsx("button",{className:"btn btn-outline btn-lg",onClick:()=>o("/login"),children:"Sign In"})]}),r.jsxs("div",{className:"hero-stats",children:[r.jsxs("div",{className:"stat",children:[r.jsx("span",{className:"stat-value",children:"24/7"}),r.jsx("span",{className:"stat-label",children:"AI Available"})]}),r.jsxs("div",{className:"stat",children:[r.jsx("span",{className:"stat-value",children:"66+"}),r.jsx("span",{className:"stat-label",children:"Bible Books"})]}),r.jsxs("div",{className:"stat",children:[r.jsx("span",{className:"stat-value",children:"Free"}),r.jsx("span",{className:"stat-label",children:"To Start"})]})]})]})}),r.jsx("section",{id:"features",className:"features",children:r.jsxs("div",{className:"container",children:[r.jsxs("div",{className:"section-header",children:[r.jsx("span",{className:"section-tag",children:"Features"}),r.jsx("h2",{children:"Everything You Need for Your Spiritual Journey"}),r.jsx("p",{children:"Powerful features designed to deepen your faith in the digital age."})]}),r.jsx("div",{className:"features-grid",children:w.map((z,S)=>r.jsxs("div",{className:"feature-card",children:[r.jsx("div",{className:"feature-icon",children:z.icon}),r.jsx("h3",{children:z.title}),r.jsx("p",{children:z.description})]},S))})]})}),r.jsx("section",{className:"cta",children:r.jsx("div",{className:"container",children:r.jsxs("div",{className:"cta-content",children:[r.jsx("h2",{children:"Begin Your Spiritual Journey Today"}),r.jsx("p",{children:"Join thousands who have discovered a new way to connect with their faith. Start for free."}),r.jsx("div",{className:"cta-buttons",children:r.jsxs("button",{className:"btn btn-primary btn-lg",onClick:()=>o("/register"),children:["Create Free Account ",r.jsx(on,{size:18})]})})]})})}),r.jsx("section",{id:"faq",className:"faq",children:r.jsxs("div",{className:"container",children:[r.jsxs("div",{className:"section-header",children:[r.jsx("span",{className:"section-tag",children:"FAQ"}),r.jsx("h2",{children:"Frequently Asked Questions"})]}),r.jsx("div",{className:"faq-list",children:v.map((z,S)=>r.jsxs("div",{className:`faq-item ${c===S?"active":""}`,onClick:()=>m(c===S?null:S),children:[r.jsxs("div",{className:"faq-question",children:[r.jsx("span",{children:z.question}),r.jsx(fh,{size:20,className:"faq-icon"})]}),c===S&&r.jsx("div",{className:"faq-answer",children:r.jsx("p",{children:z.answer})})]},S))})]})}),r.jsx("section",{className:"newsletter",children:r.jsx("div",{className:"container",children:r.jsxs("div",{className:"newsletter-content",children:[r.jsxs("div",{className:"newsletter-text",children:[r.jsx("h3",{children:"Stay Connected"}),r.jsx("p",{children:"Get weekly spiritual insights and updates"})]}),r.jsx("form",{className:"newsletter-form",onSubmit:b,children:p?r.jsxs("div",{className:"subscribed-message",children:[r.jsx(pc,{size:20})," Thanks for subscribing!"]}):r.jsxs(r.Fragment,{children:[r.jsx("input",{type:"email",placeholder:"Enter your email",value:u,onChange:z=>d(z.target.value),required:!0}),r.jsx("button",{type:"submit",className:"btn btn-primary",children:"Subscribe"})]})})]})})}),r.jsx("footer",{className:"footer",children:r.jsxs("div",{className:"container",children:[r.jsxs("div",{className:"footer-brand",children:[r.jsxs("div",{className:"nav-brand",children:[r.jsx("div",{className:"brand-icon",children:r.jsx(Ye,{size:20})}),r.jsx("span",{className:"brand-name",children:"Aria"})]}),r.jsx("p",{children:"Pioneering the intersection of faith and technology."})]}),r.jsx("div",{className:"footer-bottom",children:r.jsx("p",{children:"© 2024 Aria. All rights reserved."})})]})}),r.jsx("style",{children:`
        :root {
          --primary: #c9a227;
          --primary-light: #e6c455;
          --primary-dark: #a68520;
          --bg-dark: #0a0a0f;
          --bg-card: #141418;
          --text: #f5f5f5;
          --text-muted: #888;
          --border: rgba(255, 255, 255, 0.1);
        }

        html, body {
          margin: 0;
          padding: 0;
          width: 100%;
          height: 100%;
          overflow-x: hidden;
        }

        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        body {
          background: var(--bg-dark) !important;
          color: var(--text);
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          line-height: 1.6;
        }

        .landing-page {
          min-height: 100vh;
          width: 100%;
          position: relative;
          overflow-x: hidden;
        }

        .bg-container {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          z-index: 0;
          overflow: hidden;
        }

        .orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          opacity: 0.4;
          transition: transform 0.3s ease-out;
        }

        .orb-1 {
          width: 600px;
          height: 600px;
          background: radial-gradient(circle, var(--primary-dark) 0%, transparent 70%);
          top: -200px;
          right: -100px;
        }

        .orb-2 {
          width: 400px;
          height: 400px;
          background: radial-gradient(circle, rgba(100, 100, 150, 0.3) 0%, transparent 70%);
          bottom: -100px;
          left: -100px;
        }

        .grid-overlay {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-image: 
            linear-gradient(rgba(255, 255, 255, 0.02) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 255, 255, 0.02) 1px, transparent 1px);
          background-size: 50px 50px;
        }

        .container {
          max-width: 1100px;
          width: 100%;
          margin: 0 auto;
          padding: 0 2rem;
          box-sizing: border-box;
        }

        /* Navigation */
        .nav {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 100;
          background: rgba(10, 10, 15, 0.8);
          backdrop-filter: blur(20px);
          border-bottom: 1px solid var(--border);
        }

        .nav-container {
          max-width: 1100px;
          margin: 0 auto;
          padding: 1rem 2rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .nav-brand {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          cursor: pointer;
        }

        .brand-icon {
          width: 38px;
          height: 38px;
          background: linear-gradient(135deg, var(--primary), var(--primary-dark));
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #0a0a0f;
        }

        .brand-name {
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--text);
        }

        .nav-links {
          display: flex;
          gap: 2rem;
        }

        .nav-links a {
          color: var(--text-muted);
          text-decoration: none;
          font-weight: 500;
          transition: color 0.2s;
        }

        .nav-links a:hover {
          color: var(--primary-light);
        }

        .nav-actions {
          display: flex;
          gap: 1rem;
        }

        /* Buttons */
        .btn {
          padding: 0.75rem 1.5rem;
          border-radius: 10px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          font-size: 0.95rem;
          border: none;
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
        }

        .btn-primary {
          background: linear-gradient(135deg, var(--primary), var(--primary-dark));
          color: #0a0a0f;
        }

        .btn-primary:hover {
          background: linear-gradient(135deg, var(--primary-light), var(--primary));
          transform: translateY(-1px);
        }

        .btn-ghost {
          background: transparent;
          border: 1px solid var(--border);
          color: var(--text);
        }

        .btn-ghost:hover {
          background: rgba(255, 255, 255, 0.05);
        }

        .btn-outline {
          background: transparent;
          border: 1px solid var(--border);
          color: var(--text);
        }

        .btn-outline:hover {
          background: rgba(255, 255, 255, 0.05);
          border-color: rgba(255, 255, 255, 0.2);
        }

        .btn-lg {
          padding: 1rem 1.75rem;
          font-size: 1rem;
        }

        /* Hero */
        .hero {
          position: relative;
          z-index: 1;
          min-height: 100vh;
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 6rem 2rem 4rem;
        }

        .hero-content {
          text-align: center;
          max-width: 700px;
          width: 100%;
        }

        .hero-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          background: rgba(201, 162, 39, 0.1);
          border: 1px solid rgba(201, 162, 39, 0.2);
          border-radius: 2rem;
          color: var(--primary-light);
          margin-bottom: 1.5rem;
          font-size: 0.875rem;
        }

        .hero-title {
          font-size: clamp(2.5rem, 5vw, 3.5rem);
          font-weight: 800;
          line-height: 1.15;
          margin-bottom: 1.5rem;
        }

        .gradient-text {
          background: linear-gradient(135deg, var(--primary-light) 0%, var(--primary) 50%, var(--primary-light) 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-size: 200% auto;
          animation: shimmer 3s linear infinite;
        }

        @keyframes shimmer {
          to { background-position: 200% center; }
        }

        .hero-subtitle {
          font-size: 1.2rem;
          color: var(--text-muted);
          margin-bottom: 2rem;
          line-height: 1.7;
        }

        .hero-ctas {
          display: flex;
          gap: 1rem;
          justify-content: center;
          margin-bottom: 3rem;
          flex-wrap: wrap;
        }

        .hero-stats {
          display: flex;
          gap: 3rem;
          justify-content: center;
          padding-top: 2rem;
          border-top: 1px solid var(--border);
        }

        .stat {
          display: flex;
          flex-direction: column;
        }

        .stat-value {
          font-size: 1.75rem;
          font-weight: 700;
          color: var(--primary);
        }

        .stat-label {
          font-size: 0.875rem;
          color: var(--text-muted);
        }

        /* Features */
        .features {
          position: relative;
          z-index: 1;
          padding: 6rem 2rem;
          background: rgba(0, 0, 0, 0.3);
          width: 100%;
        }

        .section-header {
          text-align: center;
          margin-bottom: 3rem;
        }

        .section-tag {
          display: inline-block;
          padding: 0.4rem 0.9rem;
          background: rgba(201, 162, 39, 0.1);
          border: 1px solid rgba(201, 162, 39, 0.2);
          border-radius: 2rem;
          color: var(--primary);
          font-size: 0.8rem;
          font-weight: 500;
          margin-bottom: 1rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .section-header h2 {
          font-size: 2.25rem;
          font-weight: 700;
          margin-bottom: 0.75rem;
        }

        .section-header p {
          color: var(--text-muted);
          font-size: 1.1rem;
        }

        .features-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1.5rem;
        }

        .feature-card {
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: 16px;
          padding: 1.75rem;
          transition: all 0.2s;
        }

        .feature-card:hover {
          border-color: rgba(201, 162, 39, 0.3);
          transform: translateY(-2px);
        }

        .feature-icon {
          width: 48px;
          height: 48px;
          background: rgba(201, 162, 39, 0.1);
          border: 1px solid rgba(201, 162, 39, 0.2);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--primary);
          margin-bottom: 1.25rem;
        }

        .feature-card h3 {
          font-size: 1.15rem;
          font-weight: 600;
          margin-bottom: 0.5rem;
        }

        .feature-card p {
          color: var(--text-muted);
          font-size: 0.95rem;
          line-height: 1.6;
        }

        /* CTA */
        .cta {
          position: relative;
          z-index: 1;
          padding: 6rem 2rem;
          width: 100%;
        }

        .cta-content {
          text-align: center;
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: 24px;
          padding: 4rem 2rem;
        }

        .cta-content h2 {
          font-size: 2rem;
          font-weight: 700;
          margin-bottom: 0.75rem;
        }

        .cta-content p {
          color: var(--text-muted);
          font-size: 1.1rem;
          margin-bottom: 2rem;
          max-width: 450px;
          margin-left: auto;
          margin-right: auto;
        }

        .cta-buttons {
          display: flex;
          gap: 1rem;
          justify-content: center;
        }

        /* FAQ */
        .faq {
          position: relative;
          z-index: 1;
          padding: 6rem 2rem;
          background: rgba(0, 0, 0, 0.3);
          width: 100%;
        }

        .faq-list {
          max-width: 700px;
          margin: 0 auto;
        }

        .faq-item {
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: 12px;
          margin-bottom: 0.75rem;
          overflow: hidden;
          cursor: pointer;
          transition: all 0.2s;
        }

        .faq-item:hover {
          border-color: rgba(201, 162, 39, 0.2);
        }

        .faq-item.active {
          border-color: rgba(201, 162, 39, 0.3);
        }

        .faq-question {
          padding: 1.25rem 1.5rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-weight: 500;
        }

        .faq-icon {
          transition: transform 0.2s;
          color: var(--text-muted);
        }

        .faq-item.active .faq-icon {
          transform: rotate(180deg);
        }

        .faq-answer {
          padding: 0 1.5rem 1.25rem;
        }

        .faq-answer p {
          color: var(--text-muted);
          line-height: 1.7;
        }

        /* Newsletter */
        .newsletter {
          position: relative;
          z-index: 1;
          padding: 4rem 2rem;
          border-top: 1px solid var(--border);
          border-bottom: 1px solid var(--border);
          width: 100%;
        }

        .newsletter-content {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 1.5rem;
        }

        .newsletter-text h3 {
          margin-bottom: 0.25rem;
        }

        .newsletter-text p {
          color: var(--text-muted);
        }

        .newsletter-form {
          display: flex;
          gap: 0.5rem;
        }

        .newsletter-form input {
          padding: 0.75rem 1rem;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid var(--border);
          border-radius: 10px;
          color: white;
          outline: none;
          width: 220px;
        }

        .newsletter-form input::placeholder {
          color: var(--text-muted);
        }

        .subscribed-message {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: #22c55e;
        }

        /* Footer */
        .footer {
          position: relative;
          z-index: 1;
          padding: 3rem 2rem;
          background: #050507;
          width: 100%;
        }

        .footer-brand {
          margin-bottom: 1.5rem;
        }

        .footer-brand p {
          color: var(--text-muted);
          margin-top: 1rem;
          font-size: 0.9rem;
        }

        .footer-bottom {
          padding-top: 1.5rem;
          border-top: 1px solid var(--border);
          color: var(--text-muted);
          font-size: 0.85rem;
        }

        /* Responsive */
        @media (max-width: 768px) {
          .nav-links {
            display: none;
          }

          .hero-stats {
            gap: 1.5rem;
          }

          .newsletter-content {
            flex-direction: column;
            text-align: center;
          }

          .newsletter-form {
            width: 100%;
            flex-direction: column;
          }

          .newsletter-form input {
            width: 100%;
          }
        }
      `})]})},ly=()=>{const[o,u]=g.useState({x:0,y:0});return g.useEffect(()=>{const d=c=>{u({x:(c.clientX/window.innerWidth-.5)*15,y:(c.clientY/window.innerHeight-.5)*15})};return window.addEventListener("mousemove",d),()=>window.removeEventListener("mousemove",d)},[]),r.jsxs("div",{className:"bg-container",children:[r.jsx("div",{className:"orb orb-1",style:{transform:`translate(${o.x}px, ${o.y}px)`}}),r.jsx("div",{className:"orb orb-2",style:{transform:`translate(${-o.x*.7}px, ${-o.y*.7}px)`}})]})},iy=()=>{const o=qa(),{login:u}=sn(),[d,c]=g.useState(""),[m,p]=g.useState(""),[h,w]=g.useState(!1),[v,b]=g.useState(!1),[z,S]=g.useState("");g.useEffect(()=>(document.body.style.backgroundColor="#0a0a0f",()=>{document.body.style.backgroundColor=""}),[]);const O=async q=>{q.preventDefault(),b(!0),S("");try{await u(d,m),o("/app/home")}catch(Y){S(Y.message||"Failed to sign in")}finally{b(!1)}};return r.jsxs("div",{className:"auth-page",children:[r.jsx(ly,{}),r.jsx("div",{className:"auth-form-section",children:r.jsxs("div",{className:"auth-form-container",children:[r.jsxs("div",{className:"auth-brand",onClick:()=>o("/"),children:[r.jsx("div",{className:"brand-icon",children:r.jsx(Ye,{size:20})}),r.jsx("span",{className:"brand-name",children:"Aria"})]}),r.jsx("h1",{className:"auth-title",children:"Welcome Back"}),r.jsx("p",{className:"auth-subtitle",children:"Continue your spiritual journey with AI-powered guidance"}),z&&r.jsx("div",{className:"error-message",children:z}),r.jsxs("form",{onSubmit:O,children:[r.jsxs("div",{className:"form-group",children:[r.jsx("label",{htmlFor:"email",children:"Email Address"}),r.jsxs("div",{className:"input-wrapper",children:[r.jsx(vh,{size:20,className:"input-icon"}),r.jsx("input",{type:"email",id:"email",value:d,onChange:q=>c(q.target.value),placeholder:"your@email.com",required:!0})]})]}),r.jsxs("div",{className:"form-group",children:[r.jsx("label",{htmlFor:"password",children:"Password"}),r.jsxs("div",{className:"input-wrapper",children:[r.jsx(lc,{size:20,className:"input-icon"}),r.jsx("input",{type:h?"text":"password",id:"password",value:m,onChange:q=>p(q.target.value),placeholder:"Enter your password",required:!0}),r.jsx("button",{type:"button",className:"password-toggle",onClick:()=>w(!h),children:h?r.jsx(hh,{size:20}):r.jsx(ph,{size:20})})]})]}),r.jsxs("div",{className:"form-options",children:[r.jsxs("label",{className:"checkbox-label",children:[r.jsx("input",{type:"checkbox"}),"Remember me"]}),r.jsx(Ha,{to:"/forgot-password",className:"forgot-link",children:"Forgot password?"})]}),r.jsx("button",{type:"submit",disabled:v,className:"btn btn-primary btn-full",children:v?r.jsx("span",{className:"loading-spinner"}):r.jsxs(r.Fragment,{children:["Sign In ",r.jsx(on,{size:18})]})})]}),r.jsxs("p",{className:"auth-footer-text",children:["Don't have an account?"," ",r.jsx(Ha,{to:"/register",className:"auth-link",children:"Create one"})]})]})}),r.jsx("div",{className:"auth-info-section",children:r.jsxs("div",{className:"auth-info-content",children:[r.jsxs("blockquote",{className:"auth-quote",children:[`"Faith is taking the first step even when you don't see the whole staircase."`,r.jsx("cite",{children:"— Martin Luther King Jr."})]}),r.jsxs("div",{className:"auth-features",children:[r.jsxs("div",{className:"feature-item",children:[r.jsx("div",{className:"feature-icon",children:"💬"}),r.jsx("span",{children:"AI Spiritual Conversations"})]}),r.jsxs("div",{className:"feature-item",children:[r.jsx("div",{className:"feature-icon",children:"📖"}),r.jsx("span",{children:"Digital Bible Access"})]}),r.jsxs("div",{className:"feature-item",children:[r.jsx("div",{className:"feature-icon",children:"❤️"}),r.jsx("span",{children:"Emotional Support"})]})]}),r.jsxs("div",{className:"auth-stats",children:[r.jsxs("div",{className:"stat-item",children:[r.jsx("span",{className:"stat-value",children:"50K+"}),r.jsx("span",{className:"stat-label",children:"Active Users"})]}),r.jsxs("div",{className:"stat-item",children:[r.jsx("span",{className:"stat-value",children:"2M+"}),r.jsx("span",{className:"stat-label",children:"Conversations"})]}),r.jsxs("div",{className:"stat-item",children:[r.jsx("span",{className:"stat-value",children:"4.9"}),r.jsx("span",{className:"stat-label",children:"Rating"})]})]})]})}),r.jsx("style",{children:`
        :root {
          --primary: #c9a227;
          --primary-light: #e6c455;
          --primary-dark: #a68520;
          --bg-dark: #0a0a0f;
          --bg-card: #141418;
          --text: #f5f5f5;
          --text-muted: #888;
          --border: rgba(255, 255, 255, 0.1);
        }

        html, body {
          margin: 0;
          padding: 0;
          width: 100%;
          height: 100%;
        }

        .auth-page {
          min-height: 100vh;
          display: flex;
          background: var(--bg-dark);
          position: relative;
          overflow: hidden;
        }

        .bg-container {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          z-index: 0;
          overflow: hidden;
        }

        .orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(100px);
          opacity: 0.3;
          transition: transform 0.2s ease-out;
        }

        .orb-1 {
          width: 500px;
          height: 500px;
          background: radial-gradient(circle, rgba(79, 70, 229, 0.4) 0%, transparent 70%);
          top: -150px;
          left: -100px;
        }

        .orb-2 {
          width: 400px;
          height: 400px;
          background: radial-gradient(circle, var(--primary-dark) 0%, transparent 70%);
          bottom: -100px;
          right: -100px;
        }

        .auth-form-section {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          z-index: 10;
          padding: 2rem;
        }

        .auth-form-container {
          width: 100%;
          max-width: 420px;
        }

        .auth-brand {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 2.5rem;
          cursor: pointer;
        }

        .brand-icon {
          width: 38px;
          height: 38px;
          background: linear-gradient(135deg, var(--primary), var(--primary-dark));
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #0a0a0f;
        }

        .brand-name {
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--text);
        }

        .auth-title {
          font-size: 2.25rem;
          font-weight: 700;
          color: var(--text);
          margin-bottom: 0.5rem;
        }

        .auth-subtitle {
          color: var(--text-muted);
          font-size: 1rem;
          margin-bottom: 2rem;
        }

        .error-message {
          background: rgba(220, 38, 38, 0.1);
          border: 1px solid rgba(220, 38, 38, 0.3);
          border-radius: 0.75rem;
          padding: 1rem;
          margin-bottom: 1.5rem;
          color: #fca5a5;
          font-size: 0.9rem;
        }

        .form-group {
          margin-bottom: 1.25rem;
        }

        .form-group label {
          display: block;
          color: #d4d4d8;
          margin-bottom: 0.5rem;
          font-size: 0.9rem;
          font-weight: 500;
        }

        .input-wrapper {
          display: flex;
          align-items: center;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid var(--border);
          border-radius: 0.75rem;
          padding: 0 1rem;
          transition: all 0.2s;
        }

        .input-wrapper:focus-within {
          border-color: rgba(201, 162, 39, 0.5);
          box-shadow: 0 0 0 3px rgba(201, 162, 39, 0.1);
        }

        .input-icon {
          color: #71717a;
          flex-shrink: 0;
        }

        .input-wrapper input {
          flex: 1;
          background: transparent;
          border: none;
          padding: 1rem;
          color: var(--text);
          font-size: 1rem;
          outline: none;
        }

        .input-wrapper input::placeholder {
          color: #52525b;
        }

        .password-toggle {
          background: none;
          border: none;
          cursor: pointer;
          padding: 0.5rem;
          color: #71717a;
          display: flex;
          align-items: center;
        }

        .password-toggle:hover {
          color: var(--text-muted);
        }

        .form-options {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
        }

        .checkbox-label {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          cursor: pointer;
          color: #a1a1aa;
          font-size: 0.9rem;
        }

        .checkbox-label input {
          width: 16px;
          height: 16px;
          accent-color: var(--primary);
        }

        .forgot-link {
          color: var(--primary);
          text-decoration: none;
          font-size: 0.9rem;
        }

        .forgot-link:hover {
          color: var(--primary-light);
        }

        .btn {
          padding: 0.875rem 1.5rem;
          border-radius: 0.75rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          font-size: 1rem;
          border: none;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
        }

        .btn-primary {
          background: linear-gradient(135deg, var(--primary), var(--primary-dark));
          color: #0a0a0f;
        }

        .btn-primary:hover:not(:disabled) {
          background: linear-gradient(135deg, var(--primary-light), var(--primary));
        }

        .btn-full {
          width: 100%;
        }

        .btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .loading-spinner {
          width: 20px;
          height: 20px;
          border: 2px solid rgba(0, 0, 0, 0.2);
          border-top-color: #0a0a0f;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .auth-footer-text {
          text-align: center;
          margin-top: 1.5rem;
          color: var(--text-muted);
        }

        .auth-link {
          color: var(--primary);
          text-decoration: none;
          font-weight: 600;
        }

        .auth-link:hover {
          color: var(--primary-light);
        }

        /* Right Panel */
        .auth-info-section {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          z-index: 10;
          padding: 3rem;
          background: rgba(20, 20, 25, 0.5);
          border-left: 1px solid var(--border);
        }

        .auth-info-content {
          max-width: 420px;
        }

        .auth-quote {
          background: rgba(79, 70, 229, 0.1);
          border: 1px solid rgba(79, 70, 229, 0.2);
          border-radius: 1rem;
          padding: 1.5rem;
          margin-bottom: 2rem;
          color: #e0e7ff;
          font-size: 1.1rem;
          font-style: italic;
          line-height: 1.6;
        }

        .auth-quote cite {
          display: block;
          margin-top: 1rem;
          color: #818cf8;
          font-style: normal;
          font-weight: 600;
          font-size: 0.9rem;
        }

        .auth-features {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          margin-bottom: 2rem;
        }

        .feature-item {
          display: flex;
          align-items: center;
          gap: 1rem;
          color: #d4d4d8;
        }

        .feature-icon {
          width: 40px;
          height: 40px;
          background: rgba(201, 162, 39, 0.15);
          border: 1px solid rgba(201, 162, 39, 0.3);
          border-radius: 0.75rem;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.1rem;
        }

        .auth-stats {
          display: flex;
          gap: 2rem;
          padding-top: 1.5rem;
          border-top: 1px solid var(--border);
        }

        .stat-item {
          text-align: center;
        }

        .stat-value {
          display: block;
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--primary);
        }

        .stat-label {
          font-size: 0.8rem;
          color: var(--text-muted);
        }

        /* Responsive */
        @media (max-width: 1024px) {
          .auth-info-section {
            display: none;
          }
        }

        @media (max-width: 640px) {
          .auth-form-section {
            padding: 1.5rem;
          }

          .auth-title {
            font-size: 1.75rem;
          }
        }
      `})]})},ry=()=>{const[o,u]=g.useState({x:0,y:0});return g.useEffect(()=>{const d=c=>{u({x:(c.clientX/window.innerWidth-.5)*15,y:(c.clientY/window.innerHeight-.5)*15})};return window.addEventListener("mousemove",d),()=>window.removeEventListener("mousemove",d)},[]),r.jsxs("div",{className:"bg-container",children:[r.jsx("div",{className:"orb orb-1",style:{transform:`translate(${o.x}px, ${o.y}px)`}}),r.jsx("div",{className:"orb orb-2",style:{transform:`translate(${-o.x*.7}px, ${-o.y*.7}px)`}})]})},oy=()=>{const o=qa(),{register:u}=sn(),[d,c]=g.useState({fullName:"",email:"",password:"",confirmPassword:""}),[m,p]=g.useState(!1),[h,w]=g.useState(!1),[v,b]=g.useState(""),[z,S]=g.useState("");g.useEffect(()=>(document.body.style.backgroundColor="#0a0a0f",()=>{document.body.style.backgroundColor=""}),[]);const O=M=>{c({...d,[M.target.name]:M.target.value})},q=async M=>{if(M.preventDefault(),b(""),d.password!==d.confirmPassword){b("Passwords do not match");return}if(d.password.length<8){b("Password must be at least 8 characters");return}w(!0);try{const _=await u(d.email,d.password,d.fullName);_.message?S(_.message):o("/app/home")}catch(_){b(_.message||"Failed to create account")}finally{w(!1)}},Y=[{icon:"💬",text:"24/7 AI Spiritual Guidance"},{icon:"📖",text:"Complete Digital Bible"},{icon:"🙏",text:"Personalized Devotionals"},{icon:"🔒",text:"Private & Secure"}];return r.jsxs("div",{className:"auth-page",children:[r.jsx(ry,{}),r.jsx("div",{className:"auth-form-section",children:r.jsxs("div",{className:"auth-form-container",children:[r.jsxs("div",{className:"auth-brand",onClick:()=>o("/"),children:[r.jsx("div",{className:"brand-icon",children:r.jsx(Ye,{size:20})}),r.jsx("span",{className:"brand-name",children:"Aria"})]}),r.jsx("h1",{className:"auth-title",children:"Create Your Account"}),r.jsx("p",{className:"auth-subtitle",children:"Begin your spiritual journey with AI-powered guidance"}),v&&r.jsx("div",{className:"error-message",children:v}),z&&r.jsx("div",{className:"success-message",children:z}),r.jsxs("form",{onSubmit:q,children:[r.jsxs("div",{className:"form-group",children:[r.jsx("label",{htmlFor:"fullName",children:"Full Name"}),r.jsxs("div",{className:"input-wrapper",children:[r.jsx(wh,{size:20,className:"input-icon"}),r.jsx("input",{type:"text",id:"fullName",name:"fullName",value:d.fullName,onChange:O,placeholder:"John Doe",required:!0})]})]}),r.jsxs("div",{className:"form-group",children:[r.jsx("label",{htmlFor:"email",children:"Email Address"}),r.jsxs("div",{className:"input-wrapper",children:[r.jsx(vh,{size:20,className:"input-icon"}),r.jsx("input",{type:"email",id:"email",name:"email",value:d.email,onChange:O,placeholder:"your@email.com",required:!0})]})]}),r.jsxs("div",{className:"form-group",children:[r.jsx("label",{htmlFor:"password",children:"Password"}),r.jsxs("div",{className:"input-wrapper",children:[r.jsx(lc,{size:20,className:"input-icon"}),r.jsx("input",{type:m?"text":"password",id:"password",name:"password",value:d.password,onChange:O,placeholder:"Create a strong password",required:!0}),r.jsx("button",{type:"button",className:"password-toggle",onClick:()=>p(!m),children:m?r.jsx(hh,{size:20}):r.jsx(ph,{size:20})})]})]}),r.jsxs("div",{className:"form-group",children:[r.jsx("label",{htmlFor:"confirmPassword",children:"Confirm Password"}),r.jsxs("div",{className:"input-wrapper",children:[r.jsx(lc,{size:20,className:"input-icon"}),r.jsx("input",{type:m?"text":"password",id:"confirmPassword",name:"confirmPassword",value:d.confirmPassword,onChange:O,placeholder:"Confirm your password",required:!0})]})]}),r.jsx("div",{className:"terms-group",children:r.jsxs("label",{className:"checkbox-label",children:[r.jsx("input",{type:"checkbox",required:!0}),r.jsxs("span",{children:["I agree to the"," ",r.jsx(Ha,{to:"#",className:"auth-link",children:"Terms of Service"})," ","and"," ",r.jsx(Ha,{to:"#",className:"auth-link",children:"Privacy Policy"})]})]})}),r.jsx("button",{type:"submit",disabled:h,className:"btn btn-primary btn-full",children:h?r.jsx("span",{className:"loading-spinner"}):r.jsxs(r.Fragment,{children:["Create Account ",r.jsx(on,{size:18})]})})]}),r.jsxs("p",{className:"auth-footer-text",children:["Already have an account?"," ",r.jsx(Ha,{to:"/login",className:"auth-link",children:"Sign in"})]})]})}),r.jsx("div",{className:"auth-info-section",children:r.jsxs("div",{className:"auth-info-content",children:[r.jsxs("h2",{className:"info-title",children:["Why Join ",r.jsx("span",{className:"highlight",children:"Aria"}),"?"]}),r.jsx("p",{className:"info-desc",children:"Experience a revolutionary way to connect with your faith through the power of artificial intelligence."}),r.jsx("div",{className:"benefits-list",children:Y.map((M,_)=>r.jsxs("div",{className:"benefit-item",children:[r.jsx("div",{className:"benefit-icon",children:M.icon}),r.jsx("span",{children:M.text})]},_))}),r.jsxs("div",{className:"free-badge",children:["🎉 ",r.jsx("strong",{children:"Free to start"})," — No credit card required"]})]})}),r.jsx("style",{children:`
        :root {
          --primary: #c9a227;
          --primary-light: #e6c455;
          --primary-dark: #a68520;
          --bg-dark: #0a0a0f;
          --bg-card: #141418;
          --text: #f5f5f5;
          --text-muted: #888;
          --border: rgba(255, 255, 255, 0.1);
        }

        html, body {
          margin: 0;
          padding: 0;
          width: 100%;
          height: 100%;
        }

        .auth-page {
          min-height: 100vh;
          display: flex;
          background: var(--bg-dark);
          position: relative;
          overflow: hidden;
        }

        .bg-container {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          z-index: 0;
          overflow: hidden;
        }

        .orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(100px);
          opacity: 0.3;
          transition: transform 0.2s ease-out;
        }

        .orb-1 {
          width: 500px;
          height: 500px;
          background: radial-gradient(circle, rgba(79, 70, 229, 0.4) 0%, transparent 70%);
          top: -150px;
          right: -100px;
        }

        .orb-2 {
          width: 400px;
          height: 400px;
          background: radial-gradient(circle, var(--primary-dark) 0%, transparent 70%);
          bottom: -100px;
          left: -100px;
        }

        .auth-form-section {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          z-index: 10;
          padding: 2rem;
        }

        .auth-form-container {
          width: 100%;
          max-width: 420px;
        }

        .auth-brand {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 2rem;
          cursor: pointer;
        }

        .brand-icon {
          width: 38px;
          height: 38px;
          background: linear-gradient(135deg, var(--primary), var(--primary-dark));
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #0a0a0f;
        }

        .brand-name {
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--text);
        }

        .auth-title {
          font-size: 2rem;
          font-weight: 700;
          color: var(--text);
          margin-bottom: 0.5rem;
        }

        .auth-subtitle {
          color: var(--text-muted);
          font-size: 1rem;
          margin-bottom: 1.5rem;
        }

        .error-message {
          background: rgba(220, 38, 38, 0.1);
          border: 1px solid rgba(220, 38, 38, 0.3);
          border-radius: 0.75rem;
          padding: 1rem;
          margin-bottom: 1.5rem;
          color: #fca5a5;
          font-size: 0.9rem;
        }

        .success-message {
          background: rgba(16, 185, 129, 0.1);
          border: 1px solid rgba(16, 185, 129, 0.3);
          border-radius: 0.75rem;
          padding: 1rem;
          margin-bottom: 1.5rem;
          color: #6ee7b7;
          font-size: 0.9rem;
        }

        .form-group {
          margin-bottom: 1rem;
        }

        .form-group label {
          display: block;
          color: #d4d4d8;
          margin-bottom: 0.5rem;
          font-size: 0.9rem;
          font-weight: 500;
        }

        .input-wrapper {
          display: flex;
          align-items: center;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid var(--border);
          border-radius: 0.75rem;
          padding: 0 1rem;
          transition: all 0.2s;
        }

        .input-wrapper:focus-within {
          border-color: rgba(201, 162, 39, 0.5);
          box-shadow: 0 0 0 3px rgba(201, 162, 39, 0.1);
        }

        .input-icon {
          color: #71717a;
          flex-shrink: 0;
        }

        .input-wrapper input {
          flex: 1;
          background: transparent;
          border: none;
          padding: 1rem;
          color: var(--text);
          font-size: 1rem;
          outline: none;
        }

        .input-wrapper input::placeholder {
          color: #52525b;
        }

        .password-toggle {
          background: none;
          border: none;
          cursor: pointer;
          padding: 0.5rem;
          color: #71717a;
          display: flex;
          align-items: center;
        }

        .password-toggle:hover {
          color: var(--text-muted);
        }

        .terms-group {
          margin-bottom: 1.25rem;
        }

        .checkbox-label {
          display: flex;
          align-items: flex-start;
          gap: 0.75rem;
          cursor: pointer;
          color: #a1a1aa;
          font-size: 0.85rem;
          line-height: 1.5;
        }

        .checkbox-label input {
          width: 16px;
          height: 16px;
          accent-color: var(--primary);
          margin-top: 2px;
        }

        .auth-link {
          color: var(--primary);
          text-decoration: none;
        }

        .auth-link:hover {
          color: var(--primary-light);
        }

        .btn {
          padding: 0.875rem 1.5rem;
          border-radius: 0.75rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          font-size: 1rem;
          border: none;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
        }

        .btn-primary {
          background: linear-gradient(135deg, var(--primary), var(--primary-dark));
          color: #0a0a0f;
        }

        .btn-primary:hover:not(:disabled) {
          background: linear-gradient(135deg, var(--primary-light), var(--primary));
        }

        .btn-full {
          width: 100%;
        }

        .btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .loading-spinner {
          width: 20px;
          height: 20px;
          border: 2px solid rgba(0, 0, 0, 0.2);
          border-top-color: #0a0a0f;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .auth-footer-text {
          text-align: center;
          margin-top: 1.5rem;
          color: var(--text-muted);
        }

        /* Right Panel */
        .auth-info-section {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          z-index: 10;
          padding: 3rem;
          background: rgba(20, 20, 25, 0.5);
          border-left: 1px solid var(--border);
        }

        .auth-info-content {
          max-width: 440px;
        }

        .info-title {
          font-size: 1.75rem;
          font-weight: 700;
          color: var(--text);
          margin-bottom: 0.75rem;
        }

        .highlight {
          color: var(--primary);
        }

        .info-desc {
          color: var(--text-muted);
          font-size: 1rem;
          margin-bottom: 2rem;
          line-height: 1.6;
        }

        .benefits-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          margin-bottom: 2rem;
        }

        .benefit-item {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1rem;
          background: rgba(255, 255, 255, 0.03);
          border-radius: 0.75rem;
          border: 1px solid var(--border);
          color: #e4e4e7;
          transition: all 0.2s;
        }

        .benefit-item:hover {
          border-color: rgba(201, 162, 39, 0.3);
          background: rgba(201, 162, 39, 0.05);
        }

        .benefit-icon {
          width: 40px;
          height: 40px;
          background: rgba(201, 162, 39, 0.15);
          border: 1px solid rgba(201, 162, 39, 0.3);
          border-radius: 0.75rem;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.1rem;
          flex-shrink: 0;
        }

        .free-badge {
          padding: 1rem 1.25rem;
          background: rgba(79, 70, 229, 0.15);
          border: 1px solid rgba(79, 70, 229, 0.3);
          border-radius: 0.75rem;
          text-align: center;
          color: #c7d2fe;
          font-size: 0.95rem;
        }

        /* Responsive */
        @media (max-width: 1024px) {
          .auth-info-section {
            display: none;
          }
        }

        @media (max-width: 640px) {
          .auth-form-section {
            padding: 1.5rem;
          }

          .auth-title {
            font-size: 1.5rem;
          }
        }
      `})]})},sy=()=>{const o=qa(),{logout:u,user:d}=sn(),[c,m]=g.useState(!1),p=()=>{u(),o("/")},h=[{path:"/app/home",icon:r.jsx(bh,{size:20}),label:"Home",desc:"Dashboard",color:"#c9a227"},{path:"/app/ai-chat",icon:r.jsx(xr,{size:20}),label:"AI Chat",desc:"Ask anything",color:"#8b5cf6"},{path:"/app/bible",icon:r.jsx(K1,{size:20}),label:"Bible",desc:"Read Scripture",color:"#10b981"},{path:"/app/bible-study",icon:r.jsx(Qt,{size:20}),label:"Bible Study",desc:"Interactive companion",color:"#3b82f6"},{path:"/app/emotional-support",icon:r.jsx(Ba,{size:20}),label:"Faith Companion",desc:"Emotional support",color:"#ec4899"},{path:"/app/devotion",icon:r.jsx($l,{size:20}),label:"Daily Devotion",desc:"Morning reflection",color:"#f59e0b"}];return r.jsxs("div",{className:"app-layout",children:[r.jsx("button",{className:"mobile-menu-toggle",onClick:()=>m(!c),"aria-label":"Toggle menu",style:{position:"fixed",top:"1rem",left:"1rem",zIndex:200,background:"rgba(20, 20, 25, 0.9)",border:"1px solid rgba(255, 255, 255, 0.1)",borderRadius:"8px",padding:"0.5rem",color:"#f5f5f5",cursor:"pointer",display:"none"},children:c?r.jsx(rc,{size:24}):r.jsx(zb,{size:24})}),r.jsxs("aside",{className:`sidebar ${c?"open":""}`,children:[r.jsxs("div",{className:"sidebar-brand",children:[r.jsx("div",{className:"brand-icon-wrapper",children:r.jsx(Ye,{className:"brand-icon"})}),r.jsxs("div",{className:"brand-text",children:[r.jsx("span",{className:"brand-name",children:"Aria"}),r.jsx("span",{className:"brand-tagline",children:"Your spiritual companion"})]})]}),r.jsxs("nav",{className:"sidebar-nav",children:[r.jsx("div",{className:"nav-section-label",children:"Main Menu"}),h.map(w=>r.jsxs(nc,{to:w.path,className:({isActive:v})=>`sidebar-link ${v?"active":""}`,style:({isActive:v})=>v?{borderLeftColor:w.color,background:`${w.color}15`}:{},onClick:()=>m(!1),children:[r.jsx("div",{className:"link-icon",style:{color:w.color},children:w.icon}),r.jsxs("div",{className:"link-text",children:[r.jsx("span",{className:"link-label",children:w.label}),r.jsx("span",{className:"link-desc",children:w.desc})]})]},w.path))]}),r.jsxs("div",{className:"sidebar-footer",children:[r.jsxs(nc,{to:"/app/profile",className:"sidebar-link profile-link",children:[r.jsx("div",{className:"profile-avatar",children:d?.full_name?.charAt(0)||"U"}),r.jsxs("div",{className:"profile-info",children:[r.jsx("span",{className:"profile-name",children:d?.full_name||"User"}),r.jsx("span",{className:"profile-email",children:d?.email||"faith@companion.app"})]})]}),r.jsxs("button",{onClick:p,className:"sidebar-link logout-btn",children:[r.jsx(yh,{size:18}),r.jsx("span",{children:"Sign Out"})]})]})]}),r.jsx("main",{className:"app-main",children:r.jsx(l1,{})}),r.jsx("style",{children:`
        .app-layout {
          display: flex;
          min-height: 100vh;
        }

        .sidebar {
          width: 280px;
          background: linear-gradient(180deg, #0f0f14 0%, #141419 100%);
          border-right: 1px solid rgba(255, 255, 255, 0.06);
          display: flex;
          flex-direction: column;
          position: fixed;
          height: 100vh;
          z-index: 100;
        }

        .sidebar-brand {
          padding: 1.5rem;
          display: flex;
          align-items: center;
          gap: 0.875rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.06);
        }

        .brand-icon-wrapper {
          width: 44px;
          height: 44px;
          background: linear-gradient(135deg, #c9a227 0%, #a88620 100%);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 12px rgba(201, 162, 39, 0.3);
        }

        .brand-icon-wrapper .brand-icon {
          color: white;
          width: 22px;
          height: 22px;
        }

        .brand-text {
          display: flex;
          flex-direction: column;
        }

        .brand-name {
          font-size: 1.125rem;
          font-weight: 700;
          color: #f5f5f5;
          letter-spacing: -0.02em;
        }

        .brand-tagline {
          font-size: 0.7rem;
          color: rgba(255, 255, 255, 0.4);
          text-transform: uppercase;
          letter-spacing: 0.08em;
        }

        .sidebar-nav {
          flex: 1;
          padding: 1.25rem 0.875rem;
          overflow-y: auto;
        }

        .nav-section-label {
          font-size: 0.65rem;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: rgba(255, 255, 255, 0.3);
          padding: 0 0.75rem;
          margin-bottom: 0.75rem;
        }

        .sidebar-link {
          display: flex;
          align-items: center;
          gap: 0.875rem;
          padding: 0.875rem 1rem;
          color: rgba(255, 255, 255, 0.6);
          text-decoration: none;
          border-radius: 12px;
          transition: all 0.2s ease;
          font-weight: 500;
          border: none;
          background: none;
          cursor: pointer;
          width: 100%;
          font-size: 0.875rem;
          margin-bottom: 0.25rem;
          border-left: 3px solid transparent;
        }

        .sidebar-link:hover {
          background: rgba(255, 255, 255, 0.05);
          color: rgba(255, 255, 255, 0.9);
        }

        .sidebar-link.active {
          color: #f5f5f5;
        }

        .link-icon {
          width: 38px;
          height: 38px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(255, 255, 255, 0.05);
          flex-shrink: 0;
        }

        .sidebar-link.active .link-icon {
          background: rgba(255, 255, 255, 0.1);
        }

        .link-text {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 0.125rem;
        }

        .link-label {
          font-size: 0.875rem;
          font-weight: 600;
        }

        .link-desc {
          font-size: 0.7rem;
          color: rgba(255, 255, 255, 0.4);
        }

        .sidebar-footer {
          padding: 1rem 0.875rem;
          border-top: 1px solid rgba(255, 255, 255, 0.06);
        }

        .profile-link {
          padding: 0.75rem;
          margin-bottom: 0.5rem;
        }

        .profile-avatar {
          width: 40px;
          height: 40px;
          border-radius: 10px;
          background: linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 1rem;
          color: white;
          flex-shrink: 0;
        }

        .profile-info {
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }

        .profile-name {
          font-size: 0.875rem;
          font-weight: 600;
          color: #f5f5f5;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .profile-email {
          font-size: 0.7rem;
          color: rgba(255, 255, 255, 0.4);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .logout-btn {
          color: rgba(255, 255, 255, 0.5);
          font-size: 0.8rem;
        }

        .logout-btn:hover {
          color: #ef4444;
          background: rgba(239, 68, 68, 0.1);
        }

        .app-main {
          flex: 1;
          margin-left: 280px;
          padding: 0;
          background: #0a0a0f;
          min-height: 100vh;
        }

        @media (max-width: 1024px) {
          .mobile-menu-toggle {
            display: flex !important;
          }
          
          .sidebar {
            transform: translateX(-100%);
            transition: transform 0.3s ease;
          }
          
          .sidebar.open {
            transform: translateX(0);
          }
          
          .app-main {
            margin-left: 0;
          }
        }
      `})]})},He="http://localhost:8002/api/v1",Ie=()=>{const o=localStorage.getItem("authToken");return{"Content-Type":"application/json",...o&&{Authorization:`Bearer ${o}`}}},Xe=async o=>{if(!o.ok){const u=await o.json().catch(()=>({error:"Unknown error"}));throw new Error(u.error||`HTTP error! status: ${o.status}`)}return o.json()},Is={login:async(o,u)=>{const d=await fetch(`${He}/auth/login`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({email:o,password:u})});return Xe(d)},register:async(o,u,d)=>{const c=await fetch(`${He}/auth/register`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({email:o,password:u,full_name:d})});return Xe(c)},getMe:async()=>{const o=await fetch(`${He}/auth/me`,{headers:Ie()});return Xe(o)},logout:async()=>{const o=await fetch(`${He}/auth/logout`,{method:"POST",headers:Ie()});return Xe(o)}},oc={getChapter:async(o,u)=>{const d=await fetch(`${He}/bible/chapter/${encodeURIComponent(o)}/${u}`);return Xe(d)},getVerse:async(o,u,d)=>{const c=await fetch(`${He}/bible/verses/${encodeURIComponent(o)}/${u}/${d}`,{headers:Ie()});return Xe(c)},searchVerses:async o=>{const u=await fetch(`${He}/bible/search?query=${encodeURIComponent(o)}`,{headers:Ie()});return Xe(u)},createStudySession:async(o,u,d,c)=>{const m=await fetch(`${He}/bible-study/sessions`,{method:"POST",headers:Ie(),body:JSON.stringify({book:o.trim(),chapter:parseInt(u),verses:d.split("-").map(p=>parseInt(p.trim())),selected_text:c})});return Xe(m)},getStudySessions:async()=>{const o=await fetch(`${He}/bible-study/sessions`,{headers:Ie()});return Xe(o)},getStudySession:async o=>{const u=await fetch(`${He}/bible-study/sessions/${o}`,{headers:Ie()});return Xe(u)},getStudySessionMessages:async o=>{const u=await fetch(`${He}/bible-study/sessions/${o}/messages`,{headers:Ie()});return Xe(u)}},cy={generate:async(o,u)=>{const d=await fetch(`${He}/ai/generate`,{method:"POST",headers:Ie(),body:JSON.stringify({messages:o,mode:u})});return Xe(d)},chat:async(o,u="general")=>{const d=await fetch(`${He}/ai/chat`,{method:"POST",headers:Ie(),body:JSON.stringify({messages:o,mode:u})});return Xe(d)}},Nh={getWebSocketUrl:o=>{let u="ws://localhost:8002";u=u.replace(/^(ws|wss):\/\//,"");const d=window.location.protocol==="https:"?"wss:":"ws:",c=localStorage.getItem("authToken");return`${d}//${u}/ws/voice-call/${o}?token=${c}`},createCallSession:async(o="general")=>{const u=await fetch(`${He}/ai/voice-session`,{method:"POST",headers:Ie(),body:JSON.stringify({mode:o})});return Xe(u)}},uy={getHomeData:async()=>{const o=await fetch(`${He}/home/data`,{headers:Ie()});return Xe(o)},getVerse:async()=>{const o=await fetch(`${He}/home/verse`,{headers:Ie()});return Xe(o)},getActivity:async()=>{const o=await fetch(`${He}/home/activity`,{headers:Ie()});return Xe(o)},getStats:async()=>{const o=await fetch(`${He}/home/stats`,{headers:Ie()});return Xe(o)}},dy={createPrayer:async o=>{const u=await fetch(`${He}/prayers`,{method:"POST",headers:Ie(),body:JSON.stringify(o)});return Xe(u)},getPrayers:async()=>{const o=await fetch(`${He}/prayers`,{headers:Ie()});return Xe(o)},deletePrayer:async o=>{const u=await fetch(`${He}/prayers/${o}`,{method:"DELETE",headers:Ie()});return Xe(u)}},fy=()=>{const o=new Date().getHours();return o<12?"Good morning":o<17?"Good afternoon":"Good evening"},Ym=o=>{const u=new Date(o),c=new Date-u,m=Math.floor(c/6e4),p=Math.floor(c/36e5),h=Math.floor(c/864e5);return m<1?"Just now":m<60?`${m}m ago`:p<24?`${p}h ago`:h===1?"Yesterday":h<7?`${h} days ago`:u.toLocaleDateString()},Gm=()=>{const[o,u]=g.useState({x:0,y:0});return g.useEffect(()=>{const d=c=>{u({x:(c.clientX/window.innerWidth-.5)*10,y:(c.clientY/window.innerHeight-.5)*10})};return window.addEventListener("mousemove",d),()=>window.removeEventListener("mousemove",d)},[]),r.jsxs("div",{className:"home-bg",children:[r.jsx("div",{className:"bg-orb orb-1",style:{transform:`translate(${o.x}px, ${o.y}px)`}}),r.jsx("div",{className:"bg-orb orb-2",style:{transform:`translate(${-o.x*.5}px, ${-o.y*.5}px)`}})]})},my=()=>{const o=qa(),{user:u}=sn(),[d,c]=g.useState(""),[m,p]=g.useState(!0),[h,w]=g.useState({user:{name:"Believer"},verse_of_day:{verse:"",reference:""},activity:[],stats:{streak:0,time_today_minutes:0,verses_saved:0},recent_prayers:[]}),[v,b]=g.useState(!1);g.useEffect(()=>{z()},[]);const z=async()=>{try{p(!0);const M=await uy.getHomeData();w(M)}catch(M){console.error("Error fetching home data:",M)}finally{p(!1)}},S=[{icon:r.jsx(xr,{size:24}),title:"Chat with Aria",description:"Have a spiritual conversation",path:"/app/ai-chat",color:"#6366f1"},{icon:r.jsx(Qt,{size:24}),title:"Read the Bible",description:"Explore scripture",path:"/app/bible",color:"#8b5cf6"},{icon:r.jsx(Ba,{size:24}),title:"Emotional Support",description:"Find comfort & guidance",path:"/app/emotional-support",color:"#ec4899"},{icon:r.jsx($l,{size:24}),title:"Daily Devotion",description:"Start your day with God",path:"/app/devotion",color:"#f59e0b"}],O=M=>{switch(M){case"bible_study":return r.jsx(Qt,{size:18});case"support":return r.jsx(Ba,{size:18});case"devotion":return r.jsx($l,{size:18});default:return r.jsx(xr,{size:18})}},q=async()=>{if(d.trim()){b(!0);try{await dy.createPrayer({content:d}),await z(),c("")}catch(M){console.error("Error submitting prayer:",M)}finally{b(!1)}}},Y=h.user?.name?.split(" ")[0]||u?.full_name?.split(" ")[0]||"Believer";return m?r.jsxs("div",{className:"home-page",children:[r.jsx(Gm,{}),r.jsx("div",{className:"loading-container",children:r.jsx(Bm,{size:40,className:"animate-spin"})})]}):r.jsxs("div",{className:"home-page",children:[r.jsx(Gm,{}),r.jsxs("div",{className:"home-content",children:[r.jsx("section",{className:"welcome-section",children:r.jsxs("div",{className:"welcome-text",children:[r.jsxs("p",{className:"greeting",children:[fy(),","]}),r.jsxs("h1",{children:[Y,"!"]}),r.jsx("p",{className:"welcome-subtitle",children:"Welcome to your spiritual home. How can we walk with you today?"})]})}),r.jsx("section",{className:"verse-section",children:r.jsxs("div",{className:"verse-card",children:[r.jsxs("div",{className:"verse-header",children:[r.jsx(Ye,{size:18}),r.jsx("span",{children:"Verse of the Day"})]}),r.jsxs("blockquote",{className:"verse-text",children:['"',h.verse_of_day?.verse||"Loading verse...",'"']}),r.jsxs("cite",{className:"verse-reference",children:["— ",h.verse_of_day?.reference||"..."]}),r.jsxs("button",{className:"verse-btn",onClick:()=>o("/app/bible-study"),children:[r.jsx(vb,{size:16}),"Study this verse"]})]})}),r.jsxs("section",{className:"actions-section",children:[r.jsx("h2",{className:"section-title",children:"How would you like to connect?"}),r.jsx("div",{className:"actions-grid",children:S.map((M,_)=>r.jsxs("button",{className:"action-card",style:{"--action-color":M.color},onClick:()=>o(M.path),children:[r.jsx("div",{className:"action-icon",children:M.icon}),r.jsxs("div",{className:"action-info",children:[r.jsx("h3",{children:M.title}),r.jsx("p",{children:M.description})]})]},_))})]}),r.jsxs("div",{className:"home-columns",children:[r.jsxs("section",{className:"continue-section",children:[r.jsx("h2",{className:"section-title",children:"Continue Where You Left Off"}),h.activity&&h.activity.length>0?r.jsx("div",{className:"continue-list",children:h.activity.map((M,_)=>r.jsxs("button",{className:"continue-item",onClick:()=>o(M.path),children:[r.jsx("div",{className:"continue-icon",children:O(M.type)}),r.jsxs("div",{className:"continue-info",children:[r.jsx("span",{className:"continue-title",children:M.title}),r.jsx("span",{className:"continue-subtitle",children:M.subtitle})]}),r.jsx("span",{className:"continue-time",children:Ym(M.created_at)})]},_))}):r.jsxs("div",{className:"empty-activity",children:[r.jsx("p",{children:"Start your spiritual journey today!"}),r.jsx("p",{className:"empty-hint",children:"Use any of the features above to begin."})]})]}),r.jsxs("section",{className:"prayer-section",children:[r.jsx("h2",{className:"section-title",children:"What's on your heart?"}),r.jsxs("div",{className:"prayer-card",children:[r.jsx("div",{className:"prayer-icon",children:r.jsx(gh,{size:28})}),r.jsx("textarea",{className:"prayer-input",placeholder:"Share your thoughts, prayers, or reflections with God...",value:d,onChange:M=>c(M.target.value),rows:3}),r.jsxs("button",{className:"prayer-btn",onClick:q,disabled:v||!d.trim(),children:[v?r.jsx(Bm,{size:18,className:"animate-spin"}):r.jsx(Ye,{size:18}),"Send Prayer"]}),h.recent_prayers&&h.recent_prayers.length>0&&r.jsxs("div",{className:"recent-prayers",children:[r.jsx("p",{className:"recent-title",children:"Recent Prayers:"}),h.recent_prayers.slice(0,2).map((M,_)=>r.jsxs("div",{className:"prayer-preview",children:[r.jsxs("p",{children:[M.content.substring(0,50),M.content.length>50?"...":""]}),r.jsx("span",{className:"prayer-time",children:Ym(M.created_at)})]},_))]})]})]})]}),r.jsx("section",{className:"stats-section",children:r.jsxs("div",{className:"stats-grid",children:[r.jsxs("div",{className:"stat-item",children:[r.jsx(hb,{size:20,className:"stat-icon"}),r.jsxs("div",{className:"stat-info",children:[r.jsxs("span",{className:"stat-value",children:[h.stats?.streak||0," day streak"]}),r.jsx("span",{className:"stat-label",children:"Keep going!"})]})]}),r.jsxs("div",{className:"stat-item",children:[r.jsx(mh,{size:20,className:"stat-icon"}),r.jsxs("div",{className:"stat-info",children:[r.jsxs("span",{className:"stat-value",children:[h.stats?.time_today_minutes||0," min today"]}),r.jsx("span",{className:"stat-label",children:"Time in app"})]})]}),r.jsxs("div",{className:"stat-item",children:[r.jsx(Qt,{size:20,className:"stat-icon"}),r.jsxs("div",{className:"stat-info",children:[r.jsxs("span",{className:"stat-value",children:[h.stats?.verses_saved||0," verses"]}),r.jsx("span",{className:"stat-label",children:"Saved this week"})]})]})]})})]}),r.jsx("style",{children:`
        :root {
          --primary: #c9a227;
          --bg-dark: #0a0a0f;
          --bg-card: #141418;
          --text: #f5f5f5;
          --text-muted: #888;
          --border: rgba(255, 255, 255, 0.1);
        }

        .home-page {
          min-height: 100vh;
          position: relative;
          overflow: hidden;
        }

        .home-bg {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          z-index: 0;
          overflow: hidden;
        }

        .bg-orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(100px);
          opacity: 0.25;
          transition: transform 0.2s ease-out;
        }

        .orb-1 {
          width: 500px;
          height: 500px;
          background: radial-gradient(circle, var(--primary) 0%, transparent 70%);
          top: -150px;
          right: -100px;
        }

        .orb-2 {
          width: 400px;
          height: 400px;
          background: radial-gradient(circle, #6366f1 0%, transparent 70%);
          bottom: -100px;
          left: -100px;
        }

        .home-content {
          position: relative;
          z-index: 1;
          max-width: 1100px;
          margin: 0 auto;
          padding: 1.5rem;
        }

        .loading-container {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 50vh;
          color: var(--primary);
        }

        .animate-spin {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        /* Welcome Section */
        .welcome-section {
          background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
          border: 1px solid var(--border);
          border-radius: 20px;
          padding: 2rem;
          margin-bottom: 1.5rem;
        }

        .welcome-text h1 {
          font-size: 2rem;
          font-weight: 700;
          margin: 0.25rem 0 0.5rem;
        }

        .greeting {
          color: var(--text-muted);
          margin: 0;
        }

        .welcome-subtitle {
          color: var(--text-muted);
          margin: 0;
          font-size: 0.95rem;
        }

        /* Verse Section */
        .verse-section {
          margin-bottom: 1.5rem;
        }

        .verse-card {
          background: rgba(201, 162, 39, 0.08);
          border: 1px solid rgba(201, 162, 39, 0.2);
          border-radius: 16px;
          padding: 1.5rem;
        }

        .verse-header {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: var(--primary);
          font-weight: 600;
          font-size: 0.85rem;
          margin-bottom: 0.75rem;
        }

        .verse-text {
          font-size: 1.1rem;
          line-height: 1.6;
          color: #e4e4e7;
          margin: 0 0 0.5rem;
          font-style: italic;
        }

        .verse-reference {
          display: block;
          color: var(--primary);
          font-weight: 600;
          font-size: 0.9rem;
          margin-bottom: 1rem;
        }

        .verse-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          background: var(--primary);
          color: #0a0a0f;
          border: none;
          padding: 0.5rem 1rem;
          border-radius: 10px;
          font-weight: 600;
          font-size: 0.85rem;
          cursor: pointer;
          transition: all 0.2s;
        }

        .verse-btn:hover {
          background: #d4a017;
        }

        /* Actions Section */
        .actions-section {
          margin-bottom: 1.5rem;
        }

        .section-title {
          font-size: 1.15rem;
          font-weight: 700;
          color: var(--text);
          margin: 0 0 1rem;
        }

        .actions-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 1rem;
        }

        .action-card {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1rem;
          border: 1px solid var(--border);
          border-radius: 14px;
          cursor: pointer;
          transition: all 0.2s;
          background: var(--bg-card);
          text-align: left;
        }

        .action-card:hover {
          border-color: var(--action-color);
          transform: translateY(-2px);
        }

        .action-icon {
          width: 44px;
          height: 44px;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--action-color);
          flex-shrink: 0;
        }

        .action-info h3 {
          font-size: 0.95rem;
          font-weight: 600;
          margin: 0 0 0.2rem;
          color: var(--text);
        }

        .action-info p {
          font-size: 0.8rem;
          color: var(--text-muted);
          margin: 0;
        }

        /* Two Column Layout */
        .home-columns {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.5rem;
          margin-bottom: 1.5rem;
        }

        @media (max-width: 768px) {
          .home-columns {
            grid-template-columns: 1fr;
          }
        }

        /* Continue Section */
        .continue-section {
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: 16px;
          padding: 1.25rem;
        }

        .continue-list {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .continue-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid transparent;
          border-radius: 10px;
          cursor: pointer;
          transition: all 0.2s;
          text-align: left;
        }

        .continue-item:hover {
          background: rgba(255, 255, 255, 0.06);
          border-color: var(--border);
        }

        .continue-icon {
          width: 36px;
          height: 36px;
          background: rgba(99, 102, 241, 0.15);
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #6366f1;
        }

        .continue-info {
          flex: 1;
          display: flex;
          flex-direction: column;
        }

        .continue-title {
          font-weight: 600;
          color: var(--text);
          font-size: 0.9rem;
        }

        .continue-subtitle {
          font-size: 0.75rem;
          color: var(--text-muted);
        }

        .continue-time {
          font-size: 0.7rem;
          color: var(--text-muted);
        }

        .empty-activity {
          text-align: center;
          padding: 1.5rem;
          color: var(--text-muted);
        }

        .empty-activity p {
          margin: 0;
        }

        .empty-hint {
          font-size: 0.85rem;
          margin-top: 0.25rem !important;
        }

        /* Prayer Section */
        .prayer-section {
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: 16px;
          padding: 1.25rem;
        }

        .prayer-card {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
        }

        .prayer-icon {
          width: 56px;
          height: 56px;
          background: var(--primary);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #0a0a0f;
          margin-bottom: 0.75rem;
        }

        .prayer-input {
          width: 100%;
          padding: 0.75rem;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid var(--border);
          border-radius: 10px;
          font-size: 0.9rem;
          resize: none;
          font-family: inherit;
          margin-bottom: 0.75rem;
          color: var(--text);
          transition: border-color 0.2s;
        }

        .prayer-input:focus {
          outline: none;
          border-color: var(--primary);
        }

        .prayer-input::placeholder {
          color: var(--text-muted);
        }

        .prayer-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          background: var(--primary);
          color: #0a0a0f;
          border: none;
          padding: 0.625rem 1.25rem;
          border-radius: 10px;
          font-weight: 600;
          font-size: 0.9rem;
          cursor: pointer;
          transition: all 0.2s;
        }

        .prayer-btn:hover:not(:disabled) {
          background: #d4a017;
        }

        .prayer-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .recent-prayers {
          width: 100%;
          margin-top: 0.75rem;
          text-align: left;
        }

        .recent-title {
          font-size: 0.8rem;
          font-weight: 600;
          color: var(--text-muted);
          margin: 0 0 0.5rem;
        }

        .prayer-preview {
          background: rgba(255, 255, 255, 0.03);
          padding: 0.5rem;
          border-radius: 6px;
          margin-bottom: 0.35rem;
          border: 1px solid var(--border);
        }

        .prayer-preview p {
          margin: 0;
          font-size: 0.8rem;
          color: #e4e4e7;
        }

        .prayer-time {
          font-size: 0.7rem;
          color: var(--text-muted);
        }

        /* Stats Section */
        .stats-section {
          margin-bottom: 1rem;
        }

        .stats-grid {
          display: flex;
          align-items: center;
          justify-content: space-around;
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: 14px;
          padding: 1rem;
        }

        .stat-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .stat-icon {
          color: var(--primary);
        }

        .stat-info {
          display: flex;
          flex-direction: column;
        }

        .stat-value {
          font-weight: 700;
          color: var(--text);
          font-size: 0.9rem;
        }

        .stat-label {
          font-size: 0.7rem;
          color: var(--text-muted);
        }

        @media (max-width: 640px) {
          .welcome-section {
            padding: 1.5rem;
          }

          .welcome-text h1 {
            font-size: 1.5rem;
          }

          .actions-grid {
            grid-template-columns: 1fr;
          }

          .stats-grid {
            flex-direction: column;
            gap: 0.75rem;
          }
        }
      `})]})},Ps=[{id:"general",name:"Faith Companion",description:"General spiritual conversations",color:"#c9a227",icon:gc},{id:"bibleStudy",name:"Bible Guide",description:"Scripture explanations",color:"#6366f1",icon:Qt},{id:"emotionalSupport",name:"Prayer Partner",description:"Comfort & guidance",color:"#8b5cf6",icon:Ba},{id:"devotion",name:"Devotional",description:"Daily reflection",color:"#f59e0b",icon:$l}],Vm={general:["How can I grow closer to God?","What does the Bible say about love?","Help me understand prayer better"],bibleStudy:["Explain Romans 8:28","What is the meaning of Psalm 23?","Tell me about the prodigal son"],emotionalSupport:["I'm feeling anxious about the future","I need comfort during hard times","How do I find peace?"],devotion:["Give me a morning prayer","What should I reflect on today?","Words of encouragement"]},hy=["❤️","🙏","✨","💡","🤔"],py=600,gy=480,by=()=>{const[o,u]=g.useState({x:0,y:0});return g.useEffect(()=>{const d=c=>{u({x:(c.clientX/window.innerWidth-.5)*8,y:(c.clientY/window.innerHeight-.5)*8})};return window.addEventListener("mousemove",d),()=>window.removeEventListener("mousemove",d)},[]),r.jsx("div",{className:"chat-bg",children:r.jsx("div",{className:"bg-orb",style:{transform:`translate(${o.x}px, ${o.y}px)`}})})},yy=o=>{let u=o.replace(/"([^"]+)"/g,'<blockquote>"$1"</blockquote>');return u=u.replace(/• /g,"<li>"),u=u.replace(/(\d+)\. /g,'<span class="list-num">$1. </span>'),u=u.replace(/\*\*([^*]+)\*\*/g,"<strong>$1</strong>"),u=u.replace(/\*([^*]+)\*/g,"<em>$1</em>"),u},vy=({message:o,isLast:u,onCopy:d})=>{const c=o.role==="user",[m,p]=g.useState(!1),[h,w]=g.useState(!1),[v,b]=g.useState(!1),[z,S]=g.useState(!1),O=()=>{if("speechSynthesis"in window)if(h)window.speechSynthesis.cancel(),w(!1);else{const _=new SpeechSynthesisUtterance(o.content);_.onstart=()=>w(!0),_.onend=()=>w(!1),_.onerror=()=>w(!1),window.speechSynthesis.speak(_)}},q=()=>{navigator.clipboard.writeText(o.content),b(!0),setTimeout(()=>b(!1),2e3),d&&d()},Y=()=>{S(!1)},M=c?o.content:yy(o.content);return r.jsxs("div",{className:`message-wrapper ${c?"outgoing":"incoming"}`,onMouseEnter:()=>p(!0),onMouseLeave:()=>{p(!1),S(!1)},children:[r.jsxs("div",{className:"message-bubble",children:[c?r.jsx("p",{children:o.content}):r.jsx("div",{className:"message-content",dangerouslySetInnerHTML:{__html:M}}),r.jsxs("div",{className:"message-meta",children:[r.jsx("span",{className:"message-time",children:new Date().toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"})}),!c&&u&&r.jsx("span",{className:"message-status",children:r.jsx(Ye,{size:12})})]})]}),m&&!c&&r.jsxs("div",{className:"message-actions",children:[r.jsx("button",{onClick:O,title:h?"Stop":"Read aloud",children:h?r.jsx(Pb,{size:16}):r.jsx(bc,{size:16})}),r.jsx("button",{onClick:q,title:"Copy",children:v?r.jsx(pc,{size:16}):r.jsx(sb,{size:16})}),r.jsx("button",{onClick:()=>S(!z),title:"React",children:r.jsx(Ye,{size:16})})]}),z&&!c&&r.jsx("div",{className:"emoji-picker",children:hy.map((_,Z)=>r.jsx("button",{onClick:()=>Y(),children:_},Z))})]})},xy=(o,u,d,c,m,p)=>{const h=g.useRef(null),w=g.useRef(null),v=g.useRef(null),b=g.useRef(!1),z=g.useRef([]),S=g.useRef(!1),O=g.useRef(null),q=g.useRef(null),Y=g.useCallback(async()=>{if(S.current||z.current.length===0)return;S.current=!0;const L=z.current.shift();try{const te=atob(L),X=new ArrayBuffer(te.length),W=new Uint8Array(X);for(let ae=0;ae<te.length;ae++)W[ae]=te.charCodeAt(ae);w.current||(w.current=new(window.AudioContext||window.webkitAudioContext));const B=new Blob([W],{type:"audio/pcm"}),J=URL.createObjectURL(B);O.current||(O.current=new Audio),O.current.src=J,await O.current.play(),O.current.onended=()=>{S.current=!1,URL.revokeObjectURL(J),z.current.length>0&&q.current&&q.current()}}catch(te){console.error("Error playing audio:",te),S.current=!1}},[]);g.useEffect(()=>{q.current=Y},[Y]);const M=g.useCallback(()=>{v.current&&(v.current.mediaRecorder&&v.current.mediaRecorder.stop(),v.current.getTracks().forEach(L=>L.stop()),v.current=null),b.current=!1},[]),_=g.useCallback(async()=>{try{const L=o.current,te=Nh.getWebSocketUrl(L),X=new WebSocket(te);h.current=X,X.onopen=()=>{console.log("Voice call WebSocket connected"),p?.()},X.onmessage=async W=>{const B=JSON.parse(W.data);B.type==="conversation_started"||B.type==="transcript_complete"?d?.(B.message||B.text,"assistant"):B.type==="transcript"?d?.(B.text,"assistant",!0):B.type==="audio_output"?(z.current.push(B.audio),q.current&&q.current()):B.type==="error"&&m?.(B.message)},X.onerror=W=>{console.error("WebSocket error:",W),m?.("Connection error")},X.onclose=()=>{console.log("Voice call WebSocket closed"),M()}}catch(L){console.error("Failed to connect voice call:",L),m?.("Failed to connect")}},[o,d,m,p,M]),Z=g.useCallback(async()=>{try{const L=await navigator.mediaDevices.getUserMedia({audio:{echoCancellation:!0,noiseSuppression:!0,sampleRate:16e3}});v.current=L,b.current=!0;const te=new MediaRecorder(L,{mimeType:"audio/webm;codecs=opus",audioBitsPerSecond:128e3});te.ondataavailable=X=>{if(X.data.size>0&&h.current?.readyState===WebSocket.OPEN){const W=new FileReader;W.onload=()=>{const B=btoa(W.result);h.current?.send(JSON.stringify({type:"audio_input",audio:B}))},W.readAsBinaryString(X.data)}},te.start(100),v.current.mediaRecorder=te}catch(L){console.error("Failed to start recording:",L),m?.("Failed to access microphone")}},[m]),P=g.useCallback(()=>{M(),h.current&&(h.current.send(JSON.stringify({type:"stop"})),h.current.close(),h.current=null),O.current&&(O.current.pause(),O.current=null)},[M]);return g.useEffect(()=>()=>{P()},[P]),{connect:_,disconnect:P,startRecording:Z,stopRecording:M}},Xm=()=>{const o=new(window.AudioContext||window.webkitAudioContext),u=c=>{const m=o.createOscillator(),p=o.createGain();m.connect(p),p.connect(o.destination),m.frequency.setValueAtTime(440,c),m.type="sine",p.gain.setValueAtTime(0,c),p.gain.linearRampToValueAtTime(.3,c+.05),p.gain.linearRampToValueAtTime(0,c+.25),m.start(c),m.stop(c+.25);const h=o.createOscillator(),w=o.createGain();h.connect(w),w.connect(o.destination),h.frequency.setValueAtTime(480,c+.3),h.type="sine",w.gain.setValueAtTime(0,c+.3),w.gain.linearRampToValueAtTime(.3,c+.35),w.gain.linearRampToValueAtTime(0,c+.55),h.start(c+.3),h.stop(c+.55)},d=o.currentTime;return u(d),u(d+.6),o},jy=({isRinging:o,isConnected:u,onAccept:d,onDecline:c,mode:m,callDuration:p,isMuted:h,onToggleMute:w,warningShown:v})=>{const[b,z]=g.useState(!0),S=g.useRef(null);g.useEffect(()=>{if(o){S.current=Xm();const q=setInterval(()=>{S.current=Xm()},1500),Y=setInterval(()=>z(M=>!M),800);return()=>{clearInterval(q),clearInterval(Y),S.current&&S.current.close()}}},[o]);const O=q=>{const Y=Math.floor(q/60),M=q%60;return`${Y.toString().padStart(2,"0")}:${M.toString().padStart(2,"0")}`};return!o&&!u?null:r.jsx("div",{className:`call-overlay ${u?"connected":""}`,children:r.jsxs("div",{className:"call-container",children:[o&&r.jsxs(r.Fragment,{children:[r.jsx("div",{className:`call-avatar ${b?"pulse":""}`,children:r.jsx(Ye,{size:40})}),r.jsx("h3",{children:"Aria"}),r.jsx("p",{className:"call-status",children:b?"calling...":"ringing"}),r.jsxs("div",{className:"call-actions",children:[r.jsx("button",{className:"call-btn decline",onClick:c,children:r.jsx(qm,{size:24})}),r.jsx("button",{className:"call-btn accept",onClick:d,children:r.jsx(jh,{size:24})})]})]}),u&&r.jsxs(r.Fragment,{children:[r.jsx("div",{className:`connected-avatar ${v?"warning":""}`,children:r.jsx(Ye,{size:50})}),r.jsx("h3",{children:"Aria"}),r.jsx("p",{className:"call-duration",children:O(p)}),r.jsx("p",{className:"call-mode",children:m.name}),v&&r.jsx("div",{className:"call-warning",children:r.jsx("span",{children:"⚠️ 2 minutes remaining"})}),r.jsxs("div",{className:"call-info",children:[r.jsx(ib,{size:8,fill:h?"#ef4444":"#c9a227"}),r.jsx("span",{children:h?"Muted":"Connected - Voice Chat Active"})]}),r.jsxs("div",{className:"connected-actions",children:[r.jsx("button",{className:`call-btn mute ${h?"muted":""}`,onClick:w,children:h?r.jsx(kb,{size:22}):r.jsx(xh,{size:22})}),r.jsx("button",{className:"call-btn end",onClick:c,children:r.jsx(qm,{size:24})}),r.jsx("button",{className:"call-btn speaker",children:r.jsx(bc,{size:22})})]})]})]})})},Sy=()=>{const[o,u]=g.useState([]),[d,c]=g.useState(""),[m,p]=g.useState(!1),[h,w]=g.useState(Ps[0]),[v,b]=g.useState(!1),[z,S]=g.useState(!1),[O,q]=g.useState(!1),[Y,M]=g.useState(!1),[_,Z]=g.useState(!1),[P,L]=g.useState(null),[te,X]=g.useState(0),[W,B]=g.useState(!1),[J,ae]=g.useState(!1),xe=g.useRef(null),Se=g.useRef(null),F=g.useRef(null),re=g.useRef(null),me=g.useRef(null);g.useEffect(()=>{me.current=P},[P]);const ue=xy(me,h.id,(V,ne,je=!1)=>{je||u(Re=>[...Re,{role:ne,content:V}])},V=>{console.log("Audio output received")},V=>{console.error("Voice call error:",V),re.current&&re.current()},()=>{console.log("Voice call connected")});g.useEffect(()=>{const V=localStorage.getItem("aria_chat_history"),ne=localStorage.getItem("aria_chat_mode");if(V)try{const je=JSON.parse(V);u(je),S(je.length>0)}catch(je){console.error("Error loading chat history:",je)}if(ne){const je=Ps.find(Re=>Re.id===ne);je&&w(je)}},[]),g.useEffect(()=>{o.length>0&&localStorage.setItem("aria_chat_history",JSON.stringify(o))},[o]),g.useEffect(()=>{localStorage.setItem("aria_chat_mode",h.id)},[h]),g.useEffect(()=>{xe.current?.scrollIntoView({behavior:"smooth"})},[o,O]),g.useEffect(()=>(_&&(F.current=setInterval(()=>{X(V=>{const ne=V+1;return ne===gy&&!J&&(ae(!0),u(je=>[...je,{role:"assistant",content:"I'm enjoying our conversation! I wanted to let you know that I have to end our call in about 2 minutes. Is there anything else you'd like to share?"}])),ne>=py&&(re.current&&re.current(),u(je=>[...je,{role:"assistant",content:"It's been wonderful talking with you! I've really enjoyed our conversation about faith. Remember, I'm always here if you want to chat more. Take care and God bless!"}])),ne})},1e3)),()=>{F.current&&clearInterval(F.current)}),[_,J]);const C=async()=>{if(!d.trim()||m||_)return;const V=d;c(""),S(!0),u(ne=>[...ne,{role:"user",content:V}]),p(!0),q(!0);try{const ne=await cy.generate([...o,{role:"user",content:V}],h.id);u(je=>[...je,{role:"assistant",content:ne.content}])}catch(ne){console.error("Chat error:",ne),u(je=>[...je,{role:"assistant",content:"I'm sorry, I encountered an error. Please try again."}])}finally{p(!1),q(!1)}},G=V=>{V.key==="Enter"&&!V.shiftKey&&(V.preventDefault(),C())},ee=V=>{w(V),b(!1),u([{role:"assistant",content:`Hello! I'm your ${V.name}. ${V.description}. How can I help you?`}])},he=V=>{c(V),Se.current?.focus()},ze=async()=>{try{const V=await Nh.createCallSession(h.id);L(V.session_id),M(!0),ae(!1),X(0);const ne=setTimeout(()=>{j()},3e3);window.callTimeout=ne}catch(V){console.error("Failed to initiate call:",V)}},j=async()=>{window.callTimeout&&clearTimeout(window.callTimeout),M(!1),Z(!0),X(0),ae(!1),await ue.connect(),await ue.startRecording(),u(V=>[...V,{role:"assistant",content:"Hello! I'm here to talk with you about your faith. How are you feeling today?"}])},U=()=>{window.callTimeout&&clearTimeout(window.callTimeout),ue.disconnect(),M(!1),Z(!1),L(null),X(0),ae(!1),B(!1)};g.useEffect(()=>{re.current=U},[U]);const Q=()=>{W?ue.startRecording():ue.stopRecording(),B(!W)},K=()=>{u([]),S(!1),localStorage.removeItem("aria_chat_history")},se=h.icon;return r.jsxs("div",{className:"chat-page",children:[r.jsx(by,{}),r.jsxs("header",{className:"chat-header",children:[r.jsxs("div",{className:"header-left",children:[r.jsx("div",{className:"avatar",style:{background:h.color},children:r.jsx(Ye,{size:20})}),r.jsxs("div",{className:"header-info",children:[r.jsx("h2",{children:"Aria"}),r.jsx("p",{children:_?"Voice call...":h.name})]})]}),r.jsxs("div",{className:"header-actions",children:[r.jsxs("button",{className:"mode-selector-btn",onClick:()=>b(!v),style:{"--mode-color":h.color},children:[r.jsx(se,{size:16}),r.jsx("span",{children:h.name}),r.jsx(fh,{size:14,className:v?"rotated":""})]}),r.jsx("button",{className:"header-btn",onClick:ze,disabled:_||Y,title:"Voice call",children:r.jsx(jh,{size:20})}),r.jsx("button",{className:"header-btn",onClick:K,title:"Clear chat",children:r.jsx(rc,{size:20})})]})]}),v&&r.jsxs("div",{className:"mode-dropdown",children:[r.jsxs("div",{className:"mode-header",children:[r.jsx("span",{children:"Choose Chat Mode"}),r.jsx("button",{onClick:()=>b(!1),children:r.jsx(rc,{size:18})})]}),Ps.map(V=>{const ne=V.icon;return r.jsxs("button",{className:`mode-option ${h.id===V.id?"active":""}`,onClick:()=>ee(V),style:{"--mode-color":V.color},children:[r.jsx("div",{className:"mode-icon",style:{background:V.color},children:r.jsx(ne,{size:18})}),r.jsxs("div",{className:"mode-info",children:[r.jsx("span",{children:V.name}),r.jsx("small",{children:V.description})]}),h.id===V.id&&r.jsx(pc,{size:16,className:"check-icon"})]},V.id)})]}),r.jsx("div",{className:"messages-container",children:r.jsxs("div",{className:"messages-list",children:[!z&&o.length===0&&r.jsxs("div",{className:"welcome-section",children:[r.jsx("div",{className:"welcome-icon",children:r.jsx(Ye,{size:40})}),r.jsx("h3",{children:"Welcome to Aria"}),r.jsx("p",{children:"Your AI spiritual companion. Ask me anything about faith, scripture, or life."}),r.jsxs("div",{className:"welcome-features",children:[r.jsxs("span",{children:[r.jsx(Ye,{size:14})," AI-Powered"]}),r.jsxs("span",{children:[r.jsx(Ye,{size:14})," Voice Chat"]}),r.jsxs("span",{children:[r.jsx(Ye,{size:14})," 24/7 Available"]})]}),r.jsxs("div",{className:"welcome-prompts",children:[r.jsx("p",{className:"prompts-label",children:"Try asking me:"}),r.jsx("div",{className:"quick-prompts",children:Vm[h.id].map((V,ne)=>r.jsx("button",{className:"prompt-btn",onClick:()=>he(V),children:V},ne))})]})]}),o.map((V,ne)=>r.jsx(vy,{message:V,isLast:ne===o.length-1},ne)),(m||O)&&r.jsx("div",{className:"message-wrapper incoming",children:r.jsxs("div",{className:"message-bubble typing",children:[r.jsx("span",{className:"typing-dot"}),r.jsx("span",{className:"typing-dot"}),r.jsx("span",{className:"typing-dot"})]})}),r.jsx("div",{ref:xe})]})}),r.jsxs("div",{className:"input-area",children:[r.jsxs("div",{className:"input-container",children:[r.jsx("button",{className:"input-btn",onClick:()=>b(!v),children:r.jsx(ub,{size:20})}),r.jsx("input",{ref:Se,type:"text",value:d,onChange:V=>c(V.target.value),onKeyPress:G,placeholder:`Message ${h.name}...`,disabled:_}),d.trim()?r.jsx("button",{className:"send-btn",onClick:C,disabled:m,children:r.jsx(Yb,{size:20})}):r.jsx("button",{className:"mic-btn",children:r.jsx(xh,{size:20})})]}),!_&&z&&o.length<5&&r.jsx("div",{className:"quick-prompts",children:Vm[h.id].map((V,ne)=>r.jsx("button",{className:"prompt-btn",onClick:()=>he(V),children:V},ne))})]}),r.jsx(jy,{isRinging:Y,isConnected:_,onAccept:()=>j(),onDecline:U,mode:h,callDuration:te,isMuted:W,onToggleMute:Q,warningShown:J}),r.jsx("style",{children:`
        :root {
          --primary: #c9a227;
          --bg-dark: #0a0a0f;
          --bg-card: #141418;
          --text: #f5f5f5;
          --text-muted: #888;
          --border: rgba(255, 255, 255, 0.1);
        }

        .chat-page {
          display: flex;
          flex-direction: column;
          height: 100%;
          background: transparent;
          position: relative;
          overflow: hidden;
        }

        .chat-bg {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          pointer-events: none;
          z-index: 0;
          overflow: hidden;
        }

        .bg-orb {
          position: absolute;
          width: 500px;
          height: 500px;
          border-radius: 50%;
          filter: blur(120px);
          opacity: 0.2;
          background: radial-gradient(circle, var(--primary) 0%, transparent 70%);
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          transition: transform 0.15s ease-out;
        }

        /* Header */
        .chat-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.75rem 1rem;
          background: rgba(15, 15, 20, 0.95);
          border-bottom: 1px solid var(--border);
          z-index: 10;
        }

        .header-left {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .avatar {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: var(--primary);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #0a0a0f;
        }

        .header-info h2 {
          font-size: 1rem;
          font-weight: 600;
          color: var(--text);
          margin: 0;
        }

        .header-info p {
          font-size: 0.75rem;
          color: #9CA3AF;
          margin: 0;
        }

        .header-actions {
          display: flex;
          gap: 0.5rem;
          align-items: center;
        }

        /* Mode Selector Button */
        .mode-selector-btn {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          padding: 0.4rem 0.75rem;
          background: rgba(30, 30, 40, 0.8);
          border: 1px solid var(--mode-color, var(--primary));
          border-radius: 20px;
          color: var(--text);
          font-size: 0.8rem;
          cursor: pointer;
          transition: all 0.2s;
        }

        .mode-selector-btn:hover {
          background: rgba(201, 162, 39, 0.15);
        }

        .mode-selector-btn svg.rotated {
          transform: rotate(180deg);
        }

        .header-btn {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: transparent;
          border: none;
          color: #9CA3AF;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
        }

        .header-btn:hover:not(:disabled) {
          background: #374151;
          color: var(--text);
        }

        .header-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        /* Mode Dropdown */
        .mode-dropdown {
          position: absolute;
          top: 60px;
          right: 10px;
          background: rgba(30, 30, 40, 0.98);
          border: 1px solid rgba(201, 162, 39, 0.3);
          border-radius: 16px;
          z-index: 100;
          width: 300px;
          overflow: hidden;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
        }

        .mode-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem;
          border-bottom: 1px solid var(--border);
          color: var(--text);
          font-weight: 600;
          font-size: 0.9rem;
        }

        .mode-header button {
          background: none;
          border: none;
          color: #9CA3AF;
          cursor: pointer;
        }

        .mode-option {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          width: 100%;
          padding: 0.875rem 1rem;
          background: none;
          border: none;
          cursor: pointer;
          text-align: left;
          transition: all 0.2s;
        }

        .mode-option:hover {
          background: rgba(201, 162, 39, 0.1);
        }

        .mode-option.active {
          background: rgba(201, 162, 39, 0.15);
        }

        .mode-icon {
          width: 40px;
          height: 40px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
        }

        .mode-info {
          flex: 1;
          display: flex;
          flex-direction: column;
        }

        .mode-info span {
          color: var(--text);
          font-weight: 600;
          font-size: 0.95rem;
        }

        .mode-info small {
          color: #9CA3AF;
          font-size: 0.75rem;
        }

        .check-icon {
          color: var(--primary);
        }

        /* Messages */
        .messages-container {
          flex: 1;
          overflow-y: auto;
          background: transparent;
          padding: 1rem 0;
          position: relative;
          z-index: 1;
        }

        .messages-list {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          padding: 0 0.5rem;
        }

        .welcome-section {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 2rem 1rem;
          text-align: center;
        }

        .welcome-icon {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          background: linear-gradient(135deg, var(--primary), #6366f1);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          margin-bottom: 1rem;
          box-shadow: 0 10px 30px rgba(201, 162, 39, 0.3);
        }

        .welcome-section h3 {
          color: var(--text);
          font-size: 1.3rem;
          margin: 0 0 0.5rem;
        }

        .welcome-section p {
          color: #9CA3AF;
          font-size: 0.9rem;
          margin: 0 0 1rem;
          max-width: 300px;
        }

        .welcome-features {
          display: flex;
          gap: 1rem;
          margin-bottom: 1.5rem;
        }

        .welcome-features span {
          display: flex;
          align-items: center;
          gap: 0.25rem;
          color: var(--primary);
          font-size: 0.75rem;
        }

        .welcome-prompts {
          width: 100%;
          max-width: 400px;
        }

        .prompts-label {
          color: #9CA3AF;
          font-size: 0.8rem;
          margin: 0 0 0.75rem;
        }

        /* Message Bubbles */
        .message-wrapper {
          display: flex;
          margin: 0.25rem 0;
          position: relative;
        }

        .message-wrapper.incoming {
          justify-content: flex-start;
        }

        .message-wrapper.outgoing {
          justify-content: flex-end;
        }

        .message-bubble {
          max-width: 75%;
          padding: 0.75rem 1rem;
          border-radius: 16px;
          position: relative;
        }

        .message-wrapper.incoming .message-bubble {
          background: rgba(99, 102, 241, 0.15);
          border: 1px solid rgba(99, 102, 241, 0.2);
          border-top-left-radius: 4px;
        }

        .message-wrapper.outgoing .message-bubble {
          background: var(--primary);
          border-top-right-radius: 4px;
        }

        .message-bubble p, .message-content {
          margin: 0;
          color: var(--text);
          font-size: 0.9rem;
          line-height: 1.5;
        }

        .message-content blockquote {
          margin: 0.5rem 0;
          padding: 0.5rem 0.75rem;
          border-left: 3px solid var(--primary);
          background: rgba(201, 162, 39, 0.1);
          border-radius: 0 8px 8px 0;
          font-style: italic;
        }

        .message-content li {
          margin-left: 1rem;
          list-style: disc;
        }

        .message-content .list-num {
          font-weight: 600;
        }

        .message-meta {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          gap: 0.25rem;
          margin-top: 0.35rem;
        }

        .message-time {
          font-size: 0.65rem;
          color: rgba(255, 255, 255, 0.6);
        }

        .message-status {
          color: var(--text);
        }

        /* Message Actions */
        .message-actions {
          position: absolute;
          top: -10px;
          right: 0;
          display: flex;
          gap: 0.25rem;
          background: rgba(30, 30, 40, 0.95);
          border-radius: 20px;
          padding: 0.25rem;
          border: 1px solid var(--border);
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
        }

        .message-actions button {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background: none;
          border: none;
          color: var(--text);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
        }

        .message-actions button:hover {
          background: rgba(201, 162, 39, 0.2);
          color: var(--primary);
        }

        /* Emoji Picker */
        .emoji-picker {
          position: absolute;
          top: -40px;
          right: 50px;
          display: flex;
          gap: 0.25rem;
          background: rgba(30, 30, 40, 0.95);
          border-radius: 20px;
          padding: 0.35rem;
          border: 1px solid var(--border);
        }

        .emoji-picker button {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background: none;
          border: none;
          cursor: pointer;
          font-size: 1rem;
          transition: transform 0.2s;
        }

        .emoji-picker button:hover {
          transform: scale(1.2);
        }

        /* Typing Indicator */
        .message-bubble.typing {
          display: flex;
          gap: 0.3rem;
          padding: 0.75rem 1rem;
        }

        .typing-dot {
          width: 8px;
          height: 8px;
          background: #9CA3AF;
          border-radius: 50%;
          animation: bounce 1.4s infinite ease-in-out;
        }

        .typing-dot:nth-child(1) { animation-delay: 0s; }
        .typing-dot:nth-child(2) { animation-delay: 0.2s; }
        .typing-dot:nth-child(3) { animation-delay: 0.4s; }

        @keyframes bounce {
          0%, 60%, 100% { transform: translateY(0); }
          30% { transform: translateY(-4px); }
        }

        /* Input Area */
        .input-area {
          padding: 0.75rem 1rem 1rem;
          background: rgba(15, 15, 20, 0.95);
          border-top: 1px solid var(--border);
        }

        .input-container {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: rgba(30, 30, 40, 0.8);
          border: 1px solid var(--border);
          border-radius: 24px;
          padding: 0.5rem 0.75rem;
          transition: border-color 0.2s;
        }

        .input-container:focus-within {
          border-color: var(--primary);
        }

        .input-container input {
          flex: 1;
          background: none;
          border: none;
          outline: none;
          color: var(--text);
          font-size: 0.9rem;
          padding: 0.25rem 0.5rem;
        }

        .input-container input::placeholder {
          color: #9CA3AF;
        }

        .input-btn, .mic-btn {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: none;
          border: none;
          color: #9CA3AF;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
        }

        .input-btn:hover, .mic-btn:hover {
          background: rgba(201, 162, 39, 0.15);
          color: var(--primary);
        }

        .send-btn {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: var(--primary);
          border: none;
          color: #0a0a0f;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
        }

        .send-btn:hover:not(:disabled) {
          background: #d4a017;
          transform: scale(1.05);
        }

        .send-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        /* Quick Prompts */
        .quick-prompts {
          display: flex;
          gap: 0.5rem;
          overflow-x: auto;
          padding: 0.75rem 0 0;
        }

        .quick-prompts::-webkit-scrollbar {
          display: none;
        }

        .prompt-btn {
          padding: 0.5rem 0.875rem;
          background: rgba(30, 30, 40, 0.8);
          border: 1px solid rgba(201, 162, 39, 0.2);
          border-radius: 20px;
          color: #e4e4e7;
          font-size: 0.8rem;
          white-space: nowrap;
          cursor: pointer;
          transition: all 0.2s;
        }

        .prompt-btn:hover {
          background: rgba(201, 162, 39, 0.2);
          border-color: rgba(201, 162, 39, 0.5);
          transform: translateY(-1px);
        }

        /* Call Overlay */
        .call-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f0f23 100%);
          z-index: 1000;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .call-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          color: white;
        }

        .call-avatar {
          width: 120px;
          height: 120px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.2);
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 1.5rem;
          border: 3px solid white;
        }

        .call-avatar.pulse {
          animation: pulse 0.8s ease-in-out infinite;
        }

        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }

        .call-container h3 {
          font-size: 1.5rem;
          margin: 0 0 0.5rem;
        }

        .call-status {
          font-size: 1rem;
          opacity: 0.8;
          margin: 0 0 2rem;
        }

        .call-duration {
          font-size: 2rem;
          font-weight: 300;
          margin: 0 0 0.25rem;
        }

        .call-mode {
          font-size: 0.875rem;
          opacity: 0.8;
          margin: 0 0 1.5rem;
        }

        .call-warning {
          background: rgba(239, 68, 68, 0.2);
          border: 1px solid #ef4444;
          border-radius: 8px;
          padding: 0.5rem 1rem;
          margin-bottom: 1rem;
          font-size: 0.875rem;
          color: #ef4444;
        }

        .call-info {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.875rem;
          margin-bottom: 2rem;
        }

        .call-actions, .connected-actions {
          display: flex;
          gap: 2rem;
        }

        .call-btn {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
        }

        .call-btn.decline { background: #ef4444; color: white; }
        .call-btn.accept { background: var(--primary); color: #0a0a0f; }
        .call-btn.end { background: #ef4444; color: white; }
        .call-btn.mute, .call-btn.speaker { background: rgba(255, 255, 255, 0.2); color: white; }
        .call-btn.mute.muted { background: #ef4444; color: white; }

        .call-btn:hover { transform: scale(1.1); }

        .connected-avatar {
          width: 100px;
          height: 100px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.2);
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 1rem;
          border: 3px solid white;
        }

        .connected-avatar.warning {
          border-color: #ef4444;
          animation: warningPulse 1s ease-in-out infinite;
        }

        @keyframes warningPulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.4); }
          50% { box-shadow: 0 0 0 15px rgba(239, 68, 68, 0); }
        }

        /* Responsive */
        @media (max-width: 768px) {
          .message-bubble { max-width: 88%; }
          .mode-dropdown { 
            width: calc(100% - 20px); 
            left: 10px; 
            right: 10px; 
            top: 55px; 
            border-radius: 12px; 
          }
          .mode-selector-btn span {
            display: none;
          }
          .quick-prompts {
            flex-wrap: nowrap;
          }
          .prompt-btn {
            font-size: 0.75rem;
            padding: 0.4rem 0.75rem;
          }
        }
      `})]})},wy=()=>{const[o,u]=g.useState({x:0,y:0});return g.useEffect(()=>{const d=c=>{u({x:(c.clientX/window.innerWidth-.5)*8,y:(c.clientY/window.innerHeight-.5)*8})};return window.addEventListener("mousemove",d),()=>window.removeEventListener("mousemove",d)},[]),r.jsx("div",{className:"page-bg",children:r.jsx("div",{className:"bg-orb",style:{transform:`translate(${o.x}px, ${o.y}px)`}})})},Ny={"Old Testament":[{name:"Genesis",chapters:50},{name:"Exodus",chapters:40},{name:"Leviticus",chapters:27},{name:"Numbers",chapters:36},{name:"Deuteronomy",chapters:34},{name:"Joshua",chapters:24},{name:"Judges",chapters:21},{name:"Ruth",chapters:4},{name:"1 Samuel",chapters:31},{name:"2 Samuel",chapters:24},{name:"1 Kings",chapters:22},{name:"2 Kings",chapters:25},{name:"1 Chronicles",chapters:29},{name:"2 Chronicles",chapters:36},{name:"Ezra",chapters:10},{name:"Nehemiah",chapters:13},{name:"Esther",chapters:10},{name:"Job",chapters:42},{name:"Psalms",chapters:150},{name:"Proverbs",chapters:31},{name:"Ecclesiastes",chapters:12},{name:"Song of Solomon",chapters:8},{name:"Isaiah",chapters:66},{name:"Jeremiah",chapters:52},{name:"Lamentations",chapters:5},{name:"Ezekiel",chapters:48},{name:"Daniel",chapters:12},{name:"Hosea",chapters:14},{name:"Joel",chapters:3},{name:"Amos",chapters:9},{name:"Obadiah",chapters:1},{name:"Jonah",chapters:4},{name:"Micah",chapters:7},{name:"Nahum",chapters:3},{name:"Habakkuk",chapters:3},{name:"Zephaniah",chapters:3},{name:"Haggai",chapters:2},{name:"Zechariah",chapters:14},{name:"Malachi",chapters:4}],"New Testament":[{name:"Matthew",chapters:28},{name:"Mark",chapters:16},{name:"Luke",chapters:24},{name:"John",chapters:21},{name:"Acts",chapters:28},{name:"Romans",chapters:16},{name:"1 Corinthians",chapters:16},{name:"2 Corinthians",chapters:13},{name:"Galatians",chapters:6},{name:"Ephesians",chapters:6},{name:"Philippians",chapters:4},{name:"Colossians",chapters:4},{name:"1 Thessalonians",chapters:5},{name:"2 Thessalonians",chapters:3},{name:"1 Timothy",chapters:6},{name:"2 Timothy",chapters:4},{name:"Titus",chapters:3},{name:"Philemon",chapters:1},{name:"Hebrews",chapters:13},{name:"James",chapters:5},{name:"1 Peter",chapters:5},{name:"2 Peter",chapters:3},{name:"1 John",chapters:5},{name:"2 John",chapters:1},{name:"3 John",chapters:1},{name:"Jude",chapters:1},{name:"Revelation",chapters:22}]},zy=({book:o,isSelected:u,onClick:d})=>r.jsx("button",{className:`book-card ${u?"selected":""}`,onClick:d,children:r.jsxs("div",{className:"book-card-content",children:[r.jsx("h4",{children:o.name}),r.jsxs("p",{children:[o.chapters," chapters"]})]})}),Ey=({verse:o})=>{const[u,d]=g.useState(!1);return r.jsxs("div",{className:"verse-card",children:[r.jsx("span",{className:"verse-number",children:o.verse}),r.jsx("p",{className:"verse-text",children:o.text}),r.jsxs("div",{className:"verse-actions",children:[r.jsx("button",{className:`verse-action ${u?"saved":""}`,onClick:()=>d(!u),children:r.jsx(F1,{size:14,fill:u?"currentColor":"none"})}),r.jsx("button",{className:"verse-action",children:r.jsx(Qb,{size:14})}),r.jsx("button",{className:"verse-action",children:r.jsx(bc,{size:14})})]})]})},Ay=()=>{const o=qa(),[u,d]=g.useState(null),[c,m]=g.useState(1),[p,h]=g.useState(""),[w,v]=g.useState(""),[b,z]=g.useState(!1),[S,O]=g.useState([]),[q,Y]=g.useState("books"),[M,_]=g.useState(0);g.useEffect(()=>{u&&(async()=>{try{const J=await oc.getChapter(u.name,c);J.verses&&(O(J.verses),_(0))}catch(J){console.error("Error fetching verses:",J),O([])}})()},[u,c]),g.useEffect(()=>{if(S.length>0){const B=()=>{const ae=document.getElementById("verses-container");if(ae){const xe=ae.scrollTop/(ae.scrollHeight-ae.clientHeight)*100;_(Math.min(xe,100))}},J=document.getElementById("verses-container");return J?.addEventListener("scroll",B),()=>J?.removeEventListener("scroll",B)}},[S]);const Z=()=>{const J=window.getSelection().toString().trim();J&&(v(J),z(!0))},P=()=>{o("/app/bible-study",{state:{book:u?.name,chapter:c,selectedText:w}})},L=B=>{d(B),m(1),Y("chapters")},te=B=>{m(B),Y("reading")},X=()=>{q==="reading"?Y("chapters"):q==="chapters"&&(Y("books"),d(null))},W=Object.entries(Ny).reduce((B,[J,ae])=>{const xe=ae.filter(Se=>Se.name.toLowerCase().includes(p.toLowerCase()));return xe.length>0&&(B[J]=xe),B},{});return r.jsxs("div",{className:"page-container",children:[r.jsx(wy,{}),r.jsxs("div",{className:"page-content",children:[r.jsxs("header",{className:"bible-header",children:[r.jsxs("div",{className:"bible-header-left",children:[q!=="books"&&r.jsx("button",{className:"back-btn",onClick:X,children:r.jsx(Q1,{size:20})}),r.jsxs("div",{children:[r.jsxs("h1",{children:[r.jsx(Qt,{size:22})," Scripture"]}),u?r.jsxs("p",{children:[u.name," ",c>0&&`• Chapter ${c}`]}):r.jsx("p",{children:"Explore God's Word"})]})]}),q==="reading"&&r.jsxs("div",{className:"reading-progress",children:[r.jsx("div",{className:"progress-bar",children:r.jsx("div",{className:"progress-fill",style:{width:`${M}%`}})}),r.jsxs("span",{children:[Math.round(M),"% read"]})]})]}),q==="books"&&r.jsx("div",{className:"search-container",children:r.jsxs("div",{className:"search-box",children:[r.jsx(ic,{size:20}),r.jsx("input",{type:"text",placeholder:"Search books of the Bible...",value:p,onChange:B=>h(B.target.value)})]})}),r.jsxs("div",{className:"bible-content",children:[q==="books"&&r.jsxs("div",{className:"books-view",children:[r.jsxs("div",{className:"verse-of-day",children:[r.jsx("div",{className:"vod-header",children:r.jsx("span",{children:"✨ Verse of the Day"})}),r.jsx("blockquote",{children:'"For I know the plans I have for you," declares the LORD, "plans to prosper you and not to harm you, plans to give you hope and a future."'}),r.jsx("cite",{children:"— Jeremiah 29:11"})]}),r.jsx("div",{className:"testaments-container",children:Object.entries(W).map(([B,J])=>r.jsxs("div",{className:"testament-section",children:[r.jsx("h3",{className:"testament-title",children:B}),r.jsx("div",{className:"books-grid",children:J.map(ae=>r.jsx(zy,{book:ae,isSelected:u?.name===ae.name,onClick:()=>L(ae)},ae.name))})]},B))})]}),q==="chapters"&&u&&r.jsxs("div",{className:"chapters-view",children:[r.jsxs("div",{className:"selected-book-display",children:[r.jsx("div",{className:"book-preview",children:r.jsx("span",{className:"preview-icon",children:"📖"})}),r.jsxs("div",{className:"book-preview-info",children:[r.jsx("h2",{children:u.name}),r.jsxs("p",{children:[u.chapters," chapters"]})]})]}),r.jsxs("div",{className:"chapters-section",children:[r.jsx("h3",{children:"Select a Chapter"}),r.jsx("div",{className:"chapter-grid",children:Array.from({length:u.chapters},(B,J)=>r.jsx("button",{className:`chapter-btn ${c===J+1?"active":""}`,onClick:()=>te(J+1),children:J+1},J+1))})]})]}),q==="reading"&&u&&r.jsxs("div",{className:"reading-view",children:[r.jsxs("div",{id:"verses-container",className:"verses-container",onMouseUp:Z,children:[r.jsxs("div",{className:"chapter-header",children:[r.jsxs("h2",{children:["Chapter ",c]}),r.jsxs("span",{children:[S.length," verses"]})]}),S.map(B=>r.jsx(Ey,{verse:B},B.verse))]}),r.jsxs("div",{className:"reading-nav",children:[r.jsxs("button",{className:"nav-chapter-btn",disabled:c<=1,onClick:()=>m(B=>B-1),children:[r.jsx(tb,{size:20}),"Previous"]}),r.jsxs("button",{className:"nav-chapter-btn",disabled:c>=u.chapters,onClick:()=>m(B=>B+1),children:["Next",r.jsx(nb,{size:20})]})]}),b&&r.jsxs("div",{className:"ai-discuss-popup",children:[r.jsx("p",{children:"Discuss this verse with AI:"}),r.jsxs("blockquote",{children:['"',w.substring(0,80),'..."']}),r.jsxs("div",{className:"popup-actions",children:[r.jsxs("button",{className:"btn btn-primary",onClick:P,children:[r.jsx(xr,{size:16}),"Study with AI"]}),r.jsx("button",{className:"btn btn-ghost",onClick:()=>z(!1),children:"Cancel"})]})]})]})]})]}),r.jsx("style",{children:`
        :root {
          --primary: #c9a227;
          --bg-dark: #0a0a0f;
          --bg-card: #141418;
          --text: #f5f5f5;
          --text-muted: #888;
          --border: rgba(255, 255, 255, 0.1);
        }

        .page-container {
          min-height: 100vh;
          position: relative;
          overflow: hidden;
        }

        .page-bg {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          z-index: 0;
          overflow: hidden;
        }

        .bg-orb {
          position: absolute;
          width: 500px;
          height: 500px;
          border-radius: 50%;
          filter: blur(100px);
          opacity: 0.15;
          background: radial-gradient(circle, #6366f1 0%, transparent 70%);
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          transition: transform 0.15s ease-out;
        }

        .page-content {
          position: relative;
          z-index: 1;
          max-width: 1200px;
          margin: 0 auto;
          padding: 1.5rem;
        }

        /* Header */
        .bible-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
          padding-bottom: 1rem;
          border-bottom: 1px solid var(--border);
        }

        .bible-header-left {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .bible-header-left h1 {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--text);
          margin: 0;
        }

        .bible-header-left h1 svg {
          color: #c9a227;
        }

        .bible-header-left p {
          color: var(--text-muted);
          font-size: 0.875rem;
          margin: 0;
        }

        .back-btn {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.1);
          border: none;
          color: var(--text);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
        }

        .back-btn:hover {
          background: rgba(201, 162, 39, 0.2);
        }

        /* Reading Progress */
        .reading-progress {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .progress-bar {
          width: 100px;
          height: 6px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 3px;
          overflow: hidden;
        }

        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #c9a227, #f4d03f);
          border-radius: 3px;
          transition: width 0.3s ease;
        }

        .reading-progress span {
          color: var(--text-muted);
          font-size: 0.75rem;
        }

        /* Search */
        .search-container {
          margin-bottom: 1.5rem;
        }

        .search-box {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: 14px;
          padding: 0.75rem 1.25rem;
          max-width: 500px;
        }

        .search-box svg {
          color: var(--text-muted);
        }

        .search-box input {
          flex: 1;
          background: none;
          border: none;
          outline: none;
          color: var(--text);
          font-size: 1rem;
        }

        .search-box input::placeholder {
          color: var(--text-muted);
        }

        /* Books View */
        .books-view {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        /* Verse of the Day */
        .verse-of-day {
          background: rgba(201, 162, 39, 0.08);
          border: 1px solid rgba(201, 162, 39, 0.2);
          border-radius: 16px;
          padding: 1.5rem;
        }

        .vod-header {
          color: #c9a227;
          margin-bottom: 0.75rem;
          font-weight: 600;
        }

        .verse-of-day blockquote {
          color: var(--text);
          font-size: 1.1rem;
          font-style: italic;
          line-height: 1.7;
          margin: 0 0 0.75rem;
        }

        .verse-of-day cite {
          color: #c9a227;
          font-style: normal;
          font-weight: 500;
          font-size: 0.9rem;
        }

        /* Testaments */
        .testament-section {
          margin-bottom: 1.5rem;
        }

        .testament-title {
          font-size: 1.1rem;
          font-weight: 600;
          color: var(--text);
          margin-bottom: 1rem;
          padding-bottom: 0.5rem;
          border-bottom: 1px solid var(--border);
        }

        .books-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
          gap: 0.75rem;
        }

        /* Book Card */
        .book-card {
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: 12px;
          padding: 1rem;
          cursor: pointer;
          transition: all 0.2s;
          text-align: left;
        }

        .book-card:hover {
          border-color: rgba(201, 162, 39, 0.5);
          background: rgba(201, 162, 39, 0.05);
        }

        .book-card.selected {
          border-color: #c9a227;
        }

        .book-card h4 {
          color: var(--text);
          font-size: 0.9rem;
          font-weight: 600;
          margin: 0 0 0.25rem;
        }

        .book-card p {
          color: var(--text-muted);
          font-size: 0.75rem;
          margin: 0;
        }

        /* Chapters View */
        .chapters-view {
          max-width: 600px;
          margin: 0 auto;
        }

        .selected-book-display {
          display: flex;
          align-items: center;
          gap: 1.25rem;
          padding: 1.5rem;
          background: var(--bg-card);
          border-radius: 16px;
          margin-bottom: 1.5rem;
        }

        .book-preview {
          width: 70px;
          height: 90px;
          background: linear-gradient(135deg, #6366f1, #4f46e5);
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .preview-icon {
          font-size: 2rem;
        }

        .book-preview-info h2 {
          color: var(--text);
          font-size: 1.5rem;
          margin: 0 0 0.25rem;
        }

        .book-preview-info p {
          color: var(--text-muted);
          margin: 0;
          font-size: 0.9rem;
        }

        .chapters-section h3 {
          color: var(--text);
          font-size: 1rem;
          margin-bottom: 1rem;
        }

        /* Chapter Grid */
        .chapter-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(55px, 1fr));
          gap: 0.5rem;
        }

        .chapter-btn {
          aspect-ratio: 1;
          border-radius: 10px;
          background: var(--bg-card);
          border: 1px solid var(--border);
          color: var(--text);
          font-size: 0.9rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }

        .chapter-btn:hover {
          background: rgba(201, 162, 39, 0.2);
          border-color: #c9a227;
        }

        .chapter-btn.active {
          background: linear-gradient(135deg, #c9a227, #d97706);
          border-color: #c9a227;
        }

        /* Reading View */
        .reading-view {
          max-width: 800px;
          margin: 0 auto;
        }

        .verses-container {
          background: var(--bg-card);
          border-radius: 16px;
          padding: 1.5rem;
          max-height: 65vh;
          overflow-y: auto;
          margin-bottom: 1rem;
        }

        .chapter-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.25rem;
          padding-bottom: 1rem;
          border-bottom: 1px solid var(--border);
        }

        .chapter-header h2 {
          color: var(--text);
          font-size: 1.25rem;
          margin: 0;
        }

        .chapter-header span {
          color: var(--text-muted);
          font-size: 0.85rem;
        }

        /* Verse Card */
        .verse-card {
          display: flex;
          gap: 0.75rem;
          padding: 0.875rem;
          margin-bottom: 0.25rem;
          border-radius: 10px;
          transition: background 0.2s;
        }

        .verse-card:hover {
          background: rgba(255, 255, 255, 0.03);
        }

        .verse-number {
          color: #c9a227;
          font-weight: 600;
          font-size: 0.8rem;
          min-width: 22px;
        }

        .verse-text {
          color: #e4e4e7;
          line-height: 1.7;
          margin: 0;
          flex: 1;
          font-size: 0.95rem;
        }

        .verse-actions {
          display: flex;
          gap: 0.25rem;
          opacity: 0;
          transition: opacity 0.2s;
        }

        .verse-card:hover .verse-actions {
          opacity: 1;
        }

        .verse-action {
          width: 26px;
          height: 26px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.1);
          border: none;
          color: var(--text-muted);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
        }

        .verse-action:hover {
          background: rgba(201, 162, 39, 0.2);
          color: #c9a227;
        }

        .verse-action.saved {
          color: #c9a227;
        }

        /* Reading Nav */
        .reading-nav {
          display: flex;
          justify-content: space-between;
          gap: 1rem;
        }

        .nav-chapter-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1.25rem;
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: 10px;
          color: var(--text);
          font-size: 0.9rem;
          cursor: pointer;
          transition: all 0.2s;
        }

        .nav-chapter-btn:hover:not(:disabled) {
          background: rgba(201, 162, 39, 0.2);
          border-color: #c9a227;
        }

        .nav-chapter-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        /* AI Popup */
        .ai-discuss-popup {
          position: fixed;
          bottom: 2rem;
          left: 50%;
          transform: translateX(-50%);
          background: var(--bg-card);
          border: 1px solid rgba(201, 162, 39, 0.3);
          border-radius: 14px;
          padding: 1.25rem;
          max-width: 380px;
          z-index: 100;
        }

        .ai-discuss-popup p {
          color: var(--text);
          margin: 0 0 0.5rem;
          font-weight: 500;
        }

        .ai-discuss-popup blockquote {
          color: var(--text-muted);
          font-size: 0.85rem;
          margin: 0 0 1rem;
          font-style: italic;
        }

        .popup-actions {
          display: flex;
          gap: 0.75rem;
        }

        .btn {
          padding: 0.625rem 1rem;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          font-size: 0.85rem;
          border: none;
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
        }

        .btn-primary {
          background: linear-gradient(135deg, #c9a227, #d97706);
          color: white;
        }

        .btn-primary:hover {
          background: linear-gradient(135deg, #d4a92c, #c9a227);
        }

        .btn-ghost {
          background: transparent;
          border: 1px solid var(--border);
          color: var(--text-muted);
        }

        .btn-ghost:hover {
          background: rgba(255, 255, 255, 0.05);
        }

        /* Responsive */
        @media (max-width: 768px) {
          .bible-header {
            flex-direction: column;
            gap: 1rem;
            align-items: flex-start;
          }

          .books-grid {
            grid-template-columns: repeat(2, 1fr);
          }

          .selected-book-display {
            flex-direction: column;
            text-align: center;
          }

          .chapter-grid {
            grid-template-columns: repeat(auto-fill, minmax(45px, 1fr));
          }
        }
      `})]})},Ty=()=>{const[o,u]=g.useState({x:0,y:0});return g.useEffect(()=>{const d=c=>{u({x:(c.clientX/window.innerWidth-.5)*10,y:(c.clientY/window.innerHeight-.5)*10})};return window.addEventListener("mousemove",d),()=>window.removeEventListener("mousemove",d)},[]),r.jsxs("div",{className:"page-bg",children:[r.jsx("div",{className:"bg-orb orb-1",style:{transform:`translate(${o.x}px, ${o.y}px)`}}),r.jsx("div",{className:"bg-orb orb-2",style:{transform:`translate(${-o.x}px, ${-o.y}px)`}})]})},rn=o=>{const u=o.trim().toLowerCase(),d=/^(\d?\s*[a-z]+)\s+(\d+):(\d+)(?:-(\d+))?$/i,c=u.match(d);if(c)return{type:"verse",book:c[1].trim(),chapter:c[2],verse:c[3],endVerse:c[4]};const m=/^(\d?\s*[a-z]+)\s+(\d+)$/i,p=u.match(m);return p?{type:"chapter",book:p[1].trim(),chapter:p[2]}:{type:"topic",topic:u}},ky=()=>{const[o,u]=g.useState("select"),[d,c]=g.useState(""),[m,p]=g.useState(null),[h,w]=g.useState(null),[v,b]=g.useState([]),[z,S]=g.useState(""),[O,q]=g.useState(!1),[Y,M]=g.useState(!1),[_,Z]=g.useState(!1),P=g.useRef(null),L=()=>{P.current?.scrollIntoView({behavior:"smooth"})};g.useEffect(()=>{L()},[v]);const te=F=>{const re=F.target.value;c(re),re.trim()?p(rn(re)):p(null)},X=async()=>{if(!d.trim())return;const F=rn(d);p(F),q(!0);try{let re=null;if(F.type==="verse"){try{const me=await oc.getChapter(F.book.toLowerCase().trim(),parseInt(F.chapter)),ue=parseInt(F.verse),C=me.verses?.find(G=>G.verse===ue);C&&(re={type:"verse",reference:`${F.book} ${F.chapter}:${F.verse}`,text:C.text,book:F.book,chapter:parseInt(F.chapter),verse:ue})}catch{console.log("Verse not found, falling back to topic")}re||(re={type:"topic",topic:d.trim(),reference:null,text:null})}else if(F.type==="chapter")try{const me=await oc.getChapter(F.book.toLowerCase().trim(),parseInt(F.chapter)),ue=me.verses?.map(C=>C.text).join(" ");re={type:"chapter",reference:`${F.book} ${F.chapter}`,text:ue,verses:me.verses,book:F.book,chapter:parseInt(F.chapter)}}catch{re={type:"topic",topic:d.trim(),reference:null,text:null}}else re={type:"topic",topic:F.topic,reference:null,text:null};if(w(re),re.type==="verse"){const me=`Hi friend! 👋 I'm so glad you're here to study God's Word with me today. We're looking at "${re.text}" (${re.reference}).

Take a moment to read it slowly. What stands out to you? What's on your heart as you read this passage?`;b([{role:"companion",content:me}]),u("study")}else if(re.type==="chapter"){const me=`Hi friend! 👋 I'm so glad you're here to study God's Word with me today. We're diving into ${re.reference} - that's a whole chapter!

This passage has ${re.verses?.length||0} verses. Feel free to read through it at your own pace. What catches your attention? What would you like to explore together?`;b([{role:"companion",content:me}]),u("study")}else{u("study"),b([{role:"companion",content:"Let me prepare something special for your study topic..."}]);try{const me=`You are a warm, faith-filled Bible study companion. The user wants to explore the topic: "${re.topic}"

Write a brief, welcoming introduction (2-3 sentences) that:
- Expresses genuine excitement about exploring this topic together
- Briefly mentions why this topic is meaningful in Scripture
- Ends with an open question inviting them to share what aspect they'd like to explore

Be conversational, warm, and not preachy. Don't use bullet points.`,ue=localStorage.getItem("authToken"),C={"Content-Type":"application/json"};ue&&(C.Authorization=`Bearer ${ue}`);const G=await fetch("http://localhost:8002/api/v1/ai/generate",{method:"POST",headers:C,body:JSON.stringify({messages:[{role:"user",content:me}],mode:"bibleStudy"})});if(G.ok){const ee=await G.json();b([{role:"companion",content:ee.content}])}}catch(me){console.error(me),b([{role:"companion",content:`Hi friend! 👋 I'm so glad you're here to study God's Word with me today. You want to explore: "${re.topic}"

This is a wonderful topic! The Bible has so much to say about it. What aspect would you like to start with?`}])}}}catch(re){console.error(re)}finally{q(!1)}},W=async()=>{if(!z.trim())return;const F=z.trim();S(""),b(re=>[...re,{role:"user",content:F}]),q(!0);try{const re=v.map(he=>`${he.role==="user"?"User":"Companion"}: ${he.content}`).join(`

`);let me="";h?.type==="verse"?me=`Current study passage: "${h.text}" (${h.reference})`:h?.type==="chapter"?me=`Current study passage: ${h.reference} (${h.verses?.length} verses)`:me=`Current study topic: "${h?.topic}"`;const ue=localStorage.getItem("authToken"),C={"Content-Type":"application/json"};ue&&(C.Authorization=`Bearer ${ue}`);const G=`You are a warm, faith-filled Bible study companion having a conversation with a friend. 
      
${me}

Previous conversation:
${re}

User just said: "${F}"

Respond naturally and conversationally as a friend in faith would. 
- Ask follow-up questions about what they think and feel
- Share insights from Scripture when relevant
- If you agree with their interpretation, affirm them warmly
- If you see things differently, share your perspective respectfully
- Keep it conversational, not preachy
- Ask what they think, invite them to share more
- If it's a topic study, help them explore different aspects and verses related to the topic

Be genuine, warm, and supportive. Don't use bullet points or overly structured responses.`,ee=await fetch("http://localhost:8002/api/v1/ai/generate",{method:"POST",headers:C,body:JSON.stringify({messages:[{role:"user",content:G}],mode:"bibleStudy"})});if(ee.ok){const he=await ee.json();b(ze=>[...ze,{role:"companion",content:he.content}])}}catch(re){console.error(re),b(me=>[...me,{role:"companion",content:"I'm here with you. Would you like to share more about what you're thinking?"}])}finally{q(!1)}},B=()=>{Z(!0),b(F=>[...F,{role:"companion",content:`Thank you for sharing your heart with me today, friend. 💛

Before we close, let me pray for you...`}]),u("pray")},J=async()=>{M(!0),q(!0);const F=v.map(G=>`${G.role==="user"?"User":"Companion"}: ${G.content}`).join(`

`),re=localStorage.getItem("authToken"),me={"Content-Type":"application/json"};re&&(me.Authorization=`Bearer ${re}`);let ue="";h?.type==="verse"?ue=`They were studying: "${h.text}" (${h.reference})`:h?.type==="chapter"?ue=`They were studying: ${h.reference}`:ue=`They were studying the topic: "${h?.topic}"`;const C=`You are a warm, faith-filled Bible study companion. The user just clicked "Receive Prayer" at the end of their study session.

${ue}

Here's what they shared during the study:
${F}

Write a heartfelt, personal prayer (3-4 sentences) that:
- Thanks God for the conversation and what was discussed
- Prays specifically for things they mentioned or struggled with
- Asks for wisdom and application of what they learned
- Ends with encouragement

Make it personal based on what they shared. Don't use bullet points. End with "Amen." and then add a brief closing message about completing the session.`;try{const G=await fetch("http://localhost:8002/api/v1/ai/generate",{method:"POST",headers:me,body:JSON.stringify({messages:[{role:"user",content:C}],mode:"bibleStudy"})});if(G.ok){const ee=await G.json();b(he=>[...he,{role:"companion",content:ee.content}])}}catch(G){console.error(G),b(ee=>[...ee,{role:"companion",content:`Father, thank you for your Word and for this time together. I pray that what we've discussed would take root in this person's heart and bear fruit in their life. Give them wisdom to apply what they've learned and draw them closer to you each day. We love you Lord. Amen.

📖 You've completed this study session! Come back anytime to continue growing in faith together. 💛`}])}finally{q(!1)}},ae=()=>{u("select"),c(""),p(null),w(null),b([]),M(!1),Z(!1)},Se=m?m.type==="verse"?{icon:Qt,label:"Verse",color:"#8b5cf6"}:m.type==="chapter"?{icon:Lm,label:"Chapter",color:"#10b981"}:{icon:ic,label:"Topic",color:"#c9a227"}:null;return r.jsxs("div",{className:"page-container",children:[r.jsx(Ty,{}),r.jsxs("div",{className:"page-content",children:[o==="select"&&r.jsxs("div",{className:"hero-section",children:[r.jsx("div",{className:"hero-icon",children:r.jsx(Ye,{size:32})}),r.jsx("h1",{children:"Bible Study Companion"}),r.jsx("p",{children:"Let's study God's Word together — verse, chapter, or any topic"})]}),o==="select"&&r.jsxs("div",{className:"input-card",children:[r.jsxs("div",{className:"card-header",children:[r.jsx(Qt,{size:20}),r.jsx("h2",{children:"What would you like to study today?"})]}),r.jsxs("div",{className:"input-wrapper",children:[r.jsx("input",{type:"text",value:d,onChange:te,placeholder:"Try: John 3:16, Psalm 23, or 'God's love'",className:"main-input",onKeyPress:F=>F.key==="Enter"&&X()}),Se&&r.jsxs("div",{className:"input-hint",style:{borderColor:Se.color,color:Se.color},children:[r.jsx(Se.icon,{size:14}),r.jsx("span",{children:Se.label})]})]}),r.jsxs("div",{className:"examples",children:[r.jsx("span",{className:"examples-label",children:"Try:"}),r.jsx("button",{onClick:()=>{c("John 3:16"),p(rn("John 3:16"))},children:"John 3:16"}),r.jsx("button",{onClick:()=>{c("Psalm 23"),p(rn("Psalm 23"))},children:"Psalm 23"}),r.jsx("button",{onClick:()=>{c("Faith"),p(rn("Faith"))},children:"Faith"}),r.jsx("button",{onClick:()=>{c("God's love"),p(rn("God's love"))},children:"God's love"}),r.jsx("button",{onClick:()=>{c("Prayer"),p(rn("Prayer"))},children:"Prayer"})]}),r.jsx("button",{onClick:X,className:"btn btn-primary btn-large",disabled:O||!d.trim(),children:O?"Loading...":r.jsxs(r.Fragment,{children:[r.jsx(Sh,{size:18}),"Begin Study"]})})]}),(o==="study"||o==="pray")&&h&&r.jsxs("div",{className:"study-container",children:[h.type!=="topic"&&r.jsxs("div",{className:"verse-banner",children:[r.jsxs("span",{className:"verse-ref",children:[h.type==="chapter"&&r.jsx(Lm,{size:14}),h.type==="verse"&&r.jsx(Qt,{size:14})," ",h.reference]}),h.text&&r.jsx("p",{className:"verse-text",children:h.type==="verse"?`"${h.text}"`:`${h.verses?.slice(0,3).map(F=>F.text).join(" ")}...`}),h.type==="topic"&&r.jsxs("p",{className:"topic-text",children:["Exploring: ",h.topic]})]}),h.type==="topic"&&r.jsxs("div",{className:"topic-banner",children:[r.jsx(ic,{size:20}),r.jsxs("div",{children:[r.jsx("span",{className:"topic-label",children:"Exploring Topic"}),r.jsx("h3",{children:h.topic})]})]}),r.jsxs("div",{className:"chat-section",children:[r.jsxs("div",{className:"messages-container",children:[v.map((F,re)=>r.jsxs("div",{className:`message ${F.role}`,children:[r.jsx("div",{className:"message-avatar",children:F.role==="companion"?"✝️":"👤"}),r.jsx("div",{className:"message-content",children:F.content})]},re)),O&&r.jsxs("div",{className:"message companion",children:[r.jsx("div",{className:"message-avatar",children:"✝️"}),r.jsxs("div",{className:"message-content typing",children:[r.jsx("span",{children:"•"}),r.jsx("span",{children:"•"}),r.jsx("span",{children:"•"})]})]}),r.jsx("div",{ref:P})]}),o==="study"&&r.jsxs("div",{className:"input-area",children:[r.jsx("input",{type:"text",value:z,onChange:F=>S(F.target.value),onKeyPress:F=>F.key==="Enter"&&W(),placeholder:"Share your thoughts...",disabled:O}),r.jsx("button",{onClick:W,disabled:O||!z.trim(),className:"send-btn",children:r.jsx(on,{size:20})})]}),o==="study"&&v.length>2&&!Y&&r.jsx("div",{className:"study-actions",children:r.jsxs("button",{onClick:B,className:"btn btn-gold",children:[r.jsx(Ba,{size:18}),"End & Pray"]})}),_&&!Y&&r.jsx("div",{className:"prayer-actions",children:r.jsxs("button",{onClick:J,className:"btn btn-primary",children:[r.jsx(Ba,{size:18}),"Receive Prayer"]})}),Y&&r.jsx("div",{className:"new-study",children:r.jsxs("button",{onClick:ae,className:"btn btn-outline",children:[r.jsx(Db,{size:18}),"Start New Study"]})})]})]})]}),r.jsx("style",{children:`
        :root {
          --primary: #c9a227;
          --bg-dark: #0a0a0f;
          --bg-card: #141418;
          --text: #f5f5f5;
          --text-muted: #888;
          --border: rgba(255, 255, 255, 0.1);
        }

        .page-container {
          min-height: 100vh;
          position: relative;
          overflow: hidden;
        }

        .page-bg {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          z-index: 0;
        }

        .bg-orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          opacity: 0.2;
        }

        .bg-orb.orb-1 {
          width: 400px;
          height: 400px;
          background: radial-gradient(circle, #8b5cf6 0%, transparent 70%);
          top: 20%;
          left: 10%;
        }

        .bg-orb.orb-2 {
          width: 350px;
          height: 350px;
          background: radial-gradient(circle, #c9a227 0%, transparent 70%);
          bottom: 20%;
          right: 10%;
        }

        .page-content {
          position: relative;
          z-index: 1;
          max-width: 800px;
          margin: 0 auto;
          padding: 2rem 1.5rem;
        }

        .hero-section {
          text-align: center;
          margin-bottom: 2rem;
        }

        .hero-icon {
          width: 72px;
          height: 72px;
          background: linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(201, 162, 39, 0.2));
          border: 1px solid rgba(139, 92, 246, 0.3);
          border-radius: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #a78bfa;
          margin: 0 auto 1.25rem;
        }

        .hero-section h1 {
          font-size: 2rem;
          font-weight: 700;
          color: var(--text);
          margin: 0 0 0.5rem;
        }

        .hero-section p {
          color: var(--text-muted);
          font-size: 1.05rem;
          margin: 0;
        }

        .input-card {
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: 16px;
          padding: 1.5rem;
        }

        .card-header {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 1.25rem;
          color: #a78bfa;
        }

        .card-header h2 {
          font-size: 1.1rem;
          font-weight: 600;
          color: var(--text);
          margin: 0;
        }

        .input-wrapper {
          position: relative;
          margin-bottom: 1rem;
        }

        .main-input {
          width: 100%;
          padding: 1rem 1.25rem;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid var(--border);
          border-radius: 12px;
          font-size: 1rem;
          color: var(--text);
          transition: border-color 0.2s;
        }

        .main-input:focus {
          outline: none;
          border-color: #8b5cf6;
        }

        .main-input::placeholder {
          color: var(--text-muted);
        }

        .input-hint {
          position: absolute;
          right: 12px;
          top: 50%;
          transform: translateY(-50%);
          display: flex;
          align-items: center;
          gap: 0.4rem;
          padding: 0.35rem 0.65rem;
          background: rgba(0, 0, 0, 0.3);
          border: 1px solid;
          border-radius: 20px;
          font-size: 0.75rem;
          font-weight: 500;
        }

        .examples {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 1.25rem;
        }

        .examples-label {
          color: var(--text-muted);
          font-size: 0.85rem;
        }

        .examples button {
          padding: 0.35rem 0.75rem;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid var(--border);
          border-radius: 20px;
          color: var(--text);
          font-size: 0.8rem;
          cursor: pointer;
          transition: all 0.2s;
        }

        .examples button:hover {
          background: rgba(139, 92, 246, 0.2);
          border-color: #8b5cf6;
        }

        .btn {
          padding: 0.75rem 1.25rem;
          border-radius: 10px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          font-size: 0.9rem;
          border: none;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
        }

        .btn-large {
          width: 100%;
          padding: 0.875rem;
          font-size: 1rem;
        }

        .btn-primary {
          background: linear-gradient(135deg, #8b5cf6, #7c3aed);
          color: white;
        }

        .btn-primary:hover:not(:disabled) {
          background: linear-gradient(135deg, #a78bfa, #8b5cf6);
        }

        .btn-gold {
          background: linear-gradient(135deg, #c9a227, #a88620);
          color: white;
        }

        .btn-outline {
          background: transparent;
          border: 1px solid var(--border);
          color: var(--text);
        }

        .btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        /* Study Container */
        .study-container {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .verse-banner, .topic-banner {
          background: linear-gradient(135deg, rgba(139, 92, 246, 0.15), rgba(201, 162, 39, 0.1));
          border: 1px solid rgba(139, 92, 246, 0.3);
          border-radius: 16px;
          padding: 1.25rem;
          text-align: center;
        }

        .topic-banner {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 1rem;
          text-align: left;
        }

        .topic-banner svg {
          color: #c9a227;
        }

        .topic-label {
          display: block;
          font-size: 0.75rem;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .topic-banner h3 {
          margin: 0;
          color: var(--text);
          font-size: 1.25rem;
        }

        .verse-ref {
          color: #a78bfa;
          font-weight: 600;
          font-size: 0.9rem;
          margin-bottom: 0.5rem;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.4rem;
        }

        .verse-banner .verse-text {
          color: var(--text);
          font-size: 1rem;
          font-style: italic;
          line-height: 1.6;
          margin: 0;
        }

        .topic-text {
          color: var(--text-muted);
          font-size: 0.9rem;
          margin: 0;
        }

        /* Chat Section */
        .chat-section {
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: 16px;
          overflow: hidden;
          max-height: 60vh;
          display: flex;
          flex-direction: column;
        }

        .messages-container {
          flex: 1;
          overflow-y: auto;
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .message {
          display: flex;
          gap: 0.75rem;
          max-width: 90%;
        }

        .message.user {
          align-self: flex-end;
          flex-direction: row-reverse;
        }

        .message.companion {
          align-self: flex-start;
        }

        .message-avatar {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.25rem;
          flex-shrink: 0;
        }

        .message.user .message-avatar {
          background: rgba(201, 162, 39, 0.2);
        }

        .message.companion .message-avatar {
          background: rgba(139, 92, 246, 0.2);
        }

        .message-content {
          background: rgba(255, 255, 255, 0.05);
          padding: 1rem 1.25rem;
          border-radius: 16px;
          line-height: 1.6;
          color: var(--text);
          font-size: 0.95rem;
        }

        .message.user .message-content {
          background: rgba(201, 162, 39, 0.15);
          border-bottom-right-radius: 4px;
        }

        .message.companion .message-content {
          border-bottom-left-radius: 4px;
        }

        .message-content.typing span {
          animation: blink 1.4s infinite;
          color: #a78bfa;
        }

        .message-content.typing span:nth-child(2) { animation-delay: 0.2s; }
        .message-content.typing span:nth-child(3) { animation-delay: 0.4s; }

        @keyframes blink {
          0%, 60%, 100% { opacity: 0.3; }
          30% { opacity: 1; }
        }

        /* Input Area */
        .input-area {
          display: flex;
          gap: 0.75rem;
          padding: 1rem;
          border-top: 1px solid var(--border);
          background: rgba(0, 0, 0, 0.2);
        }

        .input-area input {
          flex: 1;
          padding: 0.875rem 1rem;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid var(--border);
          border-radius: 12px;
          font-size: 0.95rem;
          color: var(--text);
        }

        .input-area input:focus {
          outline: none;
          border-color: #8b5cf6;
        }

        .send-btn {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          background: linear-gradient(135deg, #8b5cf6, #7c3aed);
          border: none;
          color: white;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
        }

        .send-btn:hover:not(:disabled) {
          background: linear-gradient(135deg, #a78bfa, #8b5cf6);
        }

        .send-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        /* Study Actions */
        .study-actions, .prayer-actions, .new-study {
          padding: 1rem;
          border-top: 1px solid var(--border);
          text-align: center;
        }
      `})]})},Qm="http://localhost:8002/api/v1",pr=[{id:"struggle",label:"Struggling with something",emoji:"😔",color:"#f59e0b"},{id:"lonely",label:"Feeling alone",emoji:"😢",color:"#3b82f6"},{id:"anxious",label:"Anxiety or worry",emoji:"😰",color:"#ef4444"},{id:"confused",label:"Feeling confused",emoji:"😕",color:"#8b5cf6"},{id:"hurt",label:"Hurting emotionally",emoji:"💔",color:"#ec4899"},{id:"faith",label:"Faith questions",emoji:"✝️",color:"#10b981"},{id:"thankful",label:"Grateful for blessings",emoji:"🙏",color:"#c9a227"},{id:"other",label:"Just want to talk",emoji:"💬",color:"#6b7280"}],Cy=()=>{const[o,u]=g.useState("select"),[d,c]=g.useState(null),[m,p]=g.useState([]),[h,w]=g.useState(""),[v,b]=g.useState(!1),[z,S]=g.useState(!1),O=g.useRef(null),q=()=>{O.current?.scrollIntoView({behavior:"smooth"})};g.useEffect(()=>{q()},[m]);const Y=async()=>{if(!d)return;b(!0),u("companion");const L=pr.find(B=>B.id===d),te=localStorage.getItem("authToken"),X={"Content-Type":"application/json"};te&&(X.Authorization=`Bearer ${te}`);const W=`You are a compassionate Christian companion. They're coming to you with: "${L.label}"

Write a warm, welcoming message (2-3 sentences) that:
- Acknowledges their situation with empathy
- Reassures them that God is with them and they're not alone
- Invites them to share more at their own pace

Be warm, pastoral, and reassuring. Don't use bullet points.`;try{const B=await fetch(`${Qm}/ai/generate`,{method:"POST",headers:X,body:JSON.stringify({messages:[{role:"user",content:W}],mode:"emotionalSupport"})});if(B.ok){const J=await B.json();p([{role:"companion",content:J.content}])}}catch(B){console.error(B),p([{role:"companion",content:`Friend, I'm so glad you're here. 💛

You don't have to carry this alone - God is with you, and I'm here to walk alongside you. Take your time, share as much or as little as you'd like. I'm listening.`}])}finally{b(!1)}},M=async()=>{if(!h.trim())return;const L=h.trim();w(""),p(te=>[...te,{role:"user",content:L}]),b(!0);try{const te=m.map(xe=>`${xe.role==="user"?"User":"Companion"}: ${xe.content}`).join(`

`),X=pr.find(xe=>xe.id===d),W=localStorage.getItem("authToken"),B={"Content-Type":"application/json"};W&&(B.Authorization=`Bearer ${W}`);const J=`You are a compassionate Christian companion. They're sharing about: "${X.label}"

You are NOT a therapist - you're a faith companion who:
- Points them to God's love
- Reminds them of Biblical truths
- Prays with and for them

Previous conversation:
${te}

User just said: "${L}"

Respond with empathy and gentle biblical encouragement. Keep it conversational.`,ae=await fetch(`${Qm}/ai/generate`,{method:"POST",headers:B,body:JSON.stringify({messages:[{role:"user",content:J}],mode:"emotionalSupport"})});if(ae.ok){const xe=await ae.json();p(Se=>[...Se,{role:"companion",content:xe.content}])}}catch(te){console.error(te),p(X=>[...X,{role:"companion",content:"I'm here with you, friend."}])}finally{b(!1)}},_=()=>{S(!0),p(L=>[...L,{role:"companion",content:`Friend, thank you for opening up today. 💛

God is with you in this. You're never alone. I'm always here if you need to talk again. Take care!`}])},Z=()=>{u("select"),c(null),p([]),S(!1)},P=pr.find(L=>L.id===d);return r.jsxs("div",{className:"support-page",children:[r.jsxs("div",{className:"page-header",children:[r.jsx("div",{className:"header-icon",children:r.jsx(gh,{size:28})}),r.jsxs("div",{className:"header-text",children:[r.jsx("h1",{children:"Faith Companion"}),r.jsx("p",{children:"A safe space to talk about what's on your heart"})]})]}),o==="select"&&r.jsxs("div",{className:"selection-card",children:[r.jsxs("div",{className:"selection-intro",children:[r.jsx("h2",{children:"What's on your heart today?"}),r.jsx("p",{children:"I'm here as your faith companion - someone who will listen, reassure you, and point you to God's love. You don't have to talk to a pastor or therapist."})]}),r.jsx("div",{className:"situation-grid",children:pr.map(L=>r.jsxs("button",{className:`situation-btn ${d===L.id?"selected":""}`,onClick:()=>c(L.id),style:d===L.id?{borderColor:L.color,background:`${L.color}15`}:{},children:[r.jsx("span",{className:"situation-emoji",children:L.emoji}),r.jsx("span",{className:"situation-label",children:L.label})]},L.id))}),r.jsx("button",{onClick:Y,className:"btn-start",disabled:v||!d,children:v?"Connecting...":r.jsxs(r.Fragment,{children:[r.jsx(Sh,{size:20}),"Let's Talk"]})})]}),o==="companion"&&r.jsx("div",{className:"companion-wrapper",children:r.jsxs("div",{className:"companion-main",children:[r.jsxs("div",{className:"status-bar",children:[r.jsx("div",{className:"status-avatar",style:{background:P?.color},children:P?.emoji}),r.jsxs("div",{className:"status-info",children:[r.jsx("span",{className:"status-label",children:"Talking about"}),r.jsx("span",{className:"status-topic",children:P?.label})]}),m.length>2&&!z&&r.jsx("button",{onClick:_,className:"btn-end-small",children:"End Conversation"})]}),r.jsxs("div",{className:"chat-container",children:[r.jsxs("div",{className:"messages-list",children:[m.map((L,te)=>r.jsxs("div",{className:`msg-row ${L.role}`,children:[r.jsx("div",{className:"msg-avatar",children:L.role==="companion"?"✝️":"👤"}),r.jsx("div",{className:"msg-bubble",children:L.content})]},te)),v&&r.jsxs("div",{className:"msg-row companion",children:[r.jsx("div",{className:"msg-avatar",children:"✝️"}),r.jsxs("div",{className:"msg-bubble typing",children:[r.jsx("span",{}),r.jsx("span",{}),r.jsx("span",{})]})]}),r.jsx("div",{ref:O})]}),!z&&r.jsxs("div",{className:"input-row",children:[r.jsx("input",{type:"text",value:h,onChange:L=>w(L.target.value),onKeyPress:L=>L.key==="Enter"&&M(),placeholder:"Share what's on your heart...",disabled:v}),r.jsx("button",{onClick:M,disabled:v||!h.trim(),className:"btn-send",children:r.jsx(on,{size:20})})]}),z&&r.jsx("div",{className:"action-row",children:r.jsxs("button",{onClick:Z,className:"btn-new",children:[r.jsx(Ye,{size:18}),"Talk About Something Else"]})})]})]})}),r.jsx("style",{children:`
        .support-page {
          padding: 2rem 3rem;
          max-width: 100%;
        }

        .page-header {
          display: flex;
          align-items: center;
          gap: 1.25rem;
          margin-bottom: 2.5rem;
        }

        .header-icon {
          width: 64px;
          height: 64px;
          background: linear-gradient(135deg, rgba(236, 72, 153, 0.2), rgba(244, 114, 182, 0.2));
          border: 1px solid rgba(236, 72, 153, 0.3);
          border-radius: 18px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #ec4899;
        }

        .header-text h1 {
          font-size: 2rem;
          font-weight: 700;
          color: #f5f5f5;
          margin: 0;
        }

        .header-text p {
          color: #888;
          font-size: 1rem;
          margin: 0.25rem 0 0;
        }

        .selection-card {
          background: #141418;
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 24px;
          padding: 2.5rem;
        }

        .selection-intro {
          text-align: center;
          margin-bottom: 2rem;
        }

        .selection-intro h2 {
          font-size: 1.5rem;
          font-weight: 600;
          color: #f5f5f5;
          margin: 0 0 0.75rem;
        }

        .selection-intro p {
          color: #888;
          font-size: 1rem;
          line-height: 1.6;
          margin: 0;
          max-width: 600px;
          margin: 0 auto;
        }

        .situation-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1rem;
          margin-bottom: 2rem;
        }

        .situation-btn {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.75rem;
          padding: 1.5rem 1rem;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 16px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .situation-btn:hover {
          background: rgba(236, 72, 153, 0.08);
          border-color: rgba(236, 72, 153, 0.3);
          transform: translateY(-2px);
        }

        .situation-btn.selected {
          border-width: 2px;
        }

        .situation-emoji {
          font-size: 2rem;
        }

        .situation-label {
          color: #ccc;
          font-size: 0.85rem;
          font-weight: 500;
          text-align: center;
        }

        .btn-start {
          display: block;
          width: 100%;
          max-width: 320px;
          margin: 0 auto;
          padding: 1.125rem 2rem;
          background: linear-gradient(135deg, #ec4899, #be185d);
          border: none;
          border-radius: 14px;
          color: white;
          font-size: 1.1rem;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.625rem;
          transition: all 0.2s;
        }

        .btn-start:hover:not(:disabled) {
          background: linear-gradient(135deg, #f472b6, #ec4899);
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(236, 72, 153, 0.3);
        }

        .btn-start:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        /* Companion */
        .companion-wrapper {
          display: flex;
          gap: 1.5rem;
        }

        .companion-main {
          flex: 1;
          max-width: 900px;
        }

        .status-bar {
          display: flex;
          align-items: center;
          gap: 1rem;
          background: #141418;
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 16px;
          padding: 1rem 1.5rem;
          margin-bottom: 1rem;
        }

        .status-avatar {
          width: 48px;
          height: 48px;
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.5rem;
        }

        .status-info {
          flex: 1;
          display: flex;
          flex-direction: column;
        }

        .status-label {
          font-size: 0.75rem;
          color: #666;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .status-topic {
          font-size: 1.125rem;
          font-weight: 600;
          color: #f5f5f5;
        }

        .btn-end-small {
          padding: 0.5rem 1rem;
          background: transparent;
          border: 1px solid rgba(255, 255, 255, 0.15);
          border-radius: 8px;
          color: #888;
          font-size: 0.85rem;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-end-small:hover {
          background: rgba(255, 255, 255, 0.05);
          color: #f5f5f5;
        }

        .chat-container {
          background: #141418;
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 20px;
          overflow: hidden;
          display: flex;
          flex-direction: column;
        }

        .messages-list {
          flex: 1;
          padding: 1.75rem;
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
          max-height: 450px;
          overflow-y: auto;
        }

        .msg-row {
          display: flex;
          gap: 1rem;
          max-width: 80%;
        }

        .msg-row.user {
          align-self: flex-end;
          flex-direction: row-reverse;
        }

        .msg-avatar {
          width: 40px;
          height: 40px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.25rem;
          flex-shrink: 0;
        }

        .msg-row.user .msg-avatar {
          background: rgba(236, 72, 153, 0.2);
        }

        .msg-row.companion .msg-avatar {
          background: rgba(16, 185, 129, 0.2);
        }

        .msg-bubble {
          background: rgba(255, 255, 255, 0.05);
          padding: 1.125rem 1.5rem;
          border-radius: 18px;
          line-height: 1.65;
          color: #f5f5f5;
          font-size: 1rem;
        }

        .msg-row.user .msg-bubble {
          background: rgba(236, 72, 153, 0.15);
          border-bottom-right-radius: 6px;
        }

        .msg-row.companion .msg-bubble {
          border-bottom-left-radius: 6px;
        }

        .msg-bubble.typing {
          display: flex;
          gap: 0.375rem;
          padding: 1.125rem 1.75rem;
        }

        .msg-bubble.typing span {
          width: 10px;
          height: 10px;
          background: #10b981;
          border-radius: 50%;
          animation: bounce 1.4s infinite ease-in-out;
        }

        .msg-bubble.typing span:nth-child(1) { animation-delay: 0s; }
        .msg-bubble.typing span:nth-child(2) { animation-delay: 0.2s; }
        .msg-bubble.typing span:nth-child(3) { animation-delay: 0.4s; }

        @keyframes bounce {
          0%, 80%, 100% { transform: scale(0.6); opacity: 0.5; }
          40% { transform: scale(1); opacity: 1; }
        }

        .input-row {
          display: flex;
          gap: 1rem;
          padding: 1.25rem;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
        }

        .input-row input {
          flex: 1;
          padding: 1rem 1.25rem;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 14px;
          font-size: 1rem;
          color: #f5f5f5;
        }

        .input-row input:focus {
          outline: none;
          border-color: #ec4899;
        }

        .btn-send {
          width: 54px;
          height: 54px;
          border-radius: 14px;
          background: linear-gradient(135deg, #ec4899, #be185d);
          border: none;
          color: white;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
        }

        .btn-send:hover:not(:disabled) {
          background: linear-gradient(135deg, #f472b6, #ec4899);
        }

        .btn-send:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .action-row {
          padding: 1.25rem;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
          text-align: center;
        }

        .btn-new {
          padding: 0.875rem 1.75rem;
          background: linear-gradient(135deg, #c9a227, #a88620);
          border: none;
          border-radius: 12px;
          color: white;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
        }

        @media (max-width: 1100px) {
          .situation-grid {
            grid-template-columns: repeat(2, 1fr);
          }
          
          .support-page {
            padding: 1.5rem 2rem;
          }
        }

        @media (max-width: 768px) {
          .support-page {
            padding: 1rem;
          }
          
          .selection-card {
            padding: 1.5rem;
          }
          
          .msg-row {
            max-width: 90%;
          }
        }
      `})]})},My=()=>{const[o,u]=g.useState({x:0,y:0});return g.useEffect(()=>{const d=c=>{u({x:(c.clientX/window.innerWidth-.5)*10,y:(c.clientY/window.innerHeight-.5)*10})};return window.addEventListener("mousemove",d),()=>window.removeEventListener("mousemove",d)},[]),r.jsxs("div",{className:"page-bg",children:[r.jsx("div",{className:"bg-orb orb-1",style:{transform:`translate(${o.x}px, ${o.y}px)`}}),r.jsx("div",{className:"bg-orb orb-2",style:{transform:`translate(${-o.x}px, ${-o.y}px)`}})]})},_y=[{id:5,label:"5 min",desc:"Quick devotional"},{id:10,label:"10 min",desc:"Short & sweet"},{id:15,label:"15 min",desc:"Standard time"},{id:30,label:"30 min",desc:"Deep time"}],Ry=()=>{const[o,u]=g.useState("select"),[d,c]=g.useState(null),[m,p]=g.useState(""),[h,w]=g.useState({}),[v,b]=g.useState([]),[z,S]=g.useState(""),[O,q]=g.useState(!1),Y=g.useRef(null),M=()=>{Y.current?.scrollIntoView({behavior:"smooth"})};g.useEffect(()=>{M()},[v]);const _=X=>{c(X),u("day")},Z=async()=>{if(!m.trim())return;q(!0),u("teaching");const X=localStorage.getItem("authToken"),W={"Content-Type":"application/json"};X&&(W.Authorization=`Bearer ${X}`);const B=`The user wants a ${d}-minute morning devotion. Here's what their day looks like:

"${m}"

Generate a personalized devotional teaching that:
1. **TOPIC**: A clear, specific topic/lesson relevant to their day (2-4 words)
2. **VERSE**: A powerful Bible verse that applies to their day
3. **ADDITIONAL VERSES**: 1-2 more verses that reinforce this topic
4. **TEACHING**: A brief, warm teaching (2-3 paragraphs) that connects their day's activities/challenges to God's Word

Format:
---
**TOPIC:** [Topic name]

**MAIN VERSE:** [Book Chapter:Verse - "Verse text"]

**MORE LIGHT:** 
- [Book Chapter:Verse - "Verse text"]
- [Book Chapter:Verse - "Verse text"]

**DEVOTION:**
[Your teaching here - warm, personal, applicable to their day]
---`;try{const J=await fetch(`${He}/ai/generate`,{method:"POST",headers:W,body:JSON.stringify({messages:[{role:"user",content:B}],mode:"devotion"})});if(J.ok){const ae=await J.json();w(ae.content),b([{role:"companion",content:`Here's what God has for you today! 💛

${ae.content}

Take your time to reflect on this. What resonates with you?`}])}}catch(J){console.error(J),w(`**TOPIC:** Trust in God's Plan

**MAIN VERSE:** Proverbs 3:5-6 - "Trust in the Lord with all your heart and lean not on your own understanding; in all your ways acknowledge him, and he will make your paths straight."

**MORE LIGHT:** 
- Psalm 32:8 - "I will instruct you and teach you in the way you should go"
- Isaiah 40:31 - "They who wait for the Lord shall renew their strength"

**DEVOTION:**
Dear friend, as you go through your day, remember that God is with you. Whatever challenges or plans you face, trust Him to guide your steps. He knows every detail of your day and wants to walk with you through it. ${m.includes("stress")||m.includes("worried")?"When worry tries to creep in, remember: You can cast your cares on Him because He cares for you.":"As you navigate your plans, keep your heart open to His guidance. He may have surprises along the way!"} May this devotion bless your day!`),b([{role:"companion",content:`Here's what God has for you today! 💛

**TOPIC:** Trust in God's Plan

**MAIN VERSE:** Proverbs 3:5-6 - "Trust in the Lord with all your heart and lean not on your own understanding; in all your ways acknowledge him, and he will make your paths straight."

**DEVOTION:**
Dear friend, as you go through your day, remember that God is with you. Whatever challenges or plans you face, trust Him to guide your steps. He knows every detail of your day and wants to walk with you through it.

Take your time to reflect on this. What resonates with you?`}])}finally{q(!1)}},P=async()=>{if(!z.trim())return;const X=z.trim();S(""),b(W=>[...W,{role:"user",content:X}]),q(!0);try{const W=v.map(Se=>`${Se.role==="user"?"User":"Companion"}: ${Se.content}`).join(`

`),B=localStorage.getItem("authToken"),J={"Content-Type":"application/json"};B&&(J.Authorization=`Bearer ${B}`);const ae=`You are a warm, faith-filled daily devotion companion. 

User's day: "${m}"

Previous conversation:
${W}

User just said: "${X}"

Respond with warmth:
- Acknowledge what they shared
- Offer spiritual insight
- Ask a simple follow-up question
- Keep it conversational and brief

Don't use bullet points.`,xe=await fetch(`${He}/ai/generate`,{method:"POST",headers:J,body:JSON.stringify({messages:[{role:"user",content:ae}],mode:"devotion"})});if(xe.ok){const Se=await xe.json();b(F=>[...F,{role:"companion",content:Se.content}])}}catch(W){console.error(W),b(B=>[...B,{role:"companion",content:"I'm here with you. What else is on your heart?"}])}finally{q(!1)}},L=async()=>{u("pray"),q(!0);const X=localStorage.getItem("authToken"),W={"Content-Type":"application/json"};X&&(W.Authorization=`Bearer ${X}`);const B=v.map(ae=>`${ae.role==="user"?"User":"Companion"}: ${ae.content}`).join(`

`),J=`Generate a heartfelt, personal prayer for the user's day.

Here's what their day looks like:
"${m}"

Here's what they shared during our devotion:
${B}

Write a prayer (3-5 sentences) that:
- Thanks God for this devotion time
- Prays specifically for their day based on what they shared
- Asks for God's presence and guidance throughout their day
- Ends with "Amen."

After the prayer, add a brief warm closing (1 sentence).`;try{const ae=await fetch(`${He}/ai/generate`,{method:"POST",headers:W,body:JSON.stringify({messages:[{role:"user",content:J}],mode:"devotion"})});if(ae.ok){const xe=await ae.json();b(Se=>[...Se,{role:"companion",content:xe.content}])}}catch(ae){console.error(ae),b(xe=>[...xe,{role:"companion",content:`Father, thank you for this time in your Word. I pray that as I go through my day - ${m} - you would be with me every step. Give me the strength, wisdom, and peace I need. Help me to live out what you've taught me today. In Jesus' name, Amen.

Go in peace, friend! God bless your day! 💛`}])}finally{q(!1),u("complete")}},te=()=>{u("select"),c(null),p(""),w(null),b([])};return r.jsxs("div",{className:"page-container",children:[r.jsx(My,{}),r.jsxs("div",{className:"page-content",children:[(o==="select"||o==="day")&&r.jsxs("div",{className:"hero-section",children:[r.jsx("div",{className:"hero-icon",children:r.jsx($l,{size:32})}),r.jsx("h1",{children:"Daily Devotion"}),r.jsx("p",{children:"Let's spend time with God together"})]}),o==="select"&&r.jsxs("div",{className:"input-card",children:[r.jsxs("div",{className:"card-header",children:[r.jsx(mh,{size:20}),r.jsx("h2",{children:"How much time do you have?"})]}),r.jsx("div",{className:"duration-grid",children:_y.map(X=>r.jsxs("button",{className:"duration-btn",onClick:()=>_(X.id),children:[r.jsx("span",{className:"duration-label",children:X.label}),r.jsx("span",{className:"duration-desc",children:X.desc})]},X.id))})]}),o==="day"&&r.jsxs("div",{className:"input-card",children:[r.jsxs("div",{className:"card-header",children:[r.jsx(gc,{size:20}),r.jsx("h2",{children:"Tell me about your day"})]}),r.jsx("p",{className:"prompt-text",children:"What's on your mind? What do you have planned? Any challenges you're facing?"}),r.jsx("textarea",{value:m,onChange:X=>p(X.target.value),placeholder:"e.g., I have a big meeting today, I'm feeling nervous about...",rows:5}),r.jsx("button",{onClick:Z,className:"btn btn-primary btn-large",disabled:O||!m.trim(),children:O?"Preparing your devotion...":r.jsxs(r.Fragment,{children:[r.jsx(Ye,{size:18}),"Get My Devotion"]})})]}),(o==="teaching"||o==="pray"||o==="complete")&&r.jsx("div",{className:"companion-container",children:r.jsxs("div",{className:"chat-section",children:[r.jsxs("div",{className:"messages-container",children:[v.map((X,W)=>r.jsxs("div",{className:`message ${X.role}`,children:[r.jsx("div",{className:"message-avatar",children:X.role==="companion"?"☀️":"👤"}),r.jsx("div",{className:"message-content",children:X.content})]},W)),O&&r.jsxs("div",{className:"message companion",children:[r.jsx("div",{className:"message-avatar",children:"☀️"}),r.jsxs("div",{className:"message-content typing",children:[r.jsx("span",{children:"•"}),r.jsx("span",{children:"•"}),r.jsx("span",{children:"•"})]})]}),r.jsx("div",{ref:Y})]}),o==="teaching"&&r.jsxs("div",{className:"input-area",children:[r.jsx("input",{type:"text",value:z,onChange:X=>S(X.target.value),onKeyPress:X=>X.key==="Enter"&&P(),placeholder:"Share your thoughts...",disabled:O}),r.jsx("button",{onClick:P,disabled:O||!z.trim(),className:"send-btn",children:r.jsx(on,{size:20})})]}),o==="teaching"&&v.length>1&&r.jsx("div",{className:"prayer-actions",children:r.jsxs("button",{onClick:L,className:"btn btn-gold",children:[r.jsx(Ba,{size:18}),"End with Prayer"]})}),o==="complete"&&r.jsx("div",{className:"new-devotion",children:r.jsxs("button",{onClick:te,className:"btn btn-outline",children:[r.jsx(Ye,{size:18}),"New Devotion"]})})]})})]}),r.jsx("style",{children:`
        :root {
          --primary: #c9a227;
          --bg-dark: #0a0a0f;
          --bg-card: #141418;
          --text: #f5f5f5;
          --text-muted: #888;
          --border: rgba(255, 255, 255, 0.1);
        }

        .page-container {
          min-height: 100vh;
          position: relative;
          overflow: hidden;
        }

        .page-bg {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          z-index: 0;
        }

        .bg-orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          opacity: 0.2;
        }

        .bg-orb.orb-1 {
          width: 400px;
          height: 400px;
          background: radial-gradient(circle, #f59e0b 0%, transparent 70%);
          top: 20%;
          left: 10%;
        }

        .bg-orb.orb-2 {
          width: 350px;
          height: 350px;
          background: radial-gradient(circle, #fbbf24 0%, transparent 70%);
          bottom: 20%;
          right: 10%;
        }

        .page-content {
          position: relative;
          z-index: 1;
          max-width: 700px;
          margin: 0 auto;
          padding: 2rem 1.5rem;
        }

        .hero-section {
          text-align: center;
          margin-bottom: 2rem;
        }

        .hero-icon {
          width: 72px;
          height: 72px;
          background: linear-gradient(135deg, rgba(245, 158, 11, 0.2), rgba(251, 191, 36, 0.2));
          border: 1px solid rgba(245, 158, 11, 0.3);
          border-radius: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #f59e0b;
          margin: 0 auto 1.25rem;
        }

        .hero-section h1 {
          font-size: 2rem;
          font-weight: 700;
          color: var(--text);
          margin: 0 0 0.5rem;
        }

        .hero-section p {
          color: var(--text-muted);
          font-size: 1.05rem;
          margin: 0;
        }

        .input-card {
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: 16px;
          padding: 1.5rem;
        }

        .card-header {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 1.5rem;
          color: #f59e0b;
        }

        .card-header h2 {
          font-size: 1.1rem;
          font-weight: 600;
          color: var(--text);
          margin: 0;
        }

        .prompt-text {
          color: var(--text-muted);
          font-size: 0.95rem;
          margin: 0 0 1rem;
          line-height: 1.5;
        }

        .duration-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 0.75rem;
        }

        .duration-btn {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.25rem;
          padding: 1.25rem;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid var(--border);
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .duration-btn:hover {
          background: rgba(245, 158, 11, 0.1);
          border-color: rgba(245, 158, 11, 0.3);
        }

        .duration-label {
          font-size: 1.25rem;
          font-weight: 700;
          color: var(--text);
        }

        .duration-desc {
          font-size: 0.8rem;
          color: var(--text-muted);
        }

        textarea {
          width: 100%;
          padding: 0.875rem;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid var(--border);
          border-radius: 10px;
          font-size: 0.95rem;
          resize: none;
          font-family: inherit;
          color: var(--text);
          margin-bottom: 1rem;
        }

        textarea:focus {
          outline: none;
          border-color: #f59e0b;
        }

        textarea::placeholder {
          color: var(--text-muted);
        }

        .btn {
          padding: 0.75rem 1.25rem;
          border-radius: 10px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          font-size: 0.9rem;
          border: none;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
        }

        .btn-large {
          width: 100%;
          padding: 0.875rem;
          font-size: 1rem;
        }

        .btn-primary {
          background: linear-gradient(135deg, #f59e0b, #d97706);
          color: white;
        }

        .btn-primary:hover:not(:disabled) {
          background: linear-gradient(135deg, #fbbf24, #f59e0b);
        }

        .btn-gold {
          background: linear-gradient(135deg, #c9a227, #a88620);
          color: white;
        }

        .btn-outline {
          background: transparent;
          border: 1px solid var(--border);
          color: var(--text);
        }

        .btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        /* Chat Section */
        .companion-container {
          display: flex;
          flex-direction: column;
        }

        .chat-section {
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: 16px;
          overflow: hidden;
          max-height: 70vh;
          display: flex;
          flex-direction: column;
        }

        .messages-container {
          flex: 1;
          overflow-y: auto;
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .message {
          display: flex;
          gap: 0.75rem;
          max-width: 90%;
        }

        .message.user {
          align-self: flex-end;
          flex-direction: row-reverse;
        }

        .message.companion {
          align-self: flex-start;
        }

        .message-avatar {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.25rem;
          flex-shrink: 0;
        }

        .message.user .message-avatar {
          background: rgba(245, 158, 11, 0.2);
        }

        .message.companion .message-avatar {
          background: rgba(251, 191, 36, 0.2);
        }

        .message-content {
          background: rgba(255, 255, 255, 0.05);
          padding: 1rem 1.25rem;
          border-radius: 16px;
          line-height: 1.6;
          color: var(--text);
          font-size: 0.95rem;
        }

        .message.user .message-content {
          background: rgba(245, 158, 11, 0.15);
          border-bottom-right-radius: 4px;
        }

        .message.companion .message-content {
          border-bottom-left-radius: 4px;
        }

        .message-content.typing span {
          animation: blink 1.4s infinite;
          color: #f59e0b;
        }

        .message-content.typing span:nth-child(2) { animation-delay: 0.2s; }
        .message-content.typing span:nth-child(3) { animation-delay: 0.4s; }

        @keyframes blink {
          0%, 60%, 100% { opacity: 0.3; }
          30% { opacity: 1; }
        }

        /* Input Area */
        .input-area {
          display: flex;
          gap: 0.75rem;
          padding: 1rem;
          border-top: 1px solid var(--border);
          background: rgba(0, 0, 0, 0.2);
        }

        .input-area input {
          flex: 1;
          padding: 0.875rem 1rem;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid var(--border);
          border-radius: 12px;
          font-size: 0.95rem;
          color: var(--text);
        }

        .input-area input:focus {
          outline: none;
          border-color: #f59e0b;
        }

        .send-btn {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          background: linear-gradient(135deg, #f59e0b, #d97706);
          border: none;
          color: white;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
        }

        .send-btn:hover:not(:disabled) {
          background: linear-gradient(135deg, #fbbf24, #f59e0b);
        }

        .send-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        /* Actions */
        .prayer-actions, .new-devotion {
          padding: 1rem;
          border-top: 1px solid var(--border);
          text-align: center;
        }

        @media (max-width: 640px) {
          .duration-grid {
            grid-template-columns: 1fr;
          }
        }
      `})]})},Oy=()=>{const[o,u]=g.useState({x:0,y:0});return g.useEffect(()=>{const d=c=>{u({x:(c.clientX/window.innerWidth-.5)*8,y:(c.clientY/window.innerHeight-.5)*8})};return window.addEventListener("mousemove",d),()=>window.removeEventListener("mousemove",d)},[]),r.jsx("div",{className:"page-bg",children:r.jsx("div",{className:"bg-orb",style:{transform:`translate(${o.x}px, ${o.y}px)`}})})},Dy=()=>{const{user:o,logout:u}=sn(),[d,c]=g.useState(o?.display_name||""),[m]=g.useState(o?.email||""),[p,h]=g.useState(!1),[w,v]=g.useState(null),b=(q,Y=!1)=>{v({text:q,isError:Y}),setTimeout(()=>v(null),3e3)},z=async()=>{if(!d.trim()){b("Display name cannot be empty",!0);return}b("Profile updated successfully!"),h(!1)},S=async()=>{try{await u()}catch{b("Failed to log out",!0)}},O=o?.created_at?new Date(o.created_at).toLocaleDateString("en-US",{year:"numeric",month:"long"}):"N/A";return r.jsxs("div",{className:"page-container",children:[r.jsx(Oy,{}),r.jsxs("div",{className:"page-content",children:[r.jsxs("div",{className:"page-header",children:[r.jsx("div",{className:"header-icon",children:r.jsx(wh,{size:24})}),r.jsx("h1",{children:"Your Profile"}),r.jsx("p",{children:"Manage your account settings"})]}),r.jsxs("div",{className:"content-card",children:[r.jsxs("div",{className:"profile-section",children:[r.jsx("div",{className:"avatar",children:d?d.charAt(0).toUpperCase():"U"}),r.jsx("div",{className:"profile-info",children:p?r.jsxs("div",{className:"edit-form",children:[r.jsxs("div",{className:"form-group",children:[r.jsx("label",{children:"Display Name"}),r.jsx("input",{type:"text",value:d,onChange:q=>c(q.target.value),placeholder:"Your name"})]}),r.jsxs("div",{className:"form-group",children:[r.jsx("label",{children:"Email"}),r.jsx("input",{type:"email",value:m,disabled:!0,className:"disabled"})]}),r.jsxs("div",{className:"form-actions",children:[r.jsx("button",{onClick:z,className:"btn btn-primary",children:"Save Changes"}),r.jsx("button",{onClick:()=>h(!1),className:"btn btn-secondary",children:"Cancel"})]})]}):r.jsxs("div",{className:"info-display",children:[r.jsx("h2",{children:d||"Set up your profile"}),r.jsx("p",{className:"email",children:m}),r.jsxs("p",{className:"member-since",children:["Member since ",O]}),r.jsxs("button",{onClick:()=>h(!0),className:"btn btn-secondary",children:[r.jsx(Vb,{size:16}),"Edit Profile"]})]})})]}),w&&r.jsx("div",{className:`message ${w.isError?"error":"success"}`,children:w.text}),r.jsxs("div",{className:"settings-section",children:[r.jsx("h3",{children:"Account Actions"}),r.jsx("div",{className:"actions-list",children:r.jsxs("button",{onClick:S,className:"action-btn logout",children:[r.jsx(yh,{size:18}),r.jsx("span",{children:"Log Out"})]})})]})]})]}),r.jsx("style",{children:`
        :root {
          --primary: #c9a227;
          --bg-dark: #0a0a0f;
          --bg-card: #141418;
          --text: #f5f5f5;
          --text-muted: #888;
          --border: rgba(255, 255, 255, 0.1);
        }

        .page-container {
          min-height: 100vh;
          position: relative;
          overflow: hidden;
        }

        .page-bg {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          z-index: 0;
          overflow: hidden;
        }

        .bg-orb {
          position: absolute;
          width: 500px;
          height: 500px;
          border-radius: 50%;
          filter: blur(100px);
          opacity: 0.15;
          background: radial-gradient(circle, #ec4899 0%, transparent 70%);
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          transition: transform 0.15s ease-out;
        }

        .page-content {
          position: relative;
          z-index: 1;
          max-width: 600px;
          margin: 0 auto;
          padding: 2rem 1.5rem;
        }

        .page-header {
          text-align: center;
          margin-bottom: 2rem;
        }

        .header-icon {
          width: 56px;
          height: 56px;
          background: rgba(236, 72, 153, 0.15);
          border: 1px solid rgba(236, 72, 153, 0.3);
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #ec4899;
          margin: 0 auto 1rem;
        }

        .page-header h1 {
          font-size: 1.75rem;
          font-weight: 700;
          color: var(--text);
          margin: 0 0 0.5rem;
        }

        .page-header p {
          color: var(--text-muted);
          margin: 0;
        }

        .content-card {
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: 16px;
          padding: 1.5rem;
        }

        .profile-section {
          display: flex;
          gap: 1.5rem;
          align-items: flex-start;
          margin-bottom: 1.5rem;
        }

        .avatar {
          width: 80px;
          height: 80px;
          background: linear-gradient(135deg, #ec4899, #db2777);
          border-radius: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 2rem;
          font-weight: 700;
          color: white;
          flex-shrink: 0;
        }

        .profile-info {
          flex: 1;
        }

        .info-display h2 {
          font-size: 1.25rem;
          font-weight: 600;
          color: var(--text);
          margin: 0 0 0.25rem;
        }

        .info-display .email {
          color: var(--text-muted);
          font-size: 0.9rem;
          margin: 0 0 0.25rem;
        }

        .info-display .member-since {
          color: var(--text-muted);
          font-size: 0.8rem;
          margin: 0 0 1rem;
        }

        .edit-form .form-group {
          margin-bottom: 1rem;
        }

        .edit-form label {
          display: block;
          font-size: 0.85rem;
          color: var(--text-muted);
          margin-bottom: 0.5rem;
        }

        .edit-form input {
          width: 100%;
          padding: 0.625rem;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid var(--border);
          border-radius: 8px;
          font-size: 0.9rem;
          color: var(--text);
        }

        .edit-form input:focus {
          outline: none;
          border-color: #ec4899;
        }

        .edit-form input.disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .form-actions {
          display: flex;
          gap: 0.75rem;
        }

        .btn {
          padding: 0.625rem 1rem;
          border-radius: 10px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          font-size: 0.9rem;
          border: none;
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
        }

        .btn-primary {
          background: linear-gradient(135deg, #ec4899, #db2777);
          color: white;
        }

        .btn-primary:hover {
          background: linear-gradient(135deg, #f472b6, #ec4899);
        }

        .btn-secondary {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid var(--border);
          color: var(--text);
        }

        .btn-secondary:hover {
          background: rgba(255, 255, 255, 0.1);
        }

        .message {
          padding: 0.75rem 1rem;
          border-radius: 8px;
          margin-bottom: 1.25rem;
          font-size: 0.9rem;
        }

        .message.error {
          background: rgba(220, 38, 38, 0.1);
          border: 1px solid rgba(220, 38, 38, 0.3);
          color: #fca5a5;
        }

        .message.success {
          background: rgba(34, 197, 94, 0.1);
          border: 1px solid rgba(34, 197, 94, 0.3);
          color: #6ee7b7;
        }

        .settings-section {
          border-top: 1px solid var(--border);
          padding-top: 1.25rem;
        }

        .settings-section h3 {
          font-size: 1rem;
          font-weight: 600;
          color: var(--text);
          margin: 0 0 1rem;
        }

        .actions-list {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .action-btn {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          width: 100%;
          padding: 0.875rem 1rem;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid var(--border);
          border-radius: 10px;
          color: var(--text);
          font-size: 0.9rem;
          cursor: pointer;
          transition: all 0.2s;
        }

        .action-btn:hover {
          background: rgba(255, 255, 255, 0.08);
        }

        .action-btn.logout {
          color: #f87171;
        }

        .action-btn.logout:hover {
          background: rgba(220, 38, 38, 0.1);
          border-color: rgba(220, 38, 38, 0.3);
        }

        @media (max-width: 640px) {
          .profile-section {
            flex-direction: column;
            align-items: center;
            text-align: center;
          }

          .form-actions {
            flex-direction: column;
          }
        }
      `})]})},zh=()=>r.jsxs("div",{className:"loading-screen",children:[r.jsx("div",{className:"loading-spinner large"}),r.jsx("p",{children:"Loading Aria..."})]}),Uy=({children:o})=>{const{isAuthenticated:u,isLoading:d}=sn();return d?r.jsx(zh,{}):u?o:r.jsx(vr,{to:"/login",replace:!0})},ec=({children:o})=>{const{isAuthenticated:u,isLoading:d}=sn();return d?r.jsx(zh,{}):u?r.jsx(vr,{to:"/app/home",replace:!0}):o};function Hy(){return r.jsx(ty,{showReset:!0,children:r.jsxs(r1,{children:[r.jsx(mt,{path:"/",element:r.jsx(ec,{children:r.jsx(ny,{})})}),r.jsx(mt,{path:"/login",element:r.jsx(ec,{children:r.jsx(iy,{})})}),r.jsx(mt,{path:"/register",element:r.jsx(ec,{children:r.jsx(oy,{})})}),r.jsxs(mt,{path:"/app",element:r.jsx(Uy,{children:r.jsx(sy,{})}),children:[r.jsx(mt,{index:!0,element:r.jsx(vr,{to:"home",replace:!0})}),r.jsx(mt,{path:"home",element:r.jsx(my,{})}),r.jsx(mt,{path:"ai-chat",element:r.jsx(Sy,{})}),r.jsx(mt,{path:"bible",element:r.jsx(Ay,{})}),r.jsx(mt,{path:"bible-study",element:r.jsx(ky,{})}),r.jsx(mt,{path:"emotional-support",element:r.jsx(Cy,{})}),r.jsx(mt,{path:"devotion",element:r.jsx(Ry,{})}),r.jsx(mt,{path:"profile",element:r.jsx(Dy,{})})]}),r.jsx(mt,{path:"*",element:r.jsx(vr,{to:"/",replace:!0})})]})})}const By=({children:o})=>{const[u,d]=g.useState(null),[c,m]=g.useState(!1),[p,h]=g.useState(!0),[w,v]=g.useState(!1),b=g.useCallback(async()=>{if(!localStorage.getItem("authToken")){h(!1),v(!0);return}try{const M=await Is.getMe();d(M),m(!0)}catch(M){console.error("Auth check failed:",M),localStorage.removeItem("authToken"),v(!0)}finally{h(!1)}},[]);g.useEffect(()=>{b()},[b]);const q={user:u,isAuthenticated:c,isLoading:p,showAuthModal:w,setShowAuthModal:v,login:async(Y,M)=>{const _=await Is.login(Y,M);return localStorage.setItem("authToken",_.access_token),d(_.user),m(!0),v(!1),_},register:async(Y,M,_)=>{const Z=await Is.register(Y,M,_);return Z.access_token&&(localStorage.setItem("authToken",Z.access_token),d(Z.user),m(!0),v(!1)),Z},logout:()=>{localStorage.removeItem("authToken"),d(null),m(!1),v(!0)}};return r.jsx(uh.Provider,{value:q,children:o})};rg.createRoot(document.getElementById("root")).render(r.jsx(I0.StrictMode,{children:r.jsx(C1,{children:r.jsx(By,{children:r.jsx(Hy,{})})})}));
