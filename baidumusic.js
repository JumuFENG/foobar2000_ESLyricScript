//===================================================
//=========Baidu Music Source For ESLyric============
//===============jumufeng 2015-05-20===================
//========See "Tools->Readme" for more info==========
//===================================================

var ado = new ActiveXObject("ADODB.Stream");
var xmlhttp = new ActiveXObject("Msxml2.XMLHTTP.3.0");
var xmlDoc = new ActiveXObject("MSXML.DOMDocument");

function get_my_name()
{
    return "百度音乐";
}

function get_version() 
{
    return "0.0.1";
}

function get_author() 
{
    return "jumufeng";
}

function start_search(info,callback)
{
	var url;
	var title = info.Title;
	var artist = info.Artist;

	//process keywords
	title = process_keywords(title);
	artist = process_keywords(artist);

	url = "http://box.zhangmen.baidu.com/x?op=12&count=1&title=" + title + "$$" + artist +"$$$$";
    
	try {
		xmlhttp.open("GET",url,false);
		xmlhttp.send();
	} catch (e) {
		return;
	}
    
    var new_lyric = fb.CreateLyric();
	if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
		//parse XML
		var xml_text = xmlhttp.responseText;
		xmlDoc.loadXML(xml_text);
		//fb.trace(xml_text);
		var results = getAllLyrics();

		//download lyric
		for (var i = 0; i < results.length; i++) {
			try {
				var url = "http://box.zhangmen.baidu.com/bdlrc/" + parseInt(results[i]/100) + "/" + results[i] + ".lrc";
				xmlhttp.open("GET", url, false);
				xmlhttp.send();
			} catch (e) {
				continue;
			}
			if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
				//add lyrics to eslyric
				new_lyric.Title = title;
				new_lyric.Artist = artist;
				new_lyric.Source = get_my_name();
				new_lyric.LyricText = UTF8ToGB2312(xmlhttp.responseBody);
				callback.AddLyric(new_lyric);
			}
		}
	}
    
    new_lyric.Dispose();
}

function process_keywords(str)
{
	var s = str;
	s = s.toLowerCase();
	s = s.replace(/\'|·|\$|\&|–/g, "");
	//truncate all symbols
	s = s.replace(/\(.*?\)|\[.*?]|{.*?}|（.*?/g, "");
	s = s.replace(/[-/:-@[-`{-~]+/g, "");
	s = s.replace(/[\u2014\u2018\u201c\u2026\u3001\u3002\u300a\u300b\u300e\u300f\u3010\u3011\u30fb\uff01\uff08\uff09\uff0c\uff1a\uff1b\uff1f\uff5e\uffe5]+/g, "");
	return s;
}

function getAllLyrics()
{
    var result = [];
    getSubLrcids(xmlDoc.documentElement, result);
    var uq = {};
    var rq = [];
    for (var i=0; i<result.length; i++)
    {
        if(!uq[result[i]]){
            uq[result[i]] = true;
            rq.push(result[i]);
        }  
    }
    return rq;
}

function getSubLrcids(root, arr)
{
    var subRoots = root.childNodes;
    for (var i=0; i<subRoots.length;i++)
    {
        if (subRoots[i].nodeType==1)
        {
            //Process only element (nodeType 1) nodes
            if (subRoots[i].nodeName == "lrcid")
            {
                arr.push(subRoots[i].childNodes[0].nodeValue);
            }
            if (subRoots[i].childNodes.length > 1)
            {
                getSubLrcids(subRoots[i], arr);
            }
        }
    }
}


function UTF8ToGB2312(s){
	ado.Charset = "gb2312";
	ado.Type = 1;
	ado.Open();
	ado.Write(s);
	ado.Position = 0;
	ado.Type = 2;
	var ret = ado.ReadText();
	ado.Close();
	return ret;
}
