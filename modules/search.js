const http = require('https');
const keys = require('../keys');
const core = require('./core');

exports.run = function(slack, text, time, chan, channel, user){
    try {
        var search_text = text.substring(8, text.length).replace(/\s+/g, '+');
        var url = 'https://www.googleapis.com/customsearch/v1?key=' + keys.google + '&num=1&cx=006735756282586657842:s7i_4ej9amu&q=' + encodeURIComponent(search_text);

        http.get(url, function(res){
    		if (res.statusCode == 200){
    	        var data = '';
    			var thumb_url = '';

    	        res.on('data', function(chunk){
    	            data += chunk;
    	        });

    	        res.on('end', function(){
    	            var result = JSON.parse(data);
    	            if (result.searchInformation.totalResults != '0'){
    	                var search_user = '<@' + user.name + '>';
    	                var search_link = result.items[0].link;
    	                var search_snip = result.items[0].snippet;

    	                if ('pagemap' in result.items[0] && 'cse_thumbnail' in result.items[0].pagemap) {
    	                    thumb_url = result.items[0].pagemap.cse_thumbnail[0].src;
    	                } else thumb_url = '';

    	                var attachments = [{
    	                    'fallback': 'Here\'s what I found:',
    	                    'color': core.info,
    	                    'title': result.items[0].title,
    	                    'title_link': result.items[0].link,
    	                    'text': result.items[0].snippet + '\n' + '<' + decodeURIComponent(result.items[0].link) + '>',
    	                    'thumb_url': thumb_url
    	                }];

    	                slack._apiCall('chat.postMessage', {
    						as_user: true,
    						unfurl_links: false,
    						unfurl_media: false,
    						channel: chan,
    						attachments: JSON.stringify(attachments)
    	                }, core.delMsg(slack, chan, time));
    	            }

    				else {
    					channel.send('*Error:* The search returned no results.');
    				}
    	        });
    		}

    		else if (res.statusCode != 200){
    			if (res.statusCode == 403) channel.send('*Error*: Exceeded Maximum daily API calls.');
    			else if (res.statusCode == 500) channel.send('*Error*: An unknown error has occurred.');
    			else channel.send('*Error*: Unknown error, #*' + res.statusCode + '*');
    		}
        })

    	.on('error', function(error){
    		channel.send(core.errno + '```' + error + '```');
    	});
    }

    catch (error){
        channel.send(core.errno + '```' + error + '```');
    }
};
