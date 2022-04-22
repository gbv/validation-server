"use strict";
export const configValidation = validate10;
const schema11 = {"$schema":"http://json-schema.org/draft-07/schema#","$id":"https://format.gbv.de/validate/config-schema.json","type":"object","properties":{"title":{"type":"string"},"description":{"type":"string"},"formats":{"anyOf":[{"type":"object","patternProperties":{"^[0-9a-z_/-]+$":{"$schema":"http://json-schema.org/draft-07/schema#","$id":"https://format.gbv.de/validate/format-schema.json","type":"object","properties":{"id":{"$ref":"#/definitions/id"},"title":{"type":"string"},"short":{"type":"string"},"url":{"$ref":"#/definitions/url"},"base":{"$ref":"#/definitions/ids"},"encodes":{"$ref":"#/definitions/ids"},"encodings":{"$ref":"#/definitions/ids"},"profiles":{"$ref":"#/definitions/ids"},"restricts":{"$ref":"#/definitions/ids"},"mimetypes":{"type":"array","items":{"type":"string"},"minItems":1},"description":{"type":"string"},"fileExtension":{"type":"string"},"wikidata":{"type":"string","pattern":"^Q[1-9][0-9]*$"},"versions":{"type":"object","patternProperties":{"^[0-9a-z_/.-]+$":{"$ref":"#/definitions/version"}},"additionalProperties":false}},"additionalProperties":false,"definitions":{"id":{"type":"string","pattern":"^[0-9a-z_/.-]+$"},"ids":{"anyOf":[{"$ref":"#/definitions/id"},{"type":"array","items":{"$ref":"#/definitions/id"},"minItems":1}]},"url":{"type":"string","format":"uri","pattern":"^https?://"},"value":{"type":"string"},"version":{"type":"object","properties":{"schemas":{"type":"array","items":{"$ref":"#/definitions/schema"},"minItems":1}},"additionalProperties":true},"schema":{"type":"object","required":["type"],"anyOf":[{"properties":{"type":{"$ref":"#/definitions/id"},"url":{"$ref":"#/definitions/url"}},"additionalProperties":false},{"properties":{"type":{"$ref":"#/definitions/id"},"value":{"$ref":"#/definitions/value"}},"additionalProperties":false}]}}}},"additionalProperties":false},{"type":"array","items":{"allOf":[{"$ref":"format-schema.json"},{"type":"object","required":["id"]}]}},{"type":"string"}]},"cache":{"anyOf":[{"type":"string"},{"const":false}]},"timeout":{"type":"integer"},"port":{"type":"integer"},"baseUrl":{"$ref":"#/definitions/url"},"provider":{"$ref":"#/definitions/link"},"links":{"type":"array","items":{"$ref":"#/definitions/link"}},"limit":{"type":"string","pattern":"^[1-9][0-9]+[kKmMgG][bB]$"},"proxies":{"type":"array","items":{"type":"string"}},"verbosity":{"type":"string","enum":["debug","info","warn","error","silent"]},"version":{"type":"string"}},"definitions":{"url":{"type":"string","format":"uri","pattern":"^https?://"},"link":{"type":"object","properties":{"url":{"$ref":"#/definitions/url"},"title":{"type":"string"}},"required":["url","title"],"additionalProperties":false}},"additionalProperties":false};
const schema12 = {"type":"string","pattern":"^[0-9a-z_/.-]+$"};
const schema13 = {"type":"string","format":"uri","pattern":"^https?://"};
const schema26 = {"type":"string","format":"uri","pattern":"^https?://"};
const func2 = Object.prototype.hasOwnProperty;
const pattern0 = new RegExp("^[0-9a-z_/-]+$", "u");
const pattern2 = new RegExp("^[0-9a-z_/.-]+$", "u");
const pattern3 = new RegExp("^https?://", "u");
const pattern6 = new RegExp("^Q[1-9][0-9]*$", "u");
const pattern19 = new RegExp("^[1-9][0-9]+[kKmMgG][bB]$", "u");
const formats0 = /^(?:[a-z][a-z0-9+\-.]*:)(?:\/?\/)?[^\s]*$/i;
const schema14 = {"anyOf":[{"$ref":"#/definitions/id"},{"type":"array","items":{"$ref":"#/definitions/id"},"minItems":1}]};

function validate11(data, {instancePath="", parentData, parentDataProperty, rootData=data}={}){
let vErrors = null;
let errors = 0;
const _errs0 = errors;
let valid0 = false;
const _errs1 = errors;
const _errs2 = errors;
if(errors === _errs2){
if(typeof data === "string"){
if(!pattern2.test(data)){
const err0 = {instancePath,schemaPath:"#/definitions/id/pattern",keyword:"pattern",params:{pattern: "^[0-9a-z_/.-]+$"},message:"must match pattern \""+"^[0-9a-z_/.-]+$"+"\""};
if(vErrors === null){
vErrors = [err0];
}
else {
vErrors.push(err0);
}
errors++;
}
}
else {
const err1 = {instancePath,schemaPath:"#/definitions/id/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err1];
}
else {
vErrors.push(err1);
}
errors++;
}
}
var _valid0 = _errs1 === errors;
valid0 = valid0 || _valid0;
if(!valid0){
const _errs4 = errors;
if(errors === _errs4){
if(Array.isArray(data)){
if(data.length < 1){
const err2 = {instancePath,schemaPath:"#/anyOf/1/minItems",keyword:"minItems",params:{limit: 1},message:"must NOT have fewer than 1 items"};
if(vErrors === null){
vErrors = [err2];
}
else {
vErrors.push(err2);
}
errors++;
}
else {
var valid2 = true;
const len0 = data.length;
for(let i0=0; i0<len0; i0++){
let data0 = data[i0];
const _errs6 = errors;
const _errs7 = errors;
if(errors === _errs7){
if(typeof data0 === "string"){
if(!pattern2.test(data0)){
const err3 = {instancePath:instancePath+"/" + i0,schemaPath:"#/definitions/id/pattern",keyword:"pattern",params:{pattern: "^[0-9a-z_/.-]+$"},message:"must match pattern \""+"^[0-9a-z_/.-]+$"+"\""};
if(vErrors === null){
vErrors = [err3];
}
else {
vErrors.push(err3);
}
errors++;
}
}
else {
const err4 = {instancePath:instancePath+"/" + i0,schemaPath:"#/definitions/id/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err4];
}
else {
vErrors.push(err4);
}
errors++;
}
}
var valid2 = _errs6 === errors;
if(!valid2){
break;
}
}
}
}
else {
const err5 = {instancePath,schemaPath:"#/anyOf/1/type",keyword:"type",params:{type: "array"},message:"must be array"};
if(vErrors === null){
vErrors = [err5];
}
else {
vErrors.push(err5);
}
errors++;
}
}
var _valid0 = _errs4 === errors;
valid0 = valid0 || _valid0;
}
if(!valid0){
const err6 = {instancePath,schemaPath:"#/anyOf",keyword:"anyOf",params:{},message:"must match a schema in anyOf"};
if(vErrors === null){
vErrors = [err6];
}
else {
vErrors.push(err6);
}
errors++;
validate11.errors = vErrors;
return false;
}
else {
errors = _errs0;
if(vErrors !== null){
if(_errs0){
vErrors.length = _errs0;
}
else {
vErrors = null;
}
}
}
validate11.errors = vErrors;
return errors === 0;
}

const schema17 = {"type":"object","properties":{"schemas":{"type":"array","items":{"$ref":"#/definitions/schema"},"minItems":1}},"additionalProperties":true};
const schema18 = {"type":"object","required":["type"],"anyOf":[{"properties":{"type":{"$ref":"#/definitions/id"},"url":{"$ref":"#/definitions/url"}},"additionalProperties":false},{"properties":{"type":{"$ref":"#/definitions/id"},"value":{"$ref":"#/definitions/value"}},"additionalProperties":false}]};
const schema22 = {"type":"string"};

