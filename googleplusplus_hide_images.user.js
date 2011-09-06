// ==UserScript==
// @name           googleplusplus_hide_images
// @author         Micah Wittman
// @namespace      http://wittman.org/projects/googleplusplus_hide_images
// @include        *plus.google.com*
// @description    Adds button under each Google Plus post image to hide it (toggle show / hide). Hides the image on original post and all shared posts. Tired of an animated GIF that keep getting shared over and over in different posts? - hide it once an forget about it.
// @version        0.1.9
// ==/UserScript==

function hideImages(){
	var hide_images_by_default = false;
	var logging = false;
	
	/****** Utility functions ******/
	function log(txt) {
		if(logging) {
			 console.log(txt);
		}
	}
	function re_map(mappings){
		if(mappings == null)
			return false; //Scripts without a default (bundled) mapping resource
		var m = mappings;
		SEL = {
			'post' : "[id^='update-']", //"[id^='update-']"
			'posts' : m['XVDd7kiawTA9Z68I'], //".tn"
			'comments_wrap' : m['nqBp6N6dKqueig2R'], //".Ij"
			'comment_editor_cancel' : "[id*='.cancel']", //[id*='.cancel']
			'plust1_and_comments_link_wrap' : m['YAnwDHrlMoy67el9'], //".Bl"
			'old_comment_count_span' : m['9Iug6cv5o3NgTEEv'], //".Gw"
			'recent_comments_wrap' : m['CgYb1dbCZGVfpUAj'], //'.mf'
			'circle_links_wrap' : '#content ' + m['tZ7bxNTZEoVrcPyj'] + ' + div', //"#content .a-ud-B + div"		
			'circle_links' : "#content " + m['NCQTv2BvLd3MFT9q'].replace(':hover','') + " a[href*='stream/']", //"#content .a-ob-j-X a[href*='stream/']"
			'stream_link' : "#content " + m['XLINtDfuUFUIgeVl'] + " + a[href='/stream']:first", //"#content .a-ob-Fd a[href='/stream']:first"
			'stream_link_active' : "#content " + m['XLINtDfuUFUIgeVl'] + " + a[href='/stream']" + m['oL8HuLz0SCCVwtPK'] + ":first", //"#content .a-f-ob-B a[href='/stream'].a-ob-j-ia:first"
			'user_link' : m['tuVm7xq63YKbjl9u'] + ' a:first', //'.Nw a:first'
			'share_link' : m['xG7OYDQoYoP4QS0R'] + ' a:first', //'.gx a:first'
			'permalink_wrap' : m['tuVm7xq63YKbjl9u'], //'.Nw',
			'img_divs' :  "#content " + m['rWCWLOSJ4yQRU41j'] + "[data-content-url]", //#contentPane .F-y-Ia[data-content-url]
			'search_input_classes' : m['ikY6QG1yVApfM0ib'].replace('.','') + ' ' + m['9WbMI68ODRm5sxgV'].replace('.','') + ' ' + m['QvnLjkPdyzwsVmEq'].replace('.',''), //'a-pu-z a-x-z Ka-z-Ka'
			'___' : ''
		};
	}

	function set_selector_mappings(){
		
		/*** Scripts without a default (bundled) mapping resource ***/
		var default_selector_map = {
			'mapping date right' : '0000-00-00.000',
			'mappings' : null
			};
		/***********************************************************/
		
		var mappings = {};
		try{
			//console.log(SEL);
			/*stor_del('GPlus CSS Map');
			stor_del('Last Got GPlus CSS Map Date');
			stor_del('GPlus CSS Map Date');
			return;*/

			//var now = new Date("August 25, 2011 22:27:00"); //new Date();
			var now = new Date();

			var stored_mappings;
			var stored_last_check_for_map_update;
			var stored_map_date;

			//Check for resume flag
			var uncheckable_dom_litmus_location = false;
			var path = window.location.pathname;
			if( path !=  '/' && path.indexOf('/stream/') == -1 && path.indexOf('/posts') == -1 ){
				uncheckable_dom_litmus_location = true;
			}

			//Set mappings if first time upon page load
			if( !SET_SELECTOR_MAPPINGS_DONE_ONCE ){
				stored_mappings = $.parseJSON(stor_get('GPlus CSS Map', null));
				stored_last_check_for_map_update = stor_get('Last Got GPlus CSS Map Date', 0);
				stored_map_date = stor_get('GPlus CSS Map Date', '');

				//User stored mapping if newer than default mappings
				if((stored_last_check_for_map_update != 0) && (stored_mappings) && (stored_map_date > default_selector_map['mapping date right'])){
					mappings = stored_mappings; //local storage copy of map
					default_selector_map['mapping date right'] = stored_map_date; //Scripts without a default (bundled) mapping resource
				}else{
					mappings = default_selector_map.mappings; //included default map file
				}

				//console.log('mappings_before_remap:');
				//console.log(default_selector_map.mappings);
				re_map(mappings);
				//console.log(SEL);
			}else{
				SET_SELECTOR_MAPPINGS_DONE_ONCE = true; //done once, set flag
			}

			//Check if resume mode is needed
			if(uncheckable_dom_litmus_location){
				RESUME_MAP_CHECK_UPON_ROOT_PATH = true; //flag to re-run when at root URL
				return;
			}

			RESUME_MAP_CHECK_UPON_ROOT_PATH = false; //unset flag

			//Check remote mappings in case of update
			var timediff = now.getTime() - stored_last_check_for_map_update;
			//console.log('timediff:');
			//console.log(timediff/60*1000*60);
			//console.log('stored_last:');
			//console.log(stored_last_check_for_map_update);
			//console.log('stored_map:');
			//console.log(stored_map_date + ' and ' + stored_map_date);
			//console.log('stored_last:' + stored_last_check_for_map_update); console.log('timediff:' + (timediff > 30*60*1000)); console.log('force:' + SET_SELECTOR_MAPPINGS_FORCED);
			if((default_selector_map.mappings == null) || (stored_last_check_for_map_update == 0) || (timediff > 30*60*1000) || (SET_SELECTOR_MAPPINGS_FORCED)){ /* 30*60*1000 = 0.5 hour interval*/
				SET_SELECTOR_MAPPINGS_FORCED = false; //unset flag
				//console.log('past interval');
				$.get('http://goldenview.wittman.org/map/current_gplus_mappings_timestamp.txt', function(data){
					//console.log(data);
					var remote_date = data;
					if((remote_date.length > 8 && remote_date.length < 16 && remote_date[0] == 2) && (remote_date > default_selector_map['mapping date right'])){ //2010-01-01.123
						$.getJSON('http://goldenview.wittman.org/map/current_gplus_mappings.json', function(data){
							//console.log('ajax map pull:'); console.log(data);
							var date_right = typeof data['mapping date right'] == 'undefined' ? default_selector_map['mapping date right'] : data['mapping date right'];	
							var mappings_length = Object.keys(data.mappings).length;
							//console.log('date_right, default_date');
							//console.log(date_right); console.log(default_selector_map['mapping date right']);
							if(date_right > default_selector_map['mapping date right'] && mappings_length > 999 && (!$(SEL.posts).length || !$(SEL.comments_wrap).length || !$(SEL.circle_links).length)){
								mappings = data.mappings;
								re_map(mappings);
								stor_set('GPlus CSS Map', JSON.stringify(mappings));
								stor_set('GPlus CSS Map Date', date_right);
								//console.log('update local from remote');
								//console.log(mappings);
							}
						});
					}
				});
				stor_set('Last Got GPlus CSS Map Date', now.getTime());
				//console.log('stored:'+now.getTime());
			}
			//console.log(mappings);
		}catch(e){
			SET_SELECTOR_MAPPINGS_DONE_ONCE = true; //done once, set flag
			////mappings = default_selector_map.mappings; //If all else fails, use included default map file
			////re_map(mappings);
			//console.log('exception caught, using default');
			//console.log('Remote map not pulled yet.')
			//console.log(e.message);
			//console.log(mappings);
		}
	}
	
	function setItem(key, value) {
		try{
			log("Inside setItem: " + key + ":" + value);
			window.localStorage.removeItem(key);
			window.localStorage.setItem(key, value);
		}catch(e){
			log("Error inside setItem");
			log(e);
		}
		log("Return from setItem" + key + ":" +  value);
	}

	function getItem(key){
		var v;
		log('Get Item: ' + key);
		try{
			v = window.localStorage.getItem(key);
		}catch(e){
			log("Error inside getItem() for key: " + key);
			log(e);
			v = null;
		}
		log("Returning value: " + v);
		return v;
	}
	function removeItem(key) {
		try{
			log("Inside removetItem: " + key);
			window.localStorage.removeItem(key);
		}catch(e){
			log("Error inside removeItem");
			log(e);
		}
		log("Return from removeItem" + key);
	}
	function clearStorage(){
		log('about to clear local storage');
		window.localStorage.clear();
		log('cleared');
	}
	function GM_removeItem(name){
		removeItem(name);
	}
	function GM_setValue(name, value){
		setItem(name, value);
	}

	function GM_getValue(name, oDefault){
		var v = getItem(name);
		if(v == null){
			return oDefault;
		}else{
			return v;
		}
	}
	function set_item(key, value) {
		try{
			window.localStorage.removeItem(key);
			window.localStorage.setItem(key, value);
		}catch(e){
			log(e);
		}
	}

	function get_item(key){
		var v;
		try{
			v = window.localStorage.getItem(key);
		}catch(e){
			log(e);
			v = null;
		}
		return v;
	}
	function del_item(key) {
		try{
			window.localStorage.removeItem(key);
		}catch(e){
			log(e);
		}
		log("Return from removeItem" + key);
	}
	function stor_clear(){
		log('about to clear local storage');
		window.localStorage.clear();
		log('cleared');
	}
	function stor_del(name){
		del_item(name);
	}
	function stor_set(name, value){
		set_item(name, value);
	}
	function stor_get(name, dfault){
		var v = get_item(name);
		if(v == null){
			return dfault;
		}else{
			return v;
		}
	}
	
	var SEL = {};
	var RESUME_MAP_CHECK_UPON_ROOT_PATH = false;
	var SET_SELECTOR_MAPPINGS_DONE_ONCE = false;
	var SET_SELECTOR_MAPPINGS_FORCED = false;
	var SET_SELECTOR_MAPPINGS_FORCED_ONCE = false;

	set_selector_mappings();

	/*
	* Add integers, wrapping at 2^32. This uses 16-bit operations internally
	* to work around bugs in some JS interpreters.
	*/
	function safe_add(x, y) {
		var lsw = (x & 0xFFFF) + (y & 0xFFFF),
		msw = (x >> 16) + (y >> 16) + (lsw >> 16);
		return (msw << 16) | (lsw & 0xFFFF);
	}

	/*
	* Bitwise rotate a 32-bit number to the left.
	*/
	function bit_rol(num, cnt) {
		return (num << cnt) | (num >>> (32 - cnt));
	}

	/*
	* These functions implement the four basic operations the algorithm uses.
	*/
	function md5_cmn(q, a, b, x, s, t) {
		return safe_add(bit_rol(safe_add(safe_add(a, q), safe_add(x, t)), s), b);
	}
	function md5_ff(a, b, c, d, x, s, t) {
		return md5_cmn((b & c) | ((~b) & d), a, b, x, s, t);
	}
	function md5_gg(a, b, c, d, x, s, t) {
		return md5_cmn((b & d) | (c & (~d)), a, b, x, s, t);
	}
	function md5_hh(a, b, c, d, x, s, t) {
		return md5_cmn(b ^ c ^ d, a, b, x, s, t);
	}
	function md5_ii(a, b, c, d, x, s, t) {
		return md5_cmn(c ^ (b | (~d)), a, b, x, s, t);
	}

	/*
	* Calculate the MD5 of an array of little-endian words, and a bit length.
	*/
	function binl_md5(x, len) {
		/* append padding */
		x[len >> 5] |= 0x80 << ((len) % 32);
		x[(((len + 64) >>> 9) << 4) + 14] = len;

		var i, olda, oldb, oldc, oldd,
		a =  1732584193,
		b = -271733879,
		c = -1732584194,
		d =  271733878;

		for (i = 0; i < x.length; i += 16) {
			olda = a;
			oldb = b;
			oldc = c;
			oldd = d;

			a = md5_ff(a, b, c, d, x[i],       7, -680876936);
			d = md5_ff(d, a, b, c, x[i +  1], 12, -389564586);
			c = md5_ff(c, d, a, b, x[i +  2], 17,  606105819);
			b = md5_ff(b, c, d, a, x[i +  3], 22, -1044525330);
			a = md5_ff(a, b, c, d, x[i +  4],  7, -176418897);
			d = md5_ff(d, a, b, c, x[i +  5], 12,  1200080426);
			c = md5_ff(c, d, a, b, x[i +  6], 17, -1473231341);
			b = md5_ff(b, c, d, a, x[i +  7], 22, -45705983);
			a = md5_ff(a, b, c, d, x[i +  8],  7,  1770035416);
			d = md5_ff(d, a, b, c, x[i +  9], 12, -1958414417);
			c = md5_ff(c, d, a, b, x[i + 10], 17, -42063);
			b = md5_ff(b, c, d, a, x[i + 11], 22, -1990404162);
			a = md5_ff(a, b, c, d, x[i + 12],  7,  1804603682);
			d = md5_ff(d, a, b, c, x[i + 13], 12, -40341101);
			c = md5_ff(c, d, a, b, x[i + 14], 17, -1502002290);
			b = md5_ff(b, c, d, a, x[i + 15], 22,  1236535329);

			a = md5_gg(a, b, c, d, x[i +  1],  5, -165796510);
			d = md5_gg(d, a, b, c, x[i +  6],  9, -1069501632);
			c = md5_gg(c, d, a, b, x[i + 11], 14,  643717713);
			b = md5_gg(b, c, d, a, x[i],      20, -373897302);
			a = md5_gg(a, b, c, d, x[i +  5],  5, -701558691);
			d = md5_gg(d, a, b, c, x[i + 10],  9,  38016083);
			c = md5_gg(c, d, a, b, x[i + 15], 14, -660478335);
			b = md5_gg(b, c, d, a, x[i +  4], 20, -405537848);
			a = md5_gg(a, b, c, d, x[i +  9],  5,  568446438);
			d = md5_gg(d, a, b, c, x[i + 14],  9, -1019803690);
			c = md5_gg(c, d, a, b, x[i +  3], 14, -187363961);
			b = md5_gg(b, c, d, a, x[i +  8], 20,  1163531501);
			a = md5_gg(a, b, c, d, x[i + 13],  5, -1444681467);
			d = md5_gg(d, a, b, c, x[i +  2],  9, -51403784);
			c = md5_gg(c, d, a, b, x[i +  7], 14,  1735328473);
			b = md5_gg(b, c, d, a, x[i + 12], 20, -1926607734);

			a = md5_hh(a, b, c, d, x[i +  5],  4, -378558);
			d = md5_hh(d, a, b, c, x[i +  8], 11, -2022574463);
			c = md5_hh(c, d, a, b, x[i + 11], 16,  1839030562);
			b = md5_hh(b, c, d, a, x[i + 14], 23, -35309556);
			a = md5_hh(a, b, c, d, x[i +  1],  4, -1530992060);
			d = md5_hh(d, a, b, c, x[i +  4], 11,  1272893353);
			c = md5_hh(c, d, a, b, x[i +  7], 16, -155497632);
			b = md5_hh(b, c, d, a, x[i + 10], 23, -1094730640);
			a = md5_hh(a, b, c, d, x[i + 13],  4,  681279174);
			d = md5_hh(d, a, b, c, x[i],      11, -358537222);
			c = md5_hh(c, d, a, b, x[i +  3], 16, -722521979);
			b = md5_hh(b, c, d, a, x[i +  6], 23,  76029189);
			a = md5_hh(a, b, c, d, x[i +  9],  4, -640364487);
			d = md5_hh(d, a, b, c, x[i + 12], 11, -421815835);
			c = md5_hh(c, d, a, b, x[i + 15], 16,  530742520);
			b = md5_hh(b, c, d, a, x[i +  2], 23, -995338651);

			a = md5_ii(a, b, c, d, x[i],       6, -198630844);
			d = md5_ii(d, a, b, c, x[i +  7], 10,  1126891415);
			c = md5_ii(c, d, a, b, x[i + 14], 15, -1416354905);
			b = md5_ii(b, c, d, a, x[i +  5], 21, -57434055);
			a = md5_ii(a, b, c, d, x[i + 12],  6,  1700485571);
			d = md5_ii(d, a, b, c, x[i +  3], 10, -1894986606);
			c = md5_ii(c, d, a, b, x[i + 10], 15, -1051523);
			b = md5_ii(b, c, d, a, x[i +  1], 21, -2054922799);
			a = md5_ii(a, b, c, d, x[i +  8],  6,  1873313359);
			d = md5_ii(d, a, b, c, x[i + 15], 10, -30611744);
			c = md5_ii(c, d, a, b, x[i +  6], 15, -1560198380);
			b = md5_ii(b, c, d, a, x[i + 13], 21,  1309151649);
			a = md5_ii(a, b, c, d, x[i +  4],  6, -145523070);
			d = md5_ii(d, a, b, c, x[i + 11], 10, -1120210379);
			c = md5_ii(c, d, a, b, x[i +  2], 15,  718787259);
			b = md5_ii(b, c, d, a, x[i +  9], 21, -343485551);

			a = safe_add(a, olda);
			b = safe_add(b, oldb);
			c = safe_add(c, oldc);
			d = safe_add(d, oldd);
		}
		return [a, b, c, d];
	}

	/*
	* Convert an array of little-endian words to a string
	*/
	function binl2rstr(input) {
		var i,
		output = '';
		for (i = 0; i < input.length * 32; i += 8) {
			output += String.fromCharCode((input[i >> 5] >>> (i % 32)) & 0xFF);
		}
		return output;
	}

	/*
	* Convert a raw string to an array of little-endian words
	* Characters >255 have their high-byte silently ignored.
	*/
	function rstr2binl(input) {
		var i,
		output = [];
		output[(input.length >> 2) - 1] = undefined;
		for (i = 0; i < output.length; i += 1) {
			output[i] = 0;
		}
		for (i = 0; i < input.length * 8; i += 8) {
			output[i >> 5] |= (input.charCodeAt(i / 8) & 0xFF) << (i % 32);
		}
		return output;
	}

	/*
	* Calculate the MD5 of a raw string
	*/
	function rstr_md5(s) {
		return binl2rstr(binl_md5(rstr2binl(s), s.length * 8));
	}

	/*
	* Calculate the HMAC-MD5, of a key and some data (raw strings)
	*/
	function rstr_hmac_md5(key, data) {
		var i,
		bkey = rstr2binl(key),
		ipad = [],
		opad = [],
		hash;
		ipad[15] = opad[15] = undefined;                        
		if (bkey.length > 16) {
			bkey = binl_md5(bkey, key.length * 8);
		}
		for (i = 0; i < 16; i += 1) {
			ipad[i] = bkey[i] ^ 0x36363636;
			opad[i] = bkey[i] ^ 0x5C5C5C5C;
		}
		hash = binl_md5(ipad.concat(rstr2binl(data)), 512 + data.length * 8);
		return binl2rstr(binl_md5(opad.concat(hash), 512 + 128));
	}

	/*
	* Convert a raw string to a hex string
	*/
	function rstr2hex(input) {
		var hex_tab = '0123456789abcdef',
		output = '',
		x,
		i;
		for (i = 0; i < input.length; i += 1) {
			x = input.charCodeAt(i);
			output += hex_tab.charAt((x >>> 4) & 0x0F) +
			hex_tab.charAt(x & 0x0F);
		}
		return output;
	}

	/*
	* Encode a string as utf-8
	*/
	function str2rstr_utf8(input) {
		return unescape(encodeURIComponent(input));
	}

	/*
	* Take string arguments and return either raw or hex encoded strings
	*/
	function raw_md5(s) {
		return rstr_md5(str2rstr_utf8(s));
	}
	function hex_md5(s) {
		return rstr2hex(raw_md5(s));
	}
	function raw_hmac_md5(k, d) {
		return rstr_hmac_md5(str2rstr_utf8(k), str2rstr_utf8(d));
	}
	function hex_hmac_md5(k, d) {
		return rstr2hex(raw_hmac_md5(k, d));
	}
	/*
	* jQuery MD5 Plugin 1.2.1
	* https://github.com/blueimp/jQuery-MD5
	*
	* Copyright 2010, Sebastian Tschan
	* https://blueimp.net
	*
	* Licensed under the MIT license:
	* http://creativecommons.org/licenses/MIT/
	* 
	* Based on
	* A JavaScript implementation of the RSA Data Security, Inc. MD5 Message
	* Digest Algorithm, as defined in RFC 1321.
	* Version 2.2 Copyright (C) Paul Johnston 1999 - 2009
	* Other contributors: Greg Holt, Andrew Kepert, Ydnar, Lostinet
	* Distributed under the BSD License
	* See http://pajhome.org.uk/crypt/md5 for more info.
	*/
	function md5(string, key, raw) {
		if (!key) {
			if (!raw) {
				return hex_md5(string);
			} else {
				return raw_md5(string);
			}
		}
		if (!raw) {
			return hex_hmac_md5(key, string);
		} else {
			return raw_hmac_md5(key, string);
		}
	}

	/****** Helper functions ******/
	function isThumbnail(img){
		return (img.height() <= 62 || img.width() <= 62);
	}

	/****** Before Loop Variables ******/
	var i = 0;
	//var img_divs = $('#contentPane .P-I-ba[data-content-url]'); //OLD
	//var img_divs = $('#contentPane .O-F-X[data-content-url]'); //OLD
	//var img_divs = $('#contentPane .H-y-qa[data-content-url]'); //OLD
    var img_divs = $(SEL.img_divs); //$('#contentPane .F-y-Ia[data-content-url]'); //NEW
	
	/****** Loop ******/
	function main_loop(){
		
		//img_divs = $('#contentPane .O-F-X[data-content-url]'); //OLD
		//img_divs = $('#contentPane .H-y-qa[data-content-url]'); //OLD
        img_divs = $(SEL.img_divs); //$('#contentPane .F-y-Ia[data-content-url]'); //NEW

		img_count = img_divs.length;
			
		img_divs.each(function(){
			var t = $(this);
			var img_url = t.attr('data-content-url');
			var url_hash;
			if( !t.hasClass('gpp__hide_images_tagged') && !isThumbnail(t) ){
				//Process new images
				url_hash = md5(img_url);
				t.addClass('gpp__hide_images_tagged');
				//t.after('<div id="gpp__hide_images_button_' + i + '" style="margin:7px 9px; height: 5px;width: 91%;" class="gpp__hide_images Ah Ft h-na-o-z"><span role="button" tabindex="0"><span style="margin-top:-5px" class="" title="Hidden image"></span><span style="font-size:9px; margin:-3px 0 0 20px;position:absolute"><a>SHOW / HIDE</a></span></span></div>'); //OLD
				//t.after('<div id="gpp__hide_images_button_' + i + '" style="margin:7px 9px; height:auto;width: 91%;background-position-y:-201px;float:left" class="gpp__hide_images ns yx Fv h-ga-o-v"><span role="button" tabindex="0"><span style="margin-top:-5px" class="" title="Hidden image"></span><span style="font-size:9px; margin:-5px 0 0 22px;position:absolute"><a>SHOW / HIDE</a></span></span></div>'); //OLD
				t.after('<div id="gpp__hide_images_button_' + i + '" style="background:url(' + ICON_CAMERA + ') no-repeat; margin:7px 9px; height:auto;width: 91%;background-position-y:0px; height:1.2em; float:left;background-color:whiteSmoke" class="gpp__hide_images"><span role="button" tabindex="0"><span style="margin-top:0px" class="" title="Hidden image"></span><span style="font-size:9px; padding-top:2px; margin:0px 0 0 22px;position:absolute"><a>SHOW / HIDE</a></span></span></div>'); //NEW Lr9 Hw i-wa-m-v
				var img = t;
				var button = img.parent().find('#gpp__hide_images_button_' + i + ':first');
				button.hover(function(){
					$(this).css('background-color', 'rgb(225,225,225)');
				},
				function(){
					$(this).css('background-color', 'whiteSmoke');
				});
				button.click(function(){
					if( img.is(':visible') ){
						//Hide
						GM_setValue('gpp__hidden_img_url_' + url_hash, true);
					}else{
						//Show
						GM_removeItem('gpp__hidden_img_url_' + url_hash);
					}
					//Toggle show/hide
					img.toggle();
				});
				i++;
			}else{
				//Process existing images
				if( t.is(':visible') ){
					if(hide_images_by_default){
						if(!t.hasClass('gpp__hide_images_tagged_shown')){
							t.addClass('gpp__hide_images_tagged_shown');
							t.hide();
						}
					}else{
						url_hash = md5(img_url);
						var hidden_img_url = GM_getValue('gpp__hidden_img_url_' + url_hash, false);
						if(hidden_img_url){
							t.hide();
						}
					}
				}
			}
			
		});
	}
	
	
	var ICON_CAMERA = 'data:image/png;base64,' + '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';
	
	
	/****** Start Loop ******/
	main_loop();
	setInterval(main_loop, 2000);	

}

/****** Load jQuery then callback upon load function ******/
function addJQuery(callback){
	var script = document.createElement("script");
	script.setAttribute("src", protocol + "ajax.googleapis.com/ajax/libs/jquery/1.6.1/jquery.min.js");
	script.addEventListener('load', function() {
		var script = document.createElement("script");
		script.textContent = "(" + callback.toString() + ")();";
		document.body.appendChild(script);
	}, false);
	document.body.appendChild(script);
}

/****** Call Load jQuery + callback function ******/
var protocol = window.location.protocol + '//';
addJQuery(hideImages);