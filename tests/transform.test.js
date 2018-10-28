
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
            "Date,TimeStart,TimeEnd,ActivePct\n" +
            "5-Aug-2018,00:00,01:00,0\n" +
            "6-Aug-2018,01:00,02:00,0\n" +
            "6-Aug-2018,05:00,06:00,100\n" +
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

    it('Converts raw csv into activity intervals', function () {
        const inputCsv =
            "Date,TimeStart,TimeEnd,ActivePct\n" +
            "6-Aug-2018,05:00,06:00,0\n" +
            "6-Aug-2018,12:00,14:00,100\n" +
            "6-Aug-2018,18:00,19:00,50\n" +
            "7-Aug-2018,02:00,02:30,0";

        let activityDataIntervalTree = toActivityTree(d3.csvParse(inputCsv));

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

    it('Indexes activities to enable search', function () {
        const inputCsv =
            "Date,TimeStart,TimeEnd,ActivePct\n" +
            "6-Aug-2018,05:00,06:00,0\n" +
            "6-Aug-2018,12:00,14:00,100\n" +
            "6-Aug-2018,18:00,19:00,50\n" +
            "7-Aug-2018,02:00,02:30,0";

        let activityDataIntervalTree = toActivityTree(d3.csvParse(inputCsv));

        // Search by tight interval
        const activities = activityDataIntervalTree.search(
            dateTimeToEpoch("6-Aug-2018", "12:00"),
            dateTimeToEpoch("6-Aug-2018", "18:59"));
        expect(activities).toEqual([
            new Activity(dateTimeToEpoch("6-Aug-2018", "12:00"), dateTimeToEpoch("6-Aug-2018", "14:00"), ActivityType.FEED),
            new Activity(dateTimeToEpoch("6-Aug-2018", "15:00"), dateTimeToEpoch("6-Aug-2018", "17:00"), ActivityType.SLEEP),
            new Activity(dateTimeToEpoch("6-Aug-2018", "18:00"), dateTimeToEpoch("6-Aug-2018", "19:00"), ActivityType.FEED),
        ]);
    })
});