function validate18(data, {instancePath="", parentData, parentDataProperty, rootData=data}={}){
let vErrors = null;
let errors = 0;
const _errs1 = errors;
let valid0 = false;
const _errs2 = errors;
if(data && typeof data == "object" && !Array.isArray(data)){
const _errs3 = errors;
for(const key0 in data){
if(!((key0 === "type") || (key0 === "url"))){
const err0 = {instancePath,schemaPath:"#/anyOf/0/additionalProperties",keyword:"additionalProperties",params:{additionalProperty: key0},message:"must NOT have additional properties"};
if(vErrors === null){
vErrors = [err0];
}
else {
vErrors.push(err0);
}
errors++;
break;
}
}
if(_errs3 === errors){
if(data.type !== undefined){
let data0 = data.type;
const _errs4 = errors;
const _errs5 = errors;
if(errors === _errs5){
if(typeof data0 === "string"){
if(!pattern2.test(data0)){
const err1 = {instancePath:instancePath+"/type",schemaPath:"#/definitions/id/pattern",keyword:"pattern",params:{pattern: "^[0-9a-z_/.-]+$"},message:"must match pattern \""+"^[0-9a-z_/.-]+$"+"\""};
if(vErrors === null){
vErrors = [err1];
}
else {
vErrors.push(err1);
}
errors++;
}
}
else {
const err2 = {instancePath:instancePath+"/type",schemaPath:"#/definitions/id/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err2];
}
else {
vErrors.push(err2);
}
errors++;
}
}
var valid1 = _errs4 === errors;
}
else {
var valid1 = true;
}
if(valid1){
if(data.url !== undefined){
let data1 = data.url;
const _errs7 = errors;
const _errs8 = errors;
if(errors === _errs8){
if(errors === _errs8){
if(typeof data1 === "string"){
if(!pattern3.test(data1)){
const err3 = {instancePath:instancePath+"/url",schemaPath:"#/definitions/url/pattern",keyword:"pattern",params:{pattern: "^https?://"},message:"must match pattern \""+"^https?://"+"\""};
if(vErrors === null){
vErrors = [err3];
}
else {
vErrors.push(err3);
}
errors++;
}
else {
if(!(formats0.test(data1))){
const err4 = {instancePath:instancePath+"/url",schemaPath:"#/definitions/url/format",keyword:"format",params:{format: "uri"},message:"must match format \""+"uri"+"\""};
if(vErrors === null){
vErrors = [err4];
}
else {
vErrors.push(err4);
}
errors++;
}
}
}
else {
const err5 = {instancePath:instancePath+"/url",schemaPath:"#/definitions/url/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err5];
}
else {
vErrors.push(err5);
}
errors++;
}
}
}
var valid1 = _errs7 === errors;
}
else {
var valid1 = true;
}
}
}
}
var _valid0 = _errs2 === errors;
valid0 = valid0 || _valid0;
if(!valid0){
const _errs10 = errors;
if(data && typeof data == "object" && !Array.isArray(data)){
const _errs11 = errors;
for(const key1 in data){
if(!((key1 === "type") || (key1 === "value"))){
const err6 = {instancePath,schemaPath:"#/anyOf/1/additionalProperties",keyword:"additionalProperties",params:{additionalProperty: key1},message:"must NOT have additional properties"};
if(vErrors === null){
vErrors = [err6];
}
else {
vErrors.push(err6);
}
errors++;
break;
}
}
if(_errs11 === errors){
if(data.type !== undefined){
let data2 = data.type;
const _errs12 = errors;
const _errs13 = errors;
if(errors === _errs13){
if(typeof data2 === "string"){
if(!pattern2.test(data2)){
const err7 = {instancePath:instancePath+"/type",schemaPath:"#/definitions/id/pattern",keyword:"pattern",params:{pattern: "^[0-9a-z_/.-]+$"},message:"must match pattern \""+"^[0-9a-z_/.-]+$"+"\""};
if(vErrors === null){
vErrors = [err7];
}
else {
vErrors.push(err7);
}
errors++;
}
}
else {
const err8 = {instancePath:instancePath+"/type",schemaPath:"#/definitions/id/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err8];
}
else {
vErrors.push(err8);
}
errors++;
}
}
var valid4 = _errs12 === errors;
}
else {
var valid4 = true;
}
if(valid4){
if(data.value !== undefined){
const _errs15 = errors;
if(typeof data.value !== "string"){
const err9 = {instancePath:instancePath+"/value",schemaPath:"#/definitions/value/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err9];
}
else {
vErrors.push(err9);
}
errors++;
}
var valid4 = _errs15 === errors;
}
else {
var valid4 = true;
}
}
}
}
var _valid0 = _errs10 === errors;
valid0 = valid0 || _valid0;
}
if(!valid0){
const err10 = {instancePath,schemaPath:"#/anyOf",keyword:"anyOf",params:{},message:"must match a schema in anyOf"};
if(vErrors === null){
vErrors = [err10];
}
else {
vErrors.push(err10);
}
errors++;
validate18.errors = vErrors;
return false;
}
else {
errors = _errs1;
if(vErrors !== null){
if(_errs1){
vErrors.length = _errs1;
}
else {
vErrors = null;
}
}
}
if(errors === 0){
if(data && typeof data == "object" && !Array.isArray(data)){
let missing0;
if((data.type === undefined) && (missing0 = "type")){
validate18.errors = [{instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: missing0},message:"must have required property '"+missing0+"'"}];
return false;
}
}
else {
validate18.errors = [{instancePath,schemaPath:"#/type",keyword:"type",params:{type: "object"},message:"must be object"}];
return false;
}
}
validate18.errors = vErrors;
return errors === 0;
}


function validate17(data, {instancePath="", parentData, parentDataProperty, rootData=data}={}){
let vErrors = null;
let errors = 0;
if(errors === 0){
if(data && typeof data == "object" && !Array.isArray(data)){
if(data.schemas !== undefined){
let data0 = data.schemas;
const _errs2 = errors;
if(errors === _errs2){
if(Array.isArray(data0)){
if(data0.length < 1){
validate17.errors = [{instancePath:instancePath+"/schemas",schemaPath:"#/properties/schemas/minItems",keyword:"minItems",params:{limit: 1},message:"must NOT have fewer than 1 items"}];
return false;
}
else {
var valid1 = true;
const len0 = data0.length;
for(let i0=0; i0<len0; i0++){
const _errs4 = errors;
if(!(validate18(data0[i0], {instancePath:instancePath+"/schemas/" + i0,parentData:data0,parentDataProperty:i0,rootData}))){
vErrors = vErrors === null ? validate18.errors : vErrors.concat(validate18.errors);
errors = vErrors.length;
}
var valid1 = _errs4 === errors;
if(!valid1){
break;
}
}
}
}
else {
validate17.errors = [{instancePath:instancePath+"/schemas",schemaPath:"#/properties/schemas/type",keyword:"type",params:{type: "array"},message:"must be array"}];
return false;
}
}
}
}
else {
validate17.errors = [{instancePath,schemaPath:"#/type",keyword:"type",params:{type: "object"},message:"must be object"}];
return false;
}
}
validate17.errors = vErrors;
return errors === 0;
}

const schema23 = {"$schema":"http://json-schema.org/draft-07/schema#","$id":"https://format.gbv.de/validate/format-schema.json","type":"object","properties":{"id":{"$ref":"#/definitions/id"},"title":{"type":"string"},"short":{"type":"string"},"url":{"$ref":"#/definitions/url"},"base":{"$ref":"#/definitions/ids"},"encodes":{"$ref":"#/definitions/ids"},"encodings":{"$ref":"#/definitions/ids"},"profiles":{"$ref":"#/definitions/ids"},"restricts":{"$ref":"#/definitions/ids"},"mimetypes":{"type":"array","items":{"type":"string"},"minItems":1},"description":{"type":"string"},"fileExtension":{"type":"string"},"wikidata":{"type":"string","pattern":"^Q[1-9][0-9]*$"},"versions":{"type":"object","patternProperties":{"^[0-9a-z_/.-]+$":{"$ref":"#/definitions/version"}},"additionalProperties":false}},"additionalProperties":false,"definitions":{"id":{"type":"string","pattern":"^[0-9a-z_/.-]+$"},"ids":{"anyOf":[{"$ref":"#/definitions/id"},{"type":"array","items":{"$ref":"#/definitions/id"},"minItems":1}]},"url":{"type":"string","format":"uri","pattern":"^https?://"},"value":{"type":"string"},"version":{"type":"object","properties":{"schemas":{"type":"array","items":{"$ref":"#/definitions/schema"},"minItems":1}},"additionalProperties":true},"schema":{"type":"object","required":["type"],"anyOf":[{"properties":{"type":{"$ref":"#/definitions/id"},"url":{"$ref":"#/definitions/url"}},"additionalProperties":false},{"properties":{"type":{"$ref":"#/definitions/id"},"value":{"$ref":"#/definitions/value"}},"additionalProperties":false}]}}};

