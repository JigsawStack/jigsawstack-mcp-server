"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var jigsawstack_1 = require("jigsawstack");
var jigsawStackClient = (0, jigsawstack_1.JigsawStack)({
    apiKey: "your-api-key",
});
var result = jigsawStackClient.web.search({
    query: "Time Square New Yor",
    safe_search: "strict",
    spell_check: true,
});
console.log(result);
