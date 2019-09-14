var EWS_URL = PropertiesService.getScriptProperties().getProperty('EWS_URL');
var EWS_KEY = PropertiesService.getScriptProperties().getProperty('EWS_KEY');

var Station = function (text) {
  var inputArr = text.split(' ');
  var mainText = inputArr[0];
  var mainArr = mainText.split(',');

  if (mainArr.length >= 2) {
    if (inputArr.length == 2) this.getByGeo(mainArr, inputArr[1]);
    else this.getByGeo(mainArr);
    return;
  }

  if (mainArr.length == 1) {
    if (isNaN(mainArr[0])) {
      if (inputArr.length == 2) this.getByName(mainArr[0], inputArr[1]);
      else this.getByName(mainArr[0]);
      return;
    }
    this.getByCode(mainArr[0]);
  }
}
Station.prototype = {
  getByName: function (name, type) {
    var url = EWS_URL + "/v1/json/station?key=" + EWS_KEY + "&gcs=wgs84&name=" + name;
    if (type) url += '&type=' + type;
    var resultSet = this.request(url);
    this.setPoints(resultSet);
  },
  getByCode: function (code) {
    var url = EWS_URL + "/v1/json/station?key=" + EWS_KEY + "&gcs=wgs84&code=" + code;
    var resultSet = this.request(url);
    this.setPoints(resultSet);
  },
  getByGeo: function (geo, type) {
    this.distance = geo[2] ? geo[2] : 500;

    var url = EWS_URL + "/v1/json/geo/station?key=" + EWS_KEY + "&gcs=wgs84&geoPoint=" + geo[0] + ',' + geo[1] + ',wgs84,' + this.distance + '&gcs=wgs84';
    if (type) url += '&type=' + type;
    var resultSet = this.request(url);
    this.setPoints(resultSet);
  },
  getPointsSummary: function (points) {
    if (this.points.length == 0) return;

    var self = this;
    return points.map(function (point) {
      return point.Station.code + "\t"
        + point.Station.Name + "\t"
        + self.getType(point.Station.Type) + "\t"
        + point.GeoPoint.lati_d + ',' + point.GeoPoint.longi_d + "\t"
        + (point.Distance ? point.Distance + 'm' : '');
    }).join('\n');
  },
  getPoints: function (points) {
    if (!points) return [];
    return (points instanceof Array) ? points : [points];
  },
  getType: function (type) {
    return (type instanceof Object ? type.text + '.' + type.detail : type);
  },
  request: function (url) {
    var text = UrlFetchApp.fetch(url, { muteHttpExceptions: true });
    return JSON.parse(text).ResultSet;
  },
  setPoints: function (resultSet) {
    this.error = resultSet.Error;
    if (this.error) return;
    this.points = this.getPoints(resultSet.Point);
    this.count = resultSet.max ? resultSet.max : this.points.length;
    this.summary = this.getPointsSummary(this.points);
  }
};
