
exports.__esModule = true;
const d3 = require("d3");

const Activity = require("../src/report/domain").Activity;
const ActivityType = require("../src/report/domain").ActivityType;
const DayDataRow = require("../src/report/domain").DayDataRow;
const toActivityTree = require("../src/report/data/transform").toActivityTree;
const toDaysArray = require("../src/report/data/transform").toDaysArray;
const dateTimeToEpoch = require("../src/report/utils/time").dateTimeToEpoch;


describe('Data transform', function () {

    it('Extracts the days from ', function () {
        const inputCsv =
            "Date,TimeStart,TimeEnd,ActivityId,ActivityName\n" +
            "19-Aug-2018,21:43,22:05,1,FEED\n" +
            "19-Aug-2018,22:05,03:50,0,SLEEP\n" +
            "20-Aug-2018,03:50,04:11,1,FEED";

        const daysArray = toDaysArray(d3.csvParse(inputCsv));

        expect(daysArray).toEqual([
            new DayDataRow("20-Aug-2018", dateTimeToEpoch("20-Aug-2018", "00:00"), dateTimeToEpoch("21-Aug-2018", "00:00")),
            new DayDataRow("19-Aug-2018", dateTimeToEpoch("19-Aug-2018", "00:00"), dateTimeToEpoch("20-Aug-2018", "00:00")),
        ]);
    });

    it('toActivityTree - Converts raw csv into activity intervals', function () {
        const inputCsv =
            "Date,TimeStart,TimeEnd,ActivityId,ActivityName\n" +
            "19-Aug-2018,21:43,22:05,1,FEED\n" +
            "19-Aug-2018,22:05,03:50,0,SLEEP\n" +
            "20-Aug-2018,03:50,04:11,1,FEED";

        let activityDataIntervalTree = toActivityTree(d3.csvParse(inputCsv));

        // Return all
        const activities = activityDataIntervalTree.search(0, Number.MAX_SAFE_INTEGER);
        expect(activities).toEqual([
            new Activity(dateTimeToEpoch("19-Aug-2018", "21:43"), dateTimeToEpoch("19-Aug-2018", "22:05"), ActivityType.FEED),
            new Activity(dateTimeToEpoch("19-Aug-2018", "22:05"), dateTimeToEpoch("20-Aug-2018", "03:50"), ActivityType.SLEEP),
            new Activity(dateTimeToEpoch("20-Aug-2018", "03:50"), dateTimeToEpoch("20-Aug-2018", "04:11"), ActivityType.FEED),
        ]);
    });
});
