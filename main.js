var SLACK_ACCESS_TOKEN = PropertiesService.getScriptProperties().getProperty('SLACK_ACCESS_TOKEN');
var CHANNEL_ID = PropertiesService.getScriptProperties().getProperty('CHANNEL_ID');

function doPost(e) {
  var inputText = e.parameter.text;
  var channelName = e.parameter.channel_id;

  try {
    var station = new Station(inputText);
    var text = createResponseText(station);

    // log
    if (station.error) {
      postSlack(CHANNEL_ID, '<#' + channelName + '> : Error : ' + inputText + "\n" + station.error.Message);
    } else {
      postSlack(CHANNEL_ID, '<#' + channelName + '> : OK : ' + inputText);
    }
  } catch (e) {
    var text = e.name + "\t" + e.message + "\n"
      + 'line: ' + e.lineNumber + "\n" + e.stack;

    // log
    postSlack(CHANNEL_ID, '<#' + channelName + '> : Exception : ' + inputText + "\n" + text);
  }

  return ContentService.createTextOutput(JSON.stringify({
    response_type: "in_channel",
    text: text
  })).setMimeType(ContentService.MimeType.JSON);
}


function test() {
  var createRequest = function (inputText) {
    return {
      parameter: {
        text: inputText,
        channel_id: CHANNEL_ID
      }
    };
  };

  doPost(createRequest('hoge hoge'));
  doPost(createRequest('高円寺'));
  doPost(createRequest('高速バス'));
  doPost(createRequest('高円寺 train'));
  doPost(createRequest('35.705333,139.649826'));
  doPost(createRequest('35.705333,139.649826 train'));
  doPost(createRequest('35.705333,139.649826,100'));
  doPost(createRequest('35.705333,139.649826,2000 train'));
  doPost(createRequest('22671'));
}

function createResponseText(station) {
  var text = '';

  if (station.error) return station.error;

  text += station.distance ? station.distance + 'm以内\t' : '';
  text += station.count ? station.count + "駅\n" : '';
  text += station.summary ? station.summary : '見つかりませんでした';
  return text;
}
function postSlack(channelId, comment) {
  var app = SlackApp.create(SLACK_ACCESS_TOKEN);
  app.postMessage(
    channelId,
    comment,
    { username: 'station' }
  );
}
