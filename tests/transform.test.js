
exports.__esModule = true;
const d3 = require("d3");

const Activity = require("../src/report/domain").Activity;
const ActivityType = require("../src/report/domain").ActivityType;
const DayDataRow = require("../src/report/domain").DayDataRow;
const toActivityTreeV1 = require("../src/report/data/transform").toActivityTreeV1;
const toActivityTreeV2 = require("../src/report/data/transform").toActivityTreeV2;
const toDaysArray = require("../src/report/data/transform").toDaysArray;
const dateTimeToEpoch = require("../src/report/utils/time").dateTimeToEpoch;
const epochToDateTimeWithSep = require("../src/report/utils/time").epochToDateTimeWithSep;


describe('Data transform', function () {

    it('Extracts the days from ', function () {
        const inputCsv =
            "Date,TimeStart,TimeEnd,ActivePct\n" +
            "5-Aug-2018,00:00,01:00,0%\n" +
            "6-Aug-2018,01:00,02:00,0%\n" +
            "6-Aug-2018,05:00,06:00,100%\n" +
            "8-Aug-2018,05:00,06:00,\n" +
            "9-Aug-2018,12:00,,100\n" +
            "10-Aug-2018,,19:00,50\n" +
            ",02:00,02:30,0";

        const daysArray = toDaysArray(d3.csvParse(inputCsv));

        expect(daysArray).toEqual([
            new DayDataRow("6-Aug-2018", dateTimeToEpoch("6-Aug-2018", "00:00"), dateTimeToEpoch("7-Aug-2018", "00:00")),
            new DayDataRow("5-Aug-2018", dateTimeToEpoch("5-Aug-2018", "00:00"), dateTimeToEpoch("6-Aug-2018", "00:00")),
        ]);
    });

    //DEBT: Deprecated - remove once transitioned to the new format
    it('toActivityTreeV1 - Converts raw csv into activity intervals', function () {
        const inputCsv =
            "Date,TimeStart,TimeEnd,ActivePct\n" +
            "6-Aug-2018,05:00,06:00,0%\n" +
            "6-Aug-2018,12:00,14:00,100%\n" +
            "6-Aug-2018,18:00,19:00,50%\n" +
            "7-Aug-2018,02:00,02:30,0%";

        let activityDataIntervalTree = toActivityTreeV1(d3.csvParse(inputCsv));

        // Return all
        const activities = activityDataIntervalTree.search(0, Number.MAX_SAFE_INTEGER);
        expect(activities).toEqual([
            new Activity(dateTimeToEpoch("6-Aug-2018", "00:00"), dateTimeToEpoch("6-Aug-2018", "05:00"), ActivityType.SLEEP),
            new Activity(dateTimeToEpoch("6-Aug-2018", "05:00"), dateTimeToEpoch("6-Aug-2018", "06:00"), ActivityType.FEED),
            new Activity(dateTimeToEpoch("6-Aug-2018", "12:00"), dateTimeToEpoch("6-Aug-2018", "14:00"), ActivityType.FEED),
            new Activity(dateTimeToEpoch("6-Aug-2018", "15:00"), dateTimeToEpoch("6-Aug-2018", "17:00"), ActivityType.SLEEP),
            new Activity(dateTimeToEpoch("6-Aug-2018", "18:00"), dateTimeToEpoch("6-Aug-2018", "19:00"), ActivityType.FEED),
            new Activity(dateTimeToEpoch("6-Aug-2018", "19:00"), dateTimeToEpoch("7-Aug-2018", "02:00"), ActivityType.SLEEP),
            new Activity(dateTimeToEpoch("7-Aug-2018", "02:00"), dateTimeToEpoch("7-Aug-2018", "02:30"), ActivityType.FEED),
        ]);
    });

    it('toActivityTreeV2 - Converts raw csv into activity intervals', function () {
        const inputCsv =
            "Date,TimeStart,TimeEnd,ActivityId,ActivityName\n" +
            "19-Aug-2018,21:43,22:05,1,FEED\n" +
            "19-Aug-2018,22:05,03:50,0,SLEEP\n" +
            "20-Aug-2018,03:50,04:11,1,FEED";

        let activityDataIntervalTree = toActivityTreeV2(d3.csvParse(inputCsv));

        // Return all
        const activities = activityDataIntervalTree.search(0, Number.MAX_SAFE_INTEGER);
        expect(activities).toEqual([
            new Activity(dateTimeToEpoch("19-Aug-2018", "21:43"), dateTimeToEpoch("19-Aug-2018", "22:05"), ActivityType.FEED),
            new Activity(dateTimeToEpoch("19-Aug-2018", "22:05"), dateTimeToEpoch("20-Aug-2018", "03:50"), ActivityType.SLEEP),
            new Activity(dateTimeToEpoch("20-Aug-2018", "03:50"), dateTimeToEpoch("20-Aug-2018", "04:11"), ActivityType.FEED),
        ]);
    });

    it('Indexes activities to enable search', function () {
        const inputCsv =
            "Date,TimeStart,TimeEnd,ActivePct\n" +
            "6-Aug-2018,05:00,06:00,0%\n" +
            "6-Aug-2018,12:00,14:00,100%\n" +
            "6-Aug-2018,18:00,19:00,50%\n" +
            "7-Aug-2018,02:00,02:30,0%";

        let activityDataIntervalTree = toActivityTreeV1(d3.csvParse(inputCsv));

        // Search by tight interval
        const activities = activityDataIntervalTree.search(
            dateTimeToEpoch("6-Aug-2018", "12:00"),
            dateTimeToEpoch("6-Aug-2018", "18:59"));
        expect(activities).toEqual([
            new Activity(dateTimeToEpoch("6-Aug-2018", "12:00"), dateTimeToEpoch("6-Aug-2018", "14:00"), ActivityType.FEED),
            new Activity(dateTimeToEpoch("6-Aug-2018", "15:00"), dateTimeToEpoch("6-Aug-2018", "17:00"), ActivityType.SLEEP),
            new Activity(dateTimeToEpoch("6-Aug-2018", "18:00"), dateTimeToEpoch("6-Aug-2018", "19:00"), ActivityType.FEED),
        ]);
    });


    //DEBT: Deprecated - remove once transitioned to the new format
    it('Converts file to new format', function () {
        var fs = require('fs');
        var inputCsv = fs.readFileSync('./dist/data/testData.csv','utf8');

        let activityDataIntervalTree = toActivityTreeV1(d3.csvParse(inputCsv));

        const activities = activityDataIntervalTree.search(0, Number.MAX_SAFE_INTEGER);

        var stream = fs.createWriteStream("my_file.txt");

        stream.once('open', function(fd) {
            activities.forEach(a => {
                var asString =
                    epochToDateTimeWithSep(a.startTimeEpoch, ",") + ","
                    + epochToDateTimeWithSep(a.endTimeEpoch, ",") + ","
                    + a.type + ","+ActivityType[a.type];

                stream.write(asString+"\n")
            });
            stream.end();
        });
    });
});
