function readJsonFile(callback) {
    var xmlObj = new XMLHttpRequest();
    xmlObj.overrideMimeType('application/json');
    xmlObj.open('GET', 'data.json', true);
    xmlObj.onreadystatechange = function() {
        if (xmlObj.readyState == 4 && xmlObj.status == '200') {
            callback(xmlObj.responseText);
        }
    };
    xmlObj.send(null);
}
function processData() {
    readJsonFile(function(response) {
        // get data from json
        var importedData = JSON.parse(response);
        var orders = importedData.orders;

        var labelArr = [];
        var seriesArr = [];
        for (var i = 0; i < orders.length; i++) {
            var d = new Date(orders[i].dateString);
            labelArr.push(d.toUTCString().slice(5, 16));
            seriesArr.push(orders[i].amount);
        }
        // Chart
        var data = {
            labels: labelArr,
            series: [ seriesArr ]
        };
        var options = {
            seriesBarDistance: 30,
            reverseData: true,
            horizontalBars: true,
            chartPadding: 5,
            height: '1500px',
            axisY: {
                offset: 100
            },
            axisX: {
                position: 'start'
            }
        };
        var responsiveOptions = [
            ['screen and (max-width: 640px)', {
                seriesBarDistance: 5,
                axisX: {
                    labelInterpolationFnc: function (value) {
                        return value[0];
                    }
                }
            }]
        ];
        var chart = new Chartist.Bar('.ct-chart', data, options, responsiveOptions);
        // append circle to the end of bar
        chart.on('draw', function(data) {
            if(data.type === 'bar') {
                data.group.append(new Chartist.Svg('circle', {
                    cx: data.x2,
                    cy: data.y2,
                    r: Math.abs(Chartist.getMultiValue(data.value)) * 4 + 5
                }, 'ct-slice-pie'));
            }
        });
    });
}
processData();

