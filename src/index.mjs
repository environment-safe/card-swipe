/*
import { isBrowser, isJsDom } from 'browser-or-node';
import * as mod from 'module';
import * as path from 'path';
let internalRequire = null;
if(typeof require !== 'undefined') internalRequire = require;
const ensureRequire = ()=> (!internalRequire) && (internalRequire = mod.createRequire(import.meta.url));
//*/
 
import { CharacterScanner } from '@environment-safe/character-scanner';
import { issuerData } from './issuer-data.mjs';
import { cardTypes } from './card-types.mjs';
 
const validate = (stringToValidate)=>{
    let trimmed = stringToValidate.replace(/[\s]/g, ''),
        length = trimmed.length,
        odd = false,
        total = 0,
        calc,
        calc2;

    if (!/^[0-9]+$/.test(trimmed)) {
        return false;
    }

    for (let i = length; i > 0; i--) {
        calc = parseInt(trimmed.charAt(i - 1));
        if (!odd) {
            total += calc;
        } else {
            calc2 = calc * 2;

            switch (calc2) {
                case 10:
                    calc2 = 1;
                    break;
                case 12:
                    calc2 = 3;
                    break;
                case 14:
                    calc2 = 5;
                    break;
                case 16:
                    calc2 = 7;
                    break;
                case 18:
                    calc2 = 9;
                    break;
                default:
                    // eslint-disable-next-line no-self-assign
                    calc2 = calc2;
            }
            total += calc2;
        }
        odd = !odd;
    }

    return total !== 0 && total % 10 === 0;
};

const random = function(object, callback){
    var keys = Object.keys(object);
    var randomIndex = Math.floor(Math.random()*Object.keys(object).length);
    callback(object[keys[randomIndex]], keys[randomIndex]);
};

const forEach = function(object, callback){
    Object.keys(object).forEach(function(key, index){
        callback(object[key], key);
    });
};

const merge = function(objOne, objTwo){
    var result = {};
    forEach(objOne, function(item, key){
        result[key] = item;
    });
    forEach(objTwo, function(item, key){
        if(!result[key]) result[key] = item;
    });
    return result;
};

//var objectTool = require('async-objects');
var Keyboard = {};

export const extractIssuerData = function(account){
    var results = {};
    if(!Keyboard.Sequence.issuers) return results;
    var sequence;
    var subsequence;
    var issuerInfo;
    var width;
    var issuer = false;
    for(var lcv=0; lcv <= 2; lcv++){
        sequence = account.substring(0,4)+account.substring(4,4+lcv);
        // eslint-disable-next-line no-cond-assign
        if(issuerInfo = Keyboard.Sequence.issuers[sequence]){
            if(typeof issuerInfo == 'string'){
                issuer = issuerInfo;
            }else if(issuerInfo.from && issuerInfo.to){
                width = issuerInfo.from.length;
                subsequence = account.substring(4+lcv, width);
                if(subsequence >=  issuerInfo.from && subsequence <=  issuerInfo.to){
                    issuer = issuerInfo.issuer;
                }
            }else if(issuerInfo.in){
                width = issuerInfo.in[0].length;
                subsequence = account.substring(4+lcv, width);
                if(issuerInfo.in.contains(subsequence)){
                    issuer = issuerInfo.issuer;
                }
            }else throw('unknown issuer node type');
        }
    }
    if(issuer){
        results.issuer = issuer;
    }
    return results;
};

export const extractTypeData = function(account){
    var results = {};
    if(!Keyboard.Sequence.types) return results;
    var length = account.length;
    if(Keyboard.Sequence.types[length]){
        forEach(Keyboard.Sequence.types[length], function(type, prefix){
            if(account.indexOf(prefix) === 0) results.type = type;
        });
    }else{
        results.type = 'unknown';
    }
    return results;
};

/*var matchTree = function(tree, value){
    var keys = Object.keys(tree);
    var size = 0;
    var match = false;
    keys.forEach(function(key){
        if(value.indexOf(key) === 0 && size < key.length){
            match = key;
            size = key.length
        }
    });
    if(!match) return undefined;
};*/