function validate21(data, {instancePath="", parentData, parentDataProperty, rootData=data}={}){
/*# sourceURL="https://format.gbv.de/validate/format-schema.json" */;
let vErrors = null;
let errors = 0;
if(errors === 0){
if(data && typeof data == "object" && !Array.isArray(data)){
const _errs1 = errors;
for(const key0 in data){
if(!(func2.call(schema23.properties, key0))){
validate21.errors = [{instancePath,schemaPath:"#/additionalProperties",keyword:"additionalProperties",params:{additionalProperty: key0},message:"must NOT have additional properties"}];
return false;
break;
}
}
if(_errs1 === errors){
if(data.id !== undefined){
let data0 = data.id;
const _errs2 = errors;
const _errs3 = errors;
if(errors === _errs3){
if(typeof data0 === "string"){
if(!pattern2.test(data0)){
validate21.errors = [{instancePath:instancePath+"/id",schemaPath:"#/definitions/id/pattern",keyword:"pattern",params:{pattern: "^[0-9a-z_/.-]+$"},message:"must match pattern \""+"^[0-9a-z_/.-]+$"+"\""}];
return false;
}
}
else {
validate21.errors = [{instancePath:instancePath+"/id",schemaPath:"#/definitions/id/type",keyword:"type",params:{type: "string"},message:"must be string"}];
return false;
}
}
var valid0 = _errs2 === errors;
}
else {
var valid0 = true;
}
if(valid0){
if(data.title !== undefined){
const _errs5 = errors;
if(typeof data.title !== "string"){
validate21.errors = [{instancePath:instancePath+"/title",schemaPath:"#/properties/title/type",keyword:"type",params:{type: "string"},message:"must be string"}];
return false;
}
var valid0 = _errs5 === errors;
}
else {
var valid0 = true;
}
if(valid0){
if(data.short !== undefined){
const _errs7 = errors;
if(typeof data.short !== "string"){
validate21.errors = [{instancePath:instancePath+"/short",schemaPath:"#/properties/short/type",keyword:"type",params:{type: "string"},message:"must be string"}];
return false;
}
var valid0 = _errs7 === errors;
}
else {
var valid0 = true;
}
if(valid0){
if(data.url !== undefined){
let data3 = data.url;
const _errs9 = errors;
const _errs10 = errors;
if(errors === _errs10){
if(errors === _errs10){
if(typeof data3 === "string"){
if(!pattern3.test(data3)){
validate21.errors = [{instancePath:instancePath+"/url",schemaPath:"#/definitions/url/pattern",keyword:"pattern",params:{pattern: "^https?://"},message:"must match pattern \""+"^https?://"+"\""}];
return false;
}
else {
if(!(formats0.test(data3))){
validate21.errors = [{instancePath:instancePath+"/url",schemaPath:"#/definitions/url/format",keyword:"format",params:{format: "uri"},message:"must match format \""+"uri"+"\""}];
return false;
}
}
}
else {
validate21.errors = [{instancePath:instancePath+"/url",schemaPath:"#/definitions/url/type",keyword:"type",params:{type: "string"},message:"must be string"}];
return false;
}
}
}
var valid0 = _errs9 === errors;
}
else {
var valid0 = true;
}
if(valid0){
if(data.base !== undefined){
const _errs12 = errors;
if(!(validate11(data.base, {instancePath:instancePath+"/base",parentData:data,parentDataProperty:"base",rootData}))){
vErrors = vErrors === null ? validate11.errors : vErrors.concat(validate11.errors);
errors = vErrors.length;
}
var valid0 = _errs12 === errors;
}
else {
var valid0 = true;
}
if(valid0){
if(data.encodes !== undefined){
const _errs13 = errors;
if(!(validate11(data.encodes, {instancePath:instancePath+"/encodes",parentData:data,parentDataProperty:"encodes",rootData}))){
vErrors = vErrors === null ? validate11.errors : vErrors.concat(validate11.errors);
errors = vErrors.length;
}
var valid0 = _errs13 === errors;
}
else {
var valid0 = true;
}
if(valid0){
if(data.encodings !== undefined){
const _errs14 = errors;
if(!(validate11(data.encodings, {instancePath:instancePath+"/encodings",parentData:data,parentDataProperty:"encodings",rootData}))){
vErrors = vErrors === null ? validate11.errors : vErrors.concat(validate11.errors);
errors = vErrors.length;
}
var valid0 = _errs14 === errors;
}
else {
var valid0 = true;
}
if(valid0){
if(data.profiles !== undefined){
const _errs15 = errors;
if(!(validate11(data.profiles, {instancePath:instancePath+"/profiles",parentData:data,parentDataProperty:"profiles",rootData}))){
vErrors = vErrors === null ? validate11.errors : vErrors.concat(validate11.errors);
errors = vErrors.length;
}
var valid0 = _errs15 === errors;
}
else {
var valid0 = true;
}
if(valid0){
if(data.restricts !== undefined){
const _errs16 = errors;
if(!(validate11(data.restricts, {instancePath:instancePath+"/restricts",parentData:data,parentDataProperty:"restricts",rootData}))){
vErrors = vErrors === null ? validate11.errors : vErrors.concat(validate11.errors);
errors = vErrors.length;
}
var valid0 = _errs16 === errors;
}
else {
var valid0 = true;
}
if(valid0){
if(data.mimetypes !== undefined){
let data9 = data.mimetypes;
const _errs17 = errors;
if(errors === _errs17){
if(Array.isArray(data9)){
if(data9.length < 1){
validate21.errors = [{instancePath:instancePath+"/mimetypes",schemaPath:"#/properties/mimetypes/minItems",keyword:"minItems",params:{limit: 1},message:"must NOT have fewer than 1 items"}];
return false;
}
else {
var valid3 = true;
const len0 = data9.length;
for(let i0=0; i0<len0; i0++){
const _errs19 = errors;
if(typeof data9[i0] !== "string"){
validate21.errors = [{instancePath:instancePath+"/mimetypes/" + i0,schemaPath:"#/properties/mimetypes/items/type",keyword:"type",params:{type: "string"},message:"must be string"}];
return false;
}
var valid3 = _errs19 === errors;
if(!valid3){
break;
}
}
}
}
else {
validate21.errors = [{instancePath:instancePath+"/mimetypes",schemaPath:"#/properties/mimetypes/type",keyword:"type",params:{type: "array"},message:"must be array"}];
return false;
}
}
var valid0 = _errs17 === errors;
}
else {
var valid0 = true;
}
if(valid0){
if(data.description !== undefined){
const _errs21 = errors;
if(typeof data.description !== "string"){
validate21.errors = [{instancePath:instancePath+"/description",schemaPath:"#/properties/description/type",keyword:"type",params:{type: "string"},message:"must be string"}];
return false;
}
var valid0 = _errs21 === errors;
}
else {
var valid0 = true;
}
if(valid0){
if(data.fileExtension !== undefined){
const _errs23 = errors;
if(typeof data.fileExtension !== "string"){
validate21.errors = [{instancePath:instancePath+"/fileExtension",schemaPath:"#/properties/fileExtension/type",keyword:"type",params:{type: "string"},message:"must be string"}];
return false;
}
var valid0 = _errs23 === errors;
}
else {
var valid0 = true;
}
if(valid0){
if(data.wikidata !== undefined){
let data13 = data.wikidata;
const _errs25 = errors;
if(errors === _errs25){
if(typeof data13 === "string"){
if(!pattern6.test(data13)){
validate21.errors = [{instancePath:instancePath+"/wikidata",schemaPath:"#/properties/wikidata/pattern",keyword:"pattern",params:{pattern: "^Q[1-9][0-9]*$"},message:"must match pattern \""+"^Q[1-9][0-9]*$"+"\""}];
return false;
}
}
else {
validate21.errors = [{instancePath:instancePath+"/wikidata",schemaPath:"#/properties/wikidata/type",keyword:"type",params:{type: "string"},message:"must be string"}];
return false;
}
}
var valid0 = _errs25 === errors;
}
else {
var valid0 = true;
}
if(valid0){
if(data.versions !== undefined){
let data14 = data.versions;
const _errs27 = errors;
if(errors === _errs27){
if(data14 && typeof data14 == "object" && !Array.isArray(data14)){
const _errs29 = errors;
for(const key1 in data14){
if(!(pattern2.test(key1))){
validate21.errors = [{instancePath:instancePath+"/versions",schemaPath:"#/properties/versions/additionalProperties",keyword:"additionalProperties",params:{additionalProperty: key1},message:"must NOT have additional properties"}];
return false;
break;
}
}
if(_errs29 === errors){
var valid4 = true;
for(const key2 in data14){
if(pattern2.test(key2)){
const _errs30 = errors;
if(!(validate17(data14[key2], {instancePath:instancePath+"/versions/" + key2.replace(/~/g, "~0").replace(/\//g, "~1"),parentData:data14,parentDataProperty:key2,rootData}))){
vErrors = vErrors === null ? validate17.errors : vErrors.concat(validate17.errors);
errors = vErrors.length;
}
var valid4 = _errs30 === errors;
if(!valid4){
break;
}
}
}
}
}
else {
validate21.errors = [{instancePath:instancePath+"/versions",schemaPath:"#/properties/versions/type",keyword:"type",params:{type: "object"},message:"must be object"}];
return false;
}
}
var valid0 = _errs27 === errors;
}
else {
var valid0 = true;
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
else {
validate21.errors = [{instancePath,schemaPath:"#/type",keyword:"type",params:{type: "object"},message:"must be object"}];
return false;
}
}
validate21.errors = vErrors;
return errors === 0;
}

const schema27 = {"type":"object","properties":{"url":{"$ref":"#/definitions/url"},"title":{"type":"string"}},"required":["url","title"],"additionalProperties":false};

function validate29(data, {instancePath="", parentData, parentDataProperty, rootData=data}={}){
let vErrors = null;
let errors = 0;
if(errors === 0){
if(data && typeof data == "object" && !Array.isArray(data)){
let missing0;
if(((data.url === undefined) && (missing0 = "url")) || ((data.title === undefined) && (missing0 = "title"))){
validate29.errors = [{instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: missing0},message:"must have required property '"+missing0+"'"}];
return false;
}
else {
const _errs1 = errors;
for(const key0 in data){
if(!((key0 === "url") || (key0 === "title"))){
validate29.errors = [{instancePath,schemaPath:"#/additionalProperties",keyword:"additionalProperties",params:{additionalProperty: key0},message:"must NOT have additional properties"}];
return false;
break;
}
}
if(_errs1 === errors){
if(data.url !== undefined){
let data0 = data.url;
const _errs2 = errors;
const _errs3 = errors;
if(errors === _errs3){
if(errors === _errs3){
if(typeof data0 === "string"){
if(!pattern3.test(data0)){
validate29.errors = [{instancePath:instancePath+"/url",schemaPath:"#/definitions/url/pattern",keyword:"pattern",params:{pattern: "^https?://"},message:"must match pattern \""+"^https?://"+"\""}];
return false;
}
else {
if(!(formats0.test(data0))){
validate29.errors = [{instancePath:instancePath+"/url",schemaPath:"#/definitions/url/format",keyword:"format",params:{format: "uri"},message:"must match format \""+"uri"+"\""}];
return false;
}
}
}
else {
validate29.errors = [{instancePath:instancePath+"/url",schemaPath:"#/definitions/url/type",keyword:"type",params:{type: "string"},message:"must be string"}];
return false;
}
}
}
var valid0 = _errs2 === errors;
}
else {
var valid0 = true;
}
if(valid0){
if(data.title !== undefined){
const _errs5 = errors;
if(typeof data.title !== "string"){
validate29.errors = [{instancePath:instancePath+"/title",schemaPath:"#/properties/title/type",keyword:"type",params:{type: "string"},message:"must be string"}];
return false;
}
var valid0 = _errs5 === errors;
}
else {
var valid0 = true;
}
}
}
}
}
else {
validate29.errors = [{instancePath,schemaPath:"#/type",keyword:"type",params:{type: "object"},message:"must be object"}];
return false;
}
}
validate29.errors = vErrors;
return errors === 0;
}


function validate10(data, {instancePath="", parentData, parentDataProperty, rootData=data}={}){
/*# sourceURL="https://format.gbv.de/validate/config-schema.json" */;
let vErrors = null;
let errors = 0;
if(errors === 0){
if(data && typeof data == "object" && !Array.isArray(data)){
const _errs1 = errors;
for(const key0 in data){
if(!(func2.call(schema11.properties, key0))){
validate10.errors = [{instancePath,schemaPath:"#/additionalProperties",keyword:"additionalProperties",params:{additionalProperty: key0},message:"must NOT have additional properties"}];
return false;
break;
}
}
if(_errs1 === errors){
if(data.title !== undefined){
const _errs2 = errors;
if(typeof data.title !== "string"){
validate10.errors = [{instancePath:instancePath+"/title",schemaPath:"#/properties/title/type",keyword:"type",params:{type: "string"},message:"must be string"}];
return false;
}
var valid0 = _errs2 === errors;
}
else {
var valid0 = true;
}
if(valid0){
if(data.description !== undefined){
const _errs4 = errors;
if(typeof data.description !== "string"){
validate10.errors = [{instancePath:instancePath+"/description",schemaPath:"#/properties/description/type",keyword:"type",params:{type: "string"},message:"must be string"}];
return false;
}
var valid0 = _errs4 === errors;
}
else {
var valid0 = true;
}
if(valid0){
if(data.formats !== undefined){
let data2 = data.formats;
const _errs6 = errors;
const _errs7 = errors;
let valid1 = false;
const _errs8 = errors;
if(errors === _errs8){
if(data2 && typeof data2 == "object" && !Array.isArray(data2)){
const _errs10 = errors;
for(const key1 in data2){
if(!(pattern0.test(key1))){
const err0 = {instancePath:instancePath+"/formats",schemaPath:"#/properties/formats/anyOf/0/additionalProperties",keyword:"additionalProperties",params:{additionalProperty: key1},message:"must NOT have additional properties"};
if(vErrors === null){
vErrors = [err0];
}
else {
vErrors.push(err0);
}
errors++;
break;
}
}
if(_errs10 === errors){
var valid2 = true;
for(const key2 in data2){
if(pattern0.test(key2)){
let data3 = data2[key2];
const _errs11 = errors;
if(errors === _errs11){
if(data3 && typeof data3 == "object" && !Array.isArray(data3)){
const _errs13 = errors;
for(const key3 in data3){
if(!(func2.call(schema11.properties.formats.anyOf[0].patternProperties["^[0-9a-z_/-]+$"].properties, key3))){
const err1 = {instancePath:instancePath+"/formats/" + key2.replace(/~/g, "~0").replace(/\//g, "~1"),schemaPath:"#/properties/formats/anyOf/0/patternProperties/%5E%5B0-9a-z_~1-%5D%2B%24/additionalProperties",keyword:"additionalProperties",params:{additionalProperty: key3},message:"must NOT have additional properties"};
if(vErrors === null){
vErrors = [err1];
}
else {
vErrors.push(err1);
}
errors++;
break;
}
}
if(_errs13 === errors){
if(data3.id !== undefined){
let data4 = data3.id;
const _errs14 = errors;
const _errs15 = errors;
if(errors === _errs15){
if(typeof data4 === "string"){
if(!pattern2.test(data4)){
const err2 = {instancePath:instancePath+"/formats/" + key2.replace(/~/g, "~0").replace(/\//g, "~1")+"/id",schemaPath:"#/definitions/id/pattern",keyword:"pattern",params:{pattern: "^[0-9a-z_/.-]+$"},message:"must match pattern \""+"^[0-9a-z_/.-]+$"+"\""};
if(vErrors === null){
vErrors = [err2];
}
else {
vErrors.push(err2);
}
errors++;
}
}
else {
const err3 = {instancePath:instancePath+"/formats/" + key2.replace(/~/g, "~0").replace(/\//g, "~1")+"/id",schemaPath:"#/definitions/id/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err3];
}
else {
vErrors.push(err3);
}
errors++;
}
}
var valid3 = _errs14 === errors;
}
else {
var valid3 = true;
}
if(valid3){
if(data3.title !== undefined){
const _errs17 = errors;
if(typeof data3.title !== "string"){
const err4 = {instancePath:instancePath+"/formats/" + key2.replace(/~/g, "~0").replace(/\//g, "~1")+"/title",schemaPath:"#/properties/formats/anyOf/0/patternProperties/%5E%5B0-9a-z_~1-%5D%2B%24/properties/title/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err4];
}
else {
vErrors.push(err4);
}
errors++;
}
var valid3 = _errs17 === errors;
}
else {
var valid3 = true;
}
if(valid3){
if(data3.short !== undefined){
const _errs19 = errors;
if(typeof data3.short !== "string"){
const err5 = {instancePath:instancePath+"/formats/" + key2.replace(/~/g, "~0").replace(/\//g, "~1")+"/short",schemaPath:"#/properties/formats/anyOf/0/patternProperties/%5E%5B0-9a-z_~1-%5D%2B%24/properties/short/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err5];
}
else {
vErrors.push(err5);
}
errors++;
}
var valid3 = _errs19 === errors;
}
else {
var valid3 = true;
}
if(valid3){
if(data3.url !== undefined){
let data7 = data3.url;
const _errs21 = errors;
const _errs22 = errors;
if(errors === _errs22){
if(errors === _errs22){
if(typeof data7 === "string"){
if(!pattern3.test(data7)){
const err6 = {instancePath:instancePath+"/formats/" + key2.replace(/~/g, "~0").replace(/\//g, "~1")+"/url",schemaPath:"#/definitions/url/pattern",keyword:"pattern",params:{pattern: "^https?://"},message:"must match pattern \""+"^https?://"+"\""};
if(vErrors === null){
vErrors = [err6];
}
else {
vErrors.push(err6);
}
errors++;
}
else {
if(!(formats0.test(data7))){
const err7 = {instancePath:instancePath+"/formats/" + key2.replace(/~/g, "~0").replace(/\//g, "~1")+"/url",schemaPath:"#/definitions/url/format",keyword:"format",params:{format: "uri"},message:"must match format \""+"uri"+"\""};
if(vErrors === null){
vErrors = [err7];
}
else {
vErrors.push(err7);
}
errors++;
}
}
}
else {
const err8 = {instancePath:instancePath+"/formats/" + key2.replace(/~/g, "~0").replace(/\//g, "~1")+"/url",schemaPath:"#/definitions/url/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err8];
}
else {
vErrors.push(err8);
}
errors++;
}
}
}
var valid3 = _errs21 === errors;
}
else {
var valid3 = true;
}
if(valid3){
if(data3.base !== undefined){
const _errs24 = errors;
if(!(validate11(data3.base, {instancePath:instancePath+"/formats/" + key2.replace(/~/g, "~0").replace(/\//g, "~1")+"/base",parentData:data3,parentDataProperty:"base",rootData}))){
vErrors = vErrors === null ? validate11.errors : vErrors.concat(validate11.errors);
errors = vErrors.length;
}
var valid3 = _errs24 === errors;
}
else {
var valid3 = true;
}
if(valid3){
if(data3.encodes !== undefined){
const _errs25 = errors;
if(!(validate11(data3.encodes, {instancePath:instancePath+"/formats/" + key2.replace(/~/g, "~0").replace(/\//g, "~1")+"/encodes",parentData:data3,parentDataProperty:"encodes",rootData}))){
vErrors = vErrors === null ? validate11.errors : vErrors.concat(validate11.errors);
errors = vErrors.length;
}
var valid3 = _errs25 === errors;
}
else {
var valid3 = true;
}
if(valid3){
if(data3.encodings !== undefined){
const _errs26 = errors;
if(!(validate11(data3.encodings, {instancePath:instancePath+"/formats/" + key2.replace(/~/g, "~0").replace(/\//g, "~1")+"/encodings",parentData:data3,parentDataProperty:"encodings",rootData}))){
vErrors = vErrors === null ? validate11.errors : vErrors.concat(validate11.errors);
errors = vErrors.length;
}
var valid3 = _errs26 === errors;
}
else {
var valid3 = true;
}
if(valid3){
if(data3.profiles !== undefined){
const _errs27 = errors;
if(!(validate11(data3.profiles, {instancePath:instancePath+"/formats/" + key2.replace(/~/g, "~0").replace(/\//g, "~1")+"/profiles",parentData:data3,parentDataProperty:"profiles",rootData}))){
vErrors = vErrors === null ? validate11.errors : vErrors.concat(validate11.errors);
errors = vErrors.length;
}
var valid3 = _errs27 === errors;
}
else {
var valid3 = true;
}
if(valid3){
if(data3.restricts !== undefined){
const _errs28 = errors;
if(!(validate11(data3.restricts, {instancePath:instancePath+"/formats/" + key2.replace(/~/g, "~0").replace(/\//g, "~1")+"/restricts",parentData:data3,parentDataProperty:"restricts",rootData}))){
vErrors = vErrors === null ? validate11.errors : vErrors.concat(validate11.errors);
errors = vErrors.length;
}
var valid3 = _errs28 === errors;
}
else {
var valid3 = true;
}
if(valid3){
if(data3.mimetypes !== undefined){
let data13 = data3.mimetypes;
const _errs29 = errors;
if(errors === _errs29){
if(Array.isArray(data13)){
if(data13.length < 1){
const err9 = {instancePath:instancePath+"/formats/" + key2.replace(/~/g, "~0").replace(/\//g, "~1")+"/mimetypes",schemaPath:"#/properties/formats/anyOf/0/patternProperties/%5E%5B0-9a-z_~1-%5D%2B%24/properties/mimetypes/minItems",keyword:"minItems",params:{limit: 1},message:"must NOT have fewer than 1 items"};
if(vErrors === null){
vErrors = [err9];
}
else {
vErrors.push(err9);
}
errors++;
}
else {
var valid6 = true;
const len0 = data13.length;
for(let i0=0; i0<len0; i0++){
const _errs31 = errors;
if(typeof data13[i0] !== "string"){
const err10 = {instancePath:instancePath+"/formats/" + key2.replace(/~/g, "~0").replace(/\//g, "~1")+"/mimetypes/" + i0,schemaPath:"#/properties/formats/anyOf/0/patternProperties/%5E%5B0-9a-z_~1-%5D%2B%24/properties/mimetypes/items/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err10];
}
else {
vErrors.push(err10);
}
errors++;
}
var valid6 = _errs31 === errors;
if(!valid6){
break;
}
}
}
}
else {
const err11 = {instancePath:instancePath+"/formats/" + key2.replace(/~/g, "~0").replace(/\//g, "~1")+"/mimetypes",schemaPath:"#/properties/formats/anyOf/0/patternProperties/%5E%5B0-9a-z_~1-%5D%2B%24/properties/mimetypes/type",keyword:"type",params:{type: "array"},message:"must be array"};
if(vErrors === null){
vErrors = [err11];
}
else {
vErrors.push(err11);
}
errors++;
}
}
var valid3 = _errs29 === errors;
}
else {
var valid3 = true;
}
if(valid3){
if(data3.description !== undefined){
const _errs33 = errors;
if(typeof data3.description !== "string"){
const err12 = {instancePath:instancePath+"/formats/" + key2.replace(/~/g, "~0").replace(/\//g, "~1")+"/description",schemaPath:"#/properties/formats/anyOf/0/patternProperties/%5E%5B0-9a-z_~1-%5D%2B%24/properties/description/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err12];
}
else {
vErrors.push(err12);
}
errors++;
}
var valid3 = _errs33 === errors;
}
else {
var valid3 = true;
}
if(valid3){
if(data3.fileExtension !== undefined){
const _errs35 = errors;
if(typeof data3.fileExtension !== "string"){
const err13 = {instancePath:instancePath+"/formats/" + key2.replace(/~/g, "~0").replace(/\//g, "~1")+"/fileExtension",schemaPath:"#/properties/formats/anyOf/0/patternProperties/%5E%5B0-9a-z_~1-%5D%2B%24/properties/fileExtension/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err13];
}
else {
vErrors.push(err13);
}
errors++;
}
var valid3 = _errs35 === errors;
}
else {
var valid3 = true;
}
if(valid3){
if(data3.wikidata !== undefined){
let data17 = data3.wikidata;
const _errs37 = errors;
if(errors === _errs37){
if(typeof data17 === "string"){
if(!pattern6.test(data17)){
const err14 = {instancePath:instancePath+"/formats/" + key2.replace(/~/g, "~0").replace(/\//g, "~1")+"/wikidata",schemaPath:"#/properties/formats/anyOf/0/patternProperties/%5E%5B0-9a-z_~1-%5D%2B%24/properties/wikidata/pattern",keyword:"pattern",params:{pattern: "^Q[1-9][0-9]*$"},message:"must match pattern \""+"^Q[1-9][0-9]*$"+"\""};
if(vErrors === null){
vErrors = [err14];
}
else {
vErrors.push(err14);
}
errors++;
}
}
else {
const err15 = {instancePath:instancePath+"/formats/" + key2.replace(/~/g, "~0").replace(/\//g, "~1")+"/wikidata",schemaPath:"#/properties/formats/anyOf/0/patternProperties/%5E%5B0-9a-z_~1-%5D%2B%24/properties/wikidata/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err15];
}
else {
vErrors.push(err15);
}
errors++;
}
}
var valid3 = _errs37 === errors;
}
else {
var valid3 = true;
}
if(valid3){
if(data3.versions !== undefined){
let data18 = data3.versions;
const _errs39 = errors;
if(errors === _errs39){
if(data18 && typeof data18 == "object" && !Array.isArray(data18)){
const _errs41 = errors;
for(const key4 in data18){
if(!(pattern2.test(key4))){
const err16 = {instancePath:instancePath+"/formats/" + key2.replace(/~/g, "~0").replace(/\//g, "~1")+"/versions",schemaPath:"#/properties/formats/anyOf/0/patternProperties/%5E%5B0-9a-z_~1-%5D%2B%24/properties/versions/additionalProperties",keyword:"additionalProperties",params:{additionalProperty: key4},message:"must NOT have additional properties"};
if(vErrors === null){
vErrors = [err16];
}
else {
vErrors.push(err16);
}
errors++;
break;
}
}
if(_errs41 === errors){
var valid7 = true;
for(const key5 in data18){
if(pattern2.test(key5)){
const _errs42 = errors;
if(!(validate17(data18[key5], {instancePath:instancePath+"/formats/" + key2.replace(/~/g, "~0").replace(/\//g, "~1")+"/versions/" + key5.replace(/~/g, "~0").replace(/\//g, "~1"),parentData:data18,parentDataProperty:key5,rootData}))){
vErrors = vErrors === null ? validate17.errors : vErrors.concat(validate17.errors);
errors = vErrors.length;
}
var valid7 = _errs42 === errors;
if(!valid7){
break;
}
}
}
}
}
else {
const err17 = {instancePath:instancePath+"/formats/" + key2.replace(/~/g, "~0").replace(/\//g, "~1")+"/versions",schemaPath:"#/properties/formats/anyOf/0/patternProperties/%5E%5B0-9a-z_~1-%5D%2B%24/properties/versions/type",keyword:"type",params:{type: "object"},message:"must be object"};
if(vErrors === null){
vErrors = [err17];
}
else {
vErrors.push(err17);
}
errors++;
}
}
var valid3 = _errs39 === errors;
}
else {
var valid3 = true;
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
else {
const err18 = {instancePath:instancePath+"/formats/" + key2.replace(/~/g, "~0").replace(/\//g, "~1"),schemaPath:"#/properties/formats/anyOf/0/patternProperties/%5E%5B0-9a-z_~1-%5D%2B%24/type",keyword:"type",params:{type: "object"},message:"must be object"};
if(vErrors === null){
vErrors = [err18];
}
else {
vErrors.push(err18);
}
errors++;
}
}
var valid2 = _errs11 === errors;
if(!valid2){
break;
}
}
}
}
}
else {
const err19 = {instancePath:instancePath+"/formats",schemaPath:"#/properties/formats/anyOf/0/type",keyword:"type",params:{type: "object"},message:"must be object"};
if(vErrors === null){
vErrors = [err19];
}
else {
vErrors.push(err19);
}
errors++;
}
}
var _valid0 = _errs8 === errors;
valid1 = valid1 || _valid0;
if(!valid1){
const _errs43 = errors;
if(errors === _errs43){
if(Array.isArray(data2)){
var valid8 = true;
const len1 = data2.length;
for(let i1=0; i1<len1; i1++){
let data20 = data2[i1];
const _errs45 = errors;
const _errs46 = errors;
if(!(validate21(data20, {instancePath:instancePath+"/formats/" + i1,parentData:data2,parentDataProperty:i1,rootData}))){
vErrors = vErrors === null ? validate21.errors : vErrors.concat(validate21.errors);
errors = vErrors.length;
}
var valid9 = _errs46 === errors;
if(valid9){
const _errs47 = errors;
if(errors === _errs47){
if(data20 && typeof data20 == "object" && !Array.isArray(data20)){
let missing0;
if((data20.id === undefined) && (missing0 = "id")){
const err20 = {instancePath:instancePath+"/formats/" + i1,schemaPath:"#/properties/formats/anyOf/1/items/allOf/1/required",keyword:"required",params:{missingProperty: missing0},message:"must have required property '"+missing0+"'"};
if(vErrors === null){
vErrors = [err20];
}
else {
vErrors.push(err20);
}
errors++;
}
}
else {
const err21 = {instancePath:instancePath+"/formats/" + i1,schemaPath:"#/properties/formats/anyOf/1/items/allOf/1/type",keyword:"type",params:{type: "object"},message:"must be object"};
if(vErrors === null){
vErrors = [err21];
}
else {
vErrors.push(err21);
}
errors++;
}
}
var valid9 = _errs47 === errors;
}
var valid8 = _errs45 === errors;
if(!valid8){
break;
}
}
}
else {
const err22 = {instancePath:instancePath+"/formats",schemaPath:"#/properties/formats/anyOf/1/type",keyword:"type",params:{type: "array"},message:"must be array"};
if(vErrors === null){
vErrors = [err22];
}
else {
vErrors.push(err22);
}
errors++;
}
}
var _valid0 = _errs43 === errors;
valid1 = valid1 || _valid0;
if(!valid1){
const _errs49 = errors;
if(typeof data2 !== "string"){
const err23 = {instancePath:instancePath+"/formats",schemaPath:"#/properties/formats/anyOf/2/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err23];
}
else {
vErrors.push(err23);
}
errors++;
}
var _valid0 = _errs49 === errors;
valid1 = valid1 || _valid0;
}
}
if(!valid1){
const err24 = {instancePath:instancePath+"/formats",schemaPath:"#/properties/formats/anyOf",keyword:"anyOf",params:{},message:"must match a schema in anyOf"};
if(vErrors === null){
vErrors = [err24];
}
else {
vErrors.push(err24);
}
errors++;
validate10.errors = vErrors;
return false;
}
else {
errors = _errs7;
if(vErrors !== null){
if(_errs7){
vErrors.length = _errs7;
}
else {
vErrors = null;
}
}
}
var valid0 = _errs6 === errors;
}
else {
var valid0 = true;
}
if(valid0){
if(data.cache !== undefined){
let data21 = data.cache;
const _errs51 = errors;
const _errs52 = errors;
let valid10 = false;
const _errs53 = errors;
if(typeof data21 !== "string"){
const err25 = {instancePath:instancePath+"/cache",schemaPath:"#/properties/cache/anyOf/0/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err25];
}
else {
vErrors.push(err25);
}
errors++;
}
var _valid1 = _errs53 === errors;
valid10 = valid10 || _valid1;
if(!valid10){
const _errs55 = errors;
if(false !== data21){
const err26 = {instancePath:instancePath+"/cache",schemaPath:"#/properties/cache/anyOf/1/const",keyword:"const",params:{allowedValue: false},message:"must be equal to constant"};
if(vErrors === null){
vErrors = [err26];
}
else {
vErrors.push(err26);
}
errors++;
}
var _valid1 = _errs55 === errors;
valid10 = valid10 || _valid1;
}
if(!valid10){
const err27 = {instancePath:instancePath+"/cache",schemaPath:"#/properties/cache/anyOf",keyword:"anyOf",params:{},message:"must match a schema in anyOf"};
if(vErrors === null){
vErrors = [err27];
}
else {
vErrors.push(err27);
}
errors++;
validate10.errors = vErrors;
return false;
}
else {
errors = _errs52;
if(vErrors !== null){
if(_errs52){
vErrors.length = _errs52;
}
else {
vErrors = null;
}
}
}
var valid0 = _errs51 === errors;
}
else {
var valid0 = true;
}
if(valid0){
if(data.timeout !== undefined){
let data22 = data.timeout;
const _errs56 = errors;
if(!(((typeof data22 == "number") && (!(data22 % 1) && !isNaN(data22))) && (isFinite(data22)))){
validate10.errors = [{instancePath:instancePath+"/timeout",schemaPath:"#/properties/timeout/type",keyword:"type",params:{type: "integer"},message:"must be integer"}];
return false;
}
var valid0 = _errs56 === errors;
}
else {
var valid0 = true;
}
if(valid0){
if(data.port !== undefined){
let data23 = data.port;
const _errs58 = errors;
if(!(((typeof data23 == "number") && (!(data23 % 1) && !isNaN(data23))) && (isFinite(data23)))){
validate10.errors = [{instancePath:instancePath+"/port",schemaPath:"#/properties/port/type",keyword:"type",params:{type: "integer"},message:"must be integer"}];
return false;
}
var valid0 = _errs58 === errors;
}
else {
var valid0 = true;
}
if(valid0){
if(data.baseUrl !== undefined){
let data24 = data.baseUrl;
const _errs60 = errors;
const _errs61 = errors;
if(errors === _errs61){
if(errors === _errs61){
if(typeof data24 === "string"){
if(!pattern3.test(data24)){
validate10.errors = [{instancePath:instancePath+"/baseUrl",schemaPath:"#/definitions/url/pattern",keyword:"pattern",params:{pattern: "^https?://"},message:"must match pattern \""+"^https?://"+"\""}];
return false;
}
else {
if(!(formats0.test(data24))){
validate10.errors = [{instancePath:instancePath+"/baseUrl",schemaPath:"#/definitions/url/format",keyword:"format",params:{format: "uri"},message:"must match format \""+"uri"+"\""}];
return false;
}
}
}
else {
validate10.errors = [{instancePath:instancePath+"/baseUrl",schemaPath:"#/definitions/url/type",keyword:"type",params:{type: "string"},message:"must be string"}];
return false;
}
}
}
var valid0 = _errs60 === errors;
}
else {
var valid0 = true;
}
if(valid0){
if(data.provider !== undefined){
const _errs63 = errors;
if(!(validate29(data.provider, {instancePath:instancePath+"/provider",parentData:data,parentDataProperty:"provider",rootData}))){
vErrors = vErrors === null ? validate29.errors : vErrors.concat(validate29.errors);
errors = vErrors.length;
}
var valid0 = _errs63 === errors;
}
else {
var valid0 = true;
}
if(valid0){
if(data.links !== undefined){
let data26 = data.links;
const _errs64 = errors;
if(errors === _errs64){
if(Array.isArray(data26)){
var valid12 = true;
const len2 = data26.length;
for(let i2=0; i2<len2; i2++){
const _errs66 = errors;
if(!(validate29(data26[i2], {instancePath:instancePath+"/links/" + i2,parentData:data26,parentDataProperty:i2,rootData}))){
vErrors = vErrors === null ? validate29.errors : vErrors.concat(validate29.errors);
errors = vErrors.length;
}
var valid12 = _errs66 === errors;
if(!valid12){
break;
}
}
}
else {
validate10.errors = [{instancePath:instancePath+"/links",schemaPath:"#/properties/links/type",keyword:"type",params:{type: "array"},message:"must be array"}];
return false;
}
}
var valid0 = _errs64 === errors;
}
else {
var valid0 = true;
}
if(valid0){
if(data.limit !== undefined){
let data28 = data.limit;
const _errs67 = errors;
if(errors === _errs67){
if(typeof data28 === "string"){
if(!pattern19.test(data28)){
validate10.errors = [{instancePath:instancePath+"/limit",schemaPath:"#/properties/limit/pattern",keyword:"pattern",params:{pattern: "^[1-9][0-9]+[kKmMgG][bB]$"},message:"must match pattern \""+"^[1-9][0-9]+[kKmMgG][bB]$"+"\""}];
return false;
}
}
else {
validate10.errors = [{instancePath:instancePath+"/limit",schemaPath:"#/properties/limit/type",keyword:"type",params:{type: "string"},message:"must be string"}];
return false;
}
}
var valid0 = _errs67 === errors;
}
else {
var valid0 = true;
}
if(valid0){
if(data.proxies !== undefined){
let data29 = data.proxies;
const _errs69 = errors;
if(errors === _errs69){
if(Array.isArray(data29)){
var valid13 = true;
const len3 = data29.length;
for(let i3=0; i3<len3; i3++){
const _errs71 = errors;
if(typeof data29[i3] !== "string"){
validate10.errors = [{instancePath:instancePath+"/proxies/" + i3,schemaPath:"#/properties/proxies/items/type",keyword:"type",params:{type: "string"},message:"must be string"}];
return false;
}
var valid13 = _errs71 === errors;
if(!valid13){
break;
}
}
}
else {
validate10.errors = [{instancePath:instancePath+"/proxies",schemaPath:"#/properties/proxies/type",keyword:"type",params:{type: "array"},message:"must be array"}];
return false;
}
}
var valid0 = _errs69 === errors;
}
else {
var valid0 = true;
}
if(valid0){
if(data.verbosity !== undefined){
let data31 = data.verbosity;
const _errs73 = errors;
if(typeof data31 !== "string"){
validate10.errors = [{instancePath:instancePath+"/verbosity",schemaPath:"#/properties/verbosity/type",keyword:"type",params:{type: "string"},message:"must be string"}];
return false;
}
if(!(((((data31 === "debug") || (data31 === "info")) || (data31 === "warn")) || (data31 === "error")) || (data31 === "silent"))){
validate10.errors = [{instancePath:instancePath+"/verbosity",schemaPath:"#/properties/verbosity/enum",keyword:"enum",params:{allowedValues: schema11.properties.verbosity.enum},message:"must be equal to one of the allowed values"}];
return false;
}
var valid0 = _errs73 === errors;
}
else {
var valid0 = true;
}
if(valid0){
if(data.version !== undefined){
const _errs75 = errors;
if(typeof data.version !== "string"){
validate10.errors = [{instancePath:instancePath+"/version",schemaPath:"#/properties/version/type",keyword:"type",params:{type: "string"},message:"must be string"}];
return false;
}
var valid0 = _errs75 === errors;
}
else {
var valid0 = true;
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
else {
validate10.errors = [{instancePath,schemaPath:"#/type",keyword:"type",params:{type: "object"},message:"must be object"}];
return false;
}
}
validate10.errors = vErrors;
return errors === 0;
}

export const formatValidation = validate32;

function validate32(data, {instancePath="", parentData, parentDataProperty, rootData=data}={}){
/*# sourceURL="https://format.gbv.de/validate/format-schema.json" */;
let vErrors = null;
let errors = 0;
if(errors === 0){
if(data && typeof data == "object" && !Array.isArray(data)){
const _errs1 = errors;
for(const key0 in data){
if(!(func2.call(schema23.properties, key0))){
validate32.errors = [{instancePath,schemaPath:"#/additionalProperties",keyword:"additionalProperties",params:{additionalProperty: key0},message:"must NOT have additional properties"}];
return false;
break;
}
}
if(_errs1 === errors){
if(data.id !== undefined){
let data0 = data.id;
const _errs2 = errors;
const _errs3 = errors;
if(errors === _errs3){
if(typeof data0 === "string"){
if(!pattern2.test(data0)){
validate32.errors = [{instancePath:instancePath+"/id",schemaPath:"#/definitions/id/pattern",keyword:"pattern",params:{pattern: "^[0-9a-z_/.-]+$"},message:"must match pattern \""+"^[0-9a-z_/.-]+$"+"\""}];
return false;
}
}
else {
validate32.errors = [{instancePath:instancePath+"/id",schemaPath:"#/definitions/id/type",keyword:"type",params:{type: "string"},message:"must be string"}];
return false;
}
}
var valid0 = _errs2 === errors;
}
else {
var valid0 = true;
}
if(valid0){
if(data.title !== undefined){
const _errs5 = errors;
if(typeof data.title !== "string"){
validate32.errors = [{instancePath:instancePath+"/title",schemaPath:"#/properties/title/type",keyword:"type",params:{type: "string"},message:"must be string"}];
return false;
}
var valid0 = _errs5 === errors;
}
else {
var valid0 = true;
}
if(valid0){
if(data.short !== undefined){
const _errs7 = errors;
if(typeof data.short !== "string"){
validate32.errors = [{instancePath:instancePath+"/short",schemaPath:"#/properties/short/type",keyword:"type",params:{type: "string"},message:"must be string"}];
return false;
}
var valid0 = _errs7 === errors;
}
else {
var valid0 = true;
}
if(valid0){
if(data.url !== undefined){
let data3 = data.url;
const _errs9 = errors;
const _errs10 = errors;
if(errors === _errs10){
if(errors === _errs10){
if(typeof data3 === "string"){
if(!pattern3.test(data3)){
validate32.errors = [{instancePath:instancePath+"/url",schemaPath:"#/definitions/url/pattern",keyword:"pattern",params:{pattern: "^https?://"},message:"must match pattern \""+"^https?://"+"\""}];
return false;
}
else {
if(!(formats0.test(data3))){
validate32.errors = [{instancePath:instancePath+"/url",schemaPath:"#/definitions/url/format",keyword:"format",params:{format: "uri"},message:"must match format \""+"uri"+"\""}];
return false;
}
}
}
else {
validate32.errors = [{instancePath:instancePath+"/url",schemaPath:"#/definitions/url/type",keyword:"type",params:{type: "string"},message:"must be string"}];
return false;
}
}
}
var valid0 = _errs9 === errors;
}
else {
var valid0 = true;
}
if(valid0){
if(data.base !== undefined){
const _errs12 = errors;
if(!(validate11(data.base, {instancePath:instancePath+"/base",parentData:data,parentDataProperty:"base",rootData}))){
vErrors = vErrors === null ? validate11.errors : vErrors.concat(validate11.errors);
errors = vErrors.length;
}
var valid0 = _errs12 === errors;
}
else {
var valid0 = true;
}
if(valid0){
if(data.encodes !== undefined){
const _errs13 = errors;
if(!(validate11(data.encodes, {instancePath:instancePath+"/encodes",parentData:data,parentDataProperty:"encodes",rootData}))){
vErrors = vErrors === null ? validate11.errors : vErrors.concat(validate11.errors);
errors = vErrors.length;
}
var valid0 = _errs13 === errors;
}
else {
var valid0 = true;
}
if(valid0){
if(data.encodings !== undefined){
const _errs14 = errors;
if(!(validate11(data.encodings, {instancePath:instancePath+"/encodings",parentData:data,parentDataProperty:"encodings",rootData}))){
vErrors = vErrors === null ? validate11.errors : vErrors.concat(validate11.errors);
errors = vErrors.length;
}
var valid0 = _errs14 === errors;
}
else {
var valid0 = true;
}
if(valid0){
if(data.profiles !== undefined){
const _errs15 = errors;
if(!(validate11(data.profiles, {instancePath:instancePath+"/profiles",parentData:data,parentDataProperty:"profiles",rootData}))){
vErrors = vErrors === null ? validate11.errors : vErrors.concat(validate11.errors);
errors = vErrors.length;
}
var valid0 = _errs15 === errors;
}
else {
var valid0 = true;
}
if(valid0){
if(data.restricts !== undefined){
const _errs16 = errors;
if(!(validate11(data.restricts, {instancePath:instancePath+"/restricts",parentData:data,parentDataProperty:"restricts",rootData}))){
vErrors = vErrors === null ? validate11.errors : vErrors.concat(validate11.errors);
errors = vErrors.length;
}
var valid0 = _errs16 === errors;
}
else {
var valid0 = true;
}
if(valid0){
if(data.mimetypes !== undefined){
let data9 = data.mimetypes;
const _errs17 = errors;
if(errors === _errs17){
if(Array.isArray(data9)){
if(data9.length < 1){
validate32.errors = [{instancePath:instancePath+"/mimetypes",schemaPath:"#/properties/mimetypes/minItems",keyword:"minItems",params:{limit: 1},message:"must NOT have fewer than 1 items"}];
return false;
}
else {
var valid3 = true;
const len0 = data9.length;
for(let i0=0; i0<len0; i0++){
const _errs19 = errors;
if(typeof data9[i0] !== "string"){
validate32.errors = [{instancePath:instancePath+"/mimetypes/" + i0,schemaPath:"#/properties/mimetypes/items/type",keyword:"type",params:{type: "string"},message:"must be string"}];
return false;
}
var valid3 = _errs19 === errors;
if(!valid3){
break;
}
}
}
}
else {
validate32.errors = [{instancePath:instancePath+"/mimetypes",schemaPath:"#/properties/mimetypes/type",keyword:"type",params:{type: "array"},message:"must be array"}];
return false;
}
}
var valid0 = _errs17 === errors;
}
else {
var valid0 = true;
}
if(valid0){
if(data.description !== undefined){
const _errs21 = errors;
if(typeof data.description !== "string"){
validate32.errors = [{instancePath:instancePath+"/description",schemaPath:"#/properties/description/type",keyword:"type",params:{type: "string"},message:"must be string"}];
return false;
}
var valid0 = _errs21 === errors;
}
else {
var valid0 = true;
}
if(valid0){
if(data.fileExtension !== undefined){
const _errs23 = errors;
if(typeof data.fileExtension !== "string"){
validate32.errors = [{instancePath:instancePath+"/fileExtension",schemaPath:"#/properties/fileExtension/type",keyword:"type",params:{type: "string"},message:"must be string"}];
return false;
}
var valid0 = _errs23 === errors;
}
else {
var valid0 = true;
}
if(valid0){
if(data.wikidata !== undefined){
let data13 = data.wikidata;
const _errs25 = errors;
if(errors === _errs25){
if(typeof data13 === "string"){
if(!pattern6.test(data13)){
validate32.errors = [{instancePath:instancePath+"/wikidata",schemaPath:"#/properties/wikidata/pattern",keyword:"pattern",params:{pattern: "^Q[1-9][0-9]*$"},message:"must match pattern \""+"^Q[1-9][0-9]*$"+"\""}];
return false;
}
}
else {
validate32.errors = [{instancePath:instancePath+"/wikidata",schemaPath:"#/properties/wikidata/type",keyword:"type",params:{type: "string"},message:"must be string"}];
return false;
}
}
var valid0 = _errs25 === errors;
}
else {
var valid0 = true;
}
if(valid0){
if(data.versions !== undefined){
let data14 = data.versions;
const _errs27 = errors;
if(errors === _errs27){
if(data14 && typeof data14 == "object" && !Array.isArray(data14)){
const _errs29 = errors;
for(const key1 in data14){
if(!(pattern2.test(key1))){
validate32.errors = [{instancePath:instancePath+"/versions",schemaPath:"#/properties/versions/additionalProperties",keyword:"additionalProperties",params:{additionalProperty: key1},message:"must NOT have additional properties"}];
return false;
break;
}
}
if(_errs29 === errors){
var valid4 = true;
for(const key2 in data14){
if(pattern2.test(key2)){
const _errs30 = errors;
if(!(validate17(data14[key2], {instancePath:instancePath+"/versions/" + key2.replace(/~/g, "~0").replace(/\//g, "~1"),parentData:data14,parentDataProperty:key2,rootData}))){
vErrors = vErrors === null ? validate17.errors : vErrors.concat(validate17.errors);
errors = vErrors.length;
}
var valid4 = _errs30 === errors;
if(!valid4){
break;
}
}
}
}
}
else {
validate32.errors = [{instancePath:instancePath+"/versions",schemaPath:"#/properties/versions/type",keyword:"type",params:{type: "object"},message:"must be object"}];
return false;
}
}
var valid0 = _errs27 === errors;
}
else {
var valid0 = true;
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
else {
validate32.errors = [{instancePath,schemaPath:"#/type",keyword:"type",params:{type: "object"},message:"must be object"}];
return false;
}
}
validate32.errors = vErrors;
return errors === 0;
}
