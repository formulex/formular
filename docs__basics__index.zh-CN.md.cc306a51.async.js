(window["webpackJsonp"]=window["webpackJsonp"]||[]).push([[4,2],{"GF+i":function(e,n,t){"use strict";function r(){return r=Object.assign||function(e){for(var n=1;n<arguments.length;n++){var t=arguments[n];for(var r in t)Object.prototype.hasOwnProperty.call(t,r)&&(e[r]=t[r])}return e},r.apply(this,arguments)}t.r(n);var a=t("q1tI"),o=t.n(a),i=(t("B2uJ"),t("+su7"),t("qOys"),t("5Yjd")),l=t.n(i),s=o.a.memo((function(){var e=t("K+nK"),n=e(t("q1tI")),r=e(t("Uyu5")),a=function(){return n["default"].createElement(r["default"],null)};return n["default"].createElement(a)}));n["default"]=function(){return o.a.createElement(o.a.Fragment,null,o.a.createElement("div",{className:"markdown"},o.a.createElement("h1",{id:"formular-\u662f\u4ec0\u4e48"},o.a.createElement("a",{"aria-hidden":"true",href:"#formular-\u662f\u4ec0\u4e48"},o.a.createElement("span",{className:"icon icon-link"})),"Formular \u662f\u4ec0\u4e48"),o.a.createElement("p",null,"Formular \u662f\u4e00\u5957\u57fa\u4e8e MobX \u7684\u901a\u7528\u8868\u5355\u89e3\u51b3\u65b9\u6848\uff0c\u65e8\u5728\u89e3\u51b3\u73b0\u4ee3 Web \u5e94\u7528\u4e2d\u8f83\u4e3a\u590d\u6742\u7684\u8868\u5355\u573a\u666f\u4e2d\u7684\u95ee\u9898\u3002Formular \u80cc\u540e\u7684\u54f2\u5b66\u8ddf MobX \u548c\u5176\u72b6\u6001\u7ba1\u7406\u5bb9\u5668 ",o.a.createElement("code",null,"mobx-state-tree")," \u4e00\u81f4\uff1a\u900f\u660e\u7684\u51fd\u6570\u54cd\u5e94\u5f0f\u7f16\u7a0b\u601d\u60f3")),o.a.createElement(l.a,r({source:{tsx:"import './entry';\nimport React from 'react';\nimport { Form, Field } from '@formular/antd';\nimport { useConstant } from '@formular/react';\nimport { createForm } from '@formular/core';\nimport { Button, Modal, message } from 'antd';\nimport { autorun, reaction } from 'mobx';\nimport { toStream } from 'mobx-utils';\nimport { from } from 'rxjs';\nimport { debounceTime } from 'rxjs/operators';\nimport { fetchOptions } from './services';\n\nconst App: React.FC = () => {\n  const form = useConstant(() => createForm());\n\n  return (\n    <Form\n      form={form}\n      onFinish={(values) =>\n        Modal.success({\n          title: 'Values',\n          content: <pre>{JSON.stringify(values, null, 2)}</pre>,\n        })\n      }\n      effects={function* ({ field, value, form }) {\n        yield autorun(\n          () =>\n            (field('favoriteAnimal')!.ignored = !(field(\n              'favoriteAnimal',\n            )!.show = !!value('isFurry'))) &&\n            form.resetFields(['favoriteAnimal']),\n        );\n\n        yield autorun(\n          () =>\n            (field('otherAnimalName')!.ignored = !(field(\n              'otherAnimalName',\n            )!.show = value('favoriteAnimal') === 'others')) &&\n            form.resetFields(['otherAnimalName']),\n        );\n\n        yield reaction(\n          () => field('favoriteAnimal')?.show,\n          async (show) => {\n            if (show) {\n              const item = field('favoriteAnimal');\n              item!.loading = item!.disabled = true;\n              item!.enum = await fetchOptions();\n              item!.loading = item!.disabled = false;\n            }\n          },\n        );\n\n        yield from(toStream(() => value('otherAnimalName')))\n          .pipe(debounceTime(500))\n          .subscribe((val) => {\n            if (['dog', 'cat'].includes(val as string)) {\n              message.open({ content: `\ud83d\udc97 We all love ${val}s ` } as any);\n            }\n          });\n      }}\n    >\n      <Field\n        name=\"isFurry\"\n        initialValue={false}\n        label=\"Do you like animals \ud83d\udc3a\"\n        component=\"Checkbox\"\n        componentProps={({ field }) => ({\n          children: field?.value ? 'Yes' : 'Nope',\n        })}\n      />\n      <Field\n        name=\"favoriteAnimal\"\n        label=\"What is your favorite animal \u2764\ufe0f\"\n        component=\"Select\"\n        componentProps={{\n          style: { width: '40%' },\n          placeholder: 'Choose an animal',\n        }}\n        extra={`When you select \"Others\", the \"Other Animals\" input box will appear`}\n        rules={{ required: true, message: 'This field is required' }}\n        required\n      />\n      <Field\n        name=\"otherAnimalName\"\n        label=\"Other animals \ud83d\udc97\"\n        component=\"Input\"\n        componentProps={{\n          style: { width: '40%' },\n          placeholder: 'try to input \"cat\" or \"dog\"',\n        }}\n        rules={{ required: true, message: 'This field is required' }}\n        required\n      />\n      <Button type=\"primary\" htmlType=\"submit\">\n        Submit\n      </Button>\n    </Form>\n  );\n};\n\nexport default App;\n",jsx:"import './entry';\nimport React from 'react';\nimport { Form, Field } from '@formular/antd';\nimport { useConstant } from '@formular/react';\nimport { createForm } from '@formular/core';\nimport { Button, Modal, message } from 'antd';\nimport { autorun, reaction } from 'mobx';\nimport { toStream } from 'mobx-utils';\nimport { from } from 'rxjs';\nimport { debounceTime } from 'rxjs/operators';\nimport { fetchOptions } from './services';\n\nconst App = () => {\n  const form = useConstant(() => createForm());\n  return (\n    <Form\n      form={form}\n      onFinish={(values) =>\n        Modal.success({\n          title: 'Values',\n          content: <pre>{JSON.stringify(values, null, 2)}</pre>,\n        })\n      }\n      effects={function* ({ field, value, form }) {\n        yield autorun(\n          () =>\n            (field('favoriteAnimal').ignored = !(field('favoriteAnimal').show = !!value(\n              'isFurry',\n            ))) && form.resetFields(['favoriteAnimal']),\n        );\n        yield autorun(\n          () =>\n            (field('otherAnimalName').ignored = !(field('otherAnimalName').show =\n              value('favoriteAnimal') === 'others')) && form.resetFields(['otherAnimalName']),\n        );\n        yield reaction(\n          () => field('favoriteAnimal')?.show,\n          async (show) => {\n            if (show) {\n              const item = field('favoriteAnimal');\n              item.loading = item.disabled = true;\n              item.enum = await fetchOptions();\n              item.loading = item.disabled = false;\n            }\n          },\n        );\n        yield from(toStream(() => value('otherAnimalName')))\n          .pipe(debounceTime(500))\n          .subscribe((val) => {\n            if (['dog', 'cat'].includes(val)) {\n              message.open({\n                content: `\ud83d\udc97 We all love ${val}s `,\n              });\n            }\n          });\n      }}\n    >\n      <Field\n        name=\"isFurry\"\n        initialValue={false}\n        label=\"Do you like animals \ud83d\udc3a\"\n        component=\"Checkbox\"\n        componentProps={({ field }) => ({\n          children: field?.value ? 'Yes' : 'Nope',\n        })}\n      />\n      <Field\n        name=\"favoriteAnimal\"\n        label=\"What is your favorite animal \u2764\ufe0f\"\n        component=\"Select\"\n        componentProps={{\n          style: {\n            width: '40%',\n          },\n          placeholder: 'Choose an animal',\n        }}\n        extra={`When you select \"Others\", the \"Other Animals\" input box will appear`}\n        rules={{\n          required: true,\n          message: 'This field is required',\n        }}\n        required\n      />\n      <Field\n        name=\"otherAnimalName\"\n        label=\"Other animals \ud83d\udc97\"\n        component=\"Input\"\n        componentProps={{\n          style: {\n            width: '40%',\n          },\n          placeholder: 'try to input \"cat\" or \"dog\"',\n        }}\n        rules={{\n          required: true,\n          message: 'This field is required',\n        }}\n        required\n      />\n      <Button type=\"primary\" htmlType=\"submit\">\n        Submit\n      </Button>\n    </Form>\n  );\n};\n\nexport default App;\n"}},{defaultShowCode:!0,path:"/_demos/index",title:"\u5feb\u901f\u793a\u4f8b",desc:'<div class="markdown"><p>`&#x3C;Form>` \u7684 effects \u5c5e\u6027\u4f18\u96c5\u5730\u58f0\u660e</p></div>',CSSInDependencies:["antd/dist/antd.css"],dependencies:{"@formular/react":"1.0.0-alpha.6","@formular/antd":"1.0.0-alpha.8",antd:"4.6.5","@formular/core":"1.0.0-alpha.5",mobx:"5.15.7","mobx-utils":"5.6.1",rxjs:"6.6.3"},files:{"entry.tsx":{path:"./entry",content:"import { Registry } from '@formular/react';\nimport { Checkbox, Input, Select } from '@formular/antd/es/components';\nimport 'antd/es/checkbox/style';\nimport 'antd/es/input/style';\nimport 'antd/es/select/style';\nimport 'antd/es/form/style';\n\nRegistry.registerGlobalFields({\n  Checkbox,\n  Input,\n  Select,\n});\n"},"services.tsx":{path:"./services",content:"export async function fetchOptions() {\n  await sleep(1000);\n  return [\n    { label: 'Lion \ud83e\udd81\ufe0f', value: 'lion' },\n    { label: 'Tiger \ud83d\udc2f', value: 'tiger' },\n    { label: 'Wolf \ud83d\udc3a', value: 'wolf' },\n    { label: 'Others', value: 'others' },\n  ];\n}\n\nfunction sleep(ms: number) {\n  return new Promise((resolve) => setTimeout(resolve, ms));\n}\n"}}}),o.a.createElement(s,null)))}},"K+nK":function(e,n){function t(e){return e&&e.__esModule?e:{default:e}}e.exports=t},Uyu5:function(e,n,t){"use strict";t.r(n);t("+L6B");var r=t("2/Rp"),a=(t("miYZ"),t("tsqr")),o=t("WmNS"),i=t.n(o),l=t("9og8"),s=(t("2qtc"),t("kLXV")),m=t("aHyi"),u=t("tFTa"),c=t("3kSX"),d=t("FF8P");t("sRBo"),t("5NDa"),t("OaEy"),t("y8nQ");m["a"].registerGlobalFields({Checkbox:u["a"],Input:c["a"],Select:d["a"]});var f=t("q1tI"),p=t.n(f),h=t("N4Cn"),v=t("IlHZ"),b=t("U9Df"),y=t("7jk8"),w=t("2vnA"),x=t("Gp1o"),F=t("0/uQ"),g=t("Gi3i");function A(){return O.apply(this,arguments)}function O(){return O=Object(l["a"])(i.a.mark((function e(){return i.a.wrap((function(e){while(1)switch(e.prev=e.next){case 0:return e.next=2,N(1e3);case 2:return e.abrupt("return",[{label:"Lion \ud83e\udd81\ufe0f",value:"lion"},{label:"Tiger \ud83d\udc2f",value:"tiger"},{label:"Wolf \ud83d\udc3a",value:"wolf"},{label:"Others",value:"others"}]);case 3:case"end":return e.stop()}}),e)}))),O.apply(this,arguments)}function N(e){return new Promise(n=>setTimeout(n,e))}var q=()=>{var e=Object(b["a"])(()=>Object(y["b"])());return p.a.createElement(h["a"],{form:e,onFinish:e=>s["a"].success({title:"Values",content:p.a.createElement("pre",null,JSON.stringify(e,null,2))}),effects:i.a.mark((function e(n){var t,r,o;return i.a.wrap((function(e){while(1)switch(e.prev=e.next){case 0:return t=n.field,r=n.value,o=n.form,e.next=3,Object(w["n"])(()=>(t("favoriteAnimal").ignored=!(t("favoriteAnimal").show=!!r("isFurry")))&&o.resetFields(["favoriteAnimal"]));case 3:return e.next=5,Object(w["n"])(()=>(t("otherAnimalName").ignored=!(t("otherAnimalName").show="others"===r("favoriteAnimal")))&&o.resetFields(["otherAnimalName"]));case 5:return e.next=7,Object(w["K"])(()=>{var e;return null===(e=t("favoriteAnimal"))||void 0===e?void 0:e.show},function(){var e=Object(l["a"])(i.a.mark((function e(n){var r;return i.a.wrap((function(e){while(1)switch(e.prev=e.next){case 0:if(!n){e.next=7;break}return r=t("favoriteAnimal"),r.loading=r.disabled=!0,e.next=5,A();case 5:r.enum=e.sent,r.loading=r.disabled=!1;case 7:case"end":return e.stop()}}),e)})));return function(n){return e.apply(this,arguments)}}());case 7:return e.next=9,Object(F["a"])(Object(x["a"])(()=>r("otherAnimalName"))).pipe(Object(g["a"])(500)).subscribe(e=>{["dog","cat"].includes(e)&&a["b"].open({content:"\ud83d\udc97 We all love ".concat(e,"s ")})});case 9:case"end":return e.stop()}}),e)}))},p.a.createElement(v["a"],{name:"isFurry",initialValue:!1,label:"Do you like animals \ud83d\udc3a",component:"Checkbox",componentProps:e=>{var n=e.field;return{children:(null===n||void 0===n?void 0:n.value)?"Yes":"Nope"}}}),p.a.createElement(v["a"],{name:"favoriteAnimal",label:"What is your favorite animal \u2764\ufe0f",component:"Select",componentProps:{style:{width:"40%"},placeholder:"Choose an animal"},extra:'When you select "Others", the "Other Animals" input box will appear',rules:{required:!0,message:"This field is required"},required:!0}),p.a.createElement(v["a"],{name:"otherAnimalName",label:"Other animals \ud83d\udc97",component:"Input",componentProps:{style:{width:"40%"},placeholder:'try to input "cat" or "dog"'},rules:{required:!0,message:"This field is required"},required:!0}),p.a.createElement(r["a"],{type:"primary",htmlType:"submit"},"Submit"))};n["default"]=q}}]);