var internalScanner;
var CreditSwipe = function(options){
    if(typeof options == 'function') options = {onScan:options};
    if(!options) options = {};
    if(!options.scanner && !internalScanner) internalScanner = new CharacterScanner();
    var scanner = options.scanner || internalScanner;
    if(!options.onScan) throw('Missing \'onScan\' option!');
    //var res = [];
    var callback = options.onScan || options.callback;
    scanner.addScanner({
        name:'credit-swipe',
        scan: function(str){
            // eslint-disable-next-line no-useless-escape
            return str.match(/%B[0-9 ]{13,18}\^[\/A-Z ]+\^[0-9]{13,}\?/mi) || str.match(/;[0-9]{13,16}=[0-9]{13,}\?/mi);
        }
    });
    var swipes = {};
    var finalSwipe = function(results, cb){
        if(!swipes[results.account]){
            swipes[results.account] = results;
        }else{
            Object.keys(results).forEach((key)=>{
                swipes[results.account][key] = results[key];
            });
        }
        // collect all swipes on the same account# within 1 sec
        // ex: track1 + track2
        setTimeout(()=>{ //collect all swipes on the same account# within 1 sec
            let swipe = swipes[results.account];
            delete swipes[results.account];
            if(swipe) cb(swipe);
        }, 1000);
    };
    scanner.on('credit-swipe', function(res){
        var result = res[0] || res;
        var results = {};
        //var something = false;
        if(result.substring(0,1) == '%'){
            var parts = result.substring(2,result.length-2).split('^');
            results.account = parts[0];
            if(parts[1].indexOf('/') != -1){
                var last = parts[1].substring(0, parts[1].indexOf('/'));
                last = last.substring(0,1).toUpperCase()+last.substring(1, last.length).toLowerCase();
                results.last_name = last;
                var first = parts[1].substring(parts[1].indexOf('/')+1, parts[1].length);
                if(first.indexOf(' ') != -1){
                    results.middle_initial = first.substring(first.indexOf(' ')+1, first.length).trim();
                    first = first.substring(0, first.indexOf(' '));
                }
                first = first.substring(0,1).toUpperCase()+first.substring(1, first.length).toLowerCase();
                results.first_name = first;
                results.name = first+' '+last;
            }else results.name = parts[1];
            results.exp_year = parts[2].substring(0, 2);
            results.exp_month = parts[2].substring(2, 4);
            results.expiration = new Date(results.exp_month+'/01/'+results.exp_year);
            results.track_one = result;
            //something = true;
        }
        if(result.substring(0,1) == ';'){
            var parts2 = result.substring(1,result.length-1).split('=');
            results.account = parts2[0];
            results.exp_year = parts2[1].substring(0, 2);
            results.exp_month = parts2[1].substring(2, 4);
            results.expiration = new Date(results.exp_month+'/01/'+results.exp_year);
            results.track_two = result;
            //something = true;
        }
        if(Keyboard.Sequence.issuers && results.account){
            results = merge(results, extractIssuerData(results.account));
        }
        if(Keyboard.Sequence.types && results.account){
            results = merge(results, extractTypeData(results.account));
        }
        if(options.luhn){
            results['valid'] = validate(results.account);
        }
        finalSwipe(results, callback);
    });
};

Keyboard.Sequence = {};

Keyboard.Sequence.types = cardTypes;
var intKeys = {};
Object.keys(Keyboard.Sequence.types).forEach(function(stringKey){
    intKeys[parseInt(stringKey)] = Keyboard.Sequence.types[stringKey];
});
Keyboard.Sequence.types = intKeys;

//todo: switch to new format:
// Issuer Name [Card Name]<Network>|country|{details}
Keyboard.Sequence.issuers = issuerData;

export const CardSwipe = CreditSwipe;
export const Scanner = CharacterScanner;
export const types = Keyboard.Sequence.types;
export const generate = function(type, options){
    if(!options) options = {};
    var get = function(name){
        if(options[name]) return options[name];
        else{
            var result = generate(name, options);
            options[name] = result;
            return result;
        }
    };
    switch(type){
        case 'account':
            var keys = Object.keys(Keyboard.Sequence.types);
            var size = keys[Math.floor(Math.random()*keys.length)];
            var opts = Keyboard.Sequence.types[size];
            var number = '';
            random(opts, function(item, prefix){
                number = prefix;
            });
            while(number.length < size){
                number += ''+Math.floor(Math.random()*10);
            }
            while(!validate(number)) number = (parseInt(number)+1)+'';
            return number;
        case 'expiration':
            return '1504';
        case 'list_name':
            return 'Ed Beggler';
        case 'track_one':
            return '%B'+get('account')+'^'+get('list_name').toUpperCase()+'^'+get('expiration')+'333'+'333333' /* 'A', 'BBB' or 'CCCC'*/ +'?';
        case 'track_two':
            return ';'+get('account')+'='+get('expiration')+'333'+'333333' /* 'A', 'BBB' or 'CCCC'*/ +'?';
        case 'track_data' :
            return [
                get('track_one'),
                get('track_two')
            ];
        default : return 'blah';

    }
};
export const getStdInSwipe = async ()=>{
    let finish = null;
    const handler = function (chunk, key) {
        chunk = chunk.toString();
        for(var lcv=0; lcv < chunk.length; lcv++) scanner.input(chunk[lcv]);
        if (key && key.ctrl && key.name == 'c') process.exit();
    };
    const promise = new Promise((resolve, reject)=>{
        finish = resolve;
    });
    var scanner = new Scanner();
    new CardSwipe({
        scanner : scanner,
        onScan : function(swipeData){
            process.stdout.write('\u001b[2K\u001b[0G');
            setTimeout(()=>{
                process.stdin.off('data', handler);
                process.stdin.pause();
            }, 500);
            finish(swipeData);
        }
    });
    process.stdin.setRawMode(true);
    process.stdin.resume();
    process.stdin.on('data', handler);
    process.stdout.write('>>> 💳 >>>');
    return await promise;
};

export const fake = function(scanner, options){
    var tracks = generate('track_data', options);
    forEach(tracks, function(track){
        for(var lcv=0; lcv < track.length; lcv++){
            scanner.input(track[lcv]);
        }
    });
};